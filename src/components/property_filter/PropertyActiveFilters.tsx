// src/components/property_filter/PropertyActiveFilters.tsx

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import usePropertyStore, { PropertyFilters } from "@/stores/propertyStore";

interface PropertyActiveFiltersProps {
  resetPage: () => void;
}

const PropertyActiveFilters: React.FC<PropertyActiveFiltersProps> = ({
  resetPage,
}) => {
  const {
    filters,
    areas,
    clearFilter,
    clearFilters,
    clearAreas,
    activeFilterCount,
    setFilter,
    setAreas,
    applyFilters,
    applyAreasFilter,
  } = usePropertyStore();

  // If no active filters, don't render
  if (activeFilterCount === 0) return null;

  // Helper function to get chip colors for furnishing
  const getFurnishingChipColor = (furnishing: string) => {
    switch (furnishing) {
      case "fully":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "partially":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "unfurnished":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    }
  };

  // Helper function to format bedroom range
  const formatBedroomRange = (
    bedroomRange: PropertyFilters["bedroomRange"]
  ) => {
    const { min, max } = bedroomRange;
    if (min !== null && max !== null) {
      if (max === null) return `${min}+`;
      return `${min}-${max}`;
    }
    if (min !== null) return `${min}+`;
    if (max !== null) return `Up to ${max}`;
    return "";
  };

  // Helper function to format price range
  const formatPriceRange = (
    priceRange:
      | PropertyFilters["rentPriceRange"]
      | PropertyFilters["salePriceRange"]
  ) => {
    const { min, max } = priceRange;
    if (min !== null && max !== null) {
      return `RM${min.toLocaleString()} - RM${max.toLocaleString()}`;
    }
    if (min !== null) return `RM${min.toLocaleString()}+`;
    if (max !== null) return `Up to RM${max.toLocaleString()}`;
    return "";
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      {/* Type filter chips */}
      {filters.types.map((type) => (
        <div
          key={`type-${type}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        >
          <span>Type: {type}</span>
          <button
            onClick={() => {
              const newTypes = filters.types.filter((t) => t !== type);
              setFilter("types", newTypes);
              applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${type} type filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Subtype filter chips */}
      {filters.subtypes.map((subtype) => (
        <div
          key={`subtype-${subtype}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
        >
          <span>Subtype: {subtype}</span>
          <button
            onClick={() => {
              const newSubtypes = filters.subtypes.filter((s) => s !== subtype);
              setFilter("subtypes", newSubtypes);
              applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${subtype} subtype filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Area filter chips */}
      {areas.map((area) => (
        <div
          key={`area-${area}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
        >
          <span>Area: {area}</span>
          <button
            onClick={() => {
              const newAreas = areas.filter((a) => a !== area);
              setAreas(newAreas);
              applyAreasFilter();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${area} area filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Furnishing filter chips */}
      {filters.furnishing.map((furnishing) => (
        <div
          key={`furnishing-${furnishing}`}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getFurnishingChipColor(
            furnishing
          )}`}
        >
          <span>
            Furnishing:{" "}
            {furnishing.charAt(0).toUpperCase() + furnishing.slice(1)}
          </span>
          <button
            onClick={() => {
              const newFurnishing = filters.furnishing.filter(
                (f) => f !== furnishing
              );
              setFilter("furnishing", newFurnishing);
              applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${furnishing} furnishing filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Bedroom range filter chip */}
      {(filters.bedroomRange.min !== null ||
        filters.bedroomRange.max !== null) && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300">
          <span>Bedrooms: {formatBedroomRange(filters.bedroomRange)}</span>
          <button
            onClick={() => {
              setFilter("bedroomRange", { min: null, max: null });
              applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label="Remove bedroom range filter"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Rent price range filter chip */}
      {(filters.rentPriceRange.min !== null ||
        filters.rentPriceRange.max !== null) && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
          <span>Rent: {formatPriceRange(filters.rentPriceRange)}</span>
          <button
            onClick={() => {
              setFilter("rentPriceRange", { min: null, max: null });
              applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label="Remove rent price range filter"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Sale price range filter chip */}
      {(filters.salePriceRange.min !== null ||
        filters.salePriceRange.max !== null) && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <span>Sale: {formatPriceRange(filters.salePriceRange)}</span>
          <button
            onClick={() => {
              setFilter("salePriceRange", { min: null, max: null });
              applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label="Remove sale price range filter"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Clear all filters button */}
      <button
        onClick={() => {
          clearFilters();
          clearAreas();
          resetPage();
        }}
        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        Clear All
        <XMarkIcon className="ml-1 h-4 w-4" />
      </button>
    </div>
  );
};

export default PropertyActiveFilters;
