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
var import_genai = require("@google/genai");
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json());
function decodeGoogleNewsUrl(googleUrl) {
  try {
    const urlObj = new URL(googleUrl);
    if (urlObj.hostname.includes("news.google.com")) {
      const pathParts = urlObj.pathname.split("/");
      const base64Part = pathParts[pathParts.length - 1];
      if (base64Part && base64Part.startsWith("CBMi")) {
        let normalizedBase64 = base64Part.replace(/-/g, "+").replace(/_/g, "/");
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
  }
  return googleUrl;
}
function isSpamArticle(title, url) {
  const titleLower = title.toLowerCase();
  const sourceMatch = title.match(/\s+-\s+([^-]+)$/);
  if (sourceMatch) {
    const sourceName = sourceMatch[1].toLowerCase().trim();
    const SPAM_SOURCES = [
      "fathom journal",
      "fathom",
      "mshale",
      "operanews",
      "daily advent",
      "scores24",
      "oddspedia",
      "vipleague",
      "viprow",
      "flohockey.tv",
      "flohockey",
      "hockeytv"
    ];
    if (SPAM_SOURCES.some((s) => sourceName.includes(s))) {
      return true;
    }
  }
  const parentheticalMatch = title.match(/\(([A-Za-z0-9]{7,15})\)/);
  if (parentheticalMatch) {
    const code = parentheticalMatch[1];
    const hasLower = /[a-z]/.test(code);
    const hasUpper = /[A-Z]/.test(code);
    const hasDigits = /[0-9]/.test(code);
    if (hasDigits && (hasLower || hasUpper) || hasLower && /[A-Z]/.test(code.slice(1))) {
      return true;
    }
  }
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
  }
  const TRUSTED_STREAM_DOMAINS = [
    "espn.com",
    "sportsnet.ca",
    "tsn.ca",
    "nhl.com",
    "chl.ca",
    "theqmjhl.ca",
    "cbc.ca",
    "rds.ca",
    "tvasports.ca",
    "youtube.com",
    "vimeo.com",
    "twitch.tv",
    "cbssports.com",
    "nbcsports.com",
    "foxsports.com"
  ];
  const SPAM_PHRASES = [
    "live stream",
    "livestream",
    "free stream",
    "stream free",
    "watch live",
    "how to watch",
    "streaming free",
    "live broadcast",
    "stream link",
    "hd stream",
    "stream online",
    "watch online",
    "broadcast online",
    "watch on tv",
    "where to watch"
  ];
  const hasSpamPhrase = SPAM_PHRASES.some((phrase) => titleLower.includes(phrase));
  if (hasSpamPhrase) {
    const isTrusted = TRUSTED_STREAM_DOMAINS.some((domain) => hostname.includes(domain));
    if (!isTrusted) {
      return true;
    }
  }
  const SPAM_DOMAINS = [
    "fathomjournal.org",
    "fathom",
    "live-stream",
    "livestream",
    "sportingnews24",
    "freestreams",
    "buffstreams",
    "vipleague",
    "cricfree",
    "crackstreams",
    "hacked",
    "redirect",
    "mshale.com",
    "mshale",
    "flohockey.tv",
    "flohockey",
    "hockeytv",
    "dailyadvent",
    "operanews",
    "scores24",
    "oddspedia",
    "betting",
    "odds",
    "prediction",
    "match-preview",
    "ticket",
    "stubhub",
    "seatgeek",
    "ticketmaster",
    "vipleague",
    "viprow"
  ];
  if (SPAM_DOMAINS.some((domain) => hostname.includes(domain))) {
    return true;
  }
  const isTrustedNewsDomain = TRUSTED_STREAM_DOMAINS.some((domain) => hostname.includes(domain));
  if (!isTrustedNewsDomain) {
    const NON_NEWS_PATH_PATTERNS = [
      "/events/",
      "/tickets/",
      "/schedule/",
      "/replays/",
      "/product/",
      "/shop/",
      "/videos/"
    ];
    if (NON_NEWS_PATH_PATTERNS.some((pat) => pathname.includes(pat))) {
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
      const isTrusted = TRUSTED_STREAM_DOMAINS.some((domain) => hostname.includes(domain));
      if (!isTrusted) {
        return true;
      }
    }
  }
  return false;
}
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
    const directUrl = decodeGoogleNewsUrl(url);
    items.push({
      title: cleanTitle,
      url: directUrl,
      timestamp,
      source: source || "Sports News"
    });
  }
  return items;
}
function getSportForTeam(teamName) {
  const teamLower = teamName.toLowerCase().trim();
  if (teamLower.includes("canadiens") || teamLower.includes("leafs") || teamLower.includes("bruins") || teamLower.includes("rangers") || teamLower.includes("penguins") || teamLower.includes("blackhawks") || teamLower.includes("red wings") || teamLower.includes("oilers") || teamLower.includes("canucks") || teamLower.includes("knights") || teamLower.includes("colts") || teamLower.includes("otters") || teamLower.includes("spitfires") || teamLower.includes("greyhounds") || teamLower.includes("titan") || teamLower.includes("drakkar") || teamLower.includes("mooseheads") || teamLower.includes("blazers") || teamLower.includes("rockets") || teamLower.includes("silvertips") || teamLower.includes("marlies") || teamLower.includes("comets") || teamLower.includes("roadrunners") || teamLower.includes("wranglers") || teamLower.includes("monsters") || teamLower.includes("firebirds") || teamLower.includes("barracuda") || teamLower.includes("reign") || teamLower.includes("gulls") || teamLower.includes("condors") || teamLower.includes("senators") || teamLower.includes("devils") || teamLower.includes("islanders") || teamLower.includes("sabres") || teamLower.includes("flyers") || teamLower.includes("capitals") || teamLower.includes("hurricanes") || teamLower.includes("lightning") || teamLower.includes("panthers") || teamLower.includes("predators") || teamLower.includes("blues") || teamLower.includes("stars") || teamLower.includes("avalanche") || teamLower.includes("wild") || teamLower.includes("kraken") || teamLower.includes("coyotes") || teamLower.includes("thrashers") || teamLower.includes("wolf pack") || teamLower.includes("phantoms") || teamLower.includes("crunch") || teamLower.includes("bears") || teamLower.includes("admirals") || teamLower.includes("griffins") || teamLower.includes("moose") || teamLower.includes("wolves") || teamLower.includes("icehogs") || teamLower.includes("gulls") || teamLower.includes("conquerors") || teamLower.includes("battalion") || teamLower.includes("generals") || teamLower.includes("petes") || teamLower.includes("frontenacs") || teamLower.includes("67's") || teamLower.includes("67s") || teamLower.includes("frontenac") || teamLower.includes("sagueneens") || teamLower.includes("saguen\xE9ens") || teamLower.includes("cataractes") || teamLower.includes("voltigeurs") || teamLower.includes("oceanic") || teamLower.includes("oc\xE9anic") || teamLower.includes("remparts") || teamLower.includes("foreurs") || teamLower.includes("tigres") || teamLower.includes("armada") || teamLower.includes("phoenix") || teamLower.includes("huskies") || teamLower.includes("wheat kings") || teamLower.includes("hitmen") || teamLower.includes("oil kings") || teamLower.includes("blazers") || teamLower.includes("rockets") || teamLower.includes("hurricanes") || teamLower.includes("tigers") || teamLower.includes("warriors") || teamLower.includes("winterhawks") || teamLower.includes("raiders") || teamLower.includes("cougars") || teamLower.includes("rebels") || teamLower.includes("pats") || teamLower.includes("blades") || teamLower.includes("thunderbirds") || teamLower.includes("chiefs") || teamLower.includes("broncos") || teamLower.includes("americans") || teamLower.includes("giants") || teamLower.includes("royals") || teamLower.includes("wild") || // SHL Sweden keywords
  teamLower.includes("bryn\xE4s") || teamLower.includes("fr\xF6lunda") || teamLower.includes("f\xE4rjestad") || teamLower.includes("hv71") || teamLower.includes("leksand") || teamLower.includes("link\xF6ping") || teamLower.includes("lule\xE5") || teamLower.includes("malm\xF6") || teamLower.includes("modo") || teamLower.includes("r\xF6gle") || teamLower.includes("skellefte\xE5") || teamLower.includes("timr\xE5") || teamLower.includes("v\xE4xj\xF6") || teamLower.includes("\xF6rebro") || // NL Switzerland keywords
  teamLower.includes("ajoie") || teamLower.includes("ambr\xEC") || teamLower.includes("sc bern") || teamLower.includes("biel-bienne") || teamLower.includes("davos") || teamLower.includes("gen\xE8ve-servette") || teamLower.includes("gott\xE9ron") || teamLower.includes("lausanne") || teamLower.includes("lugano") || teamLower.includes("scl tigers") || teamLower.includes("rapperswil-jona") || teamLower.includes("ev zug") || teamLower.includes("zsc lions") || teamLower.includes("kloten") || // Liiga Finland keywords
  teamLower.includes("hifk") || teamLower.includes("hpk") || teamLower.includes("ilves") || teamLower.includes("jukurit") || teamLower.includes("jyp") || teamLower.includes("kalpa") || teamLower.includes("kookoo") || teamLower.includes("k\xE4rp\xE4t") || teamLower.includes("lukko") || teamLower.includes("pelicans") && !teamLower.includes("orleans") || teamLower.includes("saipa") || teamLower.includes("vaasan sport") || teamLower.includes("tappara") || teamLower.includes("tps") || teamLower.includes("\xE4ss\xE4t") || teamLower.includes("kiekko-espoo") || // Extraliga Czechia keywords
  teamLower.includes("liberec") || teamLower.includes("mountfield hk") || teamLower.includes("karlovy vary") || teamLower.includes("kladno") || teamLower.includes("litv\xEDnov") || teamLower.includes("olomouc") || teamLower.includes("pardubice") || teamLower.includes("plze\u0148") || teamLower.includes("sparta praha") || teamLower.includes("t\u0159inec") || teamLower.includes("v\xEDtkovice") || teamLower.includes("\u010Desk\xE9 bud\u011Bjovice") || teamLower.includes("kometa brno") || teamLower.includes("boleslav") || // DEL Germany keywords
  teamLower.includes("eisb\xE4ren") || teamLower.includes("adler mannheim") || teamLower.includes("k\xF6lner haie") || teamLower.includes("red bull m\xFCnchen") || teamLower.includes("d\xFCsseldorfer") || teamLower.includes("pinguins") || teamLower.includes("grizzlys") || teamLower.includes("roosters") || teamLower.includes("ingolstadt") || teamLower.includes("ice tigers") || teamLower.includes("wild wings") || teamLower.includes("straubing") || teamLower.includes("l\xF6wen frankfurt") || teamLower.includes("augsburger panther")) {
    return "hockey";
  }
  if (teamLower.includes("yankees") || teamLower.includes("red sox") || teamLower.includes("dodgers") || teamLower.includes("giants") || teamLower.includes("cubs") || teamLower.includes("cardinals") || teamLower.includes("blue jays") || teamLower.includes("mets") || teamLower.includes("astros") || teamLower.includes("braves") || teamLower.includes("athletics") || teamLower.includes("bisons") || teamLower.includes("ironpigs") || teamLower.includes("mud hens") || teamLower.includes("mariners") || teamLower.includes("rangers") || teamLower.includes("angels") || teamLower.includes("athletics") || teamLower.includes("astros") || teamLower.includes("guardians") || teamLower.includes("white sox") || teamLower.includes("tigers") || teamLower.includes("royals") || teamLower.includes("twins") || teamLower.includes("orioles") || teamLower.includes("rays") || teamLower.includes("blue jays") || teamLower.includes("reds") || teamLower.includes("brewers") || teamLower.includes("pirates") || teamLower.includes("phillies") || teamLower.includes("marlins") || teamLower.includes("nationals") || teamLower.includes("isotopes") || teamLower.includes("knights") || teamLower.includes("clippers") || teamLower.includes("bulls") || teamLower.includes("chihuahuas") || teamLower.includes("stripers") || teamLower.includes("indians") || teamLower.includes("jumbo shrimp") || teamLower.includes("aviators") || teamLower.includes("bats") || teamLower.includes("redbirds") || teamLower.includes("sounds") || teamLower.includes("tides") || teamLower.includes("comets") || teamLower.includes("storm chasers") || teamLower.includes("aces") || teamLower.includes("red wings") || teamLower.includes("express") || teamLower.includes("river cats") || teamLower.includes("bees") || teamLower.includes("railriders") || teamLower.includes("saints") || teamLower.includes("space cowboys") || teamLower.includes("rainiers") || teamLower.includes("worcester")) {
    return "baseball";
  }
  if (teamLower.includes("lakers") && !teamLower.includes("v\xE4xj\xF6") && !teamLower.includes("rapperswil") && !teamLower.includes("jona") || teamLower.includes("celtics") || teamLower.includes("warriors") || teamLower.includes("bulls") || teamLower.includes("knicks") || teamLower.includes("spurs") || teamLower.includes("heat") || teamLower.includes("bucks") || teamLower.includes("suns") || teamLower.includes("nets") || teamLower.includes("mavericks") || teamLower.includes("nuggets") || teamLower.includes("euroleague") || teamLower.includes("panathinaikos") || teamLower.includes("olympiacos") || teamLower.includes("maccabi") || teamLower.includes("real madrid basketball") || teamLower.includes("barcelona basketball") || teamLower.includes("fenerbahce") || teamLower.includes("partizan") || teamLower.includes("crvena zvezda") || teamLower.includes("virtus") || teamLower.includes("milano") || teamLower.includes("efes") || teamLower.includes("monaco") || teamLower.includes("baskonia") || teamLower.includes("valencia") || teamLower.includes("asvel") || teamLower.includes("alba") || teamLower.includes("bayern munich basketball") || teamLower.includes("clippers") || teamLower.includes("grizzlies") || teamLower.includes("pelicans") && teamLower.includes("orleans") || teamLower.includes("rockets") || teamLower.includes("timberwolves") || teamLower.includes("thunder") || teamLower.includes("blazers") || teamLower.includes("kings") || teamLower.includes("jazz") || teamLower.includes("cavaliers") || teamLower.includes("pistons") || teamLower.includes("pacers") || teamLower.includes("76ers") || teamLower.includes("raptors") || teamLower.includes("hawks") || teamLower.includes("hornets") || teamLower.includes("magic") || teamLower.includes("wizards")) {
    return "basketball";
  }
  if (teamLower.includes("cowboys") || teamLower.includes("patriots") || teamLower.includes("packers") || teamLower.includes("steelers") || teamLower.includes("49ers") || teamLower.includes("seahawks") || teamLower.includes("chiefs") || teamLower.includes("eagles") || teamLower.includes("giants") && !teamLower.includes("d\xFCsseldorfer") || teamLower.includes("roughriders") || teamLower.includes("argonauts") || teamLower.includes("blue bombers") || teamLower.includes("alouettes") || teamLower.includes("tiger-cats") || teamLower.includes("stampeders") || teamLower.includes("elks") || teamLower.includes("bc lions") || teamLower.includes("redblacks") || teamLower.includes("bills") || teamLower.includes("dolphins") || teamLower.includes("jets") || teamLower.includes("ravens") || teamLower.includes("bengals") || teamLower.includes("browns") || teamLower.includes("texans") || teamLower.includes("colts") || teamLower.includes("jaguars") || teamLower.includes("titans") || teamLower.includes("broncos") || teamLower.includes("raiders") || teamLower.includes("chargers") || teamLower.includes("commanders") || teamLower.includes("bears") || teamLower.includes("lions") || teamLower.includes("vikings") || teamLower.includes("saints") || teamLower.includes("buccaneers") || teamLower.includes("falcons") || teamLower.includes("panthers") || teamLower.includes("cardinals") || teamLower.includes("rams")) {
    return "football";
  }
  if (teamLower.includes("fc") || teamLower.includes("cf") || teamLower.includes("sc") || teamLower.includes("united") || teamLower.includes("city") || teamLower.includes("rovers") || teamLower.includes("wanderers") || teamLower.includes("lazio") || teamLower.includes("roma") || teamLower.includes("madrid") || teamLower.includes("barca") || teamLower.includes("barcelona") || teamLower.includes("inter") || teamLower.includes("milan") || teamLower.includes("bayern") || teamLower.includes("dortmund") || teamLower.includes("paris") || teamLower.includes("saint-germain") || teamLower.includes("ajax") || teamLower.includes("celtic") || teamLower.includes("rangers") || teamLower.includes("athletic") || teamLower.includes("real") || teamLower.includes("atletico") || teamLower.includes("sporting") || teamLower.includes("benfica") || teamLower.includes("porto") || teamLower.includes("arsenal") || teamLower.includes("chelsea") || teamLower.includes("liverpool") || teamLower.includes("tottenham") || teamLower.includes("spurs") || teamLower.includes("everton") || teamLower.includes("villa") || teamLower.includes("newcastle") || teamLower.includes("leeds") || teamLower.includes("leicester") || teamLower.includes("sevilla") || teamLower.includes("valencia") || teamLower.includes("sociedad") || teamLower.includes("villarreal") || teamLower.includes("napoli") || teamLower.includes("juventus") || teamLower.includes("fiorentina") || teamLower.includes("bologna") || teamLower.includes("atalanta") || teamLower.includes("monza") || teamLower.includes("leverkusen") || teamLower.includes("leipzig") || teamLower.includes("frankfurt") || teamLower.includes("freiburg") || teamLower.includes("marseille") || teamLower.includes("lens") || teamLower.includes("rennes") || teamLower.includes("lyon") || teamLower.includes("monaco") || teamLower.includes("lille") || teamLower.includes("sounders") || teamLower.includes("timbers") || teamLower.includes("earthquakes") || teamLower.includes("galaxy") || teamLower.includes("fire") || teamLower.includes("crew") || teamLower.includes("dynamo") || teamLower.includes("revolution") || teamLower.includes("red bulls") || teamLower.includes("nycfc") || teamLower.includes("lafc") || teamLower.includes("inter miami") || teamLower.includes("atlanta") || teamLower.includes("charlotte") || teamLower.includes("nashville") || teamLower.includes("st. louis") || teamLower.includes("orlando") || teamLower.includes("philadelphia") || teamLower.includes("toronto") || teamLower.includes("vancouver") || teamLower.includes("montreal") || teamLower.includes("tigres") || teamLower.includes("america") || teamLower.includes("chivas") || teamLower.includes("cruz azul") || teamLower.includes("pumas") || teamLower.includes("monterrey") || teamLower.includes("santos laguna") || teamLower.includes("toluca") || teamLower.includes("pachuca") || teamLower.includes("atlas") || teamLower.includes("tijuana") || teamLower.includes("queretaro") || teamLower.includes("necaxa") || teamLower.includes("mazatlan") || teamLower.includes("juarez") || teamLower.includes("puebla") || teamLower.includes("san luis") || teamLower.includes("leon")) {
    return "soccer";
  }
  return "general";
}
function filterSitesForTeam(teamName, customSites) {
  const targetSport = getSportForTeam(teamName);
  const SPORT_SPECIFIC_OUTLETS = {
    hockey: ["nhl.com", "chl.ca", "theqmjhl.ca", "theahl.com", "rds.ca", "tvasports.ca", "cbc.ca"],
    baseball: ["mlb.com", "milb.com"],
    basketball: ["nba.com", "euroleague.net", "eurohoops.net"],
    football: ["nfl.com", "cfl.ca"],
    soccer: [
      "goal.com",
      "bbc.co.uk",
      "fourfourtwo.com",
      "theguardian.com",
      "mlssoccer.com",
      "skysports.com",
      "marca.com",
      "as.com",
      "mundodeportivo.com",
      "gazzetta.it",
      "corrieredellosport.it",
      "tuttosport.com",
      "kicker.de",
      "bild.de",
      "sport1.de",
      "lequipe.fr",
      "francefootball.fr",
      "footmercato.net"
    ]
  };
  return customSites.filter((site) => {
    const siteDomain = site.toLowerCase().trim();
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
var globalNewsCache = {};
var NEWS_CACHE_TTL_MS = 10 * 60 * 1e3;
app.post("/api/news", async (req, res) => {
  try {
    const { teams, recencyDays, feedMode, customSites } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.status(400).json({ error: "Please specify at least one team." });
    }
    const days = Math.min(Math.max(Number(recencyDays) || 1, 1), 2);
    const isDirectMode = feedMode === "direct";
    const results = [];
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const sortedSites = Array.isArray(customSites) ? [...customSites].map((s) => s.toLowerCase().trim()).sort().join(",") : "";
      const cacheKey = `${team.toLowerCase().trim()}_${days}_${sortedSites}_${feedMode}`;
      const cached = globalNewsCache[cacheKey];
      const now = Date.now();
      if (cached && now - cached.timestamp < NEWS_CACHE_TTL_MS) {
        results.push({
          ...cached.result,
          fromCache: true,
          cacheAgeMs: now - cached.timestamp
        });
        continue;
      }
      if (results.filter((r) => !r.fromCache).length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 400));
      }
      try {
        let sitesFilter = "";
        const relevantSites = filterSitesForTeam(team, customSites || []);
        if (relevantSites.length > 0) {
          const formattedSites = relevantSites.map((s) => s.trim()).filter((s) => s.length > 0).map((s) => s.startsWith("site:") ? s : `site:${s}`);
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
          "cf",
          "sc",
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
          if (signatureWords.length > 1) {
            const hasAllWords = signatureWords.every((w) => titleLower.includes(w));
            if (hasAllWords) return true;
            const geoWord = signatureWords[0];
            if (titleLower.includes(geoWord)) {
              const sportsIndicators = ["win", "lose", "game", "match", "play", "squad", "coach", "signing", "goal", "defeat", "cup", "league", "qmjhl", "hockey", "score", "points", "season", "draft", "roster", "player", "trade", "contract", "injury"];
              const hasSportsWord = sportsIndicators.some((w) => titleLower.includes(w));
              if (hasSportsWord) return true;
              if (titleLower.includes(" vs ") || titleLower.includes(" vs. ") || titleLower.includes(" at ")) return true;
            }
            const nicknameWord = signatureWords[signatureWords.length - 1];
            if (titleLower.includes(nicknameWord)) {
              const commonNicks = ["wildcats", "giants", "tigers", "panthers", "lions", "eagles", "cardinals", "bulldogs", "rangers", "kings", "jets", "stars"];
              if (commonNicks.includes(nicknameWord)) {
                const regionalContext = ["qmjhl", "lhjmq", "hockey", "chl", "halifax", "mooseheads", "saint john", "sea dogs", "bathurst", "titan", "cape breton", "eagles", "rimouski", "oceanic", "quebec", "remparts", "chicoutimi", "sagueneens", "shawinigan", "cataractes", "sherbrooke", "phoenix", "rouyn-noranda", "huskies", "val-d'or", "foreurs", "boisbriand", "armada", "victoriaville", "tigres", "drummondville", "voltigeurs", "charlottetown", "islanders", "baie-comeau", "drakkar"];
                const hasContext = regionalContext.some((ctx) => titleLower.includes(ctx));
                if (hasContext) return true;
              } else {
                return true;
              }
            }
          } else if (signatureWords.length === 1) {
            if (titleLower.includes(signatureWords[0])) return true;
          }
          for (const nick of sportsNicknames) {
            if (titleLower.includes(nick)) return true;
          }
          return false;
        };
        const searchQuery = sitesFilter ? `"${team}"${sitesFilter}` : `"${team}"`;
        const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(searchQuery)}&hl=en-US&gl=US&ceid=US:en&_t=${Date.now()}`;
        let rssStatus = "200";
        let rssStatusText = "OK";
        let rssError = "";
        let generalRssStatus = "";
        let generalRssStatusText = "";
        let generalRssError = "";
        let geminiStatus = "Not attempted (found RSS results)";
        let response = null;
        try {
          response = await fetch(rssUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.0.0 Safari/537.36"
            }
          });
          rssStatus = String(response.status);
          rssStatusText = response.statusText;
        } catch (err) {
          rssStatus = "Fetch Network Error";
          rssStatusText = err.message || String(err);
          rssError = err.stack || String(err);
        }
        let articles = [];
        if (response && response.ok) {
          const xmlText = await response.text();
          const rawArticles = parseGoogleNewsRSS(xmlText);
          articles = rawArticles.filter((art) => isHeadlineMatch(art.title) && !isSpamArticle(art.title, art.url));
        } else if (response) {
          rssError = `Google News RSS responded with non-2xx code: ${response.status} ${response.statusText}`;
        }
        const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1e3;
        let filteredArticles = articles.filter((art) => art.timestamp >= cutoffTime);
        if (filteredArticles.length === 0 && sitesFilter) {
          const generalUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en&_t=${Date.now()}`;
          generalRssStatus = "Attempting...";
          try {
            const genResponse = await fetch(generalUrl, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0)" }
            });
            generalRssStatus = String(genResponse.status);
            generalRssStatusText = genResponse.statusText;
            if (genResponse.ok) {
              const genXml = await genResponse.text();
              const genArticles = parseGoogleNewsRSS(genXml);
              filteredArticles = genArticles.filter((art) => isHeadlineMatch(art.title) && !isSpamArticle(art.title, art.url)).filter((art) => art.timestamp >= cutoffTime);
            } else {
              generalRssError = `Response: ${genResponse.status} ${genResponse.statusText}`;
            }
          } catch (err) {
            generalRssStatus = "Fetch Network Error";
            generalRssStatusText = err.message || String(err);
            generalRssError = err.stack || String(err);
            console.warn(`General RSS feed fetch failed for ${team}`);
          }
        }
        let summaryText = "";
        geminiStatus = "Disabled (Relying purely on tracking feeds)";
        filteredArticles.sort((a, b) => b.timestamp - a.timestamp);
        const topArticles = filteredArticles.slice(0, 8);
        const links = topArticles.map((art) => ({
          title: art.title,
          url: art.url
        }));
        if (!summaryText) {
          summaryText = topArticles.length > 0 ? `\u2022 Direct Sports Feed Active. Loaded ${topArticles.length} recent headline${topArticles.length > 1 ? "s" : ""} directly from your tracking feed.
\u2022 Chronological live timeline of match reports and squad news below.` : `\u2022 No recent developments found on your selected sports websites in the last ${days} days. Try expanding your Recency window or updating customized domains.`;
        }
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
            rssError: rssError || void 0,
            generalRssStatus: generalRssStatus || void 0,
            generalRssStatusText: generalRssStatusText || void 0,
            generalRssError: generalRssError || void 0,
            geminiStatus,
            pacingDelayMs: i > 0 ? "Sequential pace active" : "None (first request)",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          },
          // If we failed to get articles and primary fetch wasn't completely successful
          error: topArticles.length === 0 && (rssStatus !== "200" || generalRssStatus && generalRssStatus !== "200")
        };
        results.push(resultItem);
        if (!resultItem.error) {
          globalNewsCache[cacheKey] = {
            result: resultItem,
            timestamp: Date.now()
          };
        }
      } catch (e) {
        console.warn(`Error aggregating feed for ${team}:`, e.message || e);
        results.push({
          team,
          summary: `\u2022 Offline Fallback: Temporary communication error fetching headlines for ${team} (${e.message || e}).
\u2022 Please check settings or wait for automatic retry.`,
          links: [
            { title: `${team} Hub Page`, url: `https://www.google.com/search?q=${encodeURIComponent(team)}` }
          ],
          articles: [],
          timestamp: Date.now(),
          error: true,
          diagnostics: {
            errorMsg: e.message || String(e),
            stack: e.stack ? e.stack.slice(0, 150) : void 0,
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
    }
    res.json({ results });
  } catch (error) {
    console.warn("News endpoint error:", error.message || error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
});
function matchesTeam(userTeamName, competitorDisplayName, competitorName) {
  const userLower = userTeamName.toLowerCase().trim();
  const compDisplayLower = competitorDisplayName.toLowerCase().trim();
  const compNameLower = competitorName.toLowerCase().trim();
  if (compDisplayLower === userLower || compDisplayLower.startsWith(userLower) || userLower.startsWith(compDisplayLower)) {
    return true;
  }
  const cleanAndTokenize = (str) => {
    return str.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").split(/\s+/).filter((w) => w.length >= 3 && !["the", "and", "team", "club", "sports", "news", "fc", "cf", "sc", "national", "association", "league", "de", "la", "el", "un"].includes(w));
  };
  const userTokens = cleanAndTokenize(userTeamName);
  const compDisplayTokens = cleanAndTokenize(competitorDisplayName);
  const compNameTokens = cleanAndTokenize(competitorName);
  if (userTokens.length === 0 || compDisplayTokens.length === 0) {
    return false;
  }
  const looseWords = ["real", "city", "united", "town", "county", "athletic", "rovers", "wanderers", "albion", "club", "saint", "st"];
  const overlap = userTokens.filter(
    (token) => compDisplayTokens.includes(token) || compNameTokens.includes(token)
  );
  if (overlap.length === 0) {
    return false;
  }
  const hasSpecificOverlap = overlap.some((t) => !looseWords.includes(t));
  if (hasSpecificOverlap) {
    return true;
  }
  return userTokens.every((t) => compDisplayTokens.includes(t)) || compDisplayTokens.every((t) => userTokens.includes(t));
}
function formatGameDate(dateStr) {
  try {
    const d = new Date(dateStr);
    const now = /* @__PURE__ */ new Date();
    const isToday = d.toDateString() === now.toDateString();
    const tomorrow = /* @__PURE__ */ new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const timeStr = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (isToday) {
      return `Today ${timeStr}`;
    } else if (isTomorrow) {
      return `Tomorrow ${timeStr}`;
    } else {
      const monthStr = d.toLocaleDateString([], { month: "short" });
      const dayStr = d.toLocaleDateString([], { day: "numeric" });
      return `${monthStr} ${dayStr} ${timeStr}`;
    }
  } catch {
    return "";
  }
}
var globalScoreboardCache = {};
var CACHE_TTL_MS = 24 * 60 * 60 * 1e3;
async function getCachedScoreboard(key, url) {
  const cached = globalScoreboardCache[key];
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  try {
    let targetUrl = url;
    if (key === "milb") {
      const today = /* @__PURE__ */ new Date();
      const startDateStr = today.toISOString().split("T")[0];
      const endDate = /* @__PURE__ */ new Date();
      endDate.setDate(today.getDate() + 14);
      const endDateStr = endDate.toISOString().split("T")[0];
      targetUrl = `${url}&startDate=${startDateStr}&endDate=${endDateStr}`;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4e3);
    const res = await fetch(targetUrl, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      let data = await res.json();
      if (key === "milb") {
        data = transformMlbStatsToEspn(data);
      }
      globalScoreboardCache[key] = { data, timestamp: now };
      return data;
    }
  } catch (e) {
    console.warn(`Failed to fetch scoreboard for ${key}:`, e);
  }
  return cached ? cached.data : null;
}
function transformMlbStatsToEspn(mlbData) {
  const events = [];
  if (mlbData && Array.isArray(mlbData.dates)) {
    for (const dateObj of mlbData.dates) {
      if (!Array.isArray(dateObj.games)) continue;
      for (const game of dateObj.games) {
        const awayTeam = game.teams?.away;
        const homeTeam = game.teams?.home;
        if (!awayTeam?.team || !homeTeam?.team) continue;
        const awayName = awayTeam.team.name || "";
        const homeName = homeTeam.team.name || "";
        const abstractState = game.status?.abstractGameState || "";
        const detailedState = game.status?.detailedState || "";
        let state = "pre";
        if (abstractState === "Live" || detailedState === "In Progress" || detailedState === "Live") {
          state = "in";
        } else if (abstractState === "Final" || detailedState === "Final" || detailedState === "Game Over" || detailedState === "Completed") {
          state = "post";
        }
        events.push({
          id: `milb_${game.gamePk}`,
          date: game.gameDate,
          status: {
            type: {
              state,
              detail: detailedState || abstractState || "Scheduled"
            }
          },
          competitions: [
            {
              id: `milb_${game.gamePk}`,
              date: game.gameDate,
              competitors: [
                {
                  id: `away_${awayTeam.team.id}`,
                  homeAway: "away",
                  score: String(awayTeam.score ?? 0),
                  team: {
                    id: `away_${awayTeam.team.id}`,
                    name: awayName,
                    displayName: awayName,
                    abbreviation: awayName.slice(0, 3).toUpperCase()
                  }
                },
                {
                  id: `home_${homeTeam.team.id}`,
                  homeAway: "home",
                  score: String(homeTeam.score ?? 0),
                  team: {
                    id: `home_${homeTeam.team.id}`,
                    name: homeName,
                    displayName: homeName,
                    abbreviation: homeName.slice(0, 3).toUpperCase()
                  }
                }
              ]
            }
          ]
        });
      }
    }
  }
  return { events };
}
function getSportForScoreboardKey(key) {
  if (key === "nhl" || key === "ahl") return "hockey";
  if (key === "mlb" || key === "milb") return "baseball";
  if (key === "nba") return "basketball";
  if (key === "nfl") return "football";
  if (["premier", "mls", "laliga", "seriea", "bundesliga", "ligue1", "ligamx"].includes(key)) return "soccer";
  return "other";
}
var SCOREBOARD_URLS = {
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
  ligamx: "https://site.api.espn.com/apis/site/v2/sports/soccer/mex.1/scoreboard",
  milb: "https://statsapi.mlb.com/api/v1/schedule?sportId=11"
};
app.post("/api/scores", async (req, res) => {
  try {
    const { teams } = req.body;
    if (!Array.isArray(teams) || teams.length === 0) {
      return res.json({ scores: {} });
    }
    const keys = Object.keys(SCOREBOARD_URLS);
    const boards = await Promise.all(
      keys.map(async (key) => {
        const data = await getCachedScoreboard(key, SCOREBOARD_URLS[key]);
        return { key, data };
      })
    );
    const scores = {};
    for (const teamName of teams) {
      const matchedGames = [];
      for (const board of boards) {
        if (!board.data || !Array.isArray(board.data.events)) continue;
        for (const event of board.data.events) {
          const competition = event.competitions?.[0];
          if (!competition || !Array.isArray(competition.competitors)) continue;
          for (const competitor of competition.competitors) {
            const teamObj = competitor.team;
            if (!teamObj) continue;
            const teamSport = getSportForTeam(teamName);
            const boardSport = getSportForScoreboardKey(board.key);
            if (teamSport !== "general" && boardSport !== "other" && teamSport !== boardSport) {
              continue;
            }
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
        let selectedGame = null;
        let isToday = false;
        const now = /* @__PURE__ */ new Date();
        const todayStr = now.toDateString();
        const gamesToday = matchedGames.filter((g) => {
          try {
            const d = new Date(g.event.date);
            return d.toDateString() === todayStr;
          } catch {
            return false;
          }
        });
        const upcomingGames = matchedGames.filter((g) => {
          try {
            const d = new Date(g.event.date);
            return d.getTime() > now.getTime() && d.toDateString() !== todayStr;
          } catch {
            return false;
          }
        });
        if (gamesToday.length > 0) {
          gamesToday.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
          selectedGame = gamesToday[0];
          isToday = true;
        } else if (upcomingGames.length > 0) {
          upcomingGames.sort((a, b) => new Date(a.event.date).getTime() - new Date(b.event.date).getTime());
          selectedGame = upcomingGames[0];
          isToday = false;
        } else {
          matchedGames.sort((a, b) => new Date(b.event.date).getTime() - new Date(a.event.date).getTime());
          selectedGame = matchedGames[0];
          isToday = false;
        }
        if (selectedGame) {
          const { event, competition, matchedCompetitor } = selectedGame;
          const opponent = competition.competitors.find((c) => c.id !== matchedCompetitor.team.id) || competition.competitors[0];
          const state = event.status?.type?.state || "pre";
          const detail = event.status?.type?.detail || "";
          const isHome = matchedCompetitor.homeAway === "home";
          const oppName = opponent?.team?.abbreviation || opponent?.team?.displayName || opponent?.team?.name || "Opp";
          const formattedDate = formatGameDate(event.date);
          const scoreText = `${formattedDate} ${isHome ? "vs" : "@"} ${oppName}`;
          scores[teamName] = {
            state: "pre",
            detail,
            scoreText,
            sport: selectedGame.sportKey,
            eventDate: event.date,
            opponentName: oppName,
            isHome,
            isToday,
            nextGame: null
          };
        }
      }
    }
    res.json({ scores });
  } catch (error) {
    console.warn("Scores endpoint error:", error.message || error);
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
    app.use(import_express.default.static(distPath, {
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        if (filePath.endsWith("index.html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
        } else {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      }
    }));
    app.get("*", (req, res) => {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
