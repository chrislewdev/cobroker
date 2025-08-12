// src/components/property_filter/PropertyTitleFilter.tsx

import React, { useState, useEffect } from "react";
import { XMarkIcon, DocumentTextIcon } from "@heroicons/react/24/outline";
import usePropertyStore from "@/stores/propertyStore";

interface PropertyTitleFilterProps {
  resetPage: () => void;
}

const PropertyTitleFilter: React.FC<PropertyTitleFilterProps> = ({
  resetPage,
}) => {
  const { titles, setTitles, applyTitlesFilter, properties } =
    usePropertyStore();
  const [isOpen, setIsOpen] = useState(false);
  const [localTitles, setLocalTitles] = useState<string[]>(titles);

  // Update local titles when store titles change
  useEffect(() => {
    setLocalTitles(titles);
  }, [titles]);

  // Extract unique titles from properties
  const availableTitles = React.useMemo(() => {
    const uniqueTitles = Array.from(
      new Set(properties.map((property) => property.title))
    )
      .filter((title) => title && title.trim() !== "")
      .sort();
    return uniqueTitles;
  }, [properties]);

  // Handle title changes
  const handleTitleChange = (title: string) => {
    let newTitles: string[];

    // Select/deselect title
    if (localTitles.includes(title)) {
      newTitles = localTitles.filter((t) => t !== title);
    } else {
      newTitles = [...localTitles, title];
    }

    setLocalTitles(newTitles);
  };

  // Apply title filters
  const handleApplyFilters = () => {
    setTitles(localTitles);
    applyTitlesFilter();
    resetPage();
    setIsOpen(false);
  };

  // Cancel changes
  const handleCancel = () => {
    setLocalTitles(titles);
    setIsOpen(false);
  };

  // Reset title filters
  const handleResetTitles = () => {
    setLocalTitles([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-title-dropdown]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" data-title-dropdown>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        <DocumentTextIcon className="h-4 w-4" />
        <span>Title</span>
        {titles.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-indigo-600 rounded-full">
            {titles.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 z-20 mt-2 w-80 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-800 dark:ring-zinc-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Filter by Title
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Title selection */}
            <div className="mb-4">
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 border border-gray-200 dark:border-zinc-700 rounded-md p-3">
                {availableTitles.map((title) => (
                  <label key={title} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={localTitles.includes(title)}
                      onChange={() => handleTitleChange(title)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:bg-zinc-800 dark:border-zinc-700"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate">
                      {title}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-between gap-3">
              <button
                onClick={handleResetTitles}
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

export default PropertyTitleFilter;
