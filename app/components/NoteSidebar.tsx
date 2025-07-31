"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import {
  CountryEntry,
  STATUS_COLORS,
  STATUS_LABELS,
  TravelStatus,
} from "../types";

interface NoteSidebarProps {
  countryCode: string | null;
  countryData: (CountryEntry & { name?: string }) | null;
  onUpdateCountry: (
    countryCode: string,
    updates: Partial<CountryEntry>
  ) => void;
  onRemoveCountry: (countryCode: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const NoteSidebar: React.FC<NoteSidebarProps> = ({
  countryCode,
  countryData,
  onUpdateCountry,
  onRemoveCountry,
  onClose,
  isOpen,
}) => {
  const [notes, setNotes] = useState("");
  const [visitedAt, setVisitedAt] = useState("");
  const [status, setStatus] = useState<TravelStatus>("want_to_visit");

  // Update local state when countryData changes
  useEffect(() => {
    if (countryData) {
      setNotes(countryData.notes || "");
      setVisitedAt(countryData.visitedAt || "");
      setStatus(countryData.status);
    } else {
      setNotes("");
      setVisitedAt("");
      setStatus("want_to_visit");
    }
  }, [countryData]);

  const handleSave = () => {
    if (!countryCode) return;

    const updates: Partial<CountryEntry> = {
      status,
      notes: notes.trim() || undefined,
      visitedAt: visitedAt || undefined,
    };

    onUpdateCountry(countryCode, updates);
  };

  const handleRemove = () => {
    if (!countryCode) return;
    onRemoveCountry(countryCode);
  };

  const handleStatusChange = (newStatus: TravelStatus) => {
    setStatus(newStatus);
    if (countryCode) {
      onUpdateCountry(countryCode, { status: newStatus });
    }
  };

  if (!isOpen || !countryCode) {
    return null;
  }

  const countryName = countryData?.name || countryCode.toUpperCase();

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold text-gray-900 truncate"
            title={countryName}
          >
            {countryName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Status Selection */}
        <div className="mb-6">
          <Label className="mb-3">Travel Status</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_LABELS).map(([statusKey, label]) => {
              const statusValue = statusKey as TravelStatus;
              const isSelected = status === statusValue;
              return (
                <Button
                  key={statusKey}
                  variant={isSelected ? "secondary" : "outline"}
                  className={`w-full flex flex-row items-center gap-3 min-h-[56px] px-5 text-base font-semibold border-2 bg-white ${
                    isSelected
                      ? "border-2 shadow-md"
                      : "text-gray-800 hover:border-blue-300"
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: STATUS_COLORS[statusValue],
                          color: STATUS_COLORS[statusValue],
                        }
                      : {
                          borderColor: "#d1d5db", // gray-300
                        }
                  }
                  onClick={() => handleStatusChange(statusValue)}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: STATUS_COLORS[statusValue] }}
                  />
                  <span className="whitespace-normal break-words text-gray-900 text-center">
                    {label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Visit Date */}
        {status === "visited" && (
          <div className="mb-6">
            <Label className="mb-2">Visit Date (Optional)</Label>
            <Input
              type="date"
              value={visitedAt}
              onChange={(e) => {
                setVisitedAt(e.target.value);
                if (countryCode) {
                  onUpdateCountry(countryCode, {
                    visitedAt: e.target.value || undefined,
                  });
                }
              }}
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <Label className="mb-2">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add your thoughts, memories, or plans..."
            className="h-32"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSave}
            className="w-full flex items-center justify-center"
            variant="default"
          >
            Save Changes
          </Button>

          {countryData && (
            <Button
              onClick={handleRemove}
              className="w-full flex items-center justify-center"
              variant="destructive"
            >
              Remove from Map
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
