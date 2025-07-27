// src/services/propertyApiSimulation.ts

// mock API for property related components

import initialPropertyData from "@/lib/ListingData.json";
import { PropertyListing } from "@/stores/propertyStore";

// Simulate creating and fetching property without backend and db
// Use a persistent in-memory database that survives page reloads and navigation by storing it in the global window object (only in browser environment)
const getDatabase = (): { properties: PropertyListing[]; nextId: number } => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return {
      properties: getInitialData(),
      nextId: calculateNextId(getInitialData()),
    };
  }

  // Initialize global storage if it doesn't exist
  if (!(window as any).__PROPERTY_API_SIMULATION) {
    (window as any).__PROPERTY_API_SIMULATION = {
      properties: getInitialData(),
      nextId: calculateNextId(getInitialData()),
    };
  }

  return (window as any).__PROPERTY_API_SIMULATION;
};

// Create a function to get a deep clone of the data to avoid references
const getInitialData = (): PropertyListing[] =>
  JSON.parse(JSON.stringify(initialPropertyData));

// Calculate next ID based on the highest existing ID
const calculateNextId = (properties: PropertyListing[]): number => {
  const highestId = properties.reduce(
    (max, property) => Math.max(max, parseInt(property.id, 10) || 0),
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
export const propertyApiSimulation = {
  // Properties API
  properties: {
    // Get all properties
    async getAll(): Promise<PropertyListing[]> {
      await simulateNetworkDelay();
      const db = getDatabase();
      return [...db.properties]; // Return a copy to prevent direct modification
    },

    // Get property by ID
    async getById(id: string): Promise<PropertyListing> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const property = db.properties.find((property) => property.id === id);

      if (!property) {
        throw new Error(`Property with ID ${id} not found`);
      }

      return { ...property }; // Return a copy to prevent direct modification
    },

    // Create a new property
    async create(
      propertyData: Omit<PropertyListing, "id">
    ): Promise<PropertyListing> {
      await simulateNetworkDelay(500);
      const db = getDatabase();

      // Simulate basic validation
      if (!propertyData.title?.trim()) {
        throw new Error("Property title is required");
      }

      if (!propertyData.area) {
        throw new Error("Property area is required");
      }

      // Create new property with generated ID
      const newProperty: PropertyListing = {
        id: String(db.nextId++),
        ...propertyData,
      };

      // Add to database
      db.properties.push(newProperty);

      return { ...newProperty }; // Return a copy to prevent direct modification
    },

    // Update an existing property
    async update(
      id: string,
      updates: Partial<PropertyListing>
    ): Promise<PropertyListing> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const propertyIndex = db.properties.findIndex(
        (property) => property.id === id
      );

      if (propertyIndex === -1) {
        throw new Error(`Property with ID ${id} not found`);
      }

      // Update the property
      const updatedProperty: PropertyListing = {
        ...db.properties[propertyIndex],
        ...updates,
      };

      // Replace in database
      db.properties[propertyIndex] = updatedProperty;

      return { ...updatedProperty }; // Return a copy to prevent direct modification
    },

    // Delete a property
    async delete(id: string): Promise<void> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const propertyIndex = db.properties.findIndex(
        (property) => property.id === id
      );

      if (propertyIndex === -1) {
        throw new Error(`Property with ID ${id} not found`);
      }

      // Remove from database
      db.properties.splice(propertyIndex, 1);
    },

    // Reset the database to initial state (useful for testing)
    async reset(): Promise<void> {
      if (typeof window !== "undefined") {
        (window as any).__PROPERTY_API_SIMULATION = {
          properties: getInitialData(),
          nextId: calculateNextId(getInitialData()),
        };
      }
    },
  },
};
