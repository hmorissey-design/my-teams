import { AdData } from "./types";
import sportsPresetsJson from "./teams.json";

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

// Load sports, leagues and teams dynamically from central config
export const SPORTS_PRESETS: SportPreset[] = sportsPresetsJson as SportPreset[];

// Re-export POPULAR_TEAMS for backward compatibility mapped from the JSON content
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
    headline: "🔥 Upgrade to MY TEAM NEWS Premium: No Banner Ads, Plus Live Audio Feeds!",
    sponsor: "My Team News Pro",
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
