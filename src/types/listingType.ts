// src/types/listingType.ts

export interface Listing {
  id: string;
  title: string;
  description: string;
  owner: {
    id: string;
    name: string;
    profilePic: string;
  };
  topic: string;
  subject: string;
  dateCreated: string;
  deadline: string;
  budget: number;
  status: "to do" | "in progress" | "completed" | "pending review";
}

export type ListingStatus =
  | "to do"
  | "in progress"
  | "completed"
  | "pending review";
