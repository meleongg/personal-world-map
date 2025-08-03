import { CountryEntry, MapData, TravelStatus } from "../types";

const STORAGE_KEY = "userMapData";

export const loadMapData = (): MapData => {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  const statusCycle: TravelStatus[] = [
    "want_to_visit",
    "planning",
    "visited",
    "avoid",
  ];
  const current = data[countryCode]?.status || "want_to_visit";
  const currentIndex = statusCycle.indexOf(current);
  const nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

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

// Export map as PNG image
export const exportMapAsPNG = (
  svgElement: SVGSVGElement,
  filename?: string
): void => {
  if (typeof window === "undefined") return;

  try {
    // Create a canvas element
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    // Set canvas size to match SVG viewBox
    const viewBox = svgElement.viewBox.baseVal;
    canvas.width = viewBox.width || 1000;
    canvas.height = viewBox.height || 600;

    // Convert SVG to data URL
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create an image and draw it to canvas
    const img = new Image();
    img.onload = () => {
      // Set white background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the SVG image
      ctx.drawImage(img, 0, 0);

      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (!blob) throw new Error("Could not create image blob");

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          filename ||
          `my-travel-map-${new Date().toISOString().split("T")[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Cleanup
        URL.revokeObjectURL(url);
        URL.revokeObjectURL(svgUrl);
      }, "image/png");
    };

    img.onerror = () => {
      throw new Error("Could not load SVG image");
    };

    img.src = svgUrl;
  } catch (error) {
    console.error("Error exporting map as PNG:", error);
    throw error;
  }
};
