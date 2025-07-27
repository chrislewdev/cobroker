// src/services/authService.ts

// used in authStore

import userData from "@/lib/userData.json";
import { User } from "@/stores/authStore";
import crypto from "crypto";

// Simulates database operations
export const authService = {
  // Authenticate a user
  async login(email: string, password: string): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find the user with matching email and password
    const user = userData.find(
      (user) => user.email === email && user.password === password
    );

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Return user without password
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  // Register a new user
  async register(userData: Partial<User>, password: string): Promise<User> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if email is already taken
    const existingUser = this.findUserByEmail(userData.email || "");

    if (existingUser) {
      throw new Error("Email already in use");
    }

    // In a real app, save to a database. For now just return the user data as if it was saved
    const newUser: User = {
      id: crypto.randomBytes(16).toString("hex"),
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      email: userData.email || "",
      ...userData,
    };

    // Return user without password
    return newUser;
  },

  // Reset password
  async resetPassword(
    email: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In a real app, validate old password and update with new password in database. For now just check if the user exists
    const user = this.findUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    // Check if old password matches
    if (user.password !== oldPassword) {
      throw new Error("Current password is incorrect");
    }

    // Success (in a real app, save the new password to database)
  },

  // Request password reset
  async forgotPassword(email: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if user exists
    const user = this.findUserByEmail(email);

    if (!user) {
      // In a real app, maybe return error
      return;
    }

    // In a real app, generate reset token and send email
  },

  // Helper function to find user by email
  findUserByEmail(email: string) {
    return userData.find((user) => user.email === email);
  },
};
