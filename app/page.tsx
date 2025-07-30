"use client";

import { useState } from "react";
import { Legend } from "./components/Legend";
import { MapView } from "./components/MapView";
import { NoteSidebar } from "./components/NoteSidebar";
import { useMapData } from "./hooks/useMapData";

export default function Home() {
  const {
    selectedCountry,
    setSelectedCountry,
    updateCountry,
    cycleStatus,
    removeCountry,
    getCountryData,
    getCountryStatus,
    getTotalCountsByStatus,
    isLoading,
  } = useMapData();

  // Add hoveredCountry state and handler
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const handleCountryHover = (countryCode: string | null) => {
    setHoveredCountry(countryCode);
  };

  const handleCountryClick = (countryCode: string) => {
    if (selectedCountry === countryCode) {
      // If already selected, cycle the status
      cycleStatus(countryCode);
    } else {
      // Select the country and open sidebar
      setSelectedCountry(countryCode);
    }
  };

  const handleCloseSidebar = () => {
    setSelectedCountry(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Personal World Map
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your travels and plan your next adventures
          </p>
        </div>
      </header>

      {/* Main Content and Sidebar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Legend */}
          <div className="lg:col-span-1">
            <Legend counts={getTotalCountsByStatus()} />
            {/* Instructions */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-4 border">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">
                How to Use
              </h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Click a country to select it</li>
                <li>• Click again to cycle through statuses</li>
                <li>• Selected countries open the sidebar</li>
                <li>• Add notes and visit dates</li>
              </ul>
            </div>
          </div>
          {/* Map */}
          <div className="lg:col-span-3 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-md p-4 border w-full max-w-4xl mx-auto overflow-hidden flex items-center justify-center">
              <div className="w-full aspect-w-16 aspect-h-9">
                <div className="w-full h-full">
                  <MapView
                    getCountryStatus={getCountryStatus}
                    onCountryClick={handleCountryClick}
                    selectedCountry={selectedCountry}
                    hoveredCountry={hoveredCountry}
                    onCountryHover={handleCountryHover}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Sidebar */}
        <NoteSidebar
          countryCode={selectedCountry}
          countryData={selectedCountry ? getCountryData(selectedCountry) : null}
          onUpdateCountry={updateCountry}
          onRemoveCountry={removeCountry}
          onClose={handleCloseSidebar}
          isOpen={!!selectedCountry}
        />
      </main>
    </div>
  );
}
