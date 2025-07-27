// src/services/propertyService.ts

// used in propertyStore

import { PropertyListing } from "@/stores/propertyStore";
import { propertyApiSimulation } from "@/services/propertyApiSimulation";

// Service layer that interfaces with the API (simulation for now)
export const propertyService = {
  // Fetch all properties
  async fetchProperties(): Promise<PropertyListing[]> {
    return propertyApiSimulation.properties.getAll();
  },

  // Fetch property by ID
  async fetchPropertyById(propertyId: string): Promise<PropertyListing> {
    return propertyApiSimulation.properties.getById(propertyId);
  },

  // Create a new property
  async createProperty(
    propertyData: Omit<PropertyListing, "id">
  ): Promise<PropertyListing> {
    return propertyApiSimulation.properties.create(propertyData);
  },

  // Update a property
  async updateProperty(
    propertyId: string,
    propertyData: Partial<PropertyListing>
  ): Promise<PropertyListing> {
    return propertyApiSimulation.properties.update(propertyId, propertyData);
  },

  // Delete a property
  async deleteProperty(propertyId: string): Promise<void> {
    return propertyApiSimulation.properties.delete(propertyId);
  },

  // Reset the database (useful for testing)
  async resetData(): Promise<void> {
    return propertyApiSimulation.properties.reset();
  },
};
