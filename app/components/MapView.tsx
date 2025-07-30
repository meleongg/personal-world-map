"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import { STATUS_COLORS, TravelStatus } from "../types";

// URL for world map topology data

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// MapView-specific colors
const MAPVIEW_COLORS = {
  // Lookup for status hover colors
  unvisitedFill: "#e0e7ff", // Light blue for unvisited countries
  hoverFill: "#cbd5e1", // Subtle gray-blue for hover
  visitedHover: "#16a34a", // green-600
  planningHover: "#d97706", // amber-600
  wantToVisitHover: "#2563eb", // blue-600
  avoidHover: "#b91c1c", // red-700
  selectedStroke: "#1e293b", // Even darker for selected country
  borderStroke: "#334155", // Medium-dark for borders
  hoverStroke: "#1e40af", // Blue for hover
};

const STATUS_HOVER_COLORS: Record<TravelStatus, string> = {
  visited: MAPVIEW_COLORS.visitedHover,
  planning: MAPVIEW_COLORS.planningHover,
  want_to_visit: MAPVIEW_COLORS.wantToVisitHover,
  avoid: MAPVIEW_COLORS.avoidHover,
};

interface MapViewProps {
  getCountryStatus: (countryCode: string) => TravelStatus | null;
  onCountryClick: (countryCode: string) => void;
  selectedCountry: string | null;
  hoveredCountry?: string | null;
  onCountryHover?: (countryCode: string | null) => void;
}

interface CountryProperties {
  id: string;
  name: string;
}

type CountryFeature = Feature<GeoJSON.Geometry, CountryProperties>;

export const MapView: React.FC<MapViewProps> = ({
  getCountryStatus,
  onCountryClick,
  selectedCountry,
  hoveredCountry,
  onCountryHover,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const WIDTH = 1000;
  const HEIGHT = 600;

  // D3 projection and path generator
  const projection = geoNaturalEarth1()
    .scale(180)
    .translate([WIDTH / 2, HEIGHT / 2 + 20]);

  const pathGenerator = geoPath().projection(projection);

  // Load and process geographic data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch(GEO_URL);
        const topology = await response.json();

        let countriesObject = topology.objects.countries;
        if (!countriesObject) {
          countriesObject =
            topology.objects.countries110 ||
            topology.objects.countries_110m ||
            null;
        }
        if (!countriesObject) {
          console.error(
            "Could not find countries object in TopoJSON:",
            Object.keys(topology.objects)
          );
          setIsLoading(false);
          return;
        }

        // Convert TopoJSON to GeoJSON features
        const geoJsonFeatures = feature(topology, countriesObject);
        if (!geoJsonFeatures || !(geoJsonFeatures as any).features) {
          console.error("GeoJSON features not found:", geoJsonFeatures);
          setIsLoading(false);
          return;
        }

        // Handle the conversion safely
        const features = (
          geoJsonFeatures as unknown as FeatureCollection<
            GeoJSON.Geometry,
            CountryProperties
          >
        ).features;

        // Filter out invalid countries (use id and name)
        const validCountries = features.filter((country: CountryFeature) => {
          return (
            country.id &&
            country.id !== "-99" &&
            country.properties &&
            country.properties.name &&
            typeof country.properties.name === "string"
          );
        });

        if (validCountries.length === 0) {
          console.warn("No valid countries found in features:", features);
        }

        setCountries(validCountries);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading geographic data:", error);
        setIsLoading(false);
      }
    };

    loadGeoData();
  }, []);

  const getCountryColor = (countryCode: string): string => {
    const status = getCountryStatus(countryCode);
    if (status) {
      return STATUS_COLORS[status];
    }
    return MAPVIEW_COLORS.unvisitedFill;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center aspect-[5/3] max-h-[600px]">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center aspect-[5/3] max-h-[600px]">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        width="100%"
        height="100%"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {countries.map((country, index) => {
          const countryCode = country.id ? String(country.id) : String(index);
          const countryName = country.properties.name;
          const pathData = pathGenerator(country);
          if (!pathData) return null;
          const isHovered = hoveredCountry === countryCode;
          const isSelected = selectedCountry === countryCode;
          let fillColor =
            getCountryColor(countryCode) || MAPVIEW_COLORS.unvisitedFill;
          if (isHovered && !isSelected) {
            const status = getCountryStatus(countryCode);
            fillColor = status
              ? STATUS_HOVER_COLORS[status]
              : MAPVIEW_COLORS.hoverFill;
          }
          const strokeColor = isSelected
            ? MAPVIEW_COLORS.selectedStroke
            : isHovered
            ? MAPVIEW_COLORS.hoverStroke
            : MAPVIEW_COLORS.borderStroke;
          const strokeWidth = String(isSelected || isHovered ? 2 : 0.5);
          return (
            <path
              key={countryCode}
              d={pathData}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer transition-all duration-200"
              onClick={() => onCountryClick(countryCode)}
              onMouseEnter={() => onCountryHover && onCountryHover(countryCode)}
              onMouseLeave={() => onCountryHover && onCountryHover(null)}
            >
              <title>{countryName || countryCode}</title>
            </path>
          );
        })}
      </svg>
    </div>
  );
};
