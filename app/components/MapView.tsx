"use client";

import { Button } from "@/components/ui/button";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, ZoomBehavior, zoomIdentity } from "d3-zoom";
import type { Feature } from "geojson";
import { Copy, Download, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { MAP_DIMENSIONS, MAPVIEW_COLORS, STATUS_COLORS } from "../constants";
import { useTheme } from "../contexts/ThemeContext";
import { TravelStatus } from "../types";
import { copyMapToClipboard, exportMapAsPNG } from "../utils/mapExport";

// File-specific constants
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
  const gRef = useRef<SVGGElement>(null);
  const { theme } = useTheme();

  const projection = geoNaturalEarth1()
    .scale(180)
    .translate([MAP_DIMENSIONS.WIDTH / 2, MAP_DIMENSIONS.HEIGHT / 2 + 20]);

  const pathGenerator = geoPath().projection(projection);

  // Set up zoom behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = select(svgRef.current);
    const g = select(gRef.current);

    const zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> = zoom<
      SVGSVGElement,
      unknown
    >()
      .scaleExtent([0.5, 8]) // Allow zoom from 50% to 800%
      .filter((event) => {
        // Allow zoom and pan, but prevent interference with country clicks
        return !event.ctrlKey && !event.button;
      })
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoomBehavior);

    // Store zoom behavior for reset function
    (svg.node() as any).__zoomBehavior = zoomBehavior;

    // Cleanup function
    return () => {
      svg.on(".zoom", null);
    };
  }, [countries]); // Re-run when countries change

  const handleResetZoom = () => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);
    const zoomBehavior = (svg.node() as any).__zoomBehavior;

    if (zoomBehavior) {
      svg.transition().duration(750).call(zoomBehavior.transform, zoomIdentity);
    }
  };

  const handleExportMap = async () => {
    if (!svgRef.current) {
      toast.error("Map not ready for export. Please try again.");
      return;
    }

    try {
      await exportMapAsPNG(svgRef.current);
      toast.success("Map exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export map. Please try again.");
    }
  };

  const handleCopyToClipboard = async () => {
    if (!svgRef.current) {
      toast.error("Map not ready for copying. Please try again.");
      return;
    }

    try {
      await copyMapToClipboard(svgRef.current);
      toast.success("Map copied to clipboard!");
    } catch (error) {
      console.error("Copy failed:", error);
      if (
        error instanceof Error &&
        error.message.includes("Clipboard not supported")
      ) {
        toast.info("Clipboard not supported. Map downloaded instead!");
      } else {
        toast.error(
          "Failed to copy to clipboard. Try the download option instead."
        );
      }
    }
  };

  const getCountryColor = (countryCode: string): string => {
    const status = getCountryStatus(countryCode);
    if (status) {
      return STATUS_COLORS[status];
    }
    return theme === "dark"
      ? MAPVIEW_COLORS.unvisitedFillDark
      : MAPVIEW_COLORS.unvisitedFill;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-blue-50 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center aspect-[5/3] max-h-[600px]">
        <div className="text-gray-600 dark:text-gray-300">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-blue-50 dark:bg-gray-700 rounded-lg flex items-center justify-center aspect-[5/3] max-h-[600px]">
      {/* Export and Copy Buttons */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        <Button
          onClick={handleResetZoom}
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-md flex items-center gap-2 cursor-pointer"
          title="Reset zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          onClick={handleCopyToClipboard}
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Copy className="w-4 h-4" />
          Copy
        </Button>
        <Button
          onClick={handleExportMap}
          variant="outline"
          size="sm"
          className="bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Zoom Instructions */}
      <div className="absolute top-2 left-2 z-10 bg-white/90 dark:bg-gray-800/90 rounded-md px-2 py-1 text-xs text-gray-600 dark:text-gray-300">
        Scroll to zoom • Drag to pan
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${MAP_DIMENSIONS.WIDTH} ${MAP_DIMENSIONS.HEIGHT}`}
        width="100%"
        height="100%"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid meet"
        style={{ touchAction: "none" }} // Prevent default touch behaviors
      >
        <g ref={gRef}>
          {countries.map((country, index) => {
            const countryCode = country.id ? String(country.id) : String(index);
            const countryName = country.properties.name;
            const pathData = pathGenerator(country);
            if (!pathData) return null;
            const isHovered = hoveredCountry === countryCode;
            const isSelected = selectedCountry === countryCode;
            let fillColor =
              getCountryColor(countryCode) ||
              (theme === "dark"
                ? MAPVIEW_COLORS.unvisitedFillDark
                : MAPVIEW_COLORS.unvisitedFill);
            if (isHovered && !isSelected) {
              const status = getCountryStatus(countryCode);
              fillColor = status
                ? STATUS_HOVER_COLORS[status]
                : theme === "dark"
                ? MAPVIEW_COLORS.hoverFillDark
                : MAPVIEW_COLORS.hoverFill;
            }
            const strokeColor = isSelected
              ? theme === "dark"
                ? MAPVIEW_COLORS.selectedStrokeDark
                : MAPVIEW_COLORS.selectedStroke
              : isHovered
              ? theme === "dark"
                ? MAPVIEW_COLORS.hoverStrokeDark
                : MAPVIEW_COLORS.hoverStroke
              : theme === "dark"
              ? MAPVIEW_COLORS.borderStrokeDark
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
                onClick={(e) => {
                  e.stopPropagation();
                  onCountryClick(countryCode);
                }}
                onMouseEnter={() =>
                  onCountryHover && onCountryHover(countryCode)
                }
                onMouseLeave={() => onCountryHover && onCountryHover(null)}
              >
                <title>{countryName || countryCode}</title>
              </path>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
