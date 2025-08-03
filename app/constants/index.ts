// Travel status related constants
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

export const STATUS_CYCLE: TravelStatus[] = [
  "want_to_visit",
  "planning",
  "visited",
  "avoid",
];

// MapView-specific colors
export const MAPVIEW_COLORS = {
  unvisitedFill: "#e0e7ff", // Light blue for unvisited countries
  hoverFill: "#cbd5e1", // Subtle gray-blue for hover
  visitedHover: "#16a34a", // green-600
  planningHover: "#d97706", // amber-600
  wantToVisitHover: "#2563eb", // blue-600
  avoidHover: "#b91c1c", // red-700
  selectedStroke: "#1e293b", // Even darker for selected country
  borderStroke: "#334155", // Medium-dark for borders
  hoverStroke: "#1e40af", // Blue for hover
} as const;

// Map dimensions
export const MAP_DIMENSIONS = {
  WIDTH: 1000,
  HEIGHT: 600,
} as const;

// Storage keys
export const STORAGE_KEYS = {
  USER_MAP_DATA: "userMapData",
} as const;

// Import the TravelStatus type
import type { TravelStatus } from "../types";
