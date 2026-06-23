import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Lazy initialize Gemini client to avoid crashes if API key is not present initially
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

app.use(express.json());

// Google News redirect URL decoder and spam filters
function decodeGoogleNewsUrl(googleUrl: string): string {
  try {
    const urlObj = new URL(googleUrl);
    if (urlObj.hostname.includes("news.google.com")) {
      const pathParts = urlObj.pathname.split("/");
      const base64Part = pathParts[pathParts.length - 1];
      if (base64Part && base64Part.startsWith("CBMi")) {
        let normalizedBase64 = base64Part
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        
        while (normalizedBase64.length % 4 !== 0) {
          normalizedBase64 += "=";
        }

        const decoded = Buffer.from(normalizedBase64, "base64").toString("utf-8");
        const httpIndex = decoded.indexOf("http");
        if (httpIndex !== -1) {
          const urlPart = decoded.slice(httpIndex);
          const cleanUrlMatch = urlPart.match(/^(https?:\/\/[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=%]+)/);
          if (cleanUrlMatch) {
            return cleanUrlMatch[1];
          }
        }
      }
    }
  } catch (e) {
    // ignore
  }
  return googleUrl;
}

function isSpamArticle(title: string, url: string): boolean {
  const titleLower = title.toLowerCase();
  let hostname = "";
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch (e) {
    // ignore
  }

  const TRUSTED_STREAM_DOMAINS = [
    "espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "chl.ca", "theqmjhl.ca", 
    "cbc.ca", "rds.ca", "tvasports.ca", "youtube.com", "vimeo.com", "twitch.tv",
    "cbssports.com", "nbcsports.com", "foxsports.com"
  ];

  const SPAM_PHRASES = [
    "live stream", "livestream", "free stream", "stream free", "watch live", 
    "how to watch", "streaming free", "live broadcast", "stream link", 
    "hd stream", "stream online", "watch online", "broadcast online"
  ];

  const hasSpamPhrase = SPAM_PHRASES.some(phrase => titleLower.includes(phrase));

  if (hasSpamPhrase) {
    const isTrusted = TRUSTED_STREAM_DOMAINS.some(domain => hostname.includes(domain));
    if (!isTrusted) {
      return true;
    }
  }

  const SPAM_DOMAINS = [
    "fathomjournal.org", "fathom", "live-stream", "livestream", "sportingnews24",
    "freestreams", "buffstreams", "vipleague", "cricfree", "crackstreams", "hacked", "redirect"
  ];

  if (SPAM_DOMAINS.some(domain => hostname.includes(domain))) {
    return true;
  }

  const hostnameParts = hostname.split(".");
  if (hostnameParts.length > 1) {
    const tld = hostnameParts[hostnameParts.length - 1];
    const SUSPICIOUS_TLDS = ["xyz", "top", "online", "click", "download", "club", "biz", "live", "stream", "link", "today"];
    if (SUSPICIOUS_TLDS.includes(tld)) {
      const isTrusted = TRUSTED_STREAM_DOMAINS.some(domain => hostname.includes(domain));
      if (!isTrusted) {
        return true;
      }
    }
  }

  return false;
}

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

    // Decode Google News redirect URL to direct URL
    const directUrl = decodeGoogleNewsUrl(url);

    items.push({
      title: cleanTitle,
      url: directUrl,
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
            
            // 1. Direct full match (case-insensitive)
            if (titleLower.includes(teamLower)) return true;

            // 2. If the team name has multiple words (e.g. "Moncton Wildcats")
            if (signatureWords.length > 1) {
              const hasAllWords = signatureWords.every(w => titleLower.includes(w));
              if (hasAllWords) return true;

              // Check if it has the geographical/identifying primary word (usually the first word, e.g. "Moncton")
              const geoWord = signatureWords[0];
              if (titleLower.includes(geoWord)) {
                const sportsIndicators = ["win", "lose", "game", "match", "play", "squad", "coach", "signing", "goal", "defeat", "cup", "league", "qmjhl", "hockey", "score", "points", "season", "draft", "roster", "player", "trade", "contract", "injury"];
                const hasSportsWord = sportsIndicators.some(w => titleLower.includes(w));
                if (hasSportsWord) return true;
                
                if (titleLower.includes(" vs ") || titleLower.includes(" vs. ") || titleLower.includes(" at ")) return true;
              }

              // Check if it has ONLY the common nickname (e.g. "Wildcats")
              const nicknameWord = signatureWords[signatureWords.length - 1];
              if (titleLower.includes(nicknameWord)) {
                const commonNicks = ["wildcats", "giants", "tigers", "panthers", "lions", "eagles", "cardinals", "bulldogs", "rangers", "kings", "jets", "stars"];
                if (commonNicks.includes(nicknameWord)) {
                  const regionalContext = ["qmjhl", "lhjmq", "hockey", "chl", "halifax", "mooseheads", "saint john", "sea dogs", "bathurst", "titan", "cape breton", "eagles", "rimouski", "oceanic", "quebec", "remparts", "chicoutimi", "sagueneens", "shawinigan", "cataractes", "sherbrooke", "phoenix", "rouyn-noranda", "huskies", "val-d'or", "foreurs", "boisbriand", "armada", "victoriaville", "tigres", "drummondville", "voltigeurs", "charlottetown", "islanders", "baie-comeau", "drakkar"];
                  const hasContext = regionalContext.some(ctx => titleLower.includes(ctx));
                  if (hasContext) return true;
                } else {
                  return true;
                }
              }
            } else if (signatureWords.length === 1) {
              if (titleLower.includes(signatureWords[0])) return true;
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
            articles = rawArticles.filter(art => isHeadlineMatch(art.title) && !isSpamArticle(art.title, art.url));
          }

          // Filter articles according to the lookback window
          const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
          let filteredArticles = articles.filter((art) => art.timestamp >= cutoffTime);

          // Fallback if domain-restricted search yielded zero results: query universally with simple query term so screen isn't empty
          if (filteredArticles.length === 0 && sitesFilter) {
            const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en`;
            try {
              const genResponse = await fetch(generalUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0)" },
              });
              if (genResponse.ok) {
                const genXml = await genResponse.text();
                const genArticles = parseGoogleNewsRSS(genXml);
                filteredArticles = genArticles
                  .filter(art => isHeadlineMatch(art.title) && !isSpamArticle(art.title, art.url))
                  .filter((art) => art.timestamp >= cutoffTime);
              }
            } catch (err) {
              console.warn(`General RSS feed fetch failed for ${team}, trying Gemini search grounding...`);
            }
          }

          let summaryText = "";

          // Super Fallback: If we still have 0 results (or the fetch failed / was rate-limited), query Gemini with Google Search Grounding!
          if (filteredArticles.length === 0) {
            const ai = getGeminiClient();
            if (ai) {
              try {
                console.log(`[Backup] Fetching via Gemini Search Grounding for ${team}...`);
                const aiResponse = await ai.models.generateContent({
                  model: "gemini-3.5-flash",
                  contents: `Find the absolute latest news articles, match results, transfers, or official announcements about the sports team "${team}" in the last few days. Focus strictly on real news. Provide a brief 1-2 sentence overview of the team's current status.`,
                  config: {
                    tools: [{ googleSearch: {} }],
                  },
                });

                const chunks = aiResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
                if (chunks && chunks.length > 0) {
                  const aiArticles: any[] = [];
                  chunks.forEach((chunk: any) => {
                    if (chunk.web && chunk.web.uri && chunk.web.title) {
                      if (!isSpamArticle(chunk.web.title, chunk.web.uri)) {
                        let parsedHost = "";
                        try {
                          parsedHost = new URL(chunk.web.uri).hostname.replace("www.", "");
                        } catch (e) {
                          parsedHost = "Google Search";
                        }
                        aiArticles.push({
                          title: chunk.web.title,
                          url: chunk.web.uri,
                          timestamp: Date.now(),
                          source: parsedHost,
                        });
                      }
                    }
                  });

                  if (aiArticles.length > 0) {
                    filteredArticles = aiArticles;
                    const textOut = aiResponse.text;
                    if (textOut) {
                      summaryText = `• Gemini AI Live Analysis: ${textOut.trim()}\n• Chronological live timeline of match reports and squad news compiled below.`;
                    }
                  }
                }
              } catch (aiErr) {
                console.error(`Gemini Search Grounding fallback failed for ${team}:`, aiErr);
              }
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

          if (!summaryText) {
            summaryText = topArticles.length > 0
              ? `• Direct Sports Feed Active. Loaded ${topArticles.length} recent headline${topArticles.length > 1 ? "s" : ""} directly from your tracking feed.\n• Chronological live timeline of match reports and squad news below.`
              : `• No recent developments found on your selected sports websites in the last ${days} days. Try expanding your Recency window or updating customized domains.`;
          }

          // Return feed output directly
          return {
            team,
            summary: summaryText,
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
