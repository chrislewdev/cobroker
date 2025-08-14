// src/components/property_filter/PropertyStatusFilter.tsx

import React, { useState, useEffect } from "react";
import { XMarkIcon, CheckBadgeIcon } from "@heroicons/react/24/outline";
import usePropertyStore from "@/stores/propertyStore";

interface PropertyStatusFilterProps {
  resetPage: () => void;
}

const PropertyStatusFilter: React.FC<PropertyStatusFilterProps> = ({
  resetPage,
}) => {
  const { status, setStatus, applyStatusFilter } = usePropertyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localStatus, setLocalStatus] =
    useState<("active" | "inactive")[]>(status);

  // Update local status when store status changes
  useEffect(() => {
    setLocalStatus(status);
  }, [status]);

  // Available status options
  const availableStatuses: ("active" | "inactive")[] = ["active", "inactive"];

  // Handle status changes
  const handleStatusChange = (statusItem: "active" | "inactive") => {
    let newStatus: ("active" | "inactive")[];

    // Select/deselect status
    if (localStatus.includes(statusItem)) {
      newStatus = localStatus.filter((s) => s !== statusItem);
    } else {
      newStatus = [...localStatus, statusItem];
    }

    setLocalStatus(newStatus);
  };

  // Apply status filters
  const handleApplyFilters = () => {
    setStatus(localStatus);
    applyStatusFilter();
    resetPage();
    setIsOpen(false);
  };

  // Cancel changes
  const handleCancel = () => {
    setLocalStatus(status);
    setIsOpen(false);
  };

  // Reset status filters to default (active only)
  const handleResetStatus = () => {
    setLocalStatus(["active"]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-status-filter]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative" data-status-filter>
      {/* Filter button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border transition-colors duration-200 ${
          status.length > 0 && status.length !== 1
            ? "bg-indigo-100 text-indigo-700 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
        }`}
      >
        <CheckBadgeIcon className="h-4 w-4 mr-2" />
        Status
        {status.length > 0 && status.length !== 1 && (
          <span className="ml-1 px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full dark:bg-indigo-500">
            {status.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-md shadow-lg z-50">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Filter by Status
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Status options */}
            <div className="space-y-2">
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-zinc-700 rounded-md p-3">
                {availableStatuses.map((statusItem) => (
                  <label key={statusItem} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localStatus.includes(statusItem)}
                      onChange={() => handleStatusChange(statusItem)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {statusItem}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between gap-3">
              <button
                onClick={handleResetStatus}
                className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
              >
                Reset
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleCancel}
                  className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyFilters}
                  className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyStatusFilter;
