// src/stores/propertyStore.ts

import { create } from "zustand";
import { propertyService } from "@/services/propertyService";
import {
  AsyncState,
  initialAsyncState,
  loadingState,
  successState,
  errorState,
} from "@/utils/asyncState";
import {
  createStoreResetFunctions,
  ResetOptions,
} from "@/utils/stateResetUtils";
import { PropertyListing } from "@/types/propertyType";

// Owner type
export interface PropertyOwner {
  id: string;
  name: string;
  profilePic: string;
}

// Sort options for properties
export type PropertySortOption =
  | "rent-price-asc"
  | "rent-price-desc"
  | "sale-price-asc"
  | "sale-price-desc"
  | "bedroom-asc"
  | "bedroom-desc"
  | "built-up-asc"
  | "built-up-desc";

// Filter options
export interface PropertyFilters {
  types: string[];
  subtypes: string[];
  areas: string[];
  furnishing: ("fully" | "partially" | "unfurnished")[];
  bedroomRange: {
    min: number | null;
    max: number | null;
  };
  rentPriceRange: {
    min: number | null;
    max: number | null;
  };
  salePriceRange: {
    min: number | null;
    max: number | null;
  };
}

// Define property store state
interface PropertyState {
  // Property data
  properties: PropertyListing[];
  filteredProperties: PropertyListing[];
  currentProperty: PropertyListing | null;

  // UI state
  sortBy: PropertySortOption;
  filters: PropertyFilters;
  activeFilterCount: number;

  // Async states
  propertyListState: AsyncState<PropertyListing[]>;
  propertyDetailState: AsyncState<PropertyListing>;
  propertyMutationState: AsyncState<PropertyListing | void>;

  // Property actions
  fetchProperties: () => Promise<PropertyListing[] | null>;
  fetchPropertyById: (propertyId: string) => Promise<PropertyListing | null>;
  createProperty: (
    propertyData: Omit<PropertyListing, "id">
  ) => Promise<PropertyListing | null>;
  updateProperty: (
    propertyId: string,
    propertyData: Partial<PropertyListing>
  ) => Promise<PropertyListing | null>;
  deleteProperty: (propertyId: string) => Promise<void | null>;

  // Filter actions
  setFilter: <K extends keyof PropertyFilters>(
    filterType: K,
    value: PropertyFilters[K]
  ) => void;
  clearFilters: () => void;
  clearFilter: <K extends keyof PropertyFilters>(filterType: K) => void;
  applyFilters: () => void;

  // Sort actions
  setSortOption: (option: PropertySortOption) => void;

  // State management
  resetState: {
    propertyList: (options?: ResetOptions) => void;
    propertyDetail: (options?: ResetOptions) => void;
    propertyMutation: (options?: ResetOptions) => void;
    currentProperty: (options?: ResetOptions) => void;
    properties: (options?: ResetOptions) => void;
    filteredProperties: (options?: ResetOptions) => void;
    filters: (options?: ResetOptions) => void;
    all: (options?: ResetOptions) => void;
  };
}

// Default empty filters
const defaultFilters: PropertyFilters = {
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
};

// Helper function to sort properties based on sort option
function sortProperties(
  properties: PropertyListing[],
  sortOption: PropertySortOption
): PropertyListing[] {
  const sortedProperties = [...properties]; // Create a copy to avoid mutating the original

  switch (sortOption) {
    case "rent-price-asc":
      return sortedProperties.sort((a, b) => a["rent price"] - b["rent price"]);

    case "rent-price-desc":
      return sortedProperties.sort((a, b) => b["rent price"] - a["rent price"]);

    case "sale-price-asc":
      return sortedProperties.sort((a, b) => a["sale price"] - b["sale price"]);

    case "sale-price-desc":
      return sortedProperties.sort((a, b) => b["sale price"] - a["sale price"]);

    case "bedroom-asc":
      return sortedProperties.sort((a, b) => a.bedroom - b.bedroom);

    case "bedroom-desc":
      return sortedProperties.sort((a, b) => b.bedroom - a.bedroom);

    case "built-up-asc":
      return sortedProperties.sort(
        (a, b) => parseInt(a["built-up"]) - parseInt(b["built-up"])
      );

    case "built-up-desc":
      return sortedProperties.sort(
        (a, b) => parseInt(b["built-up"]) - parseInt(a["built-up"])
      );

    default:
      // Default to rent price ascending
      return sortedProperties.sort((a, b) => a["rent price"] - b["rent price"]);
  }
}

// Check if a property matches the bedroom range filter
function matchesBedroomRange(
  property: PropertyListing,
  bedroomRange: PropertyFilters["bedroomRange"]
): boolean {
  const { min, max } = bedroomRange;

  if (min !== null && property.bedroom < min) {
    return false;
  }

  if (max !== null && property.bedroom > max) {
    return false;
  }

  return true;
}

// Check if a property matches the rent price range filter
function matchesRentPriceRange(
  property: PropertyListing,
  rentPriceRange: PropertyFilters["rentPriceRange"]
): boolean {
  const { min, max } = rentPriceRange;

  if (min !== null && property["rent price"] < min) {
    return false;
  }

  if (max !== null && property["rent price"] > max) {
    return false;
  }

  return true;
}

// Check if a property matches the sale price range filter
function matchesSalePriceRange(
  property: PropertyListing,
  salePriceRange: PropertyFilters["salePriceRange"]
): boolean {
  const { min, max } = salePriceRange;

  if (min !== null && property["sale price"] < min) {
    return false;
  }

  if (max !== null && property["sale price"] > max) {
    return false;
  }

  return true;
}

// Apply all filters to the properties
function applyFiltersToProperties(
  properties: PropertyListing[],
  filters: PropertyFilters
): PropertyListing[] {
  return properties.filter((property) => {
    // Check if property matches type filter
    const matchesType =
      filters.types.length === 0 || filters.types.includes(property.type);

    // Check if property matches subtype filter
    const matchesSubtype =
      filters.subtypes.length === 0 ||
      filters.subtypes.includes(property.subtype);

    // Check if property matches area filter
    const matchesArea =
      filters.areas.length === 0 || filters.areas.includes(property.area);

    // Check if property matches furnishing filter
    const matchesFurnishing =
      filters.furnishing.length === 0 ||
      filters.furnishing.includes(property.furnishing);

    // Check if property matches bedroom range filter
    const matchesBedroom = matchesBedroomRange(property, filters.bedroomRange);

    // Check if property matches rent price range filter
    const matchesRentPrice = matchesRentPriceRange(
      property,
      filters.rentPriceRange
    );

    // Check if property matches sale price range filter
    const matchesSalePrice = matchesSalePriceRange(
      property,
      filters.salePriceRange
    );

    // Property must match all active filters
    return (
      matchesType &&
      matchesSubtype &&
      matchesArea &&
      matchesFurnishing &&
      matchesBedroom &&
      matchesRentPrice &&
      matchesSalePrice
    );
  });
}

// Calculate the number of active filters
function calculateActiveFilterCount(filters: PropertyFilters): number {
  let count = 0;

  if (filters.types.length > 0) count++;
  if (filters.subtypes.length > 0) count++;
  if (filters.areas.length > 0) count++;
  if (filters.furnishing.length > 0) count++;

  if (filters.bedroomRange.min !== null || filters.bedroomRange.max !== null) {
    count++;
  }

  if (
    filters.rentPriceRange.min !== null ||
    filters.rentPriceRange.max !== null
  ) {
    count++;
  }

  if (
    filters.salePriceRange.min !== null ||
    filters.salePriceRange.max !== null
  ) {
    count++;
  }

  return count;
}

// Create property store
const usePropertyStore = create<PropertyState>()((set, get) => {
  // Initialize the store
  const store = {
    // Property data
    properties: [],
    filteredProperties: [],
    currentProperty: null,

    // UI state
    sortBy: "rent-price-asc" as PropertySortOption, // Default sort by rent price ascending
    filters: defaultFilters,
    activeFilterCount: 0,

    // Async states
    propertyListState: initialAsyncState as AsyncState<PropertyListing[]>,
    propertyDetailState: initialAsyncState as AsyncState<PropertyListing>,
    propertyMutationState:
      initialAsyncState as AsyncState<PropertyListing | void>,

    // Property actions
    fetchProperties: async () => {
      try {
        set({ propertyListState: loadingState(get().propertyListState) });

        const properties = await propertyService.fetchProperties();

        // Sort the properties based on current sort option
        const sortedProperties = sortProperties(properties, get().sortBy);

        // Apply existing filters if any
        const filteredProperties = applyFiltersToProperties(
          sortedProperties,
          get().filters
        );

        set({
          propertyListState: successState(properties),
          properties: sortedProperties,
          filteredProperties,
        });

        return properties;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          propertyListState: errorState(errorMessage, get().propertyListState),
        });
        return null;
      }
    },

    fetchPropertyById: async (propertyId: string) => {
      try {
        // Clear current property immediately to prevent showing stale data
        set({ currentProperty: null });

        set({ propertyDetailState: loadingState(get().propertyDetailState) });

        const property = await propertyService.fetchPropertyById(propertyId);

        set({
          propertyDetailState: successState(property),
          currentProperty: property,
        });

        return property;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          propertyDetailState: errorState(
            errorMessage,
            get().propertyDetailState
          ),
        });
        return null;
      }
    },

    createProperty: async (propertyData: Omit<PropertyListing, "id">) => {
      try {
        set({
          propertyMutationState: loadingState(get().propertyMutationState),
        });

        const newProperty = await propertyService.createProperty(propertyData);

        // Get the current properties and sort option
        const properties = [...get().properties, newProperty];
        const sortBy = get().sortBy;

        // Sort properties with the new property included
        const sortedProperties = sortProperties(properties, sortBy);

        // Apply existing filters to the new set of properties
        const filteredProperties = applyFiltersToProperties(
          sortedProperties,
          get().filters
        );

        set({
          propertyMutationState: successState(newProperty),
          properties: sortedProperties,
          filteredProperties,
        });

        return newProperty;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          propertyMutationState: errorState(
            errorMessage,
            get().propertyMutationState
          ),
        });
        return null;
      }
    },

    // In src/stores/propertyStore.ts - Updated updateProperty function (lines 352-398)

    updateProperty: async (
      propertyId: string,
      propertyData: Partial<PropertyListing>
    ) => {
      try {
        // Set loading state for property detail (not mutation)
        set({
          propertyDetailState: loadingState(get().propertyDetailState),
        });

        const updatedProperty = await propertyService.updateProperty(
          propertyId,
          propertyData
        );

        // Update properties list with the updated property
        const properties = get().properties.map((property) =>
          property.id === propertyId ? updatedProperty : property
        );

        // Sort properties with the updated property
        const sortedProperties = sortProperties(properties, get().sortBy);

        // Apply existing filters to the new set of properties
        const filteredProperties = applyFiltersToProperties(
          sortedProperties,
          get().filters
        );

        // Update current property if it's the one being updated
        const currentProperty =
          get().currentProperty?.id === propertyId
            ? updatedProperty
            : get().currentProperty;

        set({
          propertyDetailState: successState(updatedProperty), // Set success state for detail
          properties: sortedProperties,
          filteredProperties,
          currentProperty,
        });

        return updatedProperty;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          propertyDetailState: errorState(
            errorMessage,
            get().propertyDetailState
          ),
        });
        return null;
      }
    },

    deleteProperty: async (propertyId: string) => {
      try {
        set({
          propertyMutationState: loadingState(get().propertyMutationState),
        });

        await propertyService.deleteProperty(propertyId);

        // Remove the property from the properties list
        const properties = get().properties.filter(
          (property) => property.id !== propertyId
        );

        // Apply existing filters to the new set of properties
        const filteredProperties = applyFiltersToProperties(
          properties,
          get().filters
        );

        // Clear current property if it's the one being deleted
        const currentProperty =
          get().currentProperty?.id === propertyId
            ? null
            : get().currentProperty;

        set({
          propertyMutationState: successState(undefined),
          properties,
          filteredProperties,
          currentProperty,
        });

        return undefined;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          propertyMutationState: errorState(
            errorMessage,
            get().propertyMutationState
          ),
        });
        return null;
      }
    },

    // Set a specific filter
    setFilter: <K extends keyof PropertyFilters>(
      filterType: K,
      value: PropertyFilters[K]
    ) => {
      const newFilters = {
        ...get().filters,
        [filterType]: value,
      };

      set({ filters: newFilters });
    },

    // Clear all filters
    clearFilters: () => {
      set({
        filters: defaultFilters,
        filteredProperties: get().properties,
        activeFilterCount: 0,
      });
    },

    // Clear a specific filter
    clearFilter: <K extends keyof PropertyFilters>(filterType: K) => {
      const newFilters = {
        ...get().filters,
        [filterType]: defaultFilters[filterType],
      };

      // Apply the updated filters
      const filteredProperties = applyFiltersToProperties(
        get().properties,
        newFilters
      );

      // Calculate active filter count
      const activeFilterCount = calculateActiveFilterCount(newFilters);

      set({
        filters: newFilters,
        filteredProperties,
        activeFilterCount,
      });
    },

    // Apply all current filters to the properties
    applyFilters: () => {
      const filteredProperties = applyFiltersToProperties(
        get().properties,
        get().filters
      );
      const activeFilterCount = calculateActiveFilterCount(get().filters);

      set({
        filteredProperties,
        activeFilterCount,
      });
    },

    setSortOption: (option: PropertySortOption) => {
      // Get current properties
      const properties = [...get().properties];

      // Sort properties based on new option
      const sortedProperties = sortProperties(properties, option);

      // Apply existing filters to the sorted properties
      const filteredProperties = applyFiltersToProperties(
        sortedProperties,
        get().filters
      );

      // Update state with new sort option and sorted properties
      set({
        sortBy: option,
        properties: sortedProperties,
        filteredProperties,
      });
    },

    // State management
    resetState: {} as PropertyState["resetState"],
  };

  // Generate reset functions using factory but with only the needed parts of StoreApi
  const storeApi = { setState: set, getState: get };
  const resetFunctions = createStoreResetFunctions<PropertyState>(storeApi, {
    asyncStates: {
      propertyListState: initialAsyncState as AsyncState<PropertyListing[]>,
      propertyDetailState: initialAsyncState as AsyncState<PropertyListing>,
      propertyMutationState:
        initialAsyncState as AsyncState<PropertyListing | void>,
    },
    properties: {
      currentProperty: null,
      properties: [],
      filteredProperties: [],
      filters: defaultFilters,
      activeFilterCount: 0,
      sortBy: "rent-price-asc" as PropertySortOption,
    },
  });

  // Map the reset functions
  store.resetState = {
    propertyList: resetFunctions.propertyListState,
    propertyDetail: resetFunctions.propertyDetailState,
    propertyMutation: resetFunctions.propertyMutationState,
    currentProperty: resetFunctions.currentProperty,
    properties: resetFunctions.properties,
    filteredProperties: resetFunctions.filteredProperties,
    filters: resetFunctions.filters,
    all: resetFunctions.all,
  };

  return store;
});

export default usePropertyStore;
