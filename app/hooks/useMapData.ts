"use client";

import { useEffect, useState } from "react";
import { CountryEntry, MapData, TravelStatus } from "../types";
import {
  cycleCountryStatus,
  loadMapData,
  removeCountryEntry,
  saveMapData,
  updateCountryEntry,
} from "../utils/storage";

export const useMapData = () => {
  const [mapData, setMapData] = useState<MapData>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = loadMapData();
    setMapData(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveMapData(mapData);
    }
  }, [mapData, isLoading]);

  const updateCountry = (
    countryCode: string,
    updates: Partial<CountryEntry>
  ) => {
    setMapData((prev) => updateCountryEntry(prev, countryCode, updates));
  };

  const cycleStatus = (countryCode: string) => {
    setMapData((prev) => cycleCountryStatus(prev, countryCode));
  };

  const removeCountry = (countryCode: string) => {
    setMapData((prev) => removeCountryEntry(prev, countryCode));
    if (selectedCountry === countryCode) {
      setSelectedCountry(null);
    }
  };

  const getCountryData = (countryCode: string): CountryEntry | null => {
    return mapData[countryCode] || null;
  };

  const getCountryStatus = (countryCode: string): TravelStatus | null => {
    return mapData[countryCode]?.status || null;
  };

  const getTotalCountsByStatus = () => {
    return Object.values(mapData).reduce((acc, entry) => {
      acc[entry.status] = (acc[entry.status] || 0) + 1;
      return acc;
    }, {} as Record<TravelStatus, number>);
  };

  return {
    mapData,
    selectedCountry,
    setSelectedCountry,
    updateCountry,
    cycleStatus,
    removeCountry,
    getCountryData,
    getCountryStatus,
    getTotalCountsByStatus,
    isLoading,
  };
};
