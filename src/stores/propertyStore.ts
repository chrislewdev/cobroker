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

// Filter options (areas removed)
export interface PropertyFilters {
  types: string[];
  subtypes: string[];
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
  areas: string[];
  titles: string[];
  activeFilterCount: number;
  activeFilterCountExcludingAreas: number;

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

  // Area actions
  setAreas: (areas: string[]) => void;
  clearAreas: () => void;
  applyAreasFilter: () => void;

  // Title actions
  setTitles: (titles: string[]) => void;
  clearTitles: () => void;
  applyTitlesFilter: () => void;

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
    areas: (options?: ResetOptions) => void;
    all: (options?: ResetOptions) => void;
  };
}

// Default filters (without areas)
const defaultFilters: PropertyFilters = {
  types: [],
  subtypes: [],
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

// Default areas
const defaultAreas: string[] = [];

// Default titles
const defaultTitles: string[] = [];

// Sort properties based on the selected option
function sortProperties(
  properties: PropertyListing[],
  sortBy: PropertySortOption
): PropertyListing[] {
  const sortedProperties = [...properties];

  switch (sortBy) {
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
      return sortedProperties.sort((a, b) => {
        const aBuiltUp = parseInt(a["built-up"].replace(/,/g, ""));
        const bBuiltUp = parseInt(b["built-up"].replace(/,/g, ""));
        return aBuiltUp - bBuiltUp;
      });
    case "built-up-desc":
      return sortedProperties.sort((a, b) => {
        const aBuiltUp = parseInt(a["built-up"].replace(/,/g, ""));
        const bBuiltUp = parseInt(b["built-up"].replace(/,/g, ""));
        return bBuiltUp - aBuiltUp;
      });
    default:
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

// Apply all filters to the properties (including areas)
function applyFiltersToProperties(
  properties: PropertyListing[],
  filters: PropertyFilters,
  areas: string[],
  titles: string[]
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
    const matchesArea = areas.length === 0 || areas.includes(property.area);

    // Check if property matches title filter
    const matchesTitle = titles.length === 0 || titles.includes(property.title);

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
      matchesTitle &&
      matchesFurnishing &&
      matchesBedroom &&
      matchesRentPrice &&
      matchesSalePrice
    );
  });
}

// Calculate the number of active filters (excluding areas)
function calculateActiveFilterCount(filters: PropertyFilters): number {
  let count = 0;

  if (filters.types.length > 0) count++;
  if (filters.subtypes.length > 0) count++;
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

// Calculate total active filters including areas
function calculateTotalActiveFilterCount(
  filters: PropertyFilters,
  areas: string[],
  titles: string[]
): number {
  let count = calculateActiveFilterCount(filters);

  if (areas.length > 0) count++;
  if (titles.length > 0) count++;

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
    sortBy: "rent-price-asc" as PropertySortOption,
    filters: defaultFilters,
    areas: defaultAreas,
    titles: defaultTitles,
    activeFilterCount: 0,
    activeFilterCountExcludingAreas: 0,

    // Computed properties getters
    get totalActiveFilterCount() {
      return calculateTotalActiveFilterCount(
        get().filters,
        get().areas,
        get().titles
      );
    },

    get nonAreaFilterCount() {
      return calculateActiveFilterCount(get().filters);
    },

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
          get().filters,
          get().areas,
          get().titles
        );

        const activeFilterCount = calculateTotalActiveFilterCount(
          get().filters,
          get().areas,
          get().titles
        );
        const activeFilterCountExcludingAreas = calculateActiveFilterCount(
          get().filters
        );

        set({
          propertyListState: successState(properties),
          properties: sortedProperties,
          filteredProperties,
          activeFilterCount,
          activeFilterCountExcludingAreas,
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

        // Add the new property to the existing properties
        const properties = [...get().properties, newProperty];
        const sortedProperties = sortProperties(properties, get().sortBy);
        const filteredProperties = applyFiltersToProperties(
          sortedProperties,
          get().filters,
          get().areas,
          get().titles
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

    updateProperty: async (
      propertyId: string,
      propertyData: Partial<PropertyListing>
    ) => {
      try {
        set({
          propertyMutationState: loadingState(get().propertyMutationState),
        });

        const updatedProperty = await propertyService.updateProperty(
          propertyId,
          propertyData
        );

        // Update the property in the existing properties
        const properties = get().properties.map((property) =>
          property.id === propertyId ? updatedProperty : property
        );
        const sortedProperties = sortProperties(properties, get().sortBy);
        const filteredProperties = applyFiltersToProperties(
          sortedProperties,
          get().filters,
          get().areas,
          get().titles
        );

        // Update current property if it's the one being updated
        const currentProperty =
          get().currentProperty?.id === propertyId
            ? updatedProperty
            : get().currentProperty;

        set({
          propertyMutationState: successState(updatedProperty),
          properties: sortedProperties,
          filteredProperties,
          currentProperty,
        });

        return updatedProperty;
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

    deleteProperty: async (propertyId: string) => {
      try {
        set({
          propertyMutationState: loadingState(get().propertyMutationState),
        });

        await propertyService.deleteProperty(propertyId);

        // Remove the property from the existing properties
        const properties = get().properties.filter(
          (property) => property.id !== propertyId
        );
        const sortedProperties = sortProperties(properties, get().sortBy);
        const filteredProperties = applyFiltersToProperties(
          sortedProperties,
          get().filters,
          get().areas,
          get().titles
        );

        // Clear current property if it's the one being deleted
        const currentProperty =
          get().currentProperty?.id === propertyId
            ? null
            : get().currentProperty;

        set({
          propertyMutationState: successState(undefined),
          properties: sortedProperties,
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

    // Filter actions
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
      const filteredProperties = applyFiltersToProperties(
        get().properties,
        defaultFilters,
        get().areas,
        get().titles // Add this parameter
      );

      const activeFilterCount = calculateTotalActiveFilterCount(
        defaultFilters,
        get().areas,
        get().titles // Add this parameter
      );
      const activeFilterCountExcludingAreas =
        calculateActiveFilterCount(defaultFilters);

      set({
        filters: defaultFilters,
        filteredProperties,
        activeFilterCount,
        activeFilterCountExcludingAreas,
      });
    },

    // Clear a specific filter
    clearFilter: <K extends keyof PropertyFilters>(filterType: K) => {
      const newFilters = {
        ...get().filters,
        [filterType]: defaultFilters[filterType],
      };

      const filteredProperties = applyFiltersToProperties(
        get().properties,
        newFilters,
        get().areas,
        get().titles // Add this parameter
      );

      const activeFilterCount = calculateTotalActiveFilterCount(
        newFilters,
        get().areas,
        get().titles // Add this parameter
      );
      const activeFilterCountExcludingAreas =
        calculateActiveFilterCount(newFilters);

      set({
        filters: newFilters,
        filteredProperties,
        activeFilterCount,
        activeFilterCountExcludingAreas,
      });
    },

    applyFilters: () => {
      const filteredProperties = applyFiltersToProperties(
        get().properties,
        get().filters,
        get().areas,
        get().titles
      );

      set({
        filteredProperties,
      });
    },

    // Area actions
    setAreas: (areas: string[]) => {
      set({ areas });
    },

    clearAreas: () => {
      const filteredProperties = applyFiltersToProperties(
        get().properties,
        get().filters,
        defaultAreas,
        get().titles // Add this parameter
      );

      const activeFilterCount = calculateTotalActiveFilterCount(
        get().filters,
        defaultAreas,
        get().titles // Add this parameter
      );
      const activeFilterCountExcludingAreas = calculateActiveFilterCount(
        get().filters
      );

      set({
        areas: defaultAreas,
        filteredProperties,
        activeFilterCount,
        activeFilterCountExcludingAreas,
      });
    },

    applyAreasFilter: () => {
      const filteredProperties = applyFiltersToProperties(
        get().properties,
        get().filters,
        get().areas,
        get().titles // Add this parameter
      );

      const activeFilterCount = calculateTotalActiveFilterCount(
        get().filters,
        get().areas,
        get().titles // Add this parameter
      );
      const activeFilterCountExcludingAreas = calculateActiveFilterCount(
        get().filters
      );

      set({
        filteredProperties,
        activeFilterCount,
        activeFilterCountExcludingAreas,
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
        get().filters,
        get().areas,
        get().titles
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
      areas: defaultAreas,
      titles: defaultTitles,
      activeFilterCount: 0,
      activeFilterCountExcludingAreas: 0,
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
    areas: resetFunctions.areas,
    titles: resetFunctions.titles,
    all: resetFunctions.all,
  };

  return store;
});

export default usePropertyStore;
