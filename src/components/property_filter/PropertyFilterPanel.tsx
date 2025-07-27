// src/components/property_filter/PropertyFilterPanel.tsx

// filter panel, used in property filter related components

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import usePropertyStore, { PropertyFilters } from "@/stores/propertyStore";

interface PropertyFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resetPage: () => void;
}

const PropertyFilterPanel: React.FC<PropertyFilterPanelProps> = ({
  isOpen,
  onClose,
  resetPage,
}) => {
  const { filters, setFilter, applyFilters } = usePropertyStore();

  // Local state for filters (before applying)
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);

  // Update local filters when store filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle type changes
  const handleTypeChange = (type: string) => {
    let newTypes: string[];

    // Select/deselect type
    if (localFilters.types.includes(type)) {
      newTypes = localFilters.types.filter((t) => t !== type);
    } else {
      newTypes = [...localFilters.types, type];
    }

    setLocalFilters({
      ...localFilters,
      types: newTypes,
    });
  };

  // Handle subtype changes
  const handleSubtypeChange = (subtype: string) => {
    let newSubtypes: string[];

    // Select/deselect subtype
    if (localFilters.subtypes.includes(subtype)) {
      newSubtypes = localFilters.subtypes.filter((s) => s !== subtype);
    } else {
      newSubtypes = [...localFilters.subtypes, subtype];
    }

    setLocalFilters({
      ...localFilters,
      subtypes: newSubtypes,
    });
  };

  // Handle area changes
  const handleAreaChange = (area: string) => {
    let newAreas: string[];

    // Select/deselect area
    if (localFilters.areas.includes(area)) {
      newAreas = localFilters.areas.filter((a) => a !== area);
    } else {
      newAreas = [...localFilters.areas, area];
    }

    setLocalFilters({
      ...localFilters,
      areas: newAreas,
    });
  };

  // Handle furnishing changes
  const handleFurnishingChange = (
    furnishing: "fully" | "partially" | "unfurnished"
  ) => {
    let newFurnishing: ("fully" | "partially" | "unfurnished")[];

    // Select/deselect furnishing
    if (localFilters.furnishing.includes(furnishing)) {
      newFurnishing = localFilters.furnishing.filter((f) => f !== furnishing);
    } else {
      newFurnishing = [...localFilters.furnishing, furnishing];
    }

    setLocalFilters({
      ...localFilters,
      furnishing: newFurnishing,
    });
  };

  // Handle bedroom range changes
  const handleBedroomRangeChange = (range: string) => {
    let min: number | null = null;
    let max: number | null = null;

    switch (range) {
      case "1-2":
        min = 1;
        max = 2;
        break;
      case "3-4":
        min = 3;
        max = 4;
        break;
      case "5+":
        min = 5;
        max = null;
        break;
      default:
        // Clear the bedroom range
        break;
    }

    setLocalFilters({
      ...localFilters,
      bedroomRange: { min, max },
    });
  };

  // Handle rent price range changes
  const handleRentPriceRangeChange = (range: string) => {
    let min: number | null = null;
    let max: number | null = null;

    switch (range) {
      case "under-1500":
        min = 0;
        max = 1500;
        break;
      case "1500-2500":
        min = 1500;
        max = 2500;
        break;
      case "over-2500":
        min = 2500;
        max = null;
        break;
      default:
        // Clear the rent price range
        break;
    }

    setLocalFilters({
      ...localFilters,
      rentPriceRange: { min, max },
    });
  };

  // Handle sale price range changes
  const handleSalePriceRangeChange = (range: string) => {
    let min: number | null = null;
    let max: number | null = null;

    switch (range) {
      case "under-300k":
        min = 0;
        max = 300000;
        break;
      case "300k-500k":
        min = 300000;
        max = 500000;
        break;
      case "over-500k":
        min = 500000;
        max = null;
        break;
      default:
        // Clear the sale price range
        break;
    }

    setLocalFilters({
      ...localFilters,
      salePriceRange: { min, max },
    });
  };

  // Apply filters and close panel
  const handleApplyFilters = () => {
    // Apply local filters to the store
    for (const [key, value] of Object.entries(localFilters)) {
      setFilter(key as keyof PropertyFilters, value);
    }

    // Apply filters
    applyFilters();

    // Reset page to first page
    resetPage();

    // Close the filter panel
    onClose();
  };

  // Reset local filters and close panel
  const handleCancelFilters = () => {
    // Reset local filters to store filters
    setLocalFilters(filters);

    // Close the filter panel
    onClose();
  };

  // Reset all filters
  const handleResetFilters = () => {
    // Reset local filters
    setLocalFilters({
      types: [],
      subtypes: [],
      areas: [],
      furnishing: [],
      bedroomRange: {
        min: null,
        max: null,
      },
      rentPriceRange: {
        min: null,
        max: null,
      },
      salePriceRange: {
        min: null,
        max: null,
      },
    });
  };

  // Define common types from your data
  const types = ["Residential"];

  // Define common subtypes from your data
  const subtypes = ["Apartment/Flat"];

  // Define common areas from your data
  const areas = [
    "Wangsa Maju",
    "Taman Keramat",
    "Kuala Lumpur",
    "Rawang",
    "Klang",
    "Shah Alam",
    "Dutamas",
    "Sungai Buloh",
    "Seri Kembangan",
    "Damansara Perdana",
    "Sentul",
    "Ampang",
    "Jalan Tun Razak",
    "Southville City, Bangi",
    "Cheras",
    "Eco Sanctuary, Kota Kemuning",
    "Taman Wahyu",
    "Pandan Perdana",
  ];

  // Get bedroom range value for radio buttons
  const getBedroomRangeValue = () => {
    const { min, max } = localFilters.bedroomRange;

    if (min === 1 && max === 2) return "1-2";
    if (min === 3 && max === 4) return "3-4";
    if (min === 5 && max === null) return "5+";

    return "";
  };

  // Get rent price range value for radio buttons
  const getRentPriceRangeValue = () => {
    const { min, max } = localFilters.rentPriceRange;

    if (min === 0 && max === 1500) return "under-1500";
    if (min === 1500 && max === 2500) return "1500-2500";
    if (min === 2500 && max === null) return "over-2500";

    return "";
  };

  // Get sale price range value for radio buttons
  const getSalePriceRangeValue = () => {
    const { min, max } = localFilters.salePriceRange;

    if (min === 0 && max === 300000) return "under-300k";
    if (min === 300000 && max === 500000) return "300k-500k";
    if (min === 500000 && max === null) return "over-500k";

    return "";
  };

  // If the panel is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto"
      aria-labelledby="filter-panel"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleCancelFilters}
        ></div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Panel */}
        <div className="relative inline-block align-bottom bg-white dark:bg-zinc-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-6 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Filter Properties
              </h3>
              <button
                onClick={handleCancelFilters}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable content area */}
            <div className="max-h-96 overflow-y-auto pr-2">
              <div className="space-y-6">
                {/* Type Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Type
                  </h4>
                  <div className="space-y-2">
                    {types.map((type) => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localFilters.types.includes(type)}
                          onChange={() => handleTypeChange(type)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Subtype Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Property Subtype
                  </h4>
                  <div className="space-y-2">
                    {subtypes.map((subtype) => (
                      <label key={subtype} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localFilters.subtypes.includes(subtype)}
                          onChange={() => handleSubtypeChange(subtype)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {subtype}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Area Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Area
                  </h4>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto pr-2 border border-gray-200 dark:border-zinc-700 rounded-md p-2">
                    {areas.map((area) => (
                      <label key={area} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={localFilters.areas.includes(area)}
                          onChange={() => handleAreaChange(area)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {area}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Furnishing Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Furnishing
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(["fully", "partially", "unfurnished"] as const).map(
                      (furnishing) => (
                        <button
                          key={furnishing}
                          onClick={() => handleFurnishingChange(furnishing)}
                          className={`px-3 py-1 rounded-full text-sm ${
                            localFilters.furnishing.includes(furnishing)
                              ? getFurnishingButtonColor(furnishing)
                              : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                          }`}
                        >
                          {furnishing.charAt(0).toUpperCase() +
                            furnishing.slice(1)}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Bedroom Range Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bedrooms
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: "1-2", label: "1-2 Bedrooms" },
                      { id: "3-4", label: "3-4 Bedrooms" },
                      { id: "5+", label: "5+ Bedrooms" },
                      { id: "", label: "Any Bedrooms" },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          name="bedroom-range"
                          value={option.id}
                          checked={getBedroomRangeValue() === option.id}
                          onChange={() => handleBedroomRangeChange(option.id)}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rent Price Range Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rent Price Range
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: "under-1500", label: "Under RM1,500" },
                      { id: "1500-2500", label: "RM1,500 - RM2,500" },
                      { id: "over-2500", label: "Over RM2,500" },
                      { id: "", label: "Any Rent Price" },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          name="rent-price-range"
                          value={option.id}
                          checked={getRentPriceRangeValue() === option.id}
                          onChange={() => handleRentPriceRangeChange(option.id)}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sale Price Range Filter */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sale Price Range
                  </h4>
                  <div className="space-y-2">
                    {[
                      { id: "under-300k", label: "Under RM300,000" },
                      { id: "300k-500k", label: "RM300,000 - RM500,000" },
                      { id: "over-500k", label: "Over RM500,000" },
                      { id: "", label: "Any Sale Price" },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center">
                        <input
                          type="radio"
                          name="sale-price-range"
                          value={option.id}
                          checked={getSalePriceRangeValue() === option.id}
                          onChange={() => handleSalePriceRangeChange(option.id)}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500 dark:bg-zinc-800 dark:border-zinc-700"
                        />
                        <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with buttons */}
          <div className="bg-gray-50 dark:bg-zinc-800 px-4 py-3 sm:px-6 flex justify-between items-center">
            <button
              onClick={handleResetFilters}
              className="text-sm font-medium text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
            >
              Reset Filters
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleCancelFilters}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get furnishing button color
function getFurnishingButtonColor(furnishing: string): string {
  switch (furnishing) {
    case "fully":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "partially":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "unfurnished":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300";
  }
}

export default PropertyFilterPanel;
