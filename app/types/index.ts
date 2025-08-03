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
