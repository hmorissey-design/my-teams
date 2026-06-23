import { AdData } from "./types";

export interface PopularTeam {
  name: string;
  display: string;
}

export interface PopularTeamGroup {
  category: string;
  iconType: "hockey" | "baseball" | "basketball" | "soccer" | "football";
  teams: PopularTeam[];
}

export const POPULAR_TEAMS: PopularTeamGroup[] = [
  {
    category: "🏒 Hockey (NHL)",
    iconType: "hockey",
    teams: [
      { name: "Anaheim Ducks", display: "Anaheim" },
      { name: "Boston Bruins", display: "Boston" },
      { name: "Buffalo Sabres", display: "Buffalo" },
      { name: "Calgary Flames", display: "Calgary" },
      { name: "Carolina Hurricanes", display: "Carolina" },
      { name: "Chicago Blackhawks", display: "Chicago" },
      { name: "Colorado Avalanche", display: "Colorado" },
      { name: "Columbus Blue Jackets", display: "Columbus" },
      { name: "Dallas Stars", display: "Dallas" },
      { name: "Detroit Red Wings", display: "Detroit" },
      { name: "Edmonton Oilers", display: "Edmonton" },
      { name: "Florida Panthers", display: "Florida" },
      { name: "Los Angeles Kings", display: "LA Kings" },
      { name: "Minnesota Wild", display: "Minnesota" },
      { name: "Montreal Canadiens", display: "Montreal" },
      { name: "Nashville Predators", display: "Nashville" },
      { name: "New Jersey Devils", display: "New Jersey" },
      { name: "New York Islanders", display: "NY Islanders" },
      { name: "New York Rangers", display: "NY Rangers" },
      { name: "Ottawa Senators", display: "Ottawa" },
      { name: "Philadelphia Flyers", display: "Philadelphia" },
      { name: "Pittsburgh Penguins", display: "Pittsburgh" },
      { name: "San Jose Sharks", display: "San Jose" },
      { name: "Seattle Kraken", display: "Seattle" },
      { name: "St. Louis Blues", display: "St. Louis" },
      { name: "Tampa Bay Lightning", display: "Tampa Bay" },
      { name: "Toronto Maple Leafs", display: "Toronto" },
      { name: "Utah Hockey Club", display: "Utah" },
      { name: "Vancouver Canucks", display: "Vancouver" },
      { name: "Vegas Golden Knights", display: "Vegas" },
      { name: "Washington Capitals", display: "Washington" },
      { name: "Winnipeg Jets", display: "Winnipeg" }
    ]
  },
  {
    category: "⚾ Baseball (MLB)",
    iconType: "baseball",
    teams: [
      { name: "Arizona Diamondbacks", display: "Arizona" },
      { name: "Atlanta Braves", display: "Atlanta" },
      { name: "Baltimore Orioles", display: "Baltimore" },
      { name: "Boston Red Sox", display: "Boston" },
      { name: "Chicago Cubs", display: "Chicago Cubs" },
      { name: "Chicago White Sox", display: "Chicago Sox" },
      { name: "Cincinnati Reds", display: "Cincinnati" },
      { name: "Cleveland Guardians", display: "Cleveland" },
      { name: "Colorado Rockies", display: "Colorado" },
      { name: "Detroit Tigers", display: "Detroit" },
      { name: "Houston Astros", display: "Houston" },
      { name: "Kansas City Royals", display: "Kansas City" },
      { name: "Los Angeles Angels", display: "LA Angels" },
      { name: "Los Angeles Dodgers", display: "LA Dodgers" },
      { name: "Miami Marlins", display: "Miami" },
      { name: "Milwaukee Brewers", display: "Milwaukee" },
      { name: "Minnesota Twins", display: "Minnesota" },
      { name: "New York Mets", display: "NY Mets" },
      { name: "New York Yankees", display: "NY Yankees" },
      { name: "Oakland Athletics", display: "Oakland" },
      { name: "Philadelphia Phillies", display: "Philadelphia" },
      { name: "Pittsburgh Pirates", display: "Pittsburgh" },
      { name: "San Diego Padres", display: "San Diego" },
      { name: "San Francisco Giants", display: "San Francisco" },
      { name: "Seattle Mariners", display: "Seattle" },
      { name: "St. Louis Cardinals", display: "St. Louis" },
      { name: "Tampa Bay Rays", display: "Tampa Bay" },
      { name: "Texas Rangers", display: "Texas" },
      { name: "Toronto Blue Jays", display: "Toronto" },
      { name: "Washington Nationals", display: "Washington" }
    ]
  },
  {
    category: "🏀 Basketball (NBA)",
    iconType: "basketball",
    teams: [
      { name: "Atlanta Hawks", display: "Atlanta" },
      { name: "Boston Celtics", display: "Boston" },
      { name: "Brooklyn Nets", display: "Brooklyn" },
      { name: "Charlotte Hornets", display: "Charlotte" },
      { name: "Chicago Bulls", display: "Chicago" },
      { name: "Cleveland Cavaliers", display: "Cleveland" },
      { name: "Dallas Mavericks", display: "Dallas" },
      { name: "Denver Nuggets", display: "Denver" },
      { name: "Detroit Pistons", display: "Detroit" },
      { name: "Golden State Warriors", display: "Golden State" },
      { name: "Houston Rockets", display: "Houston" },
      { name: "Indiana Pacers", display: "Indiana" },
      { name: "Los Angeles Clippers", display: "LA Clippers" },
      { name: "Los Angeles Lakers", display: "LA Lakers" },
      { name: "Memphis Grizzlies", display: "Memphis" },
      { name: "Miami Heat", display: "Miami" },
      { name: "Milwaukee Bucks", display: "Milwaukee" },
      { name: "Minnesota Timberwolves", display: "Minnesota" },
      { name: "New Orleans Pelicans", display: "New Orleans" },
      { name: "New York Knicks", display: "New York" },
      { name: "Oklahoma City Thunder", display: "Oklahoma City" },
      { name: "Orlando Magic", display: "Orlando" },
      { name: "Philadelphia 76ers", display: "Philadelphia" },
      { name: "Phoenix Suns", display: "Phoenix" },
      { name: "Portland Trail Blazers", display: "Portland" },
      { name: "Sacramento Kings", display: "Sacramento" },
      { name: "San Antonio Spurs", display: "San Antonio" },
      { name: "Toronto Raptors", display: "Toronto" },
      { name: "Utah Jazz", display: "Utah" },
      { name: "Washington Wizards", display: "Washington" }
    ]
  },
  {
    category: "🏈 Football (NFL)",
    iconType: "football",
    teams: [
      { name: "Arizona Cardinals", display: "Arizona" },
      { name: "Atlanta Falcons", display: "Atlanta" },
      { name: "Baltimore Ravens", display: "Baltimore" },
      { name: "Buffalo Bills", display: "Buffalo" },
      { name: "Carolina Panthers", display: "Carolina" },
      { name: "Chicago Bears", display: "Chicago" },
      { name: "Cincinnati Bengals", display: "Cincinnati" },
      { name: "Cleveland Browns", display: "Cleveland" },
      { name: "Dallas Cowboys", display: "Dallas" },
      { name: "Denver Broncos", display: "Denver" },
      { name: "Detroit Lions", display: "Detroit" },
      { name: "Green Bay Packers", display: "Green Bay" },
      { name: "Houston Texans", display: "Houston" },
      { name: "Indianapolis Colts", display: "Indianapolis" },
      { name: "Jacksonville Jaguars", display: "Jacksonville" },
      { name: "Kansas City Chiefs", display: "Kansas City" },
      { name: "Las Vegas Raiders", display: "Las Vegas" },
      { name: "Los Angeles Chargers", display: "LA Chargers" },
      { name: "Los Angeles Rams", display: "LA Rams" },
      { name: "Miami Dolphins", display: "Miami" },
      { name: "Minnesota Vikings", display: "Minnesota" },
      { name: "New England Patriots", display: "New England" },
      { name: "New Orleans Saints", display: "New Orleans" },
      { name: "New York Giants", display: "NY Giants" },
      { name: "New York Jets", display: "NY Jets" },
      { name: "Philadelphia Eagles", display: "Philadelphia" },
      { name: "Pittsburgh Steelers", display: "Pittsburgh" },
      { name: "San Francisco 49ers", display: "San Francisco" },
      { name: "Seattle Seahawks", display: "Seattle" },
      { name: "Tampa Bay Buccaneers", display: "Tampa Bay" },
      { name: "Tennessee Titans", display: "Tennessee" },
      { name: "Washington Commanders", display: "Washington" }
    ]
  },
  {
    category: "⚽ Soccer / Football",
    iconType: "soccer",
    teams: [
      { name: "Real Madrid", display: "Madrid" },
      { name: "Barcelona", display: "Barcelona" },
      { name: "Manchester United", display: "Man United" },
      { name: "Manchester City", display: "Man City" },
      { name: "Liverpool FC", display: "Liverpool" },
      { name: "Arsenal FC", display: "Arsenal" },
      { name: "Chelsea FC", display: "Chelsea" },
      { name: "Tottenham Hotspur", display: "Tottenham" },
      { name: "Paris Saint-Germain", display: "PSG" },
      { name: "Bayern Munich", display: "Bayern" },
      { name: "Borussia Dortmund", display: "Dortmund" },
      { name: "Juventus", display: "Juventus" },
      { name: "AC Milan", display: "AC Milan" },
      { name: "Inter Milan", display: "Inter Milan" }
    ]
  }
];

export const GOOGLE_ADMOB_ADS: AdData[] = [
  {
    id: "ad-1",
    headline: "⚾ Play Base Run Master! Free to download on Google Play.",
    sponsor: "Google Play Games",
    cta: "Install",
    color: "from-blue-600 to-emerald-600"
  },
  {
    id: "ad-2",
    headline: "🔥 Upgrade to MY TEAMS Premium: No Banner Ads, Plus Live Audio Feeds!",
    sponsor: "My Teams Pro",
    cta: "Go Ad-Free",
    color: "from-purple-600 to-indigo-600"
  },
  {
    id: "ad-3",
    headline: "👟 Speed Athletics: Level up your speed. 30% Off Trainers today.",
    sponsor: "Speed Athletics",
    cta: "Shop Now",
    color: "from-amber-600 to-orange-600"
  },
  {
    id: "ad-4",
    headline: "🎮 Sports Tycoon Manager: Lead your own club to championship victory!",
    sponsor: "Megaplay Games",
    cta: "Play",
    color: "from-pink-600 to-rose-600"
  },
  {
    id: "ad-5",
    headline: "📺 LiveStream HQ: Watch all Football, Hockey, & NBA events in full 4K.",
    sponsor: "LiveStream Plus",
    cta: "Subscribe",
    color: "from-teal-600 to-cyan-700"
  }
];
