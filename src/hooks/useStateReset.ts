// src/hooks/useStateReset.ts

import { useEffect } from "react";
import { ResetOptions } from "@/utils/stateResetUtils";

interface ResetFunction {
  (options?: ResetOptions): void;
}

interface ResetConfig {
  onUnmount?: boolean;
  onSuccess?: boolean;
  preserveData?: boolean;
  resetFn: ResetFunction;
  condition?: boolean;
  key?: string; // Optional key for selective reset
}

/**
 * A hook to manage resetting state based on various conditions
 *
 * @param configs - An array of reset configurations
 */
export function useStateReset(configs: ResetConfig[]) {
  useEffect(() => {
    // Execute immediate resets if condition is true
    configs.forEach((config) => {
      if (config.condition) {
        config.resetFn({ preserve: config.preserveData });
      }
    });

    // Return cleanup function for unmount resets
    return () => {
      configs.forEach((config) => {
        if (config.onUnmount) {
          config.resetFn({ preserve: config.preserveData });
        }
      });
    };
  }, [configs]);

  // Return function to manually trigger resets
  return {
    reset: (key?: string) => {
      if (key) {
        // Reset specific config by key
        const config = configs.find((c) => (c as any).key === key);
        if (config) {
          config.resetFn({ preserve: config.preserveData });
        }
      } else {
        // Reset all configs
        configs.forEach((config) => {
          config.resetFn({ preserve: config.preserveData });
        });
      }
    },
  };
}

/**
 * A hook to automatically reset state on component unmount
 *
 * @param resetFn - The reset function to call
 * @param preserveData - Whether to preserve data when resetting
 */
export function useResetOnUnmount(
  resetFn: ResetFunction,
  preserveData = false
) {
  useEffect(() => {
    return () => {
      resetFn({ preserve: preserveData });
    };
  }, [resetFn, preserveData]);
}
