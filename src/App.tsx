import { useState, useEffect } from "react";
import { 
  Settings, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Moon, 
  Sun, 
  Newspaper, 
  ExternalLink, 
  Check, 
  Info, 
  Trophy, 
  AlertCircle,
  X,
  Compass,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { TeamNews, AppSettings, AdData } from "./types";
import { SPORTS_PRESETS, GOOGLE_ADMOB_ADS } from "./data";
// @ts-ignore
import appLogo from "./assets/images/sports_app_logo_1782243294195.jpg";

export default function App() {
  // --- Persistent Local State ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("my_teams_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        let loadedCustomSites = Array.isArray(parsed.customSites) ? parsed.customSites : ["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "skysports.com", "goal.com"];
        
        // Migrate existing saved state to automatically include new default outlets if missing
        if (Array.isArray(parsed.customSites)) {
          if (!loadedCustomSites.includes("skysports.com")) {
            loadedCustomSites = [...loadedCustomSites, "skysports.com"];
          }
          if (!loadedCustomSites.includes("goal.com")) {
            loadedCustomSites = [...loadedCustomSites, "goal.com"];
          }
        }

        // Ensure standard structure
        return {
          recencyDays: typeof parsed.recencyDays === "number" ? Math.min(Math.max(parsed.recencyDays, 1), 2) : 2,
          darkMode: typeof parsed.darkMode === "boolean" ? parsed.darkMode : true,
          teams: Array.isArray(parsed.teams) ? parsed.teams : ["Montreal Canadiens", "Toronto Blue Jays"],
          feedMode: typeof parsed.feedMode === "string" ? parsed.feedMode : "direct",
          customSites: loadedCustomSites,
          sortBy: typeof parsed.sortBy === "string" ? parsed.sortBy : "recent",
        };
      } catch (e) {
        // Fallback
      }
    }
    return {
      recencyDays: 2,
      darkMode: true,
      teams: ["Montreal Canadiens", "Toronto Blue Jays"],
      feedMode: "direct",
      customSites: ["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "skysports.com", "goal.com"],
      sortBy: "recent",
    };
  });

  // --- UI and News States ---
  const [newsCache, setNewsCache] = useState<Record<string, TeamNews>>(() => {
    const todayStr = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("my_teams_last_refresh_date");
    if (lastDate && lastDate !== todayStr) {
      // New day detected. Return empty cache to clear previous day's links.
      return {};
    }

    const saved = localStorage.getItem("my_teams_newscache");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });

  const [viewedLinks, setViewedLinks] = useState<string[]>(() => {
    const todayStr = new Date().toLocaleDateString();
    const lastDate = localStorage.getItem("my_teams_last_refresh_date");
    if (lastDate && lastDate !== todayStr) {
      // New day detected. Return empty viewed links.
      return [];
    }

    try {
      const saved = localStorage.getItem("my_teams_viewed_links");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep last refresh date updated in local storage
  useEffect(() => {
    localStorage.setItem("my_teams_last_refresh_date", new Date().toLocaleDateString());
  }, []);

  const markLinkAsViewed = (url: string) => {
    if (!viewedLinks.includes(url)) {
      const updated = [...viewedLinks, url];
      setViewedLinks(updated);
      localStorage.setItem("my_teams_viewed_links", JSON.stringify(updated));
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customTeamInput, setCustomTeamInput] = useState("");
  const [customSiteInput, setCustomSiteInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"teams" | "engine">("teams");
  const [originalSettings, setOriginalSettings] = useState<AppSettings | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  // Backup original settings when opening dialog
  useEffect(() => {
    if (showSettings && !originalSettings) {
      setOriginalSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [showSettings]);

  const handleCloseAttempt = () => {
    const hasChanges = originalSettings && JSON.stringify(settings) !== JSON.stringify(originalSettings);
    if (hasChanges) {
      setShowUnsavedPrompt(true);
    } else {
      setShowSettings(false);
      setOriginalSettings(null);
    }
  };

  const handleSaveSettings = () => {
    setOriginalSettings(null);
    setShowSettings(false);
    fetchNews(); // Trigger auto-refetch if timeline changed
  };

  const handleCancelExit = () => {
    if (originalSettings) {
      setSettings(originalSettings);
    }
    setShowSettings(false);
    setOriginalSettings(null);
    setShowUnsavedPrompt(false);
  };
  const [isSelectTeamsExpanded, setIsSelectTeamsExpanded] = useState(false);
  const [expandedSports, setExpandedSports] = useState<string[]>([]); // start fully collapsed
  const [expandedLeagues, setExpandedLeagues] = useState<string[]>([]);   // start fully collapsed
  const [selectedTeamTab, setSelectedTeamTab] = useState<string>("All");
  const [isMyTrackedTeamsExpanded, setIsMyTrackedTeamsExpanded] = useState(false);

  // Rotating Ads
  const [topAd, setTopAd] = useState<AdData>(GOOGLE_ADMOB_ADS[0]);
  const [bottomAd, setBottomAd] = useState<AdData>(GOOGLE_ADMOB_ADS[1]);

  // Synchronize Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem("my_teams_settings", JSON.stringify(settings));
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  // Save News Cache
  useEffect(() => {
    localStorage.setItem("my_teams_newscache", JSON.stringify(newsCache));
  }, [newsCache]);

  // Rotate ads on interval
  useEffect(() => {
    const interval = setInterval(() => {
      const randomTop = GOOGLE_ADMOB_ADS[Math.floor(Math.random() * GOOGLE_ADMOB_ADS.length)];
      let randomBottom = GOOGLE_ADMOB_ADS[Math.floor(Math.random() * GOOGLE_ADMOB_ADS.length)];
      while (randomBottom.id === randomTop.id) {
        randomBottom = GOOGLE_ADMOB_ADS[Math.floor(Math.random() * GOOGLE_ADMOB_ADS.length)];
      }
      setTopAd(randomTop);
      setBottomAd(randomBottom);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Client-side parser helpers for when server proxy is unavailable (e.g. GitHub Pages)
  const decodeGoogleNewsUrlClient = (googleUrl: string): string => {
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

          const decoded = atob(normalizedBase64);
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
  };

  const isSpamArticle = (title: string, url: string): boolean => {
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
  };

  const fetchRssWithFallbackProxies = async (rssUrl: string): Promise<string> => {
    const proxies = [
      // 1. corsproxy.io (very fast, direct text response)
      async () => {
        const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(rssUrl)}`);
        if (!res.ok) throw new Error("corsproxy.io failed");
        const text = await res.text();
        if (!text || text.length < 100) throw new Error("Empty or short response from corsproxy.io");
        return text;
      },
      // 2. allorigins.win (returns nested JSON wrapper)
      async () => {
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
        if (!res.ok) throw new Error("allorigins failed");
        const json = await res.json();
        if (!json.contents) throw new Error("allorigins empty content");
        if (json.contents.length < 100) throw new Error("Short response from allorigins");
        return json.contents;
      },
      // 3. codetabs (alternative direct proxy)
      async () => {
        const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`);
        if (!res.ok) throw new Error("codetabs failed");
        const text = await res.text();
        if (!text || text.length < 100) throw new Error("Empty or short response from codetabs");
        return text;
      }
    ];

    let lastError: any = null;
    for (let i = 0; i < proxies.length; i++) {
      try {
        const text = await proxies[i]();
        return text;
      } catch (err) {
        lastError = err;
        console.warn(`Proxy ${i + 1} failed:`, err);
      }
    }
    throw lastError || new Error("All client-side CORS proxies failed");
  };

  const parseGoogleNewsRSSClient = (xmlText: string) => {
    const items: any[] = [];
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
          // ignore
        }
      }
      const sourceMatch = itemContent.match(/<source[^>]*>([\s\S]*?)<\/source>/);
      const source = sourceMatch ? sourceMatch[1] : "Sports Portal";

      const cleanTitle = titleStr
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .trim();

      // Decode Google News redirect URL to direct URL
      const directUrl = decodeGoogleNewsUrlClient(url);

      items.push({
        title: cleanTitle,
        url: directUrl,
        timestamp,
        source: source || "Sports News",
      });
    }
    return items;
  };

  const isHeadlineMatchClient = (artTitle: string, team: string): boolean => {
    const titleLower = artTitle.toLowerCase();
    const teamLower = team.toLowerCase();
    
    // 1. Direct full match (case-insensitive)
    if (titleLower.includes(teamLower)) return true;

    const commonAndLooseWords = [
      "the", "and", "team", "club", "sports", "news", "official", "fc", "cf", "sc", "with", "from", "for",
      "blue", "red", "white", "black", "green", "gold", "golden", "grey", "gray", "yellow", "orange",
      "mighty", "city", "bay", "real", "united", "town", "county", "rovers", "wanderers", "albion",
      "north", "south", "east", "west"
    ];
    const signatureWords = teamLower
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !commonAndLooseWords.includes(w));

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
          const regionalContext = [
            "qmjhl", "lhjmq", "hockey", "chl", "ohl", "whl", "halifax", "mooseheads", 
            "saint john", "sea dogs", "bathurst", "titan", "cape breton", "eagles", 
            "rimouski", "oceanic", "quebec", "remparts", "chicoutimi", "sagueneens", 
            "shawinigan", "cataractes", "sherbrooke", "phoenix", "rouyn-noranda", 
            "huskies", "val-d'or", "foreurs", "boisbriand", "armada", "victoriaville", 
            "tigres", "drummondville", "voltigeurs", "charlottetown", "islanders", 
            "baie-comeau", "drakkar", "brantford", "kitchener", "vancouver", 
            "medicine hat", "everett", "london", "knights", "sarnia", "saginaw", 
            "colts", "otters", "spitfires", "blazers", "rockets", "broncos", "silvertips"
          ];
          const hasContext = regionalContext.some(ctx => titleLower.includes(ctx));
          if (hasContext) return true;
        } else {
          return true;
        }
      }
    } else if (signatureWords.length === 1) {
      if (titleLower.includes(signatureWords[0])) return true;
    }

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
    for (const nick of sportsNicknames) {
      if (titleLower.includes(nick)) return true;
    }

    return false;
  };

  // Crawl news from Express proxy
  const fetchNews = async (forceTeams?: string[], forceRecencyDays?: number) => {
    const targetTeams = forceTeams || settings.teams;
    const targetRecency = typeof forceRecencyDays === "number" ? forceRecencyDays : settings.recencyDays;
    if (targetTeams.length === 0) {
      setErrorMsg("Please add at least one team to track news.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          teams: targetTeams,
          recencyDays: targetRecency,
          feedMode: settings.feedMode,
          customSites: settings.customSites,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to search news via backend.");
      }

      const data = await response.json();
      if (data.results) {
        const updatedCache = { ...newsCache };
        data.results.forEach((item: TeamNews) => {
          updatedCache[item.team] = item;
        });
        setNewsCache(updatedCache);
      }
    } catch (err: any) {
      console.warn("Backend fetch failed, attempting client-side CORS proxy crawler...", err);
      try {
        const updatedCache = { ...newsCache };
        const results = await Promise.all(
          targetTeams.map(async (team) => {
            try {
              let sitesFilter = "";
              if (Array.isArray(settings.customSites) && settings.customSites.length > 0) {
                const formattedSites = settings.customSites
                  .map((s: string) => s.trim())
                  .filter((s: string) => s.length > 0)
                  .map((s: string) => (s.startsWith("site:") ? s : `site:${s}`));

                if (formattedSites.length > 0) {
                  sitesFilter = ` (${formattedSites.join(" OR ")})`;
                }
              }

              const searchQuery = sitesFilter ? `"${team}"${sitesFilter}` : `"${team}"`;
              const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en`;

              // Fetch with robust multi-proxy fallback mechanism
              const xmlText = await fetchRssWithFallbackProxies(rssUrl);

              const rawArticles = parseGoogleNewsRSSClient(xmlText);
              let articles = rawArticles.filter(art => isHeadlineMatchClient(art.title, team) && !isSpamArticle(art.title, art.url));

              const days = Math.min(Math.max(Number(targetRecency) || 1, 1), 2);
              const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
              let filteredArticles = articles.filter((art) => art.timestamp >= cutoffTime);

              if (filteredArticles.length === 0 && sitesFilter) {
                const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en`;
                try {
                  const genXml = await fetchRssWithFallbackProxies(generalUrl);
                  const genArticles = parseGoogleNewsRSSClient(genXml);
                  filteredArticles = genArticles
                    .filter(art => isHeadlineMatchClient(art.title, team) && !isSpamArticle(art.title, art.url))
                    .filter((art) => art.timestamp >= cutoffTime);
                } catch (genErr) {
                  console.warn(`General backup client crawl failed for ${team}:`, genErr);
                }
              }

              filteredArticles.sort((a, b) => b.timestamp - a.timestamp);
              const topArticles = filteredArticles.slice(0, 8);
              const links = topArticles.map((art) => ({
                title: art.title,
                url: art.url,
              }));

              return {
                team,
                summary: topArticles.length > 0
                  ? `• Direct Sports Feed Active (Client-Side). Loaded ${topArticles.length} recent headline${topArticles.length > 1 ? "s" : ""} directly from your tracking feed.\n• Chronological live timeline of match reports and squad news below.`
                  : `• No recent developments found on your selected sports websites in the last ${days} days. Try expanding your Recency window or updating customized domains.`,
                links: links.length > 0 ? links : [
                  { title: `Search ${team} news on Google`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
                ],
                articles: topArticles,
                timestamp: Date.now(),
              };
            } catch (innerErr: any) {
              console.error(`Client-side crawl error for ${team}:`, innerErr);
              return {
                team,
                summary: `• Offline Fallback: Temporary communication error fetching headlines for ${team}.\n• Please check settings or wait for automatic retry.`,
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

        const mergedCache = { ...newsCache };
        results.forEach((item: any) => {
          mergedCache[item.team] = item;
        });
        setNewsCache(mergedCache);
      } catch (fallbackErr) {
        setErrorMsg("Failed to update sports news feed. Both backend and client proxy crawler are offline.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Completely wipe local cache and trigger a crisp recrawl of the chosen teams
  const clearFeedCache = (options?: { fetchAfter?: boolean; forceRecencyDays?: number }) => {
    setNewsCache({});
    localStorage.removeItem("my_teams_newscache");
    setErrorMsg(null);
    if (options?.fetchAfter !== false) {
      setTimeout(() => {
        fetchNews(undefined, options?.forceRecencyDays);
      }, 50);
    }
  };

  // Initial Fetch if cache is empty for followed teams
  useEffect(() => {
    const missing = settings.teams.filter(t => !newsCache[t]);
    if (missing.length > 0 && settings.teams.length > 0) {
      fetchNews();
    }
  }, []);

  // Handle Team Actions
  const handleAddTeam = (teamName: string) => {
    const trimmed = teamName.trim();
    if (!trimmed) return;
    if (settings.teams.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      return; // Already added
    }

    const updatedTeams = [...settings.teams, trimmed];
    setSettings(prev => ({
      ...prev,
      teams: updatedTeams
    }));
    setCustomTeamInput("");
    
    // Auto-fetch for the new team
    fetchNews(updatedTeams);
  };

  const handleRemoveTeam = (teamName: string) => {
    const updatedTeams = settings.teams.filter(t => t !== teamName);
    setSettings(prev => ({
      ...prev,
      teams: updatedTeams
    }));
    if (selectedTeamTab === teamName) {
      setSelectedTeamTab("All");
    }
  };

  const handleMoveTeam = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= settings.teams.length) return;
    
    const updatedTeams = [...settings.teams];
    const temp = updatedTeams[index];
    updatedTeams[index] = updatedTeams[targetIndex];
    updatedTeams[targetIndex] = temp;
    
    setSettings(prev => ({
      ...prev,
      teams: updatedTeams
    }));
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const handleRecencyChange = (days: number) => {
    setSettings(prev => ({
      ...prev,
      recencyDays: days
    }));
    // Clear cache immediately and force a fresh fetch with the new recency value
    clearFeedCache({ fetchAfter: true, forceRecencyDays: days });
  };

  return (
    <div className={`min-h-screen w-full flex flex-col justify-between font-sans transition-colors duration-200 ${settings.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* ================= TOP AD BANNER ================= */}
      <div className={`w-full h-[90px] border-b flex items-center justify-center p-2 relative overflow-hidden transition-colors ${settings.darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="absolute top-1 left-2 bg-amber-500 text-[9px] font-black text-slate-950 px-1 py-0.5 rounded uppercase tracking-wider shadow-sm z-10 select-none">
          AdMob Test Banner BannerTop
        </div>
        
        <div className="w-full max-w-4xl flex items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${topAd.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
              {topAd.sponsor[0]}
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-500 tracking-wide uppercase">{topAd.sponsor}</div>
              <p className={`text-xs md:text-sm font-semibold leading-snug line-clamp-2 ${settings.darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {topAd.headline}
              </p>
            </div>
          </div>
          <button className={`shrink-0 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95`}>
            {topAd.cta}
          </button>
        </div>
      </div>

      {/* ================= HEADER & NAVIGATION ================= */}
      <nav id="app-navbar" className={`h-16 px-6 border-b flex items-center justify-between shrink-0 transition-colors ${settings.darkMode ? 'bg-slate-950/80 backdrop-blur-md border-slate-800' : 'bg-white/80 backdrop-blur-md border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20 border border-emerald-500/30 flex items-center justify-center bg-slate-900 shrink-0">
            <img 
              src={appLogo} 
              alt="My Teams Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase flex items-center gap-2">
              MY TEAMS
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${settings.darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
            <span>{settings.recencyDays === 1 ? "24 Hours News" : "Past Two Days News"}</span>
          </div>

          <button 
            onClick={() => fetchNews()}
            disabled={isLoading || settings.teams.length === 0}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold ${
              settings.darkMode 
                ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm'
            } disabled:opacity-50`}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Refresh All</span>
          </button>

          <button 
            id="settings-trigger"
            onClick={() => setShowSettings(true)}
            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-semibold ${
              settings.darkMode 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Setup & Config</span>
          </button>
        </div>
      </nav>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 self-start overflow-y-auto">
        
        {/* LEFT COLUMN: TEAM CONTROLLER & PRESETS */}
        <div className="lg:col-span-1 flex flex-col gap-5">
          {/* Tracked Selector & Live Search */}
          <div className={`p-4 rounded-2xl border transition-all ${settings.darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <button
              type="button"
              onClick={() => setIsMyTrackedTeamsExpanded(!isMyTrackedTeamsExpanded)}
              className="w-full text-[11px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between text-left transition-colors duration-150 py-0.5"
            >
              <span className="flex items-center gap-1.5 hover:text-slate-200 transition-colors">
                {isMyTrackedTeamsExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                Teams I'm following
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-slate-805 text-slate-300 rounded-full font-mono font-bold">{settings.teams.length}</span>
            </button>

            {isMyTrackedTeamsExpanded && (
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                {settings.teams.length === 0 ? (
                  <div className="text-center py-4 px-2">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs text-slate-400 italic">No teams saved. Select a preset below or type a custom name to track news.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 font-sans">
                    <button
                      onClick={() => setSelectedTeamTab("All")}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        selectedTeamTab === "All"
                          ? "bg-slate-800 text-emerald-400"
                          : "hover:bg-slate-800/45 text-slate-400"
                      }`}
                    >
                      <span>All Teams ({settings.teams.length})</span>
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                    </button>
                    {settings.teams.map((team) => (
                      <div 
                        key={team} 
                        className={`group flex items-center justify-between p-1.5 pl-3 rounded-xl transition-all ${
                          selectedTeamTab === team 
                            ? 'bg-slate-800 text-slate-100 font-bold' 
                            : 'hover:bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        <button 
                          onClick={() => setSelectedTeamTab(team)}
                          className="flex-1 text-left text-xs font-medium truncate"
                        >
                          {team}
                        </button>
                        <button 
                          onClick={() => handleRemoveTeam(team)}
                          title={`Remove ${team}`}
                          className="text-slate-500 hover:text-red-400 p-1 rounded-lg transition-colors opacity-80"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Custom add field */}
                <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
                  <form onSubmit={(e) => { e.preventDefault(); handleAddTeam(customTeamInput); }} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter custom team..."
                      value={customTeamInput}
                      onChange={(e) => setCustomTeamInput(e.target.value)}
                      className={`flex-1 text-xs px-3 py-2 rounded-xl outline-none border transition-all ${
                        settings.darkMode 
                          ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-slate-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-350'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={!customTeamInput.trim()}
                      className="p-2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 rounded-xl transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setSettingsTab("teams");
                      setShowSettings(true);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border ${
                      settings.darkMode
                        ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border-emerald-250 shadow-sm'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-emerald-500" />
                    <span>Browse Preset Choices...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: NEWS GRID CONTAINER */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Global Alert Notification / Fetch status */}
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-400">Oops, something went wrong</p>
                <p className="text-xs text-slate-400 mt-1">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Empty Setup Guidance */}
          {settings.teams.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center ${settings.darkMode ? 'bg-slate-900/30 border-slate-850' : 'bg-white border-slate-250 shadow-sm'}`}>
              <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold mb-2">Welcome to MY TEAMS</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto mb-6">
                Your bespoke Google Play news tracker. Begin by adding teams in the left sidebar or select from popular sports groups. We will search, gather, and organize the ultimate live-crawled updates for you.
              </p>
              <div className="flex justify-center gap-3">
                <button 
                  onClick={() => handleAddTeam("Montreal Canadiens")} 
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Track Montreal Canadiens
                </button>
                <button 
                  onClick={() => handleAddTeam("Toronto Blue Jays")} 
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700 transition"
                >
                  Track Toronto Blue Jays
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header section status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${
                    settings.darkMode 
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                      : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                    <h2>
                      {settings.recencyDays === 1 ? "News found in last 24 hours" : "News found in past two days"}
                    </h2>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 self-start sm:self-center">
                  {isLoading && (
                    <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl animate-pulse">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                      <span>Crawling live feeds...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* News Panels (Separated by team) */}
              <div className="space-y-6">
                {[...settings.teams]
                  .filter(team => selectedTeamTab === "All" || selectedTeamTab === team)
                  .sort((a, b) => {
                    if (settings.sortBy === "default") {
                      return settings.teams.indexOf(a) - settings.teams.indexOf(b);
                    }
                    const getLatestTime = (t: string) => {
                      const cache = newsCache[t];
                      if (!cache) return 0;
                      let maxArtTime = 0;
                      if (cache.articles && cache.articles.length > 0) {
                        maxArtTime = Math.max(...cache.articles.map(art => art.timestamp || 0));
                      }
                      return Math.max(maxArtTime, cache.timestamp || 0);
                    };
                    return getLatestTime(b) - getLatestTime(a);
                  })
                  .map((team) => {
                    const data = newsCache[team];
                    
                    return (
                      <div 
                        key={team} 
                        className={`p-5 rounded-2xl border transition-all ${
                          settings.darkMode 
                            ? 'bg-slate-900 border-slate-800/80 hover:border-slate-700/80' 
                            : 'bg-white border-slate-200 hover:shadow-lg hover:border-slate-250 transition-shadow'
                        }`}
                      >
                        {/* Team Title Guard */}
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-400/20 font-black text-xs text-emerald-400">
                              {team.substring(0, 3).toUpperCase()}
                            </div>
                            <h3 className="text-base font-bold font-display">{team}</h3>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            {data?.timestamp && (
                              <span className="text-[10px] text-slate-500 font-medium">
                                Updated: {new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            <button 
                              onClick={() => fetchNews([team])}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 rounded-lg transition-colors"
                              title="Recrawl this team"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Content Body */}
                        {!data ? (
                          <div className="py-8 text-center bg-slate-950/20 rounded-xl border border-dashed border-slate-800">
                            <Newspaper className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 italic">No news indexed yet.</p>
                            <button
                              onClick={() => fetchNews([team])}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-[11px] font-bold rounded-lg transition-all"
                            >
                              Crawl Live News <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {/* Feed status note - Only shown if there is an error */}
                            {data.error && (
                              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                                settings.darkMode 
                                  ? 'bg-rose-950/20 border-rose-900/50 text-rose-300' 
                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                              }`}>
                                <div className="flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                  <span>{data.summary.replace(/^[•\s]+/g, '').split('\n')[0]}</span>
                                </div>
                              </div>
                            )}

                            {/* Direct articles timeline */}
                            <div className="flex flex-col gap-2.5">
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[34rem] overflow-y-auto pr-1">
                                {data.articles && data.articles.length > 0 ? (
                                  data.articles.map((art, idx) => {
                                    const diffMs = Date.now() - art.timestamp;
                                    const diffHrs = Math.round(diffMs / (1000 * 60 * 60));
                                    let relativeTime = "";
                                    if (diffHrs < 1) {
                                      relativeTime = "Just now";
                                    } else if (diffHrs < 24) {
                                      relativeTime = `${diffHrs}h ago`;
                                    } else {
                                      const diffDays = Math.round(diffHrs / 24);
                                      relativeTime = `${diffDays}d ago`;
                                    }

                                    const isViewed = viewedLinks.includes(art.url);

                                    return (
                                      <a
                                        key={idx}
                                        href={art.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => markLinkAsViewed(art.url)}
                                        className={`py-1.5 px-3 rounded-lg border text-left flex items-start gap-2.5 group transition-all duration-150 ${
                                          isViewed
                                            ? (settings.darkMode
                                                ? 'bg-slate-950/20 border-slate-900/60 hover:bg-slate-900/40'
                                                : 'bg-slate-100/50 border-slate-200/50 hover:bg-slate-100/80')
                                            : (settings.darkMode
                                                ? 'bg-slate-950/45 border-slate-800/70 hover:bg-slate-900/90 hover:border-emerald-500/40'
                                                : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-emerald-500/35 hover:shadow-sm')
                                        }`}
                                      >
                                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-transform ${
                                          isViewed
                                            ? 'bg-slate-600 dark:bg-slate-700'
                                            : 'bg-emerald-400 group-hover:scale-125'
                                        }`}></div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-xs font-bold leading-normal tracking-tight transition-colors line-clamp-2 ${
                                            isViewed
                                              ? (settings.darkMode 
                                                  ? 'text-slate-500 group-hover:text-slate-400' 
                                                  : 'text-slate-450 group-hover:text-slate-600')
                                              : (settings.darkMode 
                                                  ? 'text-slate-100 group-hover:text-emerald-400' 
                                                  : 'text-slate-800 group-hover:text-emerald-600')
                                          }`}>
                                            {art.title}
                                          </p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[9px] font-black uppercase px-1 py-0.2 rounded font-mono ${
                                              isViewed
                                                ? 'text-slate-500 bg-slate-500/5 dark:bg-slate-500/10'
                                                : 'text-emerald-500 bg-emerald-500/10'
                                            }`}>
                                              {art.source}
                                            </span>
                                            <span className="text-[9px] text-slate-500 font-mono">{relativeTime}</span>
                                            {isViewed && (
                                              <span className="text-[8px] uppercase tracking-wider font-extrabold text-slate-500 bg-slate-500/10 px-1 py-0.2 rounded font-mono">
                                                Viewed
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <ExternalLink className={`w-3 h-3 shrink-0 self-center transition-colors ${
                                          isViewed
                                            ? 'text-slate-600 group-hover:text-slate-500'
                                            : 'text-slate-500 group-hover:text-emerald-400'
                                        }`} />
                                      </a>
                                    );
                                  })
                                ) : (
                                  <div className="col-span-1 md:col-span-2 text-xs text-slate-500 italic p-4 bg-slate-950/20 rounded-xl text-center border border-dashed border-slate-800/50">
                                    No recent stories matched selected web outlets for this team. Add more outlets or extend your recency lookup!
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* ================= BOTTOM AD BANNER ================= */}
      <div className={`w-full min-h-[90px] border-t flex flex-col items-center justify-center p-2 relative overflow-hidden transition-colors ${settings.darkMode ? 'bg-slate-900/90 border-slate-805' : 'bg-white border-slate-200 shadow-inner'}`}>
        <div className="absolute top-1 left-2 bg-purple-500 text-[9px] font-black text-white px-1 py-0.5 rounded uppercase tracking-wider shadow-sm z-10 select-none">
          AdMob Test Banner BannerBottom
        </div>

        <div className="w-full max-w-4xl flex items-center justify-between gap-4 px-4 py-1">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${bottomAd.color} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
              {bottomAd.sponsor[0]}
            </div>
            <div>
              <div className="text-[10px] font-bold text-purple-400 tracking-wide uppercase">{bottomAd.sponsor}</div>
              <p className={`text-xs md:text-sm font-semibold leading-snug line-clamp-2 ${settings.darkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                {bottomAd.headline}
              </p>
            </div>
          </div>
          <button className={`shrink-0 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95`}>
            {bottomAd.cta}
          </button>
        </div>
        <div className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">Publisher Account: Pub-48392019-3829 • Google AdMob SDK Sandbox</div>
      </div>

      {/* ================= CONFIGURATION MODAL / SHEET ================= */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className={`w-full max-w-xl rounded-2xl border p-6 flex flex-col gap-5 text-left relative transition-all shadow-2xl my-8 ${settings.darkMode ? 'bg-slate-900 border-slate-805 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
            
            {/* Modal Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${settings.darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-400 animate-spin-slow" />
                <h3 className="text-sm sm:text-base font-bold uppercase tracking-wide">Configure App Settings</h3>
              </div>
              <button 
                type="button"
                onClick={handleCloseAttempt}
                className={`p-1.5 rounded-lg border transition-colors ${
                  settings.darkMode 
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400' 
                    : 'border-slate-200 hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
                  {/* Scrollable Settings Panel */}
            <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
              
              {/* SECTION 1: COLLAPSIBLE SELECT TEAMS TO FOLLOW */}
              <div className={`rounded-xl border p-1.5 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <button
                  type="button"
                  onClick={() => setIsSelectTeamsExpanded(!isSelectTeamsExpanded)}
                  className="w-full px-3 py-2 flex items-center justify-between text-left font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    {isSelectTeamsExpanded ? (
                      <ChevronDown className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    🏆 Select Teams to Follow
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">By Sport & League</span>
                </button>

                {isSelectTeamsExpanded && (
                  <div className="p-2 space-y-2.5 border-t border-slate-800/30 mt-1">
                    {SPORTS_PRESETS.map((sport) => {
                      const isSportExpanded = expandedSports.includes(sport.id);
                      const sportFollowedCount = sport.leagues.reduce((acc, league) => {
                        return acc + league.teams.filter(t => settings.teams.includes(t.name)).length;
                      }, 0);

                      return (
                        <div key={sport.id} className={`rounded-lg overflow-hidden border ${
                          settings.darkMode ? 'border-slate-850 bg-slate-900/40' : 'border-slate-200 bg-white shadow-xs'
                        }`}>
                          {/* Sport Level Header */}
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedSports(prev => 
                                prev.includes(sport.id) 
                                  ? prev.filter(id => id !== sport.id) 
                                  : [...prev, sport.id]
                              );
                            }}
                            className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors font-semibold text-xs ${
                              settings.darkMode ? 'hover:bg-slate-850 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{sport.icon}</span>
                              <span className="font-extrabold uppercase tracking-wide">{sport.name}</span>
                              {sportFollowedCount > 0 && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                  {sportFollowedCount} active
                                </span>
                              )}
                            </div>
                            <div>
                              {isSportExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {/* League Level Sub-Accordion */}
                          {isSportExpanded && (
                            <div className={`p-2 space-y-2 border-t ${
                              settings.darkMode ? 'border-slate-850/60 bg-slate-950/40' : 'border-slate-100 bg-slate-50/50'
                            }`}>
                              {sport.leagues.map((league) => {
                                const isLeagueExpanded = expandedLeagues.includes(league.id);
                                const leagueFollowedCount = league.teams.filter(t => settings.teams.includes(t.name)).length;

                                return (
                                  <div key={league.id} className={`rounded-lg border overflow-hidden ${
                                    settings.darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white shadow-xs'
                                  }`}>
                                    {/* League level header */}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setExpandedLeagues(prev =>
                                          prev.includes(league.id) ? prev.filter(id => id !== league.id) : [...prev, league.id]
                                        );
                                      }}
                                      className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors font-semibold text-[11px] ${
                                        settings.darkMode ? 'hover:bg-slate-850 text-slate-300' : 'hover:bg-slate-100 text-slate-750'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span className="font-bold">{league.name}</span>
                                        {leagueFollowedCount > 0 && (
                                          <span className="text-[8px] font-mono font-black px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                                            {leagueFollowedCount}
                                          </span>
                                        )}
                                      </div>
                                      <div>
                                        {isLeagueExpanded ? (
                                          <ChevronDown className="w-3 h-3 text-slate-400" />
                                        ) : (
                                          <ChevronRight className="w-3 h-3 text-slate-400" />
                                        )}
                                      </div>
                                    </button>

                                    {/* Team Grid */}
                                    {isLeagueExpanded && (
                                      <div className={`p-3 border-t grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto ${
                                        settings.darkMode ? 'border-slate-800 bg-slate-950/30' : 'border-slate-150 bg-slate-50/45'
                                      }`}>
                                        {league.teams.map((item) => {
                                          const isFollowed = settings.teams.includes(item.name);
                                          return (
                                            <button
                                              key={item.name}
                                              type="button"
                                              onClick={() => isFollowed ? handleRemoveTeam(item.name) : handleAddTeam(item.name)}
                                              className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold transition-all flex items-center justify-between gap-1 active:scale-95 border ${
                                                isFollowed
                                                  ? settings.darkMode
                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/35 hover:bg-emerald-500/30'
                                                    : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm'
                                                  : settings.darkMode
                                                    ? 'bg-slate-900 border-slate-800 text-slate-450 hover:bg-slate-850'
                                                    : 'bg-white border-slate-250 text-slate-600 hover:bg-slate-100 shadow-sm'
                                              }`}
                                            >
                                              <span className="truncate">{item.display}</span>
                                              {isFollowed ? (
                                                <Check className="w-3 h-3 shrink-0 text-emerald-400" />
                                              ) : (
                                                <Plus className="w-3 h-3 shrink-0 opacity-40" />
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 2: CURRENTLY TRACKED TEAMS & ORDER */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-black uppercase tracking-wider block ${
                    settings.darkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}>Currently Tracked Teams & Priority ({settings.teams.length})</span>
                  {settings.teams.length > 1 && (
                    <span className="text-[9px] text-slate-500 font-medium">Use arrows to prioritize</span>
                  )}
                </div>
                
                {settings.teams.length === 0 ? (
                  <span className="text-xs text-slate-500 italic block">No teams currently tracked. Select a league preset above or use the sidebar form.</span>
                ) : (
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {settings.teams.map((t, index) => (
                      <div 
                        key={t} 
                        className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition-all ${
                          settings.darkMode 
                            ? 'bg-slate-900 border-slate-800 text-slate-200' 
                            : 'bg-white border-slate-200 text-slate-700 shadow-sm'
                        }`}
                      >
                        <span className="truncate flex-1 pr-2">{t}</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Move Up */}
                          <button
                            type="button"
                            onClick={() => handleMoveTeam(index, 'up')}
                            disabled={index === 0}
                            className={`p-1 rounded transition-colors ${
                              index === 0 
                                ? 'text-slate-600 cursor-not-allowed opacity-30' 
                                : settings.darkMode ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                            }`}
                            title="Move team up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          {/* Move Down */}
                          <button
                            type="button"
                            onClick={() => handleMoveTeam(index, 'down')}
                            disabled={index === settings.teams.length - 1}
                            className={`p-1 rounded transition-colors ${
                              index === settings.teams.length - 1 
                                ? 'text-slate-600 cursor-not-allowed opacity-30' 
                                : settings.darkMode ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800' : 'text-slate-500 hover:text-emerald-600 hover:bg-slate-100'
                            }`}
                            title="Move team down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          {/* Remove */}
                          <button
                            type="button"
                            onClick={() => handleRemoveTeam(t)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-500/10 hover:text-rose-450 transition-colors ml-1"
                            title={`Unfollow ${t}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 3: NEWS CRAWL LOOKBACK WINDOW */}
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide flex justify-between">
                  <span>News Crawl Lookback Window</span>
                  <span className="text-emerald-400 font-mono text-sm font-semibold">{settings.recencyDays} {settings.recencyDays === 1 ? 'day' : 'days'}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="2"
                  value={settings.recencyDays}
                  onChange={(e) => handleRecencyChange(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-805 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>1 Day (Ultra-Fresh)</span>
                  <span>2 Days (Maximum)</span>
                </div>
              </div>

              {/* SECTION 4: OUTLETS & CUSTOM OUTLETS FILTER */}
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  Target Sports Web Outlets to Display News From
                </label>
                
                <div className="space-y-3">
                  {/* Global & NA */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Global & North America
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "bleacherreport.com", "yahoosports.com"].map((site) => {
                        const isActive = settings.customSites.includes(site);
                        return (
                          <button
                            key={site}
                            type="button"
                            onClick={() => {
                              setSettings(p => {
                                const updated = isActive 
                                  ? p.customSites.filter(s => s !== site)
                                  : [...p.customSites, site];
                                return { ...p, customSites: updated };
                              });
                            }}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono font-bold ${
                              isActive
                                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                                : settings.darkMode
                                  ? "bg-slate-950/40 border-slate-850 text-slate-450 hover:border-slate-705"
                                  : "bg-white border-slate-205 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isActive ? "✓ " : ""}{site}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* UK & English Europe */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      United Kingdom & Global Soccer
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {["skysports.com", "bbc.co.uk", "fourfourtwo.com", "theguardian.com", "goal.com"].map((site) => {
                        const isActive = settings.customSites.includes(site);
                        return (
                          <button
                            key={site}
                            type="button"
                            onClick={() => {
                              setSettings(p => {
                                const updated = isActive 
                                  ? p.customSites.filter(s => s !== site)
                                  : [...p.customSites, site];
                                return { ...p, customSites: updated };
                              });
                            }}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono font-bold ${
                              isActive
                                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                                : settings.darkMode
                                  ? "bg-slate-950/40 border-slate-850 text-slate-450 hover:border-slate-705"
                                  : "bg-white border-slate-205 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isActive ? "✓ " : ""}{site}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Continental Europe */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Continental Europe (Local News & Newspapers)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "marca.com", "as.com", "mundodeportivo.com", 
                        "gazzetta.it", "corrieredellosport.it", "tuttosport.com", 
                        "kicker.de", "bild.de", "sport1.de", 
                        "lequipe.fr", "francefootball.fr", "footmercato.net"
                      ].map((site) => {
                        const isActive = settings.customSites.includes(site);
                        return (
                          <button
                            key={site}
                            type="button"
                            onClick={() => {
                              setSettings(p => {
                                const updated = isActive 
                                  ? p.customSites.filter(s => s !== site)
                                  : [...p.customSites, site];
                                return { ...p, customSites: updated };
                              });
                            }}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono font-bold ${
                              isActive
                                ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400"
                                : settings.darkMode
                                  ? "bg-slate-950/40 border-slate-850 text-slate-450 hover:border-slate-705"
                                  : "bg-white border-slate-205 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {isActive ? "✓ " : ""}{site}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Add Custom Outlets */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Type custom news domain (e.g. nfl.com)..."
                    value={customSiteInput}
                    onChange={(e) => setCustomSiteInput(e.target.value)}
                    className={`flex-1 text-xs px-3 py-2 rounded-xl border outline-none font-mono ${
                      settings.darkMode
                        ? "bg-slate-950 border-slate-800 text-slate-100 focus:border-slate-750"
                        : "bg-slate-50 border-slate-200 text-slate-850 focus:border-slate-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const clean = customSiteInput.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
                      if (clean && !settings.customSites.includes(clean)) {
                        setSettings(p => ({ ...p, customSites: [...p.customSites, clean] }));
                      }
                      setCustomSiteInput("");
                    }}
                    className="px-3 bg-slate-800 text-slate-100 rounded-xl hover:bg-slate-700 text-xs font-bold font-mono transition-all"
                  >
                    + Add
                  </button>
                </div>

                {settings.customSites.length > 0 && (
                  <div className={`p-3 rounded-xl border flex flex-wrap gap-1.5 max-h-24 overflow-y-auto ${
                    settings.darkMode ? 'bg-slate-950/30 border-slate-855' : 'bg-slate-50 border-slate-200 shadow-inner'
                  }`}>
                    <div className="flex justify-between items-center w-full mb-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase block">Currently active outlets filter ({settings.customSites.length}):</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSettings(p => ({
                            ...p,
                            customSites: ["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "skysports.com", "goal.com"]
                          }));
                        }}
                        className="text-[9px] text-emerald-500 hover:text-emerald-400 font-bold transition-all"
                      >
                        Reset to Defaults
                      </button>
                    </div>
                    {settings.customSites.map(s => (
                      <span key={s} className={`text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-mono ${
                        settings.darkMode ? 'bg-slate-800 text-slate-350' : 'bg-white border border-slate-200 text-slate-700 shadow-sm'
                      }`}>
                        {s}
                        <button 
                          type="button"
                          onClick={() => setSettings(p => ({ ...p, customSites: p.customSites.filter(out => out !== s) }))}
                          className="text-red-500 hover:text-red-400 ml-1 select-none font-bold font-sans text-xs"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 5: NEWS SORTING MODE */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                  News Sorting Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, sortBy: "recent" }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 justify-center text-center ${
                      settings.sortBy === "recent"
                        ? (settings.darkMode ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm')
                        : (settings.darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm')
                    }`}
                  >
                    <span className="text-xs">⚡ Latest Activity</span>
                    <span className="text-[9px] font-medium text-slate-500">Newest headline first</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, sortBy: "default" }))}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 justify-center text-center ${
                      settings.sortBy === "default"
                        ? (settings.darkMode ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm')
                        : (settings.darkMode ? 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm')
                    }`}
                  >
                    <span className="text-xs">📌 Custom Order</span>
                    <span className="text-[9px] font-medium text-slate-500">Use team list priority order</span>
                  </button>
                </div>
              </div>

              {/* SECTION 6: APPEARANCE TOGGLE */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Dark Mode</span>
                  <span className="text-[11px] text-slate-550">Toggle elegant neon dark vs workspace crisp light mode.</span>
                </div>
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold ${
                    settings.darkMode 
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' 
                      : 'bg-white border-slate-305 text-slate-705 hover:bg-slate-100 shadow-sm'
                  }`}
                >
                  {settings.darkMode ? (
                    <>
                      <Moon className="w-4 h-4 text-emerald-400" />
                      <span>Dark Theme</span>
                    </>
                  ) : (
                    <>
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Light Theme</span>
                    </>
                  )}
                </button>
              </div>

              {/* SECTION 7: READ HISTORY */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Clear Read History</span>
                  <span className="text-[11px] text-slate-550 block">Reset color styling for already clicked article links.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setViewedLinks([]);
                    localStorage.removeItem("my_teams_viewed_links");
                  }}
                  disabled={viewedLinks.length === 0}
                  className={`p-2.5 rounded-xl border transition-all text-xs font-bold shrink-0 ${
                    viewedLinks.length === 0
                      ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                      : settings.darkMode 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20' 
                        : 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 shadow-sm'
                  }`}
                >
                  Clear ({viewedLinks.length})
                </button>
              </div>

              {/* SECTION 8: FEED CACHE RESET */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Reset Live Feed Cache</span>
                  <span className="text-[11px] text-slate-550 block">Wipe locally saved stories and trigger a clean filter feed.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearFeedCache();
                    setOriginalSettings(null);
                    setShowSettings(false);
                  }}
                  className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset Cache</span>
                </button>
              </div>

              {/* Play Store Safe Notice */}
              <div className={`p-4 rounded-xl text-left border flex gap-3 ${settings.darkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-200'}`}>
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold block uppercase tracking-wider text-slate-400">Play Store Standalone Safe</span>
                  <p className="text-[11px] text-slate-500 leading-normal mt-0.5 font-sans">
                    This news app stores all team configurations and crawl cache locally on your device. It does not require any third-party auth, account registrations, cookies, or telemetry tracking, fully complying with Google Play Developer Policies.
                  </p>
                </div>
              </div>

            </div>

            {/* Close Button */}
            <button
              onClick={handleSaveSettings}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs rounded-xl uppercase tracking-wider transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning Dialog Overlay */}
      {showUnsavedPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
          <div className={`w-full max-w-sm rounded-2xl border p-5 flex flex-col gap-4 text-center shadow-2xl relative transition-all ${
            settings.darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="mx-auto w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 animate-pulse">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider">Unsaved Changes</h4>
              <p className={`text-xs mt-2 leading-relaxed ${settings.darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Changes have not been saved. Do you wish to exit without saving?
              </p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={handleCancelExit}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all"
              >
                Yes Exit
              </button>
              <button
                type="button"
                onClick={() => setShowUnsavedPrompt(false)}
                className={`w-full py-2.5 font-bold text-xs rounded-xl uppercase tracking-wider transition-all border ${
                  settings.darkMode
                    ? 'border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-950/60'
                    : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                No I want to Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
