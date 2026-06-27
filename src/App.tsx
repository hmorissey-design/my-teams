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

  const SPORT_SPECIFIC_SOURCES: Record<string, string[]> = {
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
    const isSpecificToOtherSport = Object.entries(SPORT_SPECIFIC_SOURCES).some(([sp, sites]) => {
      return sp !== targetSport && sites.includes(siteDomain);
    });
    return !isSpecificToOtherSport;
  });
}

// Client-side game schedule local timezone formatter helper
function getDisplayScoreText(scoreData: any): string {
  if (!scoreData) return "";
  const { state, detail, scoreText, eventDate, opponentName, isHome } = scoreData;
  if (state === "in" || state === "post" || !eventDate) {
    return scoreText || ""; // Live and Final states are pre-formatted
  }

  // Format upcoming game date in browser's local timezone
  try {
    const d = new Date(eventDate);
    const now = new Date();
    
    const isToday = d.toDateString() === now.toDateString();
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    let formattedDate = "";
    if (isToday) {
      formattedDate = `Today ${timeStr}`;
    } else if (isTomorrow) {
      formattedDate = `Tomorrow ${timeStr}`;
    } else {
      const monthStr = d.toLocaleDateString([], { month: 'short' });
      const dayStr = d.toLocaleDateString([], { day: 'numeric' });
      formattedDate = `${monthStr} ${dayStr} ${timeStr}`;
    }

    return `${formattedDate} ${isHome ? "vs" : "@"} ${opponentName || "Opponent"}`;
  } catch {
    return scoreText || "";
  }
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

function matchesTeamClient(userTeamName: string, competitorDisplayName: string, competitorName: string): boolean {
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

  const hasSpecificOverlap = overlap.some(t => !looseWords.includes(t));
  if (hasSpecificOverlap) {
    return true;
  }

  return userTokens.every(t => compDisplayTokens.includes(t)) || compDisplayTokens.every(t => userTokens.includes(t));
}

export default function App() {
  // --- Persistent Local State ---
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem("my_teams_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        let loadedCustomSites = Array.isArray(parsed.customSites) ? parsed.customSites : ["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "skysports.com", "goal.com"];
        
        // Migrate existing saved state to automatically include new default sources if missing
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
          teams: Array.isArray(parsed.teams) ? parsed.teams : [],
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
      teams: [],
      feedMode: "direct",
      customSites: ["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "skysports.com", "goal.com"],
      sortBy: "recent",
    };
  });

  // --- UI and News States ---
  // Get list of sites that are actually active for the currently followed teams
  const getActuallySearchedSites = (): string[] => {
    if (settings.teams.length === 0) {
      return [];
    }
    const allSearched = new Set<string>();
    settings.teams.forEach(team => {
      const relevant = filterSitesForTeam(team, settings.customSites);
      relevant.forEach(site => allSearched.add(site.toLowerCase().trim()));
    });
    return Array.from(allSearched);
  };

  const actuallySearched = getActuallySearchedSites();

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
  const [showSourcesSelector, setShowSourcesSelector] = useState(false);
  const [expandedDiagnostics, setExpandedDiagnostics] = useState<Record<string, boolean>>({});

  const [teamScores, setTeamScores] = useState<Record<string, any>>({});
  const [scoresLoading, setScoresLoading] = useState(false);

  const fetchScoresDirectlyOnClient = async (targetTeams: string[]) => {
    try {
      const keys = Object.keys(SCOREBOARD_URLS) as Array<keyof typeof SCOREBOARD_URLS>;
      const boards = await Promise.all(
        keys.map(async (key) => {
          try {
            const res = await fetch(SCOREBOARD_URLS[key]);
            if (res.ok) {
              const data = await res.json();
              return { key, data };
            }
          } catch (err) {
            console.warn(`Direct client fetch failed for ${key}:`, err);
          }
          return { key, data: null };
        })
      );

      const clientScores: Record<string, any> = {};

      for (const teamName of targetTeams) {
        const matchedGames: any[] = [];

        for (const board of boards) {
          if (!board.data || !Array.isArray(board.data.events)) continue;

          for (const event of board.data.events) {
            const competition = event.competitions?.[0];
            if (!competition || !Array.isArray(competition.competitors)) continue;

            for (const competitor of competition.competitors) {
              const teamObj = competitor.team;
              if (!teamObj) continue;

              if (matchesTeamClient(teamName, teamObj.displayName || "", teamObj.name || "")) {
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
          matchedGames.sort((a, b) => {
            const stateScore = (g: any) => {
              const s = g.event.status?.type?.state;
              if (s === "in") return 3;   // Live
              if (s === "post") return 2; // Finished
              return 1;                   // Scheduled
            };
            
            const scoreA = stateScore(a);
            const scoreB = stateScore(b);
            if (scoreA !== scoreB) {
              return scoreB - scoreA;
            }
            
            const dateA = new Date(a.event.date).getTime();
            const dateB = new Date(b.event.date).getTime();
            const now = Date.now();
            return Math.abs(dateA - now) - Math.abs(dateB - now);
          });

          const bestGame = matchedGames[0];
          const { event, competition, matchedCompetitor } = bestGame;
          const opponent = competition.competitors.find((c: any) => c.id !== matchedCompetitor.team.id) || competition.competitors[0];

          const state = event.status?.type?.state;
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
          }

          clientScores[teamName] = {
            state,
            detail,
            scoreText,
            sport: bestGame.sportKey,
            eventDate: event.date,
            opponentName: opponent?.team?.abbreviation || opponent?.team?.displayName || opponent?.team?.name || "Opp",
            isHome: matchedCompetitor.homeAway === "home"
          };
        }
      }

      setTeamScores(prev => ({ ...prev, ...clientScores }));
    } catch (err) {
      console.warn("Direct client scores processing failed:", err);
    }
  };

  const fetchScores = async (teamsToFetch?: string[]) => {
    const targetTeams = teamsToFetch || settings.teams;
    if (targetTeams.length === 0) return;
    setScoresLoading(true);
    try {
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ teams: targetTeams }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.scores) {
          setTeamScores(prev => ({ ...prev, ...data.scores }));
        }
      } else {
        // Fallback to client-side direct fetch if API returns an error or is a 404 (static deployment)
        await fetchScoresDirectlyOnClient(targetTeams);
      }
    } catch (e) {
      console.warn("Failed to fetch live scores from server backend, falling back to direct client-side fetch:", e);
      await fetchScoresDirectlyOnClient(targetTeams);
    } finally {
      setScoresLoading(false);
    }
  };

  // Fetch scores on initial load
  useEffect(() => {
    if (settings.teams.length > 0) {
      fetchScores();
    }
  }, []);

  // Refresh scores every 60 seconds
  useEffect(() => {
    if (settings.teams.length === 0) return;
    fetchScores(); // Fetch immediately when teams list changes
    const interval = setInterval(() => {
      fetchScores();
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.teams.join(",")]); // Join array to dependency string for stable trigger

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
  };

  const fetchRssWithFallbackProxies = async (rssUrl: string): Promise<string> => {
    const errors: string[] = [];
    const proxies = [
      // 1. Google Gadget Proxy (hosted by Google, very fast, rarely rate-limited for Google services like Google News RSS)
      {
        name: "Google Gadget Proxy",
        fn: async () => {
          const res = await fetch(`https://images-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=120&url=${encodeURIComponent(rssUrl)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          if (!text || text.length < 100) throw new Error("Empty/truncated response");
          return text;
        }
      },
      // 2. corsproxy.io (using standard query format)
      {
        name: "corsproxy.io",
        fn: async () => {
          const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(rssUrl)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          if (!text || text.length < 100) throw new Error("Empty/truncated response");
          return text;
        }
      },
      // 3. allorigins.win (raw direct passthrough)
      {
        name: "allorigins.win (raw)",
        fn: async () => {
          const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          if (!text || text.length < 100) throw new Error("Empty/truncated response");
          return text;
        }
      },
      // 4. allorigins.win (nested JSON wrapper)
      {
        name: "allorigins.win (json)",
        fn: async () => {
          const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!json.contents) throw new Error("Missing contents in JSON response");
          if (json.contents.length < 100) throw new Error("Empty/truncated response");
          return json.contents;
        }
      },
      // 5. codetabs (alternative proxy)
      {
        name: "codetabs.com",
        fn: async () => {
          const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(rssUrl)}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const text = await res.text();
          if (!text || text.length < 100) throw new Error("Empty/truncated response");
          return text;
        }
      }
    ];

    for (let i = 0; i < proxies.length; i++) {
      try {
        const text = await proxies[i].fn();
        return text;
      } catch (err: any) {
        const errMsg = err.message || String(err);
        errors.push(`${proxies[i].name} (${errMsg})`);
        console.warn(`Client Proxy Fallback [${proxies[i].name}] failed:`, errMsg);
      }
    }
    throw new Error(`All proxies failed: [${errors.join(" | ")}]`);
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
      setErrorMsg(null);
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    fetchScores(targetTeams);

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
              const relevantSites = filterSitesForTeam(team, settings.customSites || []);
              if (relevantSites.length > 0) {
                const formattedSites = relevantSites
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
                diagnostics: {
                  searchQuery,
                  rssUrl,
                  rssStatus: "200 (Client CORS Fallback)",
                  rssStatusText: "OK",
                  geminiStatus: "Disabled",
                  timestamp: new Date().toISOString(),
                },
                error: topArticles.length === 0,
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
                diagnostics: {
                  searchQuery: `"${team}"`,
                  rssUrl: `https://news.google.com/rss/search?q=${encodeURIComponent(`"${team}"`)}&hl=en-US&gl=US&ceid=US:en`,
                  rssStatus: "Client Proxy Failure",
                  rssStatusText: innerErr.message || String(innerErr),
                  rssError: innerErr.stack || String(innerErr),
                  geminiStatus: "Disabled",
                  timestamp: new Date().toISOString(),
                }
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

  // Initial Fetch if cache is empty or if any tracked teams have news older than 20 minutes (or if they had error/no-results states)
  useEffect(() => {
    if (settings.teams.length === 0) return;

    const now = Date.now();
    const CACHE_EXPIRY_MS = 20 * 60 * 1000; // 20 minutes

    const missing = settings.teams.filter(t => !newsCache[t]);
    const expired = settings.teams.filter(t => {
      const cacheEntry = newsCache[t];
      if (!cacheEntry) return false;

      // Force refresh on mount if previous attempt was an error or returned zero articles
      if (cacheEntry.error || !cacheEntry.articles || cacheEntry.articles.length === 0) {
        return true;
      }

      const age = now - (cacheEntry.timestamp || 0);
      return age > CACHE_EXPIRY_MS;
    });

    if (missing.length > 0 || expired.length > 0) {
      if (expired.length > 0 && missing.length === 0) {
        console.log(`Auto-refreshing stale or failed sports feeds: ${expired.join(", ")}`);
      }
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
            <span>Choose Teams and Preferences</span>
          </button>
        </div>
      </nav>

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6 self-start overflow-y-auto">
        
        {/* NEWS CONTAINER */}
        <div className="w-full flex flex-col gap-6">
          
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
              <div className="flex justify-center">
                <button 
                  onClick={() => {
                    setSettingsTab("teams");
                    setShowSettings(true);
                  }} 
                  className={`px-5 py-2.5 font-bold text-xs rounded-xl transition flex items-center gap-2 ${
                    settings.darkMode 
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md animate-pulse'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  Select Team(s) to follow
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
                      <span>Searching for Updates...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* HORIZONTAL TEAM FILTER PILLS */}
              {settings.teams.length > 1 && (
                <div className={`flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-b border-dashed pb-3 ${
                  settings.darkMode ? 'border-slate-800/50' : 'border-slate-200/50'
                }`}>
                  <button
                    onClick={() => setSelectedTeamTab("All")}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                      selectedTeamTab === "All"
                        ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm font-extrabold'
                        : settings.darkMode
                          ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-xs'
                    }`}
                  >
                    All Teams ({settings.teams.length})
                  </button>
                  {settings.teams.map((team) => (
                    <button
                      key={team}
                      onClick={() => setSelectedTeamTab(team)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border shrink-0 ${
                        selectedTeamTab === team
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm font-extrabold'
                          : settings.darkMode
                            ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 shadow-xs'
                      }`}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              )}

              {/* News Panels (Separated by team) */}
              <div className="space-y-6">
                {[...settings.teams]
                  .filter(team => selectedTeamTab === "All" || selectedTeamTab === team)
                  .sort((a, b) => {
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
                        <div className={`flex items-center justify-between border-b pb-3 mb-4 flex-wrap gap-2 ${settings.darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-400/20 font-black text-xs text-emerald-400 shrink-0">
                              {team.substring(0, 3).toUpperCase()}
                            </div>
                            <h3 className={`text-base font-bold font-display ${settings.darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{team}</h3>
                            {teamScores[team] && (
                              <div className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold flex items-center gap-1.5 border transition-all ${
                                teamScores[team].state === 'in'
                                  ? settings.darkMode
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 animate-pulse font-extrabold'
                                    : 'bg-amber-500/10 text-amber-600 border-amber-500/20 animate-pulse font-extrabold'
                                  : teamScores[team].state === 'post'
                                    ? settings.darkMode
                                      ? 'bg-slate-950/40 text-slate-400 border-slate-800/80 font-medium'
                                      : 'bg-slate-100 text-slate-550 border-slate-200 font-medium'
                                    : settings.darkMode
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                              }`} title={teamScores[team].detail}>
                                {teamScores[team].state === 'in' && (
                                  <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                  </span>
                                )}
                                <span>{getDisplayScoreText(teamScores[team])}</span>
                              </div>
                            )}
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
                              <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                                settings.darkMode 
                                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' 
                                  : 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                              }`}>
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    <span className="font-semibold">{data.summary.replace(/^[•\s]+/g, '').split('\n')[0]}</span>
                                  </div>
                                  {data.diagnostics && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedDiagnostics(p => ({ ...p, [team]: !p[team] }))}
                                      className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${
                                        settings.darkMode
                                          ? "bg-rose-950/40 hover:bg-rose-900/30 border-rose-800/40 text-rose-300"
                                          : "bg-white hover:bg-rose-100 border-rose-300 text-rose-700 shadow-xs"
                                      }`}
                                    >
                                      {expandedDiagnostics[team] ? "Hide Diagnostics ✕" : "Show Diagnostics ⚙️"}
                                    </button>
                                  )}
                                </div>

                                {expandedDiagnostics[team] && data.diagnostics && (
                                  <div className={`p-3 rounded-lg border text-[10px] font-mono space-y-2 overflow-x-auto ${
                                    settings.darkMode ? 'bg-slate-950/80 border-rose-900/30 text-rose-200' : 'bg-slate-100 border-rose-200 text-slate-750'
                                  }`}>
                                    <p className="font-bold border-b border-rose-900/10 pb-1 mb-1 text-[11px] uppercase tracking-wider">
                                      🔍 Connection Error Diagnostic Payload
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                      <div><span className="opacity-60 font-sans">Status Code:</span> <span className="font-bold">{data.diagnostics.rssStatus}</span></div>
                                      <div><span className="opacity-60 font-sans">Status Info:</span> <span className="font-bold">{data.diagnostics.rssStatusText}</span></div>
                                      <div className="md:col-span-2 truncate"><span className="opacity-60 font-sans">Requested URL:</span> <a href={data.diagnostics.rssUrl} target="_blank" rel="noreferrer" className="underline hover:text-emerald-400">{data.diagnostics.rssUrl}</a></div>
                                      <div><span className="opacity-60 font-sans">Pacing Delay:</span> {data.diagnostics.pacingDelayMs || "None"}</div>
                                      <div><span className="opacity-60 font-sans">Backup Gemini Status:</span> {data.diagnostics.geminiStatus}</div>
                                      <div><span className="opacity-60 font-sans">Diagnostic Timestamp:</span> {data.diagnostics.timestamp}</div>
                                    </div>
                                    {data.diagnostics.rssError && (
                                      <div className="mt-2 pt-1.5 border-t border-rose-900/10">
                                        <p className="font-bold opacity-60 font-sans">RSS Server Reason/Stack:</p>
                                        <pre className="whitespace-pre-wrap mt-0.5 max-h-24 overflow-y-auto text-[9px] bg-black/20 p-1.5 rounded">{data.diagnostics.rssError}</pre>
                                      </div>
                                    )}
                                    {data.diagnostics.generalRssStatus && (
                                      <div className="mt-2 pt-1.5 border-t border-rose-900/10 grid grid-cols-1 md:grid-cols-2 gap-y-1">
                                        <div><span className="opacity-60 font-sans">General Fallback RSS Status:</span> {data.diagnostics.generalRssStatus}</div>
                                        <div><span className="opacity-60 font-sans">General Fallback Status Text:</span> {data.diagnostics.generalRssStatusText}</div>
                                        {data.diagnostics.generalRssError && <div className="md:col-span-2 text-[9px] opacity-80">Reason: {data.diagnostics.generalRssError}</div>}
                                      </div>
                                    )}
                                    <p className="text-[9px] opacity-75 italic border-t border-rose-900/10 pt-1 mt-1 font-sans leading-relaxed">
                                      💡 <strong>Deployment Tip:</strong> {data.diagnostics.rssStatus === "Client Proxy Failure" 
                                        ? "Since this app is hosted on a static page platform (e.g. GitHub Pages), it utilizes public CORS proxies (corsproxy.io, allorigins, codetabs) to query feeds directly from the browser. If all public proxies are rate-limited, wait a few minutes or run the full-stack version to use the backend proxy."
                                        : "If you see HTTP 429 or fetch errors, the Google News RSS API has rate-limited the server IP. The pacing delay will automatically spread requests on the next load."}
                                    </p>
                                  </div>
                                )}
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
                                            ? (settings.darkMode ? 'bg-slate-700' : 'bg-slate-300')
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
                                                ? (settings.darkMode ? 'text-slate-500 bg-slate-800/60' : 'text-slate-500 bg-slate-500/10')
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
                                    No recent stories matched selected web sources for this team. Add more sources or extend your recency lookup!
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
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                  Search for news in last ...
                </span>
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-400 select-none">
                    <input
                      type="checkbox"
                      id="recency-1-day"
                      checked={settings.recencyDays === 1}
                      onChange={() => handleRecencyChange(1)}
                      className="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span>1 day</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-400 select-none">
                    <input
                      type="checkbox"
                      id="recency-2-days"
                      checked={settings.recencyDays === 2}
                      onChange={() => handleRecencyChange(2)}
                      className="rounded border-slate-300 dark:border-slate-700 text-emerald-500 focus:ring-emerald-500 w-4 h-4 accent-emerald-500 cursor-pointer"
                    />
                    <span>2 days</span>
                  </label>
                </div>
              </div>

              {/* SECTION 4: SOURCES & CUSTOM SOURCES FILTER */}
              <div className={`p-4 rounded-xl border space-y-3.5 ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
              }`}>
                <div className="flex justify-between items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wide block">
                      News Sources
                    </label>
                    <p className="text-[10px] text-slate-500">
                      Customize sports web sources that the scanner queries.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSourcesSelector(!showSourcesSelector)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all shrink-0 ${
                      showSourcesSelector
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : settings.darkMode
                          ? "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850"
                          : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-xs"
                    }`}
                  >
                    {showSourcesSelector ? "Hide Options ✕" : "Add or Remove Sources"}
                  </button>
                </div>

                {!showSourcesSelector && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block">
                      Currently Active Sources:
                    </span>
                    {settings.customSites.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {settings.customSites.map(s => {
                          const isActive = actuallySearched.includes(s.toLowerCase().trim());
                          return (
                            <span key={s} className={`text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-mono ${
                              isActive
                                ? (settings.darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-800 border border-emerald-100')
                                : (settings.darkMode ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400')
                            }`}>
                              <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic block">No active news sources selected.</span>
                    )}
                  </div>
                )}

                {showSourcesSelector && (
                  <div className="space-y-4 pt-3 border-t border-slate-200/10">
                    
                    {/* Part A: Currently Active Sources (Moved to Top) */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          Currently Active Sources
                        </span>
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

                      {settings.customSites.length > 0 ? (
                        <div className={`p-3 rounded-xl border flex flex-wrap gap-1.5 max-h-36 overflow-y-auto ${
                          settings.darkMode ? 'bg-slate-950/30 border-slate-855' : 'bg-slate-50 border-slate-200 shadow-inner'
                        }`}>
                          {settings.customSites.map(s => {
                            const isActive = actuallySearched.includes(s.toLowerCase().trim());
                            return (
                              <span key={s} className={`text-[9px] px-2 py-0.5 rounded flex items-center gap-1 font-mono transition-all ${
                                isActive
                                  ? (settings.darkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200 text-emerald-800')
                                  : (settings.darkMode ? 'bg-slate-900 text-slate-500 border border-slate-800 opacity-60' : 'bg-slate-100 border border-slate-250 text-slate-400 opacity-60')
                              }`}>
                                <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                {s} {!isActive && <span className="text-[8px] font-sans opacity-70">(unused)</span>}
                                <button 
                                  type="button"
                                  onClick={() => setSettings(p => ({ ...p, customSites: p.customSites.filter(out => out !== s) }))}
                                  className="text-red-500 hover:text-red-400 ml-1 select-none font-bold font-sans text-xs"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-550 italic">No news sources are currently active. Follow or toggle some sources below to restore tracking.</p>
                      )}

                      {/* Add Custom Source Input */}
                      <div className="flex gap-2 pt-1">
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
                    </div>

                    {/* Part B: Categorised Sources list to add/remove */}
                    <div className="space-y-3 pt-3 border-t border-slate-200/10">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                          Explore & Toggle Sport-Specific Sources
                        </span>
                        <p className="text-[10px] text-slate-500">
                          Sources are automatically mapped and filtered based on the sports of the teams you follow.
                        </p>
                      </div>

                      {settings.teams.length === 0 && (
                        <div className={`p-3 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
                          settings.darkMode ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-800 shadow-sm'
                        }`}>
                          <span className="text-sm">⚠️</span>
                          <span>No teams followed yet. Sources will activate when you follow at least one team.</span>
                        </div>
                      )}

                      <div className="space-y-3.5 pt-1">
                        {/* Global & NA */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                            Global & North America
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {["espn.com", "sportsnet.ca", "tsn.ca", "nhl.com", "theathletic.com", "bleacherreport.com", "yahoosports.com"].map((site) => {
                              const isPreferred = settings.customSites.includes(site);
                              const isActive = actuallySearched.includes(site.toLowerCase().trim());
                              return (
                                <button
                                  key={site}
                                  type="button"
                                  onClick={() => {
                                    setSettings(p => {
                                      const updated = isPreferred 
                                        ? p.customSites.filter(s => s !== site)
                                        : [...p.customSites, site];
                                      return { ...p, customSites: updated };
                                    });
                                  }}
                                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono font-bold flex items-center gap-1.5 ${
                                    isActive
                                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-xs"
                                      : isPreferred
                                        ? (settings.darkMode 
                                          ? "bg-slate-900/60 border-slate-750 text-slate-450 opacity-60 hover:opacity-100" 
                                          : "bg-slate-100 border-slate-300 text-slate-500 opacity-70 hover:opacity-100 shadow-xs")
                                        : (settings.darkMode
                                          ? "bg-slate-950/40 border-slate-850 text-slate-600 hover:border-slate-750"
                                          : "bg-white border-slate-205 text-slate-400 hover:bg-slate-50")
                                  }`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : isPreferred ? 'bg-slate-400' : 'bg-transparent'}`} />
                                  {isActive ? "✓ " : ""}{site} {isPreferred && !isActive && <span className="text-[8px] font-sans font-normal opacity-70">(unused)</span>}
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
                              const isPreferred = settings.customSites.includes(site);
                              const isActive = actuallySearched.includes(site.toLowerCase().trim());
                              return (
                                <button
                                  key={site}
                                  type="button"
                                  onClick={() => {
                                    setSettings(p => {
                                      const updated = isPreferred 
                                        ? p.customSites.filter(s => s !== site)
                                        : [...p.customSites, site];
                                      return { ...p, customSites: updated };
                                    });
                                  }}
                                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono font-bold flex items-center gap-1.5 ${
                                    isActive
                                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-xs"
                                      : isPreferred
                                        ? (settings.darkMode 
                                          ? "bg-slate-900/60 border-slate-750 text-slate-450 opacity-60 hover:opacity-100" 
                                          : "bg-slate-100 border-slate-300 text-slate-500 opacity-70 hover:opacity-100 shadow-xs")
                                        : (settings.darkMode
                                          ? "bg-slate-950/40 border-slate-850 text-slate-600 hover:border-slate-750"
                                          : "bg-white border-slate-205 text-slate-400 hover:bg-slate-50")
                                  }`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : isPreferred ? 'bg-slate-400' : 'bg-transparent'}`} />
                                  {isActive ? "✓ " : ""}{site} {isPreferred && !isActive && <span className="text-[8px] font-sans font-normal opacity-70">(unused)</span>}
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
                              const isPreferred = settings.customSites.includes(site);
                              const isActive = actuallySearched.includes(site.toLowerCase().trim());
                              return (
                                <button
                                  key={site}
                                  type="button"
                                  onClick={() => {
                                    setSettings(p => {
                                      const updated = isPreferred 
                                        ? p.customSites.filter(s => s !== site)
                                        : [...p.customSites, site];
                                      return { ...p, customSites: updated };
                                    });
                                  }}
                                  className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all font-mono font-bold flex items-center gap-1.5 ${
                                    isActive
                                      ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-400 shadow-xs"
                                      : isPreferred
                                        ? (settings.darkMode 
                                          ? "bg-slate-900/60 border-slate-750 text-slate-450 opacity-60 hover:opacity-100" 
                                          : "bg-slate-100 border-slate-300 text-slate-500 opacity-70 hover:opacity-100 shadow-xs")
                                        : (settings.darkMode
                                          ? "bg-slate-950/40 border-slate-850 text-slate-650 hover:border-slate-750"
                                          : "bg-white border-slate-205 text-slate-400 hover:bg-slate-50")
                                  }`}
                                >
                                  <span className={`w-1 h-1 rounded-full ${isActive ? 'bg-emerald-500' : isPreferred ? 'bg-slate-400' : 'bg-transparent'}`} />
                                  {isActive ? "✓ " : ""}{site} {isPreferred && !isActive && <span className="text-[8px] font-sans font-normal opacity-70">(unused)</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
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
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Change to Light Theme</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-emerald-400" />
                      <span>Change to Dark Theme</span>
                    </>
                  )}
                </button>
              </div>

              {/* SECTION 7: CLEAR HISTORY */}
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                settings.darkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-sm'
              }`}>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Clear History</span>
                  <span className="text-[11px] text-slate-550 block">Wipe downloaded stories and reset clicked/read links to start completely fresh.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearFeedCache();
                    setViewedLinks([]);
                    localStorage.removeItem("my_teams_viewed_links");
                    setOriginalSettings(null);
                    setShowSettings(false);
                  }}
                  className="p-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-sm shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
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
