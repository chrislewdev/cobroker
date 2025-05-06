// src/app/userdashboard/userlisting/client.tsx

"use client";

import React, { useEffect } from "react";
import useTaskStore from "@/stores/listingStore";
import { useSearchParams } from "next/navigation";
import { useResetOnUnmount } from "@/hooks/useStateReset";

export default function TasksPageClient() {
  const { setSortOption, resetState } = useTaskStore();
  const searchParams = useSearchParams();

  // Reset task list state on component unmount
  useResetOnUnmount(resetState.taskList);

  // Apply sort option from URL if available
  useEffect(() => {
    // Reset list state before applying new sorting
    resetState.taskList({ preserve: true });

    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSortOption(sortParam as any);
    }
  }, [searchParams, setSortOption, resetState]);

  return;
}
