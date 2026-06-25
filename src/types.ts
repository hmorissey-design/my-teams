export interface WebLink {
  title: string;
  url: string;
}

export interface DirectArticle {
  title: string;
  url: string;
  timestamp: number;
  source: string;
}

export interface TeamNews {
  team: string;
  summary: string;
  links: WebLink[];
  timestamp: number;
  articles?: DirectArticle[]; // Raw RSS headlines parsed cleanly with zero cost
  error?: boolean;
  isQuotaExceeded?: boolean;
  originalErrorMessage?: string;
  diagnostics?: any;
}

export interface AppSettings {
  recencyDays: number;
  darkMode: boolean;
  teams: string[];
  feedMode: "direct" | "ai";
  customSites: string[];
  sortBy: "default" | "recent";
}

export interface AdData {
  id: string;
  headline: string;
  sponsor: string;
  cta: string;
  color: string;
}
