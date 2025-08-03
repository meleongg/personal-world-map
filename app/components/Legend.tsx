"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";
import { TravelStatus } from "../types";

interface LegendProps {
  counts: Record<TravelStatus, number>;
}

export const Legend: React.FC<LegendProps> = ({ counts }) => {
  return (
    <Card className="p-4">
      <CardHeader className="pb-2">
        <h3 className="text-lg font-semibold text-gray-800">Legend</h3>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(STATUS_COLORS).map(([status, color]) => {
          const count = counts[status as TravelStatus] || 0;
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-sm border border-gray-300"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm text-gray-700">
                  {STATUS_LABELS[status as TravelStatus]}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs font-medium">
                {count}
              </Badge>
            </div>
          );
        })}
        <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Countries
          </span>
          <Badge variant="default" className="text-xs font-bold">
            {Object.values(counts).reduce((sum, count) => sum + count, 0)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
