// src/services/listingService.ts

// used in listingStore

import { Listing } from "@/stores/listingStore";
import { apiSimulation } from "@/services/apiSimulation";

// Service layer that interfaces with the API (simulation for now)
export const listingService = {
  // Fetch all listings
  async fetchListings(): Promise<Listing[]> {
    return apiSimulation.listings.getAll();
  },

  // Fetch listing by ID
  async fetchListingById(listingId: string): Promise<Listing> {
    return apiSimulation.listings.getById(listingId);
  },

  // Create a new listing
  async createListing(listingData: Omit<Listing, "id">): Promise<Listing> {
    return apiSimulation.listings.create(listingData);
  },

  // Update a listing
  async updateListing(
    listingId: string,
    listingData: Partial<Listing>
  ): Promise<Listing> {
    return apiSimulation.listings.update(listingId, listingData);
  },

  // Delete a listing
  async deleteListing(listingId: string): Promise<void> {
    return apiSimulation.listings.delete(listingId);
  },

  // Reset the database (useful for testing)
  async resetData(): Promise<void> {
    return apiSimulation.listings.reset();
  },
};
