"use client";

import { STATUS_COLORS, STATUS_LABELS, TravelStatus } from "../types";

interface LegendProps {
  counts: Record<TravelStatus, number>;
}

export const Legend: React.FC<LegendProps> = ({ counts }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Legend</h3>
      <div className="space-y-2">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = counts[status as TravelStatus] || 0;
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">
                  {STATUS_LABELS[status as TravelStatus]}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                {count}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Countries
          </span>
          <span className="text-sm font-bold text-gray-900 bg-blue-100 px-2 py-1 rounded-full">
            {Object.values(counts).reduce((sum, count) => sum + count, 0)}
          </span>
        </div>
      </div>
    </div>
  );
};
