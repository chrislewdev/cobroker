// src/app/userdashboard/userlisting/client.tsx

"use client";

import React, { useEffect } from "react";
import useListingStore from "@/stores/listingStore";
import { useSearchParams } from "next/navigation";
import { useResetOnUnmount } from "@/hooks/useStateReset";

export default function ListingsPageClient() {
  const { setSortOption, resetState } = useListingStore();
  const searchParams = useSearchParams();

  // Reset listing list state on component unmount
  useResetOnUnmount(resetState.listingList);

  // Apply sort option from URL if available
  useEffect(() => {
    // Reset list state before applying new sorting
    resetState.listingList({ preserve: true });

    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSortOption(sortParam as any);
    }
  }, [searchParams, setSortOption, resetState]);

  return;
}
