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

  // 1. Check for spam sources declared in the Google News title itself (e.g. "Headline - Fathom Journal")
  const sourceMatch = title.match(/\s+-\s+([^-]+)$/);
  if (sourceMatch) {
    const sourceName = sourceMatch[1].toLowerCase().trim();
    const SPAM_SOURCES = [
      "fathom journal", "fathom", "mshale", "operanews", "daily advent", 
      "scores24", "oddspedia", "vipleague", "viprow", "flohockey.tv", "flohockey", "hockeytv"
    ];
    if (SPAM_SOURCES.some(s => sourceName.includes(s))) {
      return true;
    }
  }

  // 2. Check for parenthetical random alphanumeric code identifiers (e.g. "(Dp6SFCgXkF)")
  // These are used by auto-generated spam scripts to bypass search duplicate filters.
  const parentheticalMatch = title.match(/\(([A-Za-z0-9]{7,15})\)/);
  if (parentheticalMatch) {
    const code = parentheticalMatch[1];
    const hasLower = /[a-z]/.test(code);
    const hasUpper = /[A-Z]/.test(code);
    const hasDigits = /[0-9]/.test(code);
    // Spam codes have a mix of casing (e.g. Dp6SFCgXkF) or mix of letters and digits.
    // Standard sports terms inside parentheses are e.g. "(QMJHL)" or "(Halifax)"
    if ((hasDigits && (hasLower || hasUpper)) || (hasLower && /[A-Z]/.test(code.slice(1)))) {
      return true;
    }
  }

  // 3. Try to decode the Google News redirect URL to check the actual destination hostname
  let resolvedUrl = url;
  try {
    if (url.includes("news.google.com")) {
      const parts = url.split("/");
      let b64 = parts[parts.length - 1];
      if (b64.includes("?")) {
        b64 = b64.split("?")[0];
      }
      b64 = b64.replace(/-/g, "+").replace(/_/g, "/");
      while (b64.length % 4 !== 0) {
        b64 += "=";
      }
      
      let decoded = "";
      if (typeof Buffer !== "undefined") {
        decoded = Buffer.from(b64, "base64").toString("utf-8");
      } else if (typeof atob !== "undefined") {
        decoded = atob(b64);
      }
      
      const match = decoded.match(/https?:\/\/[^\s"'\x00-\x1F\x7F-\x9F]+/);
      if (match) {
        resolvedUrl = match[0];
      }
    }
  } catch (e) {
    // ignore decoding errors
  }

  let hostname = "";
  let pathname = "";
  let search = "";
  try {
    const parsedUrl = new URL(resolvedUrl);
    hostname = parsedUrl.hostname.toLowerCase();
    pathname = parsedUrl.pathname.toLowerCase();
    search = parsedUrl.search.toLowerCase();
  } catch (e) {
    // ignore URL parsing errors
  }

  const TRUSTED_STREAM_DOMAINS = [
    "espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "chl.ca", "theqmjhl.ca", 
    "cbc.ca", "rds.ca", "tvasports.ca", "youtube.com", "vimeo.com", "twitch.tv",
    "cbssports.com", "nbcsports.com", "foxsports.com"
  ];

  const SPAM_PHRASES = [
    "live stream", "livestream", "free stream", "stream free", "watch live", 
    "how to watch", "streaming free", "live broadcast", "stream link", 
    "hd stream", "stream online", "watch online", "broadcast online",
    "watch on tv", "where to watch"
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
    "freestreams", "buffstreams", "vipleague", "cricfree", "crackstreams", "hacked", "redirect",
    "mshale.com", "mshale", "flohockey.tv", "flohockey", "hockeytv", "dailyadvent", "operanews",
    "scores24", "oddspedia", "betting", "odds", "prediction", "match-preview", "ticket", "stubhub",
    "seatgeek", "ticketmaster", "vipleague", "viprow"
  ];

  if (SPAM_DOMAINS.some(domain => hostname.includes(domain))) {
    return true;
  }

  // Filter out non-news path directories for non-trusted domains (e.g. event listings, ticket pages, video replays)
  const isTrustedNewsDomain = TRUSTED_STREAM_DOMAINS.some(domain => hostname.includes(domain));
  if (!isTrustedNewsDomain) {
    const NON_NEWS_PATH_PATTERNS = [
      "/events/", "/tickets/", "/schedule/", "/replays/", "/product/", "/shop/", "/videos/"
    ];
    if (NON_NEWS_PATH_PATTERNS.some(pat => pathname.includes(pat))) {
      return true;
    }
    if (search.includes("playing=") || search.includes("eventid=")) {
      return true;
    }
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

// Helper to determine the sport of any given team
function getSportForTeam(teamName: string): string {
  const teamLower = teamName.toLowerCase().trim();

  if (
    teamLower.includes("canadiens") || teamLower.includes("leafs") || teamLower.includes("bruins") ||
    teamLower.includes("rangers") || teamLower.includes("penguins") || teamLower.includes("blackhawks") ||
    teamLower.includes("red wings") || teamLower.includes("oilers") || teamLower.includes("canucks") ||
    teamLower.includes("knights") || teamLower.includes("colts") || teamLower.includes("otters") ||
    teamLower.includes("spitfires") || teamLower.includes("greyhounds") || teamLower.includes("titan") ||
    teamLower.includes("drakkar") || teamLower.includes("mooseheads") || teamLower.includes("blazers") ||
    teamLower.includes("rockets") || teamLower.includes("silvertips") || teamLower.includes("marlies") ||
    teamLower.includes("comets") || teamLower.includes("roadrunners") || teamLower.includes("wranglers") ||
    teamLower.includes("monsters") || teamLower.includes("firebirds") || teamLower.includes("barracuda") ||
    teamLower.includes("reign") || teamLower.includes("gulls") || teamLower.includes("condors") ||
    teamLower.includes("senators") || teamLower.includes("devils") || teamLower.includes("islanders") ||
    teamLower.includes("sabres") || teamLower.includes("flyers") || teamLower.includes("capitals") ||
    teamLower.includes("hurricanes") || teamLower.includes("lightning") || teamLower.includes("panthers") ||
    teamLower.includes("predators") || teamLower.includes("blues") || teamLower.includes("stars") ||
    teamLower.includes("avalanche") || teamLower.includes("wild") || teamLower.includes("kraken") ||
    teamLower.includes("coyotes") || teamLower.includes("thrashers") || teamLower.includes("wolf pack") ||
    teamLower.includes("phantoms") || teamLower.includes("crunch") || teamLower.includes("bears") ||
    teamLower.includes("admirals") || teamLower.includes("griffins") || teamLower.includes("moose") ||
    teamLower.includes("wolves") || teamLower.includes("icehogs") || teamLower.includes("gulls") ||
    teamLower.includes("conquerors") || teamLower.includes("battalion") || teamLower.includes("generals") ||
    teamLower.includes("petes") || teamLower.includes("frontenacs") || teamLower.includes("67's") ||
    teamLower.includes("67s") || teamLower.includes("frontenac") || teamLower.includes("sagueneens") ||
    teamLower.includes("saguenéens") || teamLower.includes("cataractes") || teamLower.includes("voltigeurs") ||
    teamLower.includes("oceanic") || teamLower.includes("océanic") || teamLower.includes("remparts") ||
    teamLower.includes("foreurs") || teamLower.includes("tigres") || teamLower.includes("armada") ||
    teamLower.includes("phoenix") || teamLower.includes("huskies") || teamLower.includes("wheat kings") ||
    teamLower.includes("hitmen") || teamLower.includes("oil kings") || teamLower.includes("blazers") ||
    teamLower.includes("rockets") || teamLower.includes("hurricanes") || teamLower.includes("tigers") ||
    teamLower.includes("warriors") || teamLower.includes("winterhawks") || teamLower.includes("raiders") ||
    teamLower.includes("cougars") || teamLower.includes("rebels") || teamLower.includes("pats") ||
    teamLower.includes("blades") || teamLower.includes("thunderbirds") || teamLower.includes("chiefs") ||
    teamLower.includes("broncos") || teamLower.includes("americans") || teamLower.includes("giants") ||
    teamLower.includes("royals") || teamLower.includes("wild") ||
    // SHL Sweden keywords
    teamLower.includes("brynäs") || teamLower.includes("frölunda") || teamLower.includes("färjestad") ||
    teamLower.includes("hv71") || teamLower.includes("leksand") || teamLower.includes("linköping") ||
    teamLower.includes("luleå") || teamLower.includes("malmö") || teamLower.includes("modo") ||
    teamLower.includes("rögle") || teamLower.includes("skellefteå") || teamLower.includes("timrå") ||
    teamLower.includes("växjö") || teamLower.includes("örebro") ||
    // NL Switzerland keywords
    teamLower.includes("ajoie") || teamLower.includes("ambrì") || teamLower.includes("sc bern") ||
    teamLower.includes("biel-bienne") || teamLower.includes("davos") || teamLower.includes("genève-servette") ||
    teamLower.includes("gottéron") || teamLower.includes("lausanne") || teamLower.includes("lugano") ||
    teamLower.includes("scl tigers") || teamLower.includes("rapperswil-jona") || teamLower.includes("ev zug") ||
    teamLower.includes("zsc lions") || teamLower.includes("kloten") ||
    // Liiga Finland keywords
    teamLower.includes("hifk") || teamLower.includes("hpk") || teamLower.includes("ilves") ||
    teamLower.includes("jukurit") || teamLower.includes("jyp") || teamLower.includes("kalpa") ||
    teamLower.includes("kookoo") || teamLower.includes("kärpät") || teamLower.includes("lukko") ||
    (teamLower.includes("pelicans") && !teamLower.includes("orleans")) || teamLower.includes("saipa") ||
    teamLower.includes("vaasan sport") || teamLower.includes("tappara") || teamLower.includes("tps") ||
    teamLower.includes("ässät") || teamLower.includes("kiekko-espoo") ||
    // Extraliga Czechia keywords
    teamLower.includes("liberec") || teamLower.includes("mountfield hk") || teamLower.includes("karlovy vary") ||
    teamLower.includes("kladno") || teamLower.includes("litvínov") || teamLower.includes("olomouc") ||
    teamLower.includes("pardubice") || teamLower.includes("plzeň") || teamLower.includes("sparta praha") ||
    teamLower.includes("třinec") || teamLower.includes("vítkovice") || teamLower.includes("české budějovice") ||
    teamLower.includes("kometa brno") || teamLower.includes("boleslav") ||
    // DEL Germany keywords
    teamLower.includes("eisbären") || teamLower.includes("adler mannheim") || teamLower.includes("kölner haie") ||
    teamLower.includes("red bull münchen") || teamLower.includes("düsseldorfer") || teamLower.includes("pinguins") ||
    teamLower.includes("grizzlys") || teamLower.includes("roosters") || teamLower.includes("ingolstadt") ||
    teamLower.includes("ice tigers") || teamLower.includes("wild wings") || teamLower.includes("straubing") ||
    teamLower.includes("löwen frankfurt") || teamLower.includes("augsburger panther")
  ) {
    return "hockey";
  }

  if (
    teamLower.includes("yankees") || teamLower.includes("red sox") || teamLower.includes("dodgers") ||
    teamLower.includes("giants") || teamLower.includes("cubs") || teamLower.includes("cardinals") ||
    teamLower.includes("blue jays") || teamLower.includes("mets") || teamLower.includes("astros") ||
    teamLower.includes("braves") || teamLower.includes("athletics") || teamLower.includes("bisons") ||
    teamLower.includes("ironpigs") || teamLower.includes("mud hens") || teamLower.includes("mariners") ||
    teamLower.includes("rangers") || teamLower.includes("angels") || teamLower.includes("athletics") ||
    teamLower.includes("astros") || teamLower.includes("guardians") || teamLower.includes("white sox") ||
    teamLower.includes("tigers") || teamLower.includes("royals") || teamLower.includes("twins") ||
    teamLower.includes("orioles") || teamLower.includes("rays") || teamLower.includes("blue jays") ||
    teamLower.includes("reds") || teamLower.includes("brewers") || teamLower.includes("pirates") ||
    teamLower.includes("phillies") || teamLower.includes("marlins") || teamLower.includes("nationals") ||
    teamLower.includes("isotopes") || teamLower.includes("knights") || teamLower.includes("clippers") ||
    teamLower.includes("bulls") || teamLower.includes("chihuahuas") || teamLower.includes("stripers") ||
    teamLower.includes("indians") || teamLower.includes("jumbo shrimp") || teamLower.includes("aviators") ||
    teamLower.includes("bats") || teamLower.includes("redbirds") || teamLower.includes("sounds") ||
    teamLower.includes("tides") || teamLower.includes("comets") || teamLower.includes("storm chasers") ||
    teamLower.includes("aces") || teamLower.includes("red wings") || teamLower.includes("express") ||
    teamLower.includes("river cats") || teamLower.includes("bees") || teamLower.includes("railriders") ||
    teamLower.includes("saints") || teamLower.includes("space cowboys") || teamLower.includes("rainiers") ||
    teamLower.includes("worcester")
  ) {
    return "baseball";
  }

  if (
    (teamLower.includes("lakers") && !teamLower.includes("växjö") && !teamLower.includes("rapperswil") && !teamLower.includes("jona")) ||
    teamLower.includes("celtics") || teamLower.includes("warriors") ||
    teamLower.includes("bulls") || teamLower.includes("knicks") || teamLower.includes("spurs") ||
    teamLower.includes("heat") || teamLower.includes("bucks") || teamLower.includes("suns") ||
    teamLower.includes("nets") || teamLower.includes("mavericks") || teamLower.includes("nuggets") ||
    teamLower.includes("euroleague") || teamLower.includes("panathinaikos") || teamLower.includes("olympiacos") ||
    teamLower.includes("maccabi") || teamLower.includes("real madrid basketball") || teamLower.includes("barcelona basketball") ||
    teamLower.includes("fenerbahce") || teamLower.includes("partizan") || teamLower.includes("crvena zvezda") ||
    teamLower.includes("virtus") || teamLower.includes("milano") || teamLower.includes("efes") ||
    teamLower.includes("monaco") || teamLower.includes("baskonia") || teamLower.includes("valencia") ||
    teamLower.includes("asvel") || teamLower.includes("alba") || teamLower.includes("bayern munich basketball") ||
    teamLower.includes("clippers") || teamLower.includes("grizzlies") || (teamLower.includes("pelicans") && teamLower.includes("orleans")) ||
    teamLower.includes("rockets") || teamLower.includes("timberwolves") || teamLower.includes("thunder") ||
    teamLower.includes("blazers") || teamLower.includes("kings") || teamLower.includes("jazz") ||
    teamLower.includes("cavaliers") || teamLower.includes("pistons") || teamLower.includes("pacers") ||
    teamLower.includes("76ers") || teamLower.includes("raptors") || teamLower.includes("hawks") ||
    teamLower.includes("hornets") || teamLower.includes("magic") || teamLower.includes("wizards")
  ) {
    return "basketball";
  }

  if (
    teamLower.includes("cowboys") || teamLower.includes("patriots") || teamLower.includes("packers") ||
    teamLower.includes("steelers") || teamLower.includes("49ers") || teamLower.includes("seahawks") ||
    teamLower.includes("chiefs") || teamLower.includes("eagles") || (teamLower.includes("giants") && !teamLower.includes("düsseldorfer")) ||
    teamLower.includes("roughriders") || teamLower.includes("argonauts") || teamLower.includes("blue bombers") ||
    teamLower.includes("alouettes") || teamLower.includes("tiger-cats") || teamLower.includes("stampeders") ||
    teamLower.includes("elks") || teamLower.includes("bc lions") || teamLower.includes("redblacks") ||
    teamLower.includes("bills") || teamLower.includes("dolphins") || teamLower.includes("jets") ||
    teamLower.includes("ravens") || teamLower.includes("bengals") || teamLower.includes("browns") ||
    teamLower.includes("texans") || teamLower.includes("colts") || teamLower.includes("jaguars") ||
    teamLower.includes("titans") || teamLower.includes("broncos") || teamLower.includes("raiders") ||
    teamLower.includes("chargers") || teamLower.includes("commanders") || teamLower.includes("bears") ||
    teamLower.includes("lions") || teamLower.includes("vikings") || teamLower.includes("saints") ||
    teamLower.includes("buccaneers") || teamLower.includes("falcons") || teamLower.includes("panthers") ||
    teamLower.includes("cardinals") || teamLower.includes("rams")
  ) {
    return "football";
  }

  if (
    teamLower.includes("fc") || teamLower.includes("cf") || teamLower.includes("sc") ||
    teamLower.includes("united") || teamLower.includes("city") || teamLower.includes("rovers") ||
    teamLower.includes("wanderers") || teamLower.includes("lazio") || teamLower.includes("roma") ||
    teamLower.includes("madrid") || teamLower.includes("barca") || teamLower.includes("barcelona") ||
    teamLower.includes("inter") || teamLower.includes("milan") || teamLower.includes("bayern") ||
    teamLower.includes("dortmund") || teamLower.includes("paris") || teamLower.includes("saint-germain") ||
    teamLower.includes("ajax") || teamLower.includes("celtic") || teamLower.includes("rangers") ||
    teamLower.includes("athletic") || teamLower.includes("real") || teamLower.includes("atletico") ||
    teamLower.includes("sporting") || teamLower.includes("benfica") || teamLower.includes("porto") ||
    teamLower.includes("arsenal") || teamLower.includes("chelsea") || teamLower.includes("liverpool") ||
    teamLower.includes("tottenham") || teamLower.includes("spurs") || teamLower.includes("everton") ||
    teamLower.includes("villa") || teamLower.includes("newcastle") || teamLower.includes("leeds") ||
    teamLower.includes("leicester") || teamLower.includes("sevilla") || teamLower.includes("valencia") ||
    teamLower.includes("sociedad") || teamLower.includes("villarreal") || teamLower.includes("napoli") ||
    teamLower.includes("juventus") || teamLower.includes("fiorentina") || teamLower.includes("bologna") ||
    teamLower.includes("atalanta") || teamLower.includes("monza") || teamLower.includes("leverkusen") ||
    teamLower.includes("leipzig") || teamLower.includes("frankfurt") || teamLower.includes("freiburg") ||
    teamLower.includes("marseille") || teamLower.includes("lens") || teamLower.includes("rennes") ||
    teamLower.includes("lyon") || teamLower.includes("monaco") || teamLower.includes("lille") ||
    teamLower.includes("sounders") || teamLower.includes("timbers") || teamLower.includes("earthquakes") ||
    teamLower.includes("galaxy") || teamLower.includes("fire") || teamLower.includes("crew") ||
    teamLower.includes("dynamo") || teamLower.includes("revolution") || teamLower.includes("red bulls") ||
    teamLower.includes("nycfc") || teamLower.includes("lafc") || teamLower.includes("inter miami") ||
    teamLower.includes("atlanta") || teamLower.includes("charlotte") || teamLower.includes("nashville") ||
    teamLower.includes("st. louis") || teamLower.includes("orlando") || teamLower.includes("philadelphia") ||
    teamLower.includes("toronto") || teamLower.includes("vancouver") || teamLower.includes("montreal") ||
    teamLower.includes("tigres") || teamLower.includes("america") || teamLower.includes("chivas") ||
    teamLower.includes("cruz azul") || teamLower.includes("pumas") || teamLower.includes("monterrey") ||
    teamLower.includes("santos laguna") || teamLower.includes("toluca") || teamLower.includes("pachuca") ||
    teamLower.includes("atlas") || teamLower.includes("tijuana") || teamLower.includes("queretaro") ||
    teamLower.includes("necaxa") || teamLower.includes("mazatlan") || teamLower.includes("juarez") ||
    teamLower.includes("puebla") || teamLower.includes("san luis") || teamLower.includes("leon")
  ) {
    return "soccer";
  }

  return "general";
}

// Filters custom/active sites list based on the team's sport
function filterSitesForTeam(teamName: string, customSites: string[]): string[] {
  const targetSport = getSportForTeam(teamName);

  const SPORT_SPECIFIC_OUTLETS: Record<string, string[]> = {
    hockey: ["nhl.com", "chl.ca", "theqmjhl.ca", "theahl.com", "rds.ca", "tvasports.ca", "cbc.ca"],
    baseball: ["mlb.com", "milb.com"],
    basketball: ["nba.com", "euroleague.net", "eurohoops.net"],
    football: ["nfl.com", "cfl.ca"],
    soccer: [
      "goal.com", "bbc.co.uk", "fourfourtwo.com", "theguardian.com", "mlssoccer.com", "skysports.com",
      "marca.com", "as.com", "mundodeportivo.com", "gazzetta.it", "corrieredellosport.it", 
      "tuttosport.com", "kicker.de", "bild.de", "sport1.de", "lequipe.fr", "francefootball.fr", "footmercato.net"
    ]
  };

  return customSites.filter(site => {
    const siteDomain = site.toLowerCase().trim();
    // If not following a Soccer team (i.e. targetSport is not 'soccer'), then goal.com must not be searched
    if (targetSport !== "soccer" && siteDomain.includes("goal.com")) {
      return false;
    }
    if (targetSport === "general") {
      return true;
    }
    const isSpecificToOtherSport = Object.entries(SPORT_SPECIFIC_OUTLETS).some(([sp, sites]) => {
      return sp !== targetSport && sites.includes(siteDomain);
    });
    return !isSpecificToOtherSport;
  });
}

// Global in-memory cache for sports news to avoid repetitive Google RSS lookups
interface NewsCacheEntry {
  result: any;
  timestamp: number;
}
const globalNewsCache: Record<string, NewsCacheEntry> = {};
const NEWS_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes cache for news

// Sports news search API
app.post("/api/news", async (req, res) => {
  try {
    const { teams, recencyDays, feedMode, customSites } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ error: "Please specify at least one team." });
    }

    const days = Math.min(Math.max(Number(recencyDays) || 1, 1), 2);
    const isDirectMode = feedMode === "direct";

    const results: any[] = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      
      // Calculate a unique cache key based on team, recency window, custom sites, and feed mode
      const sortedSites = Array.isArray(customSites) 
        ? [...customSites].map(s => s.toLowerCase().trim()).sort().join(",") 
        : "";
      const cacheKey = `${team.toLowerCase().trim()}_${days}_${sortedSites}_${feedMode}`;
      
      // Check cache first
      const cached = globalNewsCache[cacheKey];
      const now = Date.now();
      if (cached && (now - cached.timestamp < NEWS_CACHE_TTL_MS)) {
        // Return cached result (with a minor tweak to the timestamp to look fresh, or keeping it original)
        results.push({
          ...cached.result,
          fromCache: true,
          cacheAgeMs: now - cached.timestamp
        });
        continue;
      }

      if (results.filter(r => !r.fromCache).length > 0) {
        // Sequential fetch delay only when we are ACTUALLY making a network request
        // This pacing delay with minor random jitter avoids triggering Google News concurrent request IP blocks
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
      }

      try {
        // Prepare sites query
        let sitesFilter = "";
        const relevantSites = filterSitesForTeam(team, customSites || []);
        if (relevantSites.length > 0) {
          const formattedSites = relevantSites
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
          "the", "and", "team", "club", "sports", "news", "official", "fc", "cf", "sc", "with", "from", "for",
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
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en&_t=${Date.now()}`;

        let rssStatus = "200";
        let rssStatusText = "OK";
        let rssError = "";
        let generalRssStatus = "";
        let generalRssStatusText = "";
        let generalRssError = "";
        let geminiStatus = "Not attempted (found RSS results)";

        // Fetch RSS feed server-side (bypass client-side CORS completely)
        let response: any = null;
        try {
          response = await fetch(rssUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36",
            },
          });
          rssStatus = String(response.status);
          rssStatusText = response.statusText;
        } catch (err: any) {
          rssStatus = "Fetch Network Error";
          rssStatusText = err.message || String(err);
          rssError = err.stack || String(err);
        }

        let articles: any[] = [];
        if (response && response.ok) {
          const xmlText = await response.text();
          const rawArticles = parseGoogleNewsRSS(xmlText);
          // Apply strict headline relevance filter right at retrieval time
          articles = rawArticles.filter(art => isHeadlineMatch(art.title) && !isSpamArticle(art.title, art.url));
        } else if (response) {
          rssError = `Google News RSS responded with non-2xx code: ${response.status} ${response.statusText}`;
        }

        // Filter articles according to the lookback window
        const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
        let filteredArticles = articles.filter((art) => art.timestamp >= cutoffTime);

        // Fallback if domain-restricted search yielded zero results: query universally with simple query term so screen isn't empty
        if (filteredArticles.length === 0 && sitesFilter) {
          const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en&_t=${Date.now()}`;
          generalRssStatus = "Attempting...";
          try {
            const genResponse = await fetch(generalUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0)" },
            });
            generalRssStatus = String(genResponse.status);
            generalRssStatusText = genResponse.statusText;
            if (genResponse.ok) {
              const genXml = await genResponse.text();
              const genArticles = parseGoogleNewsRSS(genXml);
              filteredArticles = genArticles
                .filter(art => isHeadlineMatch(art.title) && !isSpamArticle(art.title, art.url))
                .filter((art) => art.timestamp >= cutoffTime);
            } else {
              generalRssError = `Response: ${genResponse.status} ${genResponse.statusText}`;
            }
          } catch (err: any) {
            generalRssStatus = "Fetch Network Error";
            generalRssStatusText = err.message || String(err);
            generalRssError = err.stack || String(err);
            console.warn(`General RSS feed fetch failed for ${team}`);
          }
        }

        let summaryText = "";
        geminiStatus = "Disabled (Relying purely on tracking feeds)";

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
        const resultItem = {
          team,
          summary: summaryText,
          links: links.length > 0 ? links : [
            { title: `Search ${team} news on Google`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
          ],
          articles: topArticles,
          timestamp: Date.now(),
          diagnostics: {
            searchQuery,
            rssUrl,
            rssStatus,
            rssStatusText,
            rssError: rssError || undefined,
            generalRssStatus: generalRssStatus || undefined,
            generalRssStatusText: generalRssStatusText || undefined,
            generalRssError: generalRssError || undefined,
            geminiStatus,
            pacingDelayMs: i > 0 ? "Sequential pace active" : "None (first request)",
            timestamp: new Date().toISOString(),
          },
          // If we failed to get articles and primary fetch wasn't completely successful
          error: topArticles.length === 0 && (rssStatus !== "200" || (generalRssStatus && generalRssStatus !== "200")),
        };

        results.push(resultItem);

        // Cache the successful/valid result (avoid caching transient complete connection failures)
        if (!resultItem.error) {
          globalNewsCache[cacheKey] = {
            result: resultItem,
            timestamp: Date.now()
          };
        }
      } catch (e: any) {
        console.warn(`Error aggregating feed for ${team}:`, e.message || e);
        results.push({
          team,
          summary: `• Offline Fallback: Temporary communication error fetching headlines for ${team} (${e.message || e}).\n• Please check settings or wait for automatic retry.`,
          links: [
            { title: `${team} Hub Page`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
          ],
          articles: [],
          timestamp: Date.now(),
          error: true,
          diagnostics: {
            errorMsg: e.message || String(e),
            stack: e.stack ? e.stack.slice(0, 150) : undefined,
            timestamp: new Date().toISOString(),
          }
        });
      }
    }

    res.json({ results });
  } catch (error: any) {
    console.warn("News endpoint error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Helper to check if a team name matches the ESPN competitor displayName or name
function matchesTeam(userTeamName: string, competitorDisplayName: string, competitorName: string): boolean {
  const userLower = userTeamName.toLowerCase().trim();
  const compDisplayLower = competitorDisplayName.toLowerCase().trim();
  const compNameLower = competitorName.toLowerCase().trim();

  // 1. Direct match
  if (compDisplayLower === userLower || compDisplayLower.startsWith(userLower) || userLower.startsWith(compDisplayLower)) {
    return true;
  }

  // 2. Token overlap (ignoring common noise words)
  const cleanAndTokenize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !["the", "and", "team", "club", "sports", "news", "fc", "cf", "sc", "national", "association", "league", "de", "la", "el", "un"].includes(w));
  };

  const userTokens = cleanAndTokenize(userTeamName);
  const compDisplayTokens = cleanAndTokenize(competitorDisplayName);
  const compNameTokens = cleanAndTokenize(competitorName);

  if (userTokens.length === 0 || compDisplayTokens.length === 0) {
    return false;
  }

  // Common/loose adjectives that shouldn't be the sole match if other tokens exist
  const looseWords = ["real", "city", "united", "town", "county", "athletic", "rovers", "wanderers", "albion", "club", "saint", "st"];

  // Find overlapping tokens
  const overlap = userTokens.filter(token => 
    compDisplayTokens.includes(token) || compNameTokens.includes(token)
  );

  if (overlap.length === 0) {
    return false;
  }

  // If there's an overlap, but all overlapping tokens are loose words,
  // we require at least one non-loose word overlap, or that they represent a high proportion of the name
  const hasSpecificOverlap = overlap.some(t => !looseWords.includes(t));
  if (hasSpecificOverlap) {
    return true;
  }

  // If it's a loose word, they must share the entire token set or at least have a very close match
  return userTokens.every(t => compDisplayTokens.includes(t)) || compDisplayTokens.every(t => userTokens.includes(t));
}

// Helper to format upcoming game dates
function formatGameDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) {
      return `Today ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow ${timeStr}`;
    } else {
      const monthStr = d.toLocaleDateString([], { month: 'short' });
      const dayStr = d.toLocaleDateString([], { day: 'numeric' });
      return `${monthStr} ${dayStr} ${timeStr}`;
    }
  } catch {
    return "";
  }
}

// Global in-memory cache for scoreboard data
interface ScoreboardCache {
  data: any;
  timestamp: number;
}
const globalScoreboardCache: Record<string, ScoreboardCache> = {};
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

// Safe cached fetch
async function getCachedScoreboard(key: string, url: string): Promise<any> {
  const cached = globalScoreboardCache[key];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const data = await res.json();
      globalScoreboardCache[key] = { data, timestamp: now };
      return data;
    }
  } catch (e) {
    console.warn(`Failed to fetch scoreboard for ${key}:`, e);
  }
  return cached ? cached.data : null;
}

const SCOREBOARD_URLS = {
  nhl: "https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard",
  ahl: "https://site.api.espn.com/apis/site/v2/sports/hockey/ahl/scoreboard",
  mlb: "https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard",
  nba: "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard",
  nfl: "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard",
  premier: "https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard",
  mls: "https://site.api.espn.com/apis/site/v2/sports/soccer/usa.1/scoreboard",
  laliga: "https://site.api.espn.com/apis/site/v2/sports/soccer/esp.1/scoreboard",
  seriea: "https://site.api.espn.com/apis/site/v2/sports/soccer/ita.1/scoreboard",
  bundesliga: "https://site.api.espn.com/apis/site/v2/sports/soccer/ger.1/scoreboard",
  ligue1: "https://site.api.espn.com/apis/site/v2/sports/soccer/fra.1/scoreboard",
  ligamx: "https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard"
};

// API Endpoint to fetch scores and game statuses for custom teams list
app.post("/api/scores", async (req, res) => {
  try {
    const { teams } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.json({ scores: {} });
    }

    // Fetch all scoreboards in parallel (utilizes global in-memory cache)
    const keys = Object.keys(SCOREBOARD_URLS);
    const boards = await Promise.all(
      keys.map(async (key) => {
        const data = await getCachedScoreboard(key, SCOREBOARD_URLS[key as keyof typeof SCOREBOARD_URLS]);
        return { key, data };
      })
    );

    const scores: Record<string, any> = {};

    for (const teamName of teams) {
      const matchedGames: any[] = [];

      for (const board of boards) {
        if (!board.data || !Array.isArray(board.data.events)) continue;

        for (const event of board.data.events) {
          const competition = event.competitions?.[0];
          if (!competition || !Array.isArray(competition.competitors)) continue;

          for (const competitor of competition.competitors) {
            const teamObj = competitor.team;
            if (!teamObj) continue;

            if (matchesTeam(teamName, teamObj.displayName || "", teamObj.name || "")) {
              matchedGames.push({
                event,
                competition,
                matchedCompetitor: competitor,
                sportKey: board.key
              });
            }
          }
        }
      }

      if (matchedGames.length > 0) {
        // Sort matched games so live/active games take highest priority, then completed, then upcoming
        matchedGames.sort((a, b) => {
          const stateScore = (g: any) => {
            const state = g.event.status?.type?.state;
            if (state === "in") return 3;   // Live
            if (state === "post") return 2; // Finished
            return 1;                       // Scheduled/Upcoming
          };
          
          const scoreA = stateScore(a);
          const scoreB = stateScore(b);
          if (scoreA !== scoreB) {
            return scoreB - scoreA;
          }
          
          // Same state: pick the one closest to now
          const dateA = new Date(a.event.date).getTime();
          const dateB = new Date(b.event.date).getTime();
          const now = Date.now();
          return Math.abs(dateA - now) - Math.abs(dateB - now);
        });

        const bestGame = matchedGames[0];
        const { event, competition, matchedCompetitor } = bestGame;
        const opponent = competition.competitors.find((c: any) => c.id !== matchedCompetitor.team.id) || competition.competitors[0];

        const state = event.status?.type?.state; // "pre" | "in" | "post"
        const detail = event.status?.type?.detail || "";

        const homeCompetitor = competition.competitors.find((c: any) => c.homeAway === "home");
        const awayCompetitor = competition.competitors.find((c: any) => c.homeAway === "away");
        const homeName = homeCompetitor?.team?.abbreviation || homeCompetitor?.team?.name || "Home";
        const awayName = awayCompetitor?.team?.abbreviation || awayCompetitor?.team?.name || "Away";
        const homeScore = homeCompetitor?.score || "0";
        const awayScore = awayCompetitor?.score || "0";

        let scoreText = "";
        if (state === "in") {
          scoreText = `Live: ${awayName} ${awayScore} @ ${homeName} ${homeScore} (${detail})`;
        } else if (state === "post") {
          scoreText = `Final: ${awayName} ${awayScore}, ${homeName} ${homeScore}`;
        } else {
          const isHome = matchedCompetitor.homeAway === "home";
          const oppName = opponent?.team?.abbreviation || opponent?.team?.displayName || opponent?.team?.name || "Opp";
          const formattedDate = formatGameDate(event.date);
          scoreText = `${formattedDate} ${isHome ? "vs" : "@"} ${oppName}`;
        }

        let nextGameData: any = null;
        if (state === "post") {
          const upcomingGames = matchedGames.filter(g => g.event.status?.type?.state === "pre");
          if (upcomingGames.length > 0) {
            upcomingGames.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
            const nextGame = upcomingGames[0];
            const nextComp = nextGame.competition;
            const nextMatchedComp = nextGame.matchedCompetitor;
            const nextOpponent = nextComp.competitors.find((c: any) => c.id !== nextMatchedComp.team.id) || nextComp.competitors[0];
            
            nextGameData = {
              eventDate: nextGame.event.date,
              opponentName: nextOpponent?.team?.abbreviation || nextOpponent?.team?.displayName || nextOpponent?.team?.name || "Opp",
              isHome: nextMatchedComp.homeAway === "home"
            };
          }
        }

        scores[teamName] = {
          state,
          detail,
          scoreText,
          sport: bestGame.sportKey,
          eventDate: event.date,
          opponentName: opponent?.team?.abbreviation || opponent?.team?.displayName || opponent?.team?.name || "Opp",
          isHome: matchedCompetitor.homeAway === "home",
          nextGame: nextGameData
        };
      }
    }

    res.json({ scores });
  } catch (error: any) {
    console.warn("Scores endpoint error:", error.message || error);
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
