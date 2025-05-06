// src/utils/stateResetUtils.ts

// Standardized state reset util

import { resetState } from "@/utils/asyncState";
import { StoreApi } from "zustand";

// Type for reset options
export interface ResetOptions {
  preserve?: boolean; // Whether to preserve current data
}

// Type for the path to a state property
export type StatePath<T> = string[] | ((state: T) => any);

// Create a type-safe reset function for a specific state slice
export function createResetFunction<T>(
  getter: (state: T) => any,
  setter: StoreApi<T>["setState"],
  initialValue: any,
  stateKey?: string
) {
  return (options: ResetOptions = {}) => {
    setter((state) => {
      // Use functional updates to get the current state
      const currentState = getter(state);

      // Preserve data if specified
      const data =
        options.preserve && currentState?.data ? currentState.data : null;

      // Use provided stateKey or try to determine it
      const key = stateKey || getLastKey(getter);

      // If we couldn't determine the key, just return the state unchanged to avoid errors
      if (!key) return state;

      // Return the state update
      return {
        ...state,
        [key]: { ...resetState(), data },
      };
    });
  };
}

// Reset multiple state properties at once
export function createBatchResetFunction<T>(setters: {
  [key: string]: (options?: ResetOptions) => void;
}) {
  return (options: ResetOptions = {}) => {
    // Execute all reset functions with the provided options
    Object.values(setters).forEach((resetFn) => resetFn(options));
  };
}

// Helper function to get the last key from a function path
// This is a best-effort approach and may not work for all cases
function getLastKey<T>(getter: (state: T) => any): string | null {
  try {
    // Convert function to string
    const fnString = getter.toString();

    // Try to find a pattern like "state.propertyName"
    const statePropertyRegex = /state\.(\w+)/;
    const match = fnString.match(statePropertyRegex);

    if (match && match[1]) {
      return match[1];
    }

    // Alternative approach - try to find a return statement with property access
    const returnPropertyRegex = /return\s+\w+\.(\w+)/;
    const returnMatch = fnString.match(returnPropertyRegex);

    if (returnMatch && returnMatch[1]) {
      return returnMatch[1];
    }

    return null;
  } catch (error) {
    console.error("Error parsing getter function:", error);
    return null;
  }
}

// Create a simplified StoreApi interface that only requires setState and getState
interface SimplifiedStoreApi<T> {
  setState: StoreApi<T>["setState"];
  getState: () => T;
}

// Factory function to generate reset functions for a store
export function createStoreResetFunctions<T>(
  store: SimplifiedStoreApi<T>,
  asyncStateMap: Record<string, any>
) {
  const resetFunctions: Record<string, (options?: ResetOptions) => void> = {};

  // Create a reset function for each async state property
  for (const key in asyncStateMap) {
    // Use an explicit key reference instead of relying on function parsing
    resetFunctions[key] = createResetFunction(
      (state: T) => (state as any)[key],
      store.setState,
      asyncStateMap[key],
      key // Pass the key explicitly
    );
  }

  // Add a batch reset function for all states
  resetFunctions.all = createBatchResetFunction(resetFunctions);

  return resetFunctions;
}
