"use client";

import { useEffect, useState } from "react";
import {
  CountryEntry,
  STATUS_COLORS,
  STATUS_LABELS,
  TravelStatus,
} from "../types";

interface NoteSidebarProps {
  countryCode: string | null;
  countryData: CountryEntry | null;
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

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-xl border-l border-gray-200 z-50 overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {countryCode.toUpperCase()}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Travel Status
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STATUS_LABELS).map(([statusKey, label]) => {
              const statusValue = statusKey as TravelStatus;
              const isSelected = status === statusValue;
              return (
                <button
                  key={statusKey}
                  onClick={() => handleStatusChange(statusValue)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: STATUS_COLORS[statusValue] }}
                    />
                    {label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visit Date */}
        {status === "visited" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Visit Date (Optional)
            </label>
            <input
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleSave}
            placeholder="Add your thoughts, memories, or plans..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none h-32"
          />
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSave}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Save Changes
          </button>

          {countryData && (
            <button
              onClick={handleRemove}
              className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 transition-colors font-medium"
            >
              Remove from Map
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
