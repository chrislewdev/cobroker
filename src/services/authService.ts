// src/services/authService.ts

import userData from "@/lib/userData.json";
import { User } from "@/stores/authStore";

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

  // Helper function to find user by email
  findUserByEmail(email: string) {
    return userData.find((user) => user.email === email);
  },
};
