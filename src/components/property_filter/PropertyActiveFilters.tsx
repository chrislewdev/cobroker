// src/components/property_filter/PropertyActiveFilters.tsx

// show active filter, used in property filter related components

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import usePropertyStore, { PropertyFilters } from "@/stores/propertyStore";

interface PropertyActiveFiltersProps {
  resetPage: () => void;
}

const PropertyActiveFilters: React.FC<PropertyActiveFiltersProps> = ({
  resetPage,
}) => {
  const { filters, clearFilter, clearFilters, activeFilterCount } =
    usePropertyStore();

  // If no active filters, don't render
  if (activeFilterCount === 0) return null;

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
              clearFilter("types");
              usePropertyStore.getState().setFilter("types", newTypes);
              usePropertyStore.getState().applyFilters();
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
              clearFilter("subtypes");
              usePropertyStore.getState().setFilter("subtypes", newSubtypes);
              usePropertyStore.getState().applyFilters();
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
      {filters.areas.map((area) => (
        <div
          key={`area-${area}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
        >
          <span>Area: {area}</span>
          <button
            onClick={() => {
              const newAreas = filters.areas.filter((a) => a !== area);
              clearFilter("areas");
              usePropertyStore.getState().setFilter("areas", newAreas);
              usePropertyStore.getState().applyFilters();
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
              clearFilter("furnishing");
              usePropertyStore
                .getState()
                .setFilter("furnishing", newFurnishing);
              usePropertyStore.getState().applyFilters();
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
              clearFilter("bedroomRange");
              usePropertyStore.getState().applyFilters();
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
              clearFilter("rentPriceRange");
              usePropertyStore.getState().applyFilters();
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
              clearFilter("salePriceRange");
              usePropertyStore.getState().applyFilters();
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
          resetPage();
        }}
        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        Clear All Filters
      </button>
    </div>
  );
};

// Helper function to get furnishing chip color
function getFurnishingChipColor(furnishing: string): string {
  switch (furnishing) {
    case "fully":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "partially":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "unfurnished":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

// Helper function to format bedroom range
function formatBedroomRange(
  bedroomRange: PropertyFilters["bedroomRange"]
): string {
  const { min, max } = bedroomRange;

  if (min === 1 && max === 2) return "1-2";
  if (min === 3 && max === 4) return "3-4";
  if (min === 5 && max === null) return "5+";

  if (min !== null && max !== null) return `${min}-${max}`;
  if (min !== null) return `${min}+`;
  if (max !== null) return `Up to ${max}`;

  return "Any";
}

// Helper function to format price range
function formatPriceRange(
  priceRange:
    | PropertyFilters["rentPriceRange"]
    | PropertyFilters["salePriceRange"]
): string {
  const { min, max } = priceRange;

  // Rent price ranges
  if (min === 0 && max === 1500) return "Under RM1,500";
  if (min === 1500 && max === 2500) return "RM1,500 - RM2,500";
  if (min === 2500 && max === null) return "Over RM2,500";

  // Sale price ranges
  if (min === 0 && max === 300000) return "Under RM300K";
  if (min === 300000 && max === 500000) return "RM300K - RM500K";
  if (min === 500000 && max === null) return "Over RM500K";

  if (min !== null && max !== null)
    return `RM${min.toLocaleString()} - RM${max.toLocaleString()}`;
  if (min !== null) return `Min RM${min.toLocaleString()}`;
  if (max !== null) return `Max RM${max.toLocaleString()}`;

  return "Any";
}

export default PropertyActiveFilters;
