import { STATUS_CYCLE, STORAGE_KEYS } from "../constants";
import { CountryEntry, MapData } from "../types";

export const loadMapData = (): MapData => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_MAP_DATA);
    if (!stored) return {};

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? convertArrayToObject(parsed) : parsed;
  } catch (error) {
    console.error("Error loading map data:", error);
    return {};
  }
};

export const saveMapData = (data: MapData): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.USER_MAP_DATA, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving map data:", error);
  }
};

export const updateCountryEntry = (
  data: MapData,
  countryCode: string,
  updates: Partial<CountryEntry>
): MapData => {
  const existing = data[countryCode];
  const updatedEntry: CountryEntry = {
    ...existing,
    countryCode,
    status: existing?.status || "want_to_visit",
    ...updates,
  };

  return {
    ...data,
    [countryCode]: updatedEntry,
  };
};

export const cycleCountryStatus = (
  data: MapData,
  countryCode: string
): MapData => {
  const current = data[countryCode]?.status || "want_to_visit";
  const currentIndex = STATUS_CYCLE.indexOf(current);
  const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

  return updateCountryEntry(data, countryCode, { status: nextStatus });
};

export const removeCountryEntry = (
  data: MapData,
  countryCode: string
): MapData => {
  const newData = { ...data };
  delete newData[countryCode];
  return newData;
};

// Helper function to convert legacy array format to object format
const convertArrayToObject = (entries: CountryEntry[]): MapData => {
  return entries.reduce((acc, entry) => {
    acc[entry.countryCode] = entry;
    return acc;
  }, {} as MapData);
};
