// stores/listingStore.ts

import { create } from "zustand";
import { listingService } from "@/services/listingService";
import {
  AsyncState,
  initialAsyncState,
  loadingState,
  successState,
  errorState,
} from "@/utils/asyncState";
import {
  createStoreResetFunctions,
  createResetFunction,
  ResetOptions,
} from "@/utils/stateResetUtils";

// Owner type
export interface ListingOwner {
  id: string;
  name: string;
  profilePic: string;
}

// Listing type
export interface Listing {
  id: string;
  title: string;
  description: string;
  owner: ListingOwner;
  topic: string;
  subject: string;
  dateCreated: string;
  deadline: string;
  budget: number;
  status: "to do" | "in progress" | "completed" | "pending review";
}

// Sort options for listings
export type ListingSortOption =
  | "deadline-asc"
  | "deadline-desc"
  | "budget-asc"
  | "budget-desc"
  | "date-created-asc"
  | "date-created-desc";

// Filter options
export interface ListingFilters {
  priority: ("high" | "medium" | "low")[];
  topics: string[];
  subjects: string[];
  budgetRange: {
    min: number | null;
    max: number | null;
  };
}

// Define listing store state
interface ListingState {
  // Listing data
  listings: Listing[];
  filteredListings: Listing[];
  currentListing: Listing | null;

  // UI state
  sortBy: ListingSortOption;
  filters: ListingFilters;
  activeFilterCount: number;

  // Async states
  listingListState: AsyncState<Listing[]>;
  listingDetailState: AsyncState<Listing>;
  listingMutationState: AsyncState<Listing | void>;

  // Listing actions
  fetchListings: () => Promise<Listing[] | null>;
  fetchListingById: (listingId: string) => Promise<Listing | null>;
  createListing: (listingData: Omit<Listing, "id">) => Promise<Listing | null>;
  updateListing: (
    listingId: string,
    listingData: Partial<Listing>
  ) => Promise<Listing | null>;
  deleteListing: (listingId: string) => Promise<void | null>;

  // Filter actions
  setFilter: <K extends keyof ListingFilters>(
    filterType: K,
    value: ListingFilters[K]
  ) => void;
  clearFilters: () => void;
  clearFilter: <K extends keyof ListingFilters>(filterType: K) => void;
  applyFilters: () => void;

  // Sort actions
  setSortOption: (option: ListingSortOption) => void;

  // State management
  resetState: {
    listingList: (options?: ResetOptions) => void;
    listingDetail: (options?: ResetOptions) => void;
    listingMutation: (options?: ResetOptions) => void;
    all: (options?: ResetOptions) => void;
  };
}

// Default empty filters
const defaultFilters: ListingFilters = {
  priority: [],
  topics: [],
  subjects: [],
  budgetRange: {
    min: null,
    max: null,
  },
};

// AsyncState mapping for reset functions
const asyncStateMap = {
  listingListState: initialAsyncState,
  listingDetailState: initialAsyncState,
  listingMutationState: initialAsyncState,
};

// Helper function to sort listings based on sort option
function sortListings(
  listings: Listing[],
  sortOption: ListingSortOption
): Listing[] {
  const sortedListings = [...listings]; // Create a copy to avoid mutating the original

  switch (sortOption) {
    case "deadline-asc":
      return sortedListings.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );

    case "deadline-desc":
      return sortedListings.sort(
        (a, b) =>
          new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      );

    case "budget-asc":
      return sortedListings.sort((a, b) => a.budget - b.budget);

    case "budget-desc":
      return sortedListings.sort((a, b) => b.budget - a.budget);

    case "date-created-asc":
      return sortedListings.sort(
        (a, b) =>
          new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
      );

    case "date-created-desc":
      return sortedListings.sort(
        (a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );

    default:
      // Default to deadline ascending (earliest first)
      return sortedListings.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
  }
}

// Calculate priority based on deadline
function calculateListingPriority(deadline: string): "high" | "medium" | "low" {
  const deadlineDate = new Date(deadline);
  const currentDate = new Date();

  // Calculate the difference in days
  const diffInTime = deadlineDate.getTime() - currentDate.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

  // Determine priority based on difference
  if (diffInDays <= 7) {
    return "high";
  } else if (diffInDays <= 14) {
    return "medium";
  } else {
    return "low";
  }
}

// Check if a listing matches the budget range filter
function matchesBudgetRange(
  listing: Listing,
  budgetRange: ListingFilters["budgetRange"]
): boolean {
  const { min, max } = budgetRange;

  if (min !== null && listing.budget < min) {
    return false;
  }

  if (max !== null && listing.budget > max) {
    return false;
  }

  return true;
}

// Apply all filters to the listings
function applyFiltersToListings(
  listings: Listing[],
  filters: ListingFilters
): Listing[] {
  return listings.filter((listing) => {
    // Calculate listing priority
    const listingPriority = calculateListingPriority(listing.deadline);

    // Check if listing matches priority filter
    const matchesPriority =
      filters.priority.length === 0 ||
      filters.priority.includes(listingPriority);

    // Check if listing matches topic filter
    const matchesTopic =
      filters.topics.length === 0 || filters.topics.includes(listing.topic);

    // Check if listing matches subject filter
    const matchesSubject =
      filters.subjects.length === 0 ||
      filters.subjects.includes(listing.subject);

    // Check if listing matches budget range filter
    const matchesBudget = matchesBudgetRange(listing, filters.budgetRange);

    // Listing must match all active filters
    return matchesPriority && matchesTopic && matchesSubject && matchesBudget;
  });
}

// Calculate the number of active filters
function calculateActiveFilterCount(filters: ListingFilters): number {
  let count = 0;

  if (filters.priority.length > 0) count++;
  if (filters.topics.length > 0) count++;
  if (filters.subjects.length > 0) count++;

  if (filters.budgetRange.min !== null || filters.budgetRange.max !== null) {
    count++;
  }

  return count;
}

// Create listing store
const useListingStore = create<ListingState>()((set, get) => {
  // Initialize the store
  const store = {
    // Listing data
    listings: [],
    filteredListings: [],
    currentListing: null,

    // UI state
    sortBy: "deadline-asc" as ListingSortOption, // Default sort by deadline ascending (earliest first)
    filters: defaultFilters,
    activeFilterCount: 0,

    // Async states
    listingListState: initialAsyncState,
    listingDetailState: initialAsyncState,
    listingMutationState: initialAsyncState,

    // Listing actions
    fetchListings: async () => {
      try {
        set({ listingListState: loadingState(get().listingListState) });

        const listings = await listingService.fetchListings();

        // Sort the listings based on current sort option
        const sortedListings = sortListings(listings, get().sortBy);

        // Apply existing filters if any
        const filteredListings = applyFiltersToListings(
          sortedListings,
          get().filters
        );

        set({
          listingListState: successState(listings),
          listings: sortedListings,
          filteredListings,
        });

        return listings;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          listingListState: errorState(errorMessage, get().listingListState),
        });
        return null;
      }
    },

    fetchListingById: async (listingId: string) => {
      try {
        set({ listingDetailState: loadingState(get().listingDetailState) });

        const listing = await listingService.fetchListingById(listingId);

        set({
          listingDetailState: successState(listing),
          currentListing: listing,
        });

        return listing;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          listingDetailState: errorState(
            errorMessage,
            get().listingDetailState
          ),
        });
        return null;
      }
    },

    createListing: async (listingData: Omit<Listing, "id">) => {
      try {
        set({ listingMutationState: loadingState(get().listingMutationState) });

        const newListing = await listingService.createListing(listingData);

        // Get the current listings and sort option
        const listings = [...get().listings, newListing];
        const sortBy = get().sortBy;

        // Sort listings with the new listing included
        const sortedListings = sortListings(listings, sortBy);

        // Apply existing filters to the new set of listings
        const filteredListings = applyFiltersToListings(
          sortedListings,
          get().filters
        );

        set({
          listingMutationState: successState(newListing),
          listings: sortedListings,
          filteredListings,
        });

        return newListing;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          listingMutationState: errorState(
            errorMessage,
            get().listingMutationState
          ),
        });
        return null;
      }
    },

    updateListing: async (listingId: string, listingData: Partial<Listing>) => {
      try {
        set({ listingMutationState: loadingState(get().listingMutationState) });

        const updatedListing = await listingService.updateListing(
          listingId,
          listingData
        );

        // Update listings list with the updated listing
        const listings = get().listings.map((listing) =>
          listing.id === listingId ? updatedListing : listing
        );

        // Sort listings with the updated listing
        const sortedListings = sortListings(listings, get().sortBy);

        // Apply existing filters to the new set of listings
        const filteredListings = applyFiltersToListings(
          sortedListings,
          get().filters
        );

        // Update current listing if it's the one being updated
        const currentListing =
          get().currentListing?.id === listingId
            ? updatedListing
            : get().currentListing;

        set({
          listingMutationState: successState(updatedListing),
          listings: sortedListings,
          filteredListings,
          currentListing,
        });

        return updatedListing;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          listingMutationState: errorState(
            errorMessage,
            get().listingMutationState
          ),
        });
        return null;
      }
    },

    deleteListing: async (listingId: string) => {
      try {
        set({ listingMutationState: loadingState(get().listingMutationState) });

        await listingService.deleteListing(listingId);

        // Remove the listing from the listings list
        const listings = get().listings.filter(
          (listing) => listing.id !== listingId
        );

        // Apply existing filters to the new set of listings
        const filteredListings = applyFiltersToListings(
          listings,
          get().filters
        );

        // Clear current listing if it's the one being deleted
        const currentListing =
          get().currentListing?.id === listingId ? null : get().currentListing;

        set({
          listingMutationState: successState(undefined),
          listings,
          filteredListings,
          currentListing,
        });

        return undefined;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          listingMutationState: errorState(
            errorMessage,
            get().listingMutationState
          ),
        });
        return null;
      }
    },

    // Set a specific filter
    setFilter: <K extends keyof ListingFilters>(
      filterType: K,
      value: ListingFilters[K]
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
        filteredListings: get().listings,
        activeFilterCount: 0,
      });
    },

    // Clear a specific filter
    clearFilter: <K extends keyof ListingFilters>(filterType: K) => {
      const newFilters = {
        ...get().filters,
        [filterType]: defaultFilters[filterType],
      };

      // Apply the updated filters
      const filteredListings = applyFiltersToListings(
        get().listings,
        newFilters
      );

      // Calculate active filter count
      const activeFilterCount = calculateActiveFilterCount(newFilters);

      set({
        filters: newFilters,
        filteredListings,
        activeFilterCount,
      });
    },

    // Apply all current filters to the listings
    applyFilters: () => {
      const filteredListings = applyFiltersToListings(
        get().listings,
        get().filters
      );
      const activeFilterCount = calculateActiveFilterCount(get().filters);

      set({
        filteredListings,
        activeFilterCount,
      });
    },

    setSortOption: (option: ListingSortOption) => {
      // Get current listings
      const listings = [...get().listings];

      // Sort listings based on new option
      const sortedListings = sortListings(listings, option);

      // Apply existing filters to the sorted listings
      const filteredListings = applyFiltersToListings(
        sortedListings,
        get().filters
      );

      // Update state with new sort option and sorted listings
      set({
        sortBy: option,
        listings: sortedListings,
        filteredListings,
      });
    },

    // State management
    resetState: {} as any,
  };

  // Generate reset functions using factory but with only the needed parts of StoreApi
  const storeApi = { setState: set, getState: get };
  const resetFunctions = createStoreResetFunctions<ListingState>(storeApi, {
    listingListState: initialAsyncState,
    listingDetailState: initialAsyncState,
    listingMutationState: initialAsyncState,
  });

  // Map the generated reset functions to our preferred naming
  store.resetState = {
    listingList: resetFunctions.listingListState,
    listingDetail: resetFunctions.listingDetailState,
    listingMutation: resetFunctions.listingMutationState,
    all: resetFunctions.all,
  };

  return store;
});

export default useListingStore;
