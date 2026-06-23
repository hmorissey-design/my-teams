var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json());
function parseGoogleNewsRSS(xmlText) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xmlText)) !== null) {
    const itemContent = match[1];
    const titleMatch = itemContent.match(/<title>([\s\S]*?)<\/title>/);
    let titleStr = titleMatch ? titleMatch[1] : "Sports Update";
    const linkMatch = itemContent.match(/<link>([\s\S]*?)<\/link>/);
    const url = linkMatch ? linkMatch[1] : "";
    const pubDateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
    const pubDateStr = pubDateMatch ? pubDateMatch[1] : "";
    let timestamp = Date.now();
    if (pubDateStr) {
      try {
        timestamp = Date.parse(pubDateStr);
      } catch (e) {
      }
    }
    const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
    const source = sourceMatch ? sourceMatch[1] : "Sports Portal";
    let cleanTitle = titleStr.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
    items.push({
      title: cleanTitle,
      url,
      timestamp,
      source: source || "Sports News"
    });
  }
  return items;
}
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
          let sitesFilter = "";
          if (Array.isArray(customSites) && customSites.length > 0) {
            const formattedSites = customSites.map((s) => s.trim()).filter((s) => s.length > 0).map((s) => s.startsWith("site:") ? s : `site:${s}`);
            if (formattedSites.length > 0) {
              sitesFilter = ` (${formattedSites.join(" OR ")})`;
            }
          }
          const teamLower = team.toLowerCase();
          const commonAndLooseWords = [
            "the",
            "and",
            "team",
            "club",
            "sports",
            "news",
            "official",
            "fc",
            "with",
            "from",
            "for",
            "blue",
            "red",
            "white",
            "black",
            "green",
            "gold",
            "golden",
            "grey",
            "gray",
            "yellow",
            "orange",
            "mighty",
            "city",
            "bay",
            "real",
            "united",
            "town",
            "county",
            "rovers",
            "wanderers",
            "albion",
            "north",
            "south",
            "east",
            "west"
          ];
          const signatureWords = teamLower.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter((w) => w.length >= 3 && !commonAndLooseWords.includes(w));
          const sportsNicknames = [];
          if (teamLower.includes("canadiens") || teamLower.includes("montreal")) {
            sportsNicknames.push("habs");
          }
          if (teamLower.includes("leafs") || teamLower.includes("toronto")) {
            sportsNicknames.push("leafs");
          }
          if (teamLower.includes("jays") || teamLower.includes("toronto")) {
            sportsNicknames.push("jays");
          }
          const isHeadlineMatch = (artTitle) => {
            const titleLower = artTitle.toLowerCase();
            if (titleLower.includes(teamLower)) return true;
            for (const word of signatureWords) {
              if (titleLower.includes(word)) return true;
            }
            for (const nick of sportsNicknames) {
              if (titleLower.includes(nick)) return true;
            }
            return false;
          };
          const searchQuery = sitesFilter ? `"${team}"${sitesFilter}` : `"${team}"`;
          const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;
          const response = await fetch(rssUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
            }
          });
          let articles = [];
          if (response.ok) {
            const xmlText = await response.text();
            const rawArticles = parseGoogleNewsRSS(xmlText);
            articles = rawArticles.filter((art) => isHeadlineMatch(art.title));
          }
          const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1e3;
          let filteredArticles = articles.filter((art) => art.timestamp >= cutoffTime);
          if (filteredArticles.length === 0 && sitesFilter) {
            const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en`;
            const genResponse = await fetch(generalUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0)" }
            });
            if (genResponse.ok) {
              const genXml = await genResponse.text();
              const genArticles = parseGoogleNewsRSS(genXml);
              filteredArticles = genArticles.filter((art) => isHeadlineMatch(art.title)).filter((art) => art.timestamp >= cutoffTime);
            }
          }
          filteredArticles.sort((a, b) => b.timestamp - a.timestamp);
          const topArticles = filteredArticles.slice(0, 8);
          const links = topArticles.map((art) => ({
            title: art.title,
            url: art.url
          }));
          return {
            team,
            summary: topArticles.length > 0 ? `\u2022 Direct Sports Feed Active. Loaded ${topArticles.length} recent headline${topArticles.length > 1 ? "s" : ""} directly from your tracking feed.
\u2022 Chronological live timeline of match reports and squad news below.` : `\u2022 No recent developments found on your selected sports websites in the last ${days} days. Try expanding your Recency window or updating customized domains.`,
            links: links.length > 0 ? links : [
              { title: `Search ${team} news on Google`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
            ],
            articles: topArticles,
            timestamp: Date.now()
          };
        } catch (e) {
          console.error(`Error aggregating feed for ${team}:`, e);
          return {
            team,
            summary: `\u2022 Offline Fallback: Temporary communication error fetching headlines for ${team} (${e.message || e}).
\u2022 Please check settings or wait for automatic retry.`,
            links: [
              { title: `${team} Hub Page`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
            ],
            articles: [],
            timestamp: Date.now(),
            error: true
          };
        }
      })
    );
    res.json({ results });
  } catch (error) {
    console.error("News endpoint error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
