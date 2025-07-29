// src/services/profileService.ts

// used in profileStore

import userData from "@/lib/userData.json";
import { User, UserStats } from "@/stores/authStore";

// Simulates database operations
export const profileService = {
  // Fetch user profile by ID
  async fetchUserProfile(userId: string): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find the user with matching ID
    const user = userData.find((user) => user.id === userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Return user without password
    const { ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  // Update user profile
  async updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, update user in database. For now just return the updated user data

    // Find the user
    const user = this.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Merge the existing user data with updates
    const updatedUser = {
      ...user,
      ...profileData,
    };

    // Return user without password
    const { ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  },

  // Helper function to find user by ID
  findUserById(id: string) {
    return userData.find((user) => user.id === id);
  },

  // Get user stats
  async getUserStats(userId: string): Promise<UserStats> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find the user
    const user = this.findUserById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // Return existing stats or default stats
    return (
      user.stats || {
        tasksFulfilled: 0,
        successScore: 0,
        taskRating: 0,
        responseRate: 0,
        lastLogin: new Date().toISOString(),
        memberSince: new Date().toISOString(),
        profileCompleteness: 0,
      }
    );
  },
};
