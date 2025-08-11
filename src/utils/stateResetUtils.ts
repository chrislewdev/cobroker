// src/utils/stateResetUtils.ts

import { resetState } from "@/utils/asyncState";
import { StoreApi } from "zustand";

// Type for reset options
export interface ResetOptions {
  preserve?: boolean; // Whether to preserve current data
}

// Type for the path to a state property
export type StatePath<T> = string[] | ((state: T) => unknown);

// Create a type-safe reset function for a specific state slice
interface StateWithData {
  data?: unknown;
}

export function createResetFunction<T>(
  getter: (state: T) => StateWithData | unknown,
  setter: StoreApi<T>["setState"],
  initialValue: StateWithData | unknown,
  stateKey?: string
) {
  return (options: ResetOptions = {}) => {
    setter((state) => {
      const currentState = getter(state) as StateWithData;
      const data =
        options.preserve && currentState?.data ? currentState.data : null;
      const key = stateKey || getLastKey(() => getter(state as T));

      if (!key) return state;

      return {
        ...state,
        [key]: { ...resetState(), data },
      };
    });
  };
}

// Create reset function for non-async properties
export function createPropertyResetFunction<T, K extends keyof T>(
  setter: StoreApi<T>["setState"],
  propertyKey: K,
  initialValue: T[K]
) {
  return (options: ResetOptions = {}) => {
    setter((state) => ({
      ...state,
      [propertyKey]: initialValue,
    }));
  };
}

// Reset multiple state properties at once
export function createBatchResetFunction(setters: {
  [key: string]: (options?: ResetOptions) => void;
}) {
  return (options: ResetOptions = {}) => {
    Object.values(setters).forEach((resetFn) => resetFn(options));
  };
}

// Helper function to get the last key from a function path
function getLastKey(getter: () => unknown): string | null {
  try {
    const fnString = getter.toString();
    const statePropertyRegex = /state\.(\w+)/;
    const match = fnString.match(statePropertyRegex);

    if (match && match[1]) {
      return match[1];
    }

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
  stateMap: {
    asyncStates?: Record<string, unknown>;
    properties?: Record<string, unknown>;
  }
) {
  const resetFunctions: Record<string, (options?: ResetOptions) => void> = {};

  // Handle async states
  if (stateMap.asyncStates) {
    for (const key in stateMap.asyncStates) {
      resetFunctions[key] = createResetFunction(
        (state: T) => (state as Record<string, unknown>)[key],
        store.setState,
        stateMap.asyncStates[key],
        key
      );
    }
  }

  // Handle regular properties
  if (stateMap.properties) {
    for (const key in stateMap.properties) {
      resetFunctions[key] = createPropertyResetFunction(
        store.setState,
        key as keyof T,
        stateMap.properties[key] as T[keyof T]
      );
    }
  }

  // Add a batch reset function for all states
  resetFunctions.all = createBatchResetFunction(resetFunctions);

  return resetFunctions;
}
