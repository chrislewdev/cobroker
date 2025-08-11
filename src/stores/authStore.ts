// src/stores/authStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import {
  AsyncState,
  initialAsyncState,
  loadingState,
  successState,
  errorState,
} from "@/utils/asyncState";
import {
  createStoreResetFunctions,
  ResetOptions,
} from "@/utils/stateResetUtils";

// Define user stats type
export interface UserStats {
  tasksFulfilled: number;
  successScore: number;
  taskRating: number;
  responseRate: number;
  lastLogin: string;
  memberSince: string;
  profileCompleteness: number;
}

// Define user type
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  title?: string;
  bio?: string;
  location?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
  profilePic?: string;
  stats?: UserStats;
}

// Define auth store state
interface AuthState {
  // Authentication state
  isAuthenticated: boolean;
  user: User | null;

  // Async states
  authState: AsyncState<User>;

  // Authentication actions
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;

  // State management
  resetState: {
    auth: (options?: ResetOptions) => void;
    isAuthenticated: (options?: ResetOptions) => void;
    user: (options?: ResetOptions) => void;
    all: (options?: ResetOptions) => void;
  };
}

// Create auth store with persistence
const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => {
      // Initialize the store
      const store = {
        // Authentication state
        isAuthenticated: false,
        user: null,

        // Async states
        authState: initialAsyncState as AsyncState<User>,

        // Authentication actions
        login: async (email: string, password: string) => {
          try {
            set({ authState: loadingState(get().authState) });

            const user = await authService.login(email, password);

            set({
              authState: successState(user),
              isAuthenticated: true,
              user,
            });

            return user;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            set({ authState: errorState(errorMessage, get().authState) });
            return null;
          }
        },

        logout: () => {
          // Clear authentication state explicitly to avoid circular calls
          set({
            isAuthenticated: false,
            user: null,
            authState: initialAsyncState as AsyncState<User>,
          });
        },

        // State management
        resetState: {} as AuthState["resetState"],
      };

      // Generate reset functions using factory
      const storeApi = { setState: set, getState: get };

      // UPDATE: Include both async states and regular properties
      const resetFunctions = createStoreResetFunctions<AuthState>(storeApi, {
        asyncStates: {
          authState: initialAsyncState as AsyncState<User>,
        },
        properties: {
          isAuthenticated: false,
          user: null,
        },
      });

      // UPDATE: Map all reset functions including individual properties
      store.resetState = {
        auth: resetFunctions.authState,
        isAuthenticated: resetFunctions.isAuthenticated,
        user: resetFunctions.user,
        all: resetFunctions.all,
      };

      return store;
    },
    {
      name: "auth-storage", // name of the item in localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);

export default useAuthStore;
