"use client";

import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature, FeatureCollection } from "geojson";
import { useEffect, useRef, useState } from "react";
import { feature } from "topojson-client";
import { STATUS_COLORS, TravelStatus } from "../types";

// URL for world map topology data
const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface MapViewProps {
  getCountryStatus: (countryCode: string) => TravelStatus | null;
  onCountryClick: (countryCode: string) => void;
  selectedCountry: string | null;
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
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [countries, setCountries] = useState<CountryFeature[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Map dimensions
  const WIDTH = 800;
  const HEIGHT = 500;

  // D3 projection and path generator
  const projection = geoNaturalEarth1()
    .scale(140)
    .translate([WIDTH / 2, HEIGHT / 2 + 20]);

  const pathGenerator = geoPath().projection(projection);

  // Load and process geographic data
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const response = await fetch(GEO_URL);
        const topology = await response.json();
        console.log("TopoJSON object keys:", Object.keys(topology.objects));

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

        // Debug: log the properties of the first few features
        console.log(
          "Sample feature properties:",
          features.slice(0, 5).map((f) => f.properties)
        );

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
    return "#f3f4f6"; // Default gray color for unvisited countries
  };

  const getStrokeColor = (countryCode: string): string => {
    if (selectedCountry === countryCode) {
      return "#1f2937"; // Dark gray for selected country
    }
    return "#e5e7eb"; // Light gray for borders
  };

  const getStrokeWidth = (countryCode: string): number => {
    if (selectedCountry === countryCode) {
      return 2;
    }
    return 0.5;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-blue-50 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width={WIDTH}
        height={HEIGHT}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-full"
        style={{ maxWidth: "100%", height: "auto" }}
      >
        {countries.map((country, index) => {
          const countryCode = country.id ? String(country.id) : String(index);
          const countryName = country.properties.name;
          const pathData = pathGenerator(country);
          if (!pathData) return null;
          const fillColor = getCountryColor(countryCode) || "#bdbdbd";
          const strokeColor = getStrokeColor(countryCode) || "#888";
          const strokeWidth = String(getStrokeWidth(countryCode) || 0.5);
          return (
            <path
              key={countryCode}
              d={pathData}
              fill={fillColor}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              className="cursor-pointer transition-all duration-200 hover:stroke-gray-700 hover:stroke-2"
              onClick={() => onCountryClick(countryCode)}
              onMouseEnter={(e) => {
                const target = e.target as SVGPathElement;
                target.style.stroke = "#374151";
                target.style.strokeWidth = "1.5";
              }}
              onMouseLeave={(e) => {
                const target = e.target as SVGPathElement;
                target.style.stroke = strokeColor;
                target.style.strokeWidth = strokeWidth;
              }}
            >
              <title>{countryName || countryCode}</title>
            </path>
          );
        })}
      </svg>
    </div>
  );
};
