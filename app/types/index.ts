export type TravelStatus = "visited" | "planning" | "want_to_visit" | "avoid";

export interface CountryEntry {
  countryCode: string; // ISO Alpha
  status: TravelStatus;
  notes?: string;
  visitedAt?: string; // ISO date string, optional
  colorOverride?: string; // Optional hex code
}

export interface MapData {
  [countryCode: string]: CountryEntry;
}

export const STATUS_COLORS = {
  visited: "#22c55e", // green-500
  planning: "#fde047", // yellow-400
  want_to_visit: "#3b82f6", // blue-500
  avoid: "#ef4444", // red-500
} as const;

export const STATUS_LABELS = {
  visited: "Visited",
  planning: "Planning to Visit",
  want_to_visit: "Want to Visit",
  avoid: "Avoid",
} as const;
