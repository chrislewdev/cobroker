// src/app/userdashboard/propertymanagement/client.tsx

"use client";

import React, { useEffect } from "react";
import usePropertyStore, { PropertySortOption } from "@/stores/propertyStore";
import { useSearchParams } from "next/navigation";
import { useResetOnUnmount } from "@/hooks/useStateReset";
import PropertyListingPage from "@/components/propertylist/PropertyListingPage";

export default function PropertyManagementClient() {
  const { setSortOption, resetState } = usePropertyStore();
  const searchParams = useSearchParams();

  // Reset property list state on component unmount
  useResetOnUnmount(resetState.propertyList);

  // Apply sort option from URL if available
  useEffect(() => {
    // Reset list state before applying new sorting
    resetState.propertyList({ preserve: true });

    const sortParam = searchParams.get("sort");
    if (sortParam) {
      setSortOption(sortParam as PropertySortOption);
    }
  }, [searchParams, setSortOption, resetState]);

  return <PropertyListingPage />;
}
