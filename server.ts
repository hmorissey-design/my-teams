import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// XML parser for Google News RSS
function parseGoogleNewsRSS(xmlText: string): any[] {
  const items: any[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];

    // Extract title
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    let titleStr = titleMatch ? titleMatch[1] : "Sports Update";

    // Extract link
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const url = linkMatch ? linkMatch[1] : "";

    // Extract pubDate
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const pubDateStr = pubDateMatch ? pubDateMatch[1] : "";
    let timestamp = Date.now();
    if (pubDateStr) {
      try {
        timestamp = Date.parse(pubDateStr);
      } catch (e) {
        // Fallback
      }
    }

    // Extract source name
    const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
    const source = sourceMatch ? sourceMatch[1] : "Sports Portal";

    // Decode XML entities cleanly
    let cleanTitle = titleStr
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim();

    // Sometimes the publisher name is appended at the end like "- ESPN" or "- Sportsnet.ca"
    // We can leave it, or let it slide since it's already highly readable.
    items.push({
      title: cleanTitle,
      url,
      timestamp,
      source: source || "Sports News",
    });
  }
  return items;
}

// Sports news search API
app.post("/api/news", async (req, res) => {
  try {
    const { teams, recencyDays, feedMode, customSites } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ error: "Please specify at least one team." });
    }

    const days = Math.min(Math.max(Number(recencyDays) || 1, 1), 5);
    const isDirectMode = feedMode === "direct";

    const results = await Promise.all(
      teams.map(async (team) => {
        try {
          // Prepare sites query
          let sitesFilter = "";
          if (Array.isArray(customSites) && customSites.length > 0) {
            const formattedSites = customSites
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0)
              .map((s: string) => (s.startsWith("site:") ? s : `site:${s}`));

            if (formattedSites.length > 0) {
              sitesFilter = ` (${formattedSites.join(" OR ")})`;
            }
          }

          // Define key signature words mapping to filter out non-applicable footer/sidebar links
          const teamLower = team.toLowerCase();
          const commonAndLooseWords = [
            "the", "and", "team", "club", "sports", "news", "official", "fc", "with", "from", "for",
            "blue", "red", "white", "black", "green", "gold", "golden", "grey", "gray", "yellow", "orange",
            "mighty", "city", "bay", "real", "united", "town", "county", "rovers", "wanderers", "albion",
            "north", "south", "east", "west"
          ];
          const signatureWords = teamLower
            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
            .split(/\s+/)
            .filter(w => w.length >= 3 && !commonAndLooseWords.includes(w));

          const sportsNicknames: string[] = [];
          if (teamLower.includes("canadiens") || teamLower.includes("montreal")) {
            sportsNicknames.push("habs");
          }
          if (teamLower.includes("leafs") || teamLower.includes("toronto")) {
            sportsNicknames.push("leafs");
          }
          if (teamLower.includes("jays") || teamLower.includes("toronto")) {
            sportsNicknames.push("jays");
          }

          const isHeadlineMatch = (artTitle: string): boolean => {
            const titleLower = artTitle.toLowerCase();
            // Always allow if contains full team name
            if (titleLower.includes(teamLower)) return true;
            
            // Check signature words (must match at least one specific descriptive word)
            for (const word of signatureWords) {
              if (titleLower.includes(word)) return true;
            }

            // Check sport specific nicknames
            for (const nick of sportsNicknames) {
              if (titleLower.includes(nick)) return true;
            }

            return false;
          };

          // Build query specifically targeting the team constraints.
          // We simplify this to just the team name to circumvent restrictive/blocked nested searches on Google RSS.
          const searchQuery = sitesFilter ? `"${team}"${sitesFilter}` : `"${team}"`;
          const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;

          // Fetch RSS feed server-side (bypass client-side CORS completely)
          const response = await fetch(rssUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
            },
          });

          let articles: any[] = [];
          if (response.ok) {
            const xmlText = await response.text();
            const rawArticles = parseGoogleNewsRSS(xmlText);
            // Apply strict headline relevance filter right at retrieval time
            articles = rawArticles.filter(art => isHeadlineMatch(art.title));
          }

          // Filter articles according to the lookback window
          const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
          let filteredArticles = articles.filter((art) => art.timestamp >= cutoffTime);

          // Fallback if domain-restricted search yielded zero results: query universally with simple query term so screen isn't empty
          if (filteredArticles.length === 0 && sitesFilter) {
            const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en`;
            const genResponse = await fetch(generalUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0)" },
            });
            if (genResponse.ok) {
              const genXml = await genResponse.text();
              const genArticles = parseGoogleNewsRSS(genXml);
              filteredArticles = genArticles
                .filter(art => isHeadlineMatch(art.title))
                .filter((art) => art.timestamp >= cutoffTime);
            }
          }

          // Sort articles by date (newest first)
          filteredArticles.sort((a, b) => b.timestamp - a.timestamp);

          // Get top 8 articles
          const topArticles = filteredArticles.slice(0, 8);

          // Convert to WebLink format for backward compatibility
          const links = topArticles.map((art) => ({
            title: art.title,
            url: art.url,
          }));

          // Return feed output directly (100% Free / Unlimited / No Gemini / No credits used)
          return {
            team,
            summary: topArticles.length > 0
              ? `• Direct Sports Feed Active. Loaded ${topArticles.length} recent headline${topArticles.length > 1 ? "s" : ""} directly from your tracking feed.\n• Chronological live timeline of match reports and squad news below.`
              : `• No recent developments found on your selected sports websites in the last ${days} days. Try expanding your Recency window or updating customized domains.`,
            links: links.length > 0 ? links : [
              { title: `Search ${team} news on Google`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
            ],
            articles: topArticles,
            timestamp: Date.now(),
          };
        } catch (e: any) {
          console.error(`Error aggregating feed for ${team}:`, e);
          return {
            team,
            summary: `• Offline Fallback: Temporary communication error fetching headlines for ${team} (${e.message || e}).\n• Please check settings or wait for automatic retry.`,
            links: [
              { title: `${team} Hub Page`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
            ],
            articles: [],
            timestamp: Date.now(),
            error: true,
          };
        }
      })
    );

    res.json({ results });
  } catch (error: any) {
    console.error("News endpoint error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Serve frontend build or compile with Vite in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
