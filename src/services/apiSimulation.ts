// services/apiSimulation.ts

// mock API for listing related components

import initialListingData from "@/lib/userListingData.json";
import { Listing } from "@/stores/listingStore";

// Simulate creating and fetching listing without backend and db
// Use a persistent in-memory database that survives page reloads and navigation by storing it in the global window object (only in browser environment)
const getDatabase = (): { listings: Listing[]; nextId: number } => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return {
      listings: getInitialData(),
      nextId: calculateNextId(getInitialData()),
    };
  }

  // Initialize global storage if it doesn't exist
  if (!(window as any).__API_SIMULATION) {
    (window as any).__API_SIMULATION = {
      listings: getInitialData(),
      nextId: calculateNextId(getInitialData()),
    };
  }

  return (window as any).__API_SIMULATION;
};

// Create a function to get a deep clone of the data to avoid references
const getInitialData = (): Listing[] =>
  JSON.parse(JSON.stringify(initialListingData));

// Calculate next ID based on the highest existing ID
const calculateNextId = (listings: Listing[]): number => {
  const highestId = listings.reduce(
    (max, listing) => Math.max(max, parseInt(listing.id, 10) || 0),
    0
  );
  return highestId + 1;
};

// Utility to simulate network delay with random variation
const simulateNetworkDelay = async (baseMs = 300): Promise<void> => {
  const variation = Math.random() * 200;
  const delay = baseMs + variation;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// API simulation methods
export const apiSimulation = {
  // Listings API
  listings: {
    // Get all listings
    async getAll(): Promise<Listing[]> {
      await simulateNetworkDelay();
      const db = getDatabase();
      return [...db.listings]; // Return a copy to prevent direct modification
    },

    // Get listing by ID
    async getById(id: string): Promise<Listing> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const listing = db.listings.find((listing) => listing.id === id);

      if (!listing) {
        throw new Error(`Listing with ID ${id} not found`);
      }

      return { ...listing }; // Return a copy to prevent direct modification
    },

    // Create a new listing
    async create(listingData: Omit<Listing, "id">): Promise<Listing> {
      await simulateNetworkDelay(500);
      const db = getDatabase();

      // Simulate basic validation
      if (!listingData.title?.trim()) {
        throw new Error("Listing title is required");
      }

      if (!listingData.deadline) {
        throw new Error("Listing deadline is required");
      }

      // Create new listing with generated ID
      const newListing: Listing = {
        id: String(db.nextId++),
        ...listingData,
      };

      // Add to database
      db.listings.push(newListing);

      return { ...newListing }; // Return a copy to prevent direct modification
    },

    // Update an existing listing
    async update(id: string, updates: Partial<Listing>): Promise<Listing> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const listingIndex = db.listings.findIndex(
        (listing) => listing.id === id
      );

      if (listingIndex === -1) {
        throw new Error(`Listing with ID ${id} not found`);
      }

      // Update the listing
      const updatedListing: Listing = {
        ...db.listings[listingIndex],
        ...updates,
      };

      // Replace in database
      db.listings[listingIndex] = updatedListing;

      return { ...updatedListing }; // Return a copy to prevent direct modification
    },

    // Delete a listing
    async delete(id: string): Promise<void> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const listingIndex = db.listings.findIndex(
        (listing) => listing.id === id
      );

      if (listingIndex === -1) {
        throw new Error(`Listing with ID ${id} not found`);
      }

      // Remove from database
      db.listings.splice(listingIndex, 1);
    },

    // Reset the database to initial state (useful for testing)
    async reset(): Promise<void> {
      if (typeof window !== "undefined") {
        (window as any).__API_SIMULATION = {
          listings: getInitialData(),
          nextId: calculateNextId(getInitialData()),
        };
      }
    },
  },
};
