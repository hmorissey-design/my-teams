import { AdData } from "./types";

export interface PopularTeam {
  name: string;
  display: string;
}

export interface PresetLeague {
  id: string;
  name: string;
  teams: PopularTeam[];
}

export interface SportPreset {
  id: string;
  name: string;
  icon: string;
  leagues: PresetLeague[];
}

export const SPORTS_PRESETS: SportPreset[] = [
  {
    id: "hockey",
    name: "Hockey",
    icon: "🏒",
    leagues: [
      {
        id: "nhl",
        name: "NHL (National Hockey League)",
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
        id: "ohl",
        name: "OHL (Ontario Hockey League)",
        teams: [
          { name: "Barrie Colts", display: "Barrie" },
          { name: "Brantford Bulldogs", display: "Brantford" },
          { name: "Erie Otters", display: "Erie" },
          { name: "Flint Firebirds", display: "Flint" },
          { name: "Guelph Storm", display: "Guelph" },
          { name: "Kingston Frontenacs", display: "Kingston" },
          { name: "Kitchener Rangers", display: "Kitchener" },
          { name: "London Knights", display: "London" },
          { name: "Brampton Steelheads", display: "Brampton" },
          { name: "Niagara IceDogs", display: "Niagara" },
          { name: "North Bay Battalion", display: "North Bay" },
          { name: "Oshawa Generals", display: "Oshawa" },
          { name: "Ottawa 67's", display: "Ottawa 67s" },
          { name: "Owen Sound Attack", display: "Owen Sound" },
          { name: "Peterborough Petes", display: "Peterborough" },
          { name: "Saginaw Spirit", display: "Saginaw" },
          { name: "Sarnia Sting", display: "Sarnia" },
          { name: "Soo Greyhounds", display: "Soo Greyhounds" },
          { name: "Sudbury Wolves", display: "Sudbury" },
          { name: "Windsor Spitfires", display: "Windsor" }
        ]
      },
      {
        id: "qmjhl",
        name: "QMJHL (Quebec Maritimes Junior Hockey League)",
        teams: [
          { name: "Acadie-Bathurst Titan", display: "Acadie-Bathurst" },
          { name: "Baie-Comeau Drakkar", display: "Baie-Comeau" },
          { name: "Blainville-Boisbriand Armada", display: "Blainville-Boisbriand" },
          { name: "Cape Breton Eagles", display: "Cape Breton" },
          { name: "Charlottetown Islanders", display: "Charlottetown" },
          { name: "Chicoutimi Saguenéens", display: "Chicoutimi" },
          { name: "Drummondville Voltigeurs", display: "Drummondville" },
          { name: "Gatineau Olympiques", display: "Gatineau" },
          { name: "Halifax Mooseheads", display: "Halifax" },
          { name: "Moncton Wildcats", display: "Moncton" },
          { name: "Quebec Remparts", display: "Quebec" },
          { name: "Rimouski Océanic", display: "Rimouski" },
          { name: "Rouyn-Noranda Huskies", display: "Rouyn-Noranda" },
          { name: "Saint John Sea Dogs", display: "Saint John" },
          { name: "Shawinigan Cataractes", display: "Shawinigan" },
          { name: "Sherbrooke Phoenix", display: "Sherbrooke" },
          { name: "Val-d'Or Foreurs", display: "Val-d'Or" },
          { name: "Victoriaville Tigres", display: "Victoriaville" }
        ]
      },
      {
        id: "whl",
        name: "WHL (Western Hockey League)",
        teams: [
          { name: "Brandon Wheat Kings", display: "Brandon" },
          { name: "Calgary Hitmen", display: "Calgary" },
          { name: "Edmonton Oil Kings", display: "Edmonton" },
          { name: "Everett Silvertips", display: "Everett" },
          { name: "Kamloops Blazers", display: "Kamloops" },
          { name: "Kelowna Rockets", display: "Kelowna" },
          { name: "Lethbridge Hurricanes", display: "Lethbridge" },
          { name: "Medicine Hat Tigers", display: "Medicine Hat" },
          { name: "Moose Jaw Warriors", display: "Moose Jaw" },
          { name: "Portland Winterhawks", display: "Portland" },
          { name: "Prince Albert Raiders", display: "Prince Albert" },
          { name: "Prince George Cougars", display: "Prince George" },
          { name: "Red Deer Rebels", display: "Red Deer" },
          { name: "Regina Pats", display: "Regina" },
          { name: "Saskatoon Blades", display: "Saskatoon" },
          { name: "Seattle Thunderbirds", display: "Seattle" },
          { name: "Spokane Chiefs", display: "Spokane" },
          { name: "Swift Current Broncos", display: "Swift Current" },
          { name: "Tri-City Americans", display: "Tri-City" },
          { name: "Vancouver Giants", display: "Vancouver" },
          { name: "Victoria Royals", display: "Victoria" },
          { name: "Wenatchee Wild", display: "Wenatchee" }
        ]
      },
      {
        id: "ahl",
        name: "AHL (American Hockey League)",
        teams: [
          { name: "Abbotsford Canucks", display: "Abbotsford" },
          { name: "Bakersfield Condors", display: "Bakersfield" },
          { name: "Belleville Senators", display: "Belleville" },
          { name: "Bridgeport Islanders", display: "Bridgeport" },
          { name: "Calgary Wranglers", display: "Calgary Wranglers" },
          { name: "Charlotte Checkers", display: "Charlotte" },
          { name: "Chicago Wolves", display: "Chicago" },
          { name: "Cleveland Monsters", display: "Cleveland" },
          { name: "Coachella Valley Firebirds", display: "Coachella Valley" },
          { name: "Colorado Eagles", display: "Colorado" },
          { name: "Grand Rapids Griffins", display: "Grand Rapids" },
          { name: "Hartford Wolf Pack", display: "Hartford" },
          { name: "Henderson Silver Knights", display: "Henderson" },
          { name: "Hershey Bears", display: "Hershey" },
          { name: "Iowa Wild", display: "Iowa" },
          { name: "Laval Rocket", display: "Laval" },
          { name: "Lehigh Valley Phantoms", display: "Lehigh Valley" },
          { name: "Manitoba Moose", display: "Manitoba" },
          { name: "Milwaukee Admirals", display: "Milwaukee" },
          { name: "Ontario Reign", display: "Ontario" },
          { name: "Providence Bruins", display: "Providence" },
          { name: "Rochester Americans", display: "Rochester" },
          { name: "Rockford IceHogs", display: "Rockford" },
          { name: "San Diego Gulls", display: "San Diego" },
          { name: "San Jose Barracuda", display: "San Jose" },
          { name: "Springfield Thunderbirds", display: "Springfield" },
          { name: "Syracuse Crunch", display: "Syracuse" },
          { name: "Texas Stars", display: "Texas" },
          { name: "Toronto Marlies", display: "Marlies" },
          { name: "Tucson Roadrunners", display: "Tucson" },
          { name: "Utica Comets", display: "Utica" },
          { name: "Wilkes-Barre/Scranton Penguins", display: "Wilkes-Barre/Scranton" }
        ]
      }
    ]
  },
  {
    id: "baseball",
    name: "Baseball",
    icon: "⚾",
    leagues: [
      {
        id: "mlb",
        name: "MLB (Major League Baseball)",
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
        id: "milb",
        name: "Minor League Baseball (Triple-A)",
        teams: [
          { name: "Albuquerque Isotopes", display: "Albuquerque" },
          { name: "Buffalo Bisons", display: "Buffalo Bisons" },
          { name: "Charlotte Knights", display: "Charlotte Knights" },
          { name: "Columbus Clippers", display: "Columbus Clippers" },
          { name: "Durham Bulls", display: "Durham Bulls" },
          { name: "El Paso Chihuahuas", display: "El Paso" },
          { name: "Gwinnett Stripers", display: "Gwinnett" },
          { name: "Indianapolis Indians", display: "Indianapolis" },
          { name: "Iowa Cubs", display: "Iowa Cubs" },
          { name: "Jacksonville Jumbo Shrimp", display: "Jacksonville" },
          { name: "Las Vegas Aviators", display: "Las Vegas" },
          { name: "Lehigh Valley IronPigs", display: "Lehigh Valley" },
          { name: "Louisville Bats", display: "Louisville" },
          { name: "Memphis Redbirds", display: "Memphis" },
          { name: "Nashville Sounds", display: "Nashville" },
          { name: "Norfolk Tides", display: "Norfolk" },
          { name: "Oklahoma City Comets", display: "Oklahoma City" },
          { name: "Omaha Storm Chasers", display: "Omaha" },
          { name: "Reno Aces", display: "Reno" },
          { name: "Rochester Red Wings", display: "Rochester" },
          { name: "Round Rock Express", display: "Round Rock" },
          { name: "Sacramento River Cats", display: "Sacramento" },
          { name: "Salt Lake Bees", display: "Salt Lake" },
          { name: "Scranton/Wilkes-Barre RailRiders", display: "Scranton/W-B" },
          { name: "St. Paul Saints", display: "St. Paul" },
          { name: "Sugar Land Space Cowboys", display: "Sugar Land" },
          { name: "Syracuse Mets", display: "Syracuse" },
          { name: "Tacoma Rainiers", display: "Tacoma" },
          { name: "Toledo Mud Hens", display: "Toledo" },
          { name: "Worcester Red Sox", display: "Worcester" }
        ]
      }
    ]
  },
  {
    id: "basketball",
    name: "Basketball",
    icon: "🏀",
    leagues: [
      {
        id: "nba",
        name: "NBA (National Basketball Association)",
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
        id: "euroleague",
        name: "EuroLeague",
        teams: [
          { name: "Real Madrid Baloncesto", display: "Real Madrid" },
          { name: "FC Barcelona Basketball", display: "FC Barcelona" },
          { name: "Olympiacos BC", display: "Olympiacos" },
          { name: "Panathinaikos BC", display: "Panathinaikos" }
        ]
      }
    ]
  },
  {
    id: "football",
    name: "American Football",
    icon: "🏈",
    leagues: [
      {
        id: "nfl",
        name: "NFL (National Football League)",
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
        id: "cfl",
        name: "CFL (Canadian Football League)",
        teams: [
          { name: "BC Lions", display: "BC Lions" },
          { name: "Calgary Stampeders", display: "Calgary" },
          { name: "Edmonton Elks", display: "Edmonton" },
          { name: "Hamilton Tiger-Cats", display: "Hamilton" },
          { name: "Montreal Alouettes", display: "Montreal" },
          { name: "Ottawa Redblacks", display: "Ottawa" },
          { name: "Saskatchewan Roughriders", display: "Saskatchewan" },
          { name: "Toronto Argonauts", display: "Toronto" },
          { name: "Winnipeg Blue Bombers", display: "Winnipeg" }
        ]
      }
    ]
  },
  {
    id: "soccer",
    name: "Soccer / Football",
    icon: "⚽",
    leagues: [
      {
        id: "premier",
        name: "Premier League (England)",
        teams: [
          { name: "Arsenal FC", display: "Arsenal" },
          { name: "Aston Villa", display: "Aston Villa" },
          { name: "Bournemouth FC", display: "Bournemouth" },
          { name: "Brentford FC", display: "Brentford" },
          { name: "Brighton & Hove Albion", display: "Brighton" },
          { name: "Chelsea FC", display: "Chelsea" },
          { name: "Crystal Palace", display: "Crystal Palace" },
          { name: "Everton FC", display: "Everton" },
          { name: "Fulham FC", display: "Fulham" },
          { name: "Ipswich Town", display: "Ipswich" },
          { name: "Leicester City", display: "Leicester" },
          { name: "Liverpool FC", display: "Liverpool" },
          { name: "Manchester City", display: "Man City" },
          { name: "Manchester United", display: "Man United" },
          { name: "Newcastle United", display: "Newcastle" },
          { name: "Nottingham Forest", display: "Nottm Forest" },
          { name: "Southampton FC", display: "Southampton" },
          { name: "Tottenham Hotspur", display: "Tottenham" },
          { name: "West Ham United", display: "West Ham" },
          { name: "Wolverhampton Wanderers", display: "Wolves" }
        ]
      },
      {
        id: "laliga",
        name: "La Liga (Spain)",
        teams: [
          { name: "Athletic Bilbao", display: "Athletic" },
          { name: "Atlético Madrid", display: "Atlético" },
          { name: "FC Barcelona", display: "Barcelona" },
          { name: "Celta Vigo", display: "Celta" },
          { name: "Deportivo Alavés", display: "Alavés" },
          { name: "RCD Espanyol", display: "Espanyol" },
          { name: "Getafe CF", display: "Getafe" },
          { name: "Girona FC", display: "Girona" },
          { name: "UD Las Palmas", display: "Las Palmas" },
          { name: "CD Leganés", display: "Leganés" },
          { name: "RCD Mallorca", display: "Mallorca" },
          { name: "CA Osasuna", display: "Osasuna" },
          { name: "Rayo Vallecano", display: "Rayo" },
          { name: "Real Betis", display: "Betis" },
          { name: "Real Madrid", display: "Real Madrid" },
          { name: "Real Sociedad", display: "Sociedad" },
          { name: "Sevilla FC", display: "Sevilla" },
          { name: "Valencia CF", display: "Valencia" },
          { name: "Real Valladolid", display: "Valladolid" },
          { name: "Villarreal CF", display: "Villarreal" }
        ]
      },
      {
        id: "seriea",
        name: "Serie A (Italy)",
        teams: [
          { name: "Atalanta BC", display: "Atalanta" },
          { name: "Bologna FC", display: "Bologna" },
          { name: "Cagliari Calcio", display: "Cagliari" },
          { name: "Como 1907", display: "Como" },
          { name: "Empoli FC", display: "Empoli" },
          { name: "ACF Fiorentina", display: "Fiorentina" },
          { name: "Genoa CFC", display: "Genoa" },
          { name: "Hellas Verona", display: "Verona" },
          { name: "Inter Milan", display: "Inter" },
          { name: "Juventus FC", display: "Juventus" },
          { name: "SS Lazio", display: "Lazio" },
          { name: "US Lecce", display: "Lecce" },
          { name: "AC Milan", display: "AC Milan" },
          { name: "AC Monza", display: "Monza" },
          { name: "SSC Napoli", display: "Napoli" },
          { name: "Parma Calcio", display: "Parma" },
          { name: "AS Roma", display: "Roma" },
          { name: "Torino FC", display: "Torino" },
          { name: "Udinese Calcio", display: "Udinese" },
          { name: "Venezia FC", display: "Venezia" }
        ]
      },
      {
        id: "bundesliga",
        name: "Bundesliga (Germany)",
        teams: [
          { name: "Bayer Leverkusen", display: "Leverkusen" },
          { name: "Bayern Munich", display: "Bayern" },
          { name: "Borussia Dortmund", display: "Dortmund" },
          { name: "Borussia Mönchengladbach", display: "M'gladbach" },
          { name: "Eintracht Frankfurt", display: "Frankfurt" },
          { name: "FC Augsburg", display: "Augsburg" },
          { name: "FC Heidenheim", display: "Heidenheim" },
          { name: "FC St. Pauli", display: "St. Pauli" },
          { name: "RB Leipzig", display: "Leipzig" },
          { name: "SC Freiburg", display: "Freiburg" },
          { name: "TSG Hoffenheim", display: "Hoffenheim" },
          { name: "Union Berlin", display: "Union Berlin" },
          { name: "VfB Stuttgart", display: "Stuttgart" },
          { name: "VfL Bochum", display: "Bochum" },
          { name: "VfL Wolfsburg", display: "Wolfsburg" },
          { name: "Werder Bremen", display: "Bremen" },
          { name: "Mainz 05", display: "Mainz" },
          { name: "Holstein Kiel", display: "Kiel" }
        ]
      },
      {
        id: "ligue1",
        name: "Ligue 1 (France)",
        teams: [
          { name: "Angers SCO", display: "Angers" },
          { name: "AJ Auxerre", display: "Auxerre" },
          { name: "AS Monaco", display: "Monaco" },
          { name: "AS Saint-Étienne", display: "Saint-Étienne" },
          { name: "FC Nantes", display: "Nantes" },
          { name: "Le Havre AC", display: "Le Havre" },
          { name: "Lille OSC", display: "Lille" },
          { name: "Montpellier HSC", display: "Montpellier" },
          { name: "OGC Nice", display: "Nice" },
          { name: "Olympique Lyonnais", display: "Lyon" },
          { name: "Olympique de Marseille", display: "Marseille" },
          { name: "Paris Saint-Germain", display: "PSG" },
          { name: "RC Lens", display: "Lens" },
          { name: "RC Strasbourg", display: "Strasbourg" },
          { name: "Stade Brestois 29", display: "Brest" },
          { name: "Stade de Reims", display: "Reims" },
          { name: "Stade Rennais", display: "Rennes" },
          { name: "Toulouse FC", display: "Toulouse" }
        ]
      },
      {
        id: "mls",
        name: "MLS (North America)",
        teams: [
          { name: "Atlanta United FC", display: "Atlanta" },
          { name: "Austin FC", display: "Austin" },
          { name: "CF Montréal", display: "Montréal" },
          { name: "Charlotte FC", display: "Charlotte" },
          { name: "Chicago Fire FC", display: "Chicago" },
          { name: "Colorado Rapids", display: "Colorado" },
          { name: "Columbus Crew", display: "Columbus" },
          { name: "D.C. United", display: "D.C. United" },
          { name: "FC Cincinnati", display: "Cincinnati" },
          { name: "FC Dallas", display: "Dallas" },
          { name: "Houston Dynamo FC", display: "Houston" },
          { name: "Inter Miami CF", display: "Inter Miami" },
          { name: "LA Galaxy", display: "LA Galaxy" },
          { name: "Los Angeles FC", display: "LAFC" },
          { name: "Minnesota United FC", display: "Minnesota" },
          { name: "Nashville SC", display: "Nashville" },
          { name: "New England Revolution", display: "New England" },
          { name: "New York City FC", display: "NYCFC" },
          { name: "New York Red Bulls", display: "NY Red Bulls" },
          { name: "Orlando City SC", display: "Orlando" },
          { name: "Philadelphia Union", display: "Philadelphia" },
          { name: "Portland Timbers", display: "Portland" },
          { name: "Real Salt Lake", display: "Real Salt Lake" },
          { name: "San Jose Earthquakes", display: "San Jose" },
          { name: "San Diego FC", display: "San Diego" },
          { name: "Seattle Sounders FC", display: "Seattle" },
          { name: "Sporting Kansas City", display: "Sporting KC" },
          { name: "St. Louis City SC", display: "St. Louis" },
          { name: "Toronto FC", display: "Toronto" },
          { name: "Vancouver Whitecaps FC", display: "Vancouver" }
        ]
      },
      {
        id: "ligamx",
        name: "Liga MX (Mexico)",
        teams: [
          { name: "Club América", display: "América" },
          { name: "Atlas FC", display: "Atlas" },
          { name: "Atlético San Luis", display: "San Luis" },
          { name: "CF Monterrey", display: "Monterrey" },
          { name: "CF Pachuca", display: "Pachuca" },
          { name: "Chivas de Guadalajara", display: "Chivas" },
          { name: "Club León", display: "León" },
          { name: "Club Necaxa", display: "Necaxa" },
          { name: "Club Puebla", display: "Puebla" },
          { name: "Club Tijuana", display: "Tijuana" },
          { name: "Cruz Azul", display: "Cruz Azul" },
          { name: "Deportivo Toluca FC", display: "Toluca" },
          { name: "FC Juárez", display: "Juárez" },
          { name: "Mazatlán FC", display: "Mazatlán" },
          { name: "Pumas UNAM", display: "Pumas" },
          { name: "Querétaro FC", display: "Querétaro" },
          { name: "Santos Laguna", display: "Santos" },
          { name: "Tigres UANL", display: "Tigres" }
        ]
      }
    ]
  }
];

// Re-export POPULAR_TEAMS for backward compatibility if ever imported,
// but map from SPORTS_PRESETS to prevent duplicate raw code.
export const POPULAR_TEAMS = SPORTS_PRESETS.flatMap(sport => 
  sport.leagues.map(l => ({
    category: `${sport.icon} ${l.name}`,
    iconType: sport.id as any,
    teams: l.teams
  }))
);

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
