"use client";

import { Button } from "@/components/ui/button";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import type { Feature } from "geojson";
import { Download } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";
import { STATUS_COLORS, TravelStatus } from "../types";

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
  countries: CountryFeature[];
  isLoading: boolean;
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
  countries,
  isLoading,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const WIDTH = 1000;
  const HEIGHT = 600;

  const projection = geoNaturalEarth1()
    .scale(180)
    .translate([WIDTH / 2, HEIGHT / 2 + 20]);

  const pathGenerator = geoPath().projection(projection);

  const handleExportMap = async () => {
    if (!svgRef.current) {
      toast.error("Map not ready for export. Please try again.");
      return;
    }

    try {
      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      // Set canvas size
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      // Convert SVG to data URL
      const svgData = new XMLSerializer().serializeToString(svgRef.current);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image and draw it to canvas
      const img = new Image();
      img.onload = () => {
        // Set white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Draw the SVG image
        ctx.drawImage(img, 0, 0);

        // Convert canvas to blob and download
        canvas.toBlob((blob) => {
          if (!blob) throw new Error("Could not create image blob");

          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `my-travel-map-${
            new Date().toISOString().split("T")[0]
          }.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Cleanup
          URL.revokeObjectURL(url);
          URL.revokeObjectURL(svgUrl);

          toast.success("Map exported successfully!");
        }, "image/png");
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        toast.error("Failed to export map. Please try again.");
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export map. Please try again.");
    }
  };

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
    <div className="relative w-full bg-blue-50 rounded-lg overflow-hidden flex items-center justify-center aspect-[5/3] max-h-[600px]">
      {/* Export Button */}
      <Button
        onClick={handleExportMap}
        variant="outline"
        size="sm"
        className="absolute top-2 right-2 z-10 bg-white/90 hover:bg-white shadow-md flex items-center gap-2 cursor-pointer"
      >
        <Download className="w-4 h-4" />
        Export
      </Button>

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
