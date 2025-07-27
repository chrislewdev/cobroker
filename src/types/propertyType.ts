// src/types/propertyType.ts

export interface PropertyListing {
  id: string;
  title: string;
  type: string; // e.g., "Residential"
  subtype: string; // e.g., "Apartment/Flat"
  area: string;
  bedroom: number;
  bathroom: number;
  furnishing: "fully" | "partially" | "unfurnished";
  carpark: number;
  owner: {
    id: string;
    name: string;
    profilePic: string;
  };
  "built-up": string;
  "rent price": number;
  "sale price": number;
  status: "active" | "inactive";
}

export type PropertyStatus = "active" | "inactive";
export type FurnishingType = "fully" | "partially" | "unfurnished";
