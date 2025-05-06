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
  resetPasswordState: AsyncState<void>;
  forgotPasswordState: AsyncState<void>;

  // Authentication actions
  login: (email: string, password: string) => Promise<User | null>;
  register: (userData: Partial<User>, password: string) => Promise<User | null>;
  logout: () => void;
  resetPassword: (
    oldPassword: string,
    newPassword: string
  ) => Promise<void | null>;
  forgotPassword: (email: string) => Promise<void | null>;

  // State management
  resetState: {
    auth: (options?: ResetOptions) => void;
    resetPassword: (options?: ResetOptions) => void;
    forgotPassword: (options?: ResetOptions) => void;
    all: (options?: ResetOptions) => void;
  };
}

// AsyncState mapping for reset functions
const asyncStateMap = {
  authState: initialAsyncState,
  resetPasswordState: initialAsyncState,
  forgotPasswordState: initialAsyncState,
};

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
        authState: initialAsyncState,
        resetPasswordState: initialAsyncState,
        forgotPasswordState: initialAsyncState,

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

        register: async (userData: Partial<User>, password: string) => {
          try {
            set({ authState: loadingState(get().authState) });

            const user = await authService.register(userData, password);

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
          set({
            isAuthenticated: false,
            user: null,
            authState: initialAsyncState,
            resetPasswordState: initialAsyncState,
            forgotPasswordState: initialAsyncState,
          });
        },

        resetPassword: async (oldPassword: string, newPassword: string) => {
          const currentUser = get().user;
          if (!currentUser) {
            const errorMsg = "Not authenticated";
            set({
              resetPasswordState: errorState(
                errorMsg,
                get().resetPasswordState
              ),
            });
            return null;
          }

          try {
            set({ resetPasswordState: loadingState(get().resetPasswordState) });

            await authService.resetPassword(
              currentUser.email,
              oldPassword,
              newPassword
            );

            set({ resetPasswordState: successState(undefined) });

            return undefined;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            set({
              resetPasswordState: errorState(
                errorMessage,
                get().resetPasswordState
              ),
            });
            return null;
          }
        },

        forgotPassword: async (email: string) => {
          try {
            set({
              forgotPasswordState: loadingState(get().forgotPasswordState),
            });

            await authService.forgotPassword(email);

            set({ forgotPasswordState: successState(undefined) });

            return undefined;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            set({
              forgotPasswordState: errorState(
                errorMessage,
                get().forgotPasswordState
              ),
            });
            return null;
          }
        },

        // State management
        resetState: {} as any,
      };

      // Generate reset functions using factory but with only the needed parts of StoreApi
      const storeApi = { setState: set, getState: get };
      const resetFunctions = createStoreResetFunctions<AuthState>(
        storeApi,
        asyncStateMap
      );

      // Map the reset functions to our structure
      store.resetState = {
        auth: resetFunctions.authState,
        resetPassword: resetFunctions.resetPasswordState,
        forgotPassword: resetFunctions.forgotPasswordState,
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
