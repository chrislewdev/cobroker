// src/app/userdashboard/properties/[id]/client-page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import EditPropertyInfo from "@/components/property/EditPropertyInfo";
import EditPropertyDetails from "@/components/property/EditPropertyDetails";
import usePropertyStore, { PropertyListing } from "@/stores/propertyStore";
import { useResetOnUnmount } from "@/hooks/useStateReset";

interface PendingUpdate {
  section: "basicInfo" | "details";
  data: Partial<PropertyListing>;
}

function EditIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

interface PropertyDetailClientProps {
  propertyId: string;
}

export default function PropertyDetailClient({
  propertyId,
}: PropertyDetailClientProps) {
  const {
    currentProperty,
    propertyDetailState,
    fetchPropertyById,
    updateProperty,
    resetState,
  } = usePropertyStore();

  const {
    loading: propertyLoading,
    error: propertyError,
    success: propertySuccess,
  } = propertyDetailState;

  const [editingBasicInfo, setEditingBasicInfo] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);

  // State used during saving process to prevent UI flashes
  const [pendingUpdates, setPendingUpdates] = useState<PendingUpdate | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);

  // Reset property detail state on component unmount
  useResetOnUnmount(resetState.propertyDetail);

  // Fetch property details on component mount or when propertyId changes
  useEffect(() => {
    if (propertyId) {
      // Clear current property immediately to prevent showing previous property data
      usePropertyStore.setState({ currentProperty: null });

      // Reset property detail state before fetching
      resetState.propertyDetail();

      // Fetch the new property
      fetchPropertyById(propertyId);
    }
  }, [propertyId, fetchPropertyById, resetState]);

  // Clear current property when component unmounts or propertyId changes
  useEffect(() => {
    return () => {
      // Clear current property on cleanup
      usePropertyStore.setState({ currentProperty: null });
    };
  }, [propertyId]);

  // Handle success state - apply to both basic info and details
  useEffect(() => {
    console.log("Success state changed:", {
      propertySuccess,
      isSaving,
      editingBasicInfo,
      editingDetails,
    });

    if (propertySuccess && isSaving) {
      console.log("Property update successful, cleaning up states...");

      // Immediately reset all editing states
      setEditingBasicInfo(false);
      setEditingDetails(false);
      setIsSaving(false);
      setPendingUpdates(null);

      console.log("States reset, now resetting store success state...");

      // Reset the success state in the store after state updates
      setTimeout(() => {
        resetState.propertyDetail({ preserve: true });
        console.log("Store success state reset");
      }, 50);
    }
  }, [propertySuccess, isSaving, editingBasicInfo, editingDetails, resetState]);

  // Unified handler for property updates
  const handlePropertyUpdate = async (
    section: "basicInfo" | "details",
    data: Partial<PropertyListing>
  ) => {
    console.log(`Starting property update for ${section}:`, data);

    try {
      // Set saving state to true to track the process of saving
      setIsSaving(true);

      // Store and display pending updates to user (optimistic UI update)
      setPendingUpdates({ section, data });

      console.log("About to call updateProperty...");

      // Perform the update (this should trigger success state in store)
      const result = await updateProperty(propertyId, data);

      console.log("updateProperty completed with result:", result);

      // If update failed, reset the saving state
      if (!result) {
        console.log("Property update failed, resetting saving state");
        setIsSaving(false);
        setPendingUpdates(null);
      }
      // Note: If successful, the success effect above will handle cleanup
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      // Stop saving if error
      setIsSaving(false);
      setPendingUpdates(null);
    }
  };

  // Handle basic info update with the unified handler
  const handleBasicInfoUpdate = async (data: Partial<PropertyListing>) => {
    await handlePropertyUpdate("basicInfo", data);
  };

  // Handle details update with the unified handler
  const handleDetailsUpdate = async (data: Partial<PropertyListing>) => {
    await handlePropertyUpdate("details", data);
  };

  // Handle cancel actions
  const handleBasicInfoCancel = () => {
    console.log("Canceling basic info edit");
    setEditingBasicInfo(false);
    setIsSaving(false);
    setPendingUpdates(null);
    resetState.propertyDetail({ preserve: true });
  };

  const handleDetailsCancel = () => {
    console.log("Canceling details edit");
    setEditingDetails(false);
    setIsSaving(false);
    setPendingUpdates(null);
    resetState.propertyDetail({ preserve: true });
  };

  // If property is loading, show loading state
  if (
    (propertyLoading && !currentProperty && !isSaving) ||
    (propertyLoading && !currentProperty)
  ) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

  // Error loading the property
  if (propertyError && !isSaving) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md max-w-md">
          <p className="font-semibold">Error loading property</p>
          <p>{propertyError}</p>
        </div>
      </div>
    );
  }

  // If no property, show error (not during saving process)
  if (!currentProperty && !isSaving) {
    return (
      <div className="flex justify-center p-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-md max-w-md">
          <p>Property not found. Please try again later.</p>
          <Link
            href="/userdashboard/propertymanagement"
            className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  // Create a merged property object that includes both current and pending updates
  const displayProperty = currentProperty
    ? {
        ...currentProperty,
        // Apply pending basic info updates if available
        ...(pendingUpdates && pendingUpdates.section === "basicInfo"
          ? pendingUpdates.data
          : {}),
        // Apply pending details updates if available
        ...(pendingUpdates && pendingUpdates.section === "details"
          ? pendingUpdates.data
          : {}),
      }
    : null;

  // Safety check
  if (!displayProperty) {
    return <div>Loading property...</div>;
  }

  // Get furnishing color
  const getFurnishingColor = (furnishing: string) => {
    const furnishingColors: Record<string, string> = {
      fully:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      partially:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      unfurnished:
        "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    };

    return (
      furnishingColors[furnishing] ||
      "bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300"
    );
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      inactive: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    };

    return (
      statusColors[status] ||
      "bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300"
    );
  };

  function PropertyHeader() {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between">
          <div className="flex-1 mb-4 md:mb-0">
            <div className="flex items-center mb-2">
              <Link
                href="/userdashboard/propertymanagement"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Properties
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {displayProperty.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {displayProperty.type} • {displayProperty.subtype}
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-medium">
              {displayProperty.area}
            </p>
          </div>

          {/* Status and badges */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`text-sm px-3 py-1 rounded-full ${getStatusColor(
                displayProperty.status
              )}`}
            >
              {displayProperty.status.charAt(0).toUpperCase() +
                displayProperty.status.slice(1)}
            </div>
            <div
              className={`text-sm px-3 py-1 rounded-full ${getFurnishingColor(
                displayProperty.furnishing
              )}`}
            >
              {displayProperty.furnishing.charAt(0).toUpperCase() +
                displayProperty.furnishing.slice(1)}{" "}
              Furnished
            </div>
          </div>
        </div>
      </div>
    );
  }

  function BasicInformation() {
    if (editingBasicInfo) {
      return (
        <EditPropertyInfo
          propertyData={{
            title: displayProperty.title,
            type: displayProperty.type,
            subtype: displayProperty.subtype,
            area: displayProperty.area,
            status: displayProperty.status,
          }}
          onCancel={handleBasicInfoCancel}
          onSubmit={handleBasicInfoUpdate}
          isLoading={propertyLoading || isSaving}
          isError={!!propertyError}
          errorMessage={propertyError || ""}
          isSuccess={propertySuccess}
        />
      );
    }

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Basic Information
          </h2>

          <button
            className="ml-2 px-3 py-1 text-sm rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1"
            onClick={() => {
              console.log("Opening basic info edit form");
              // Reset state before opening edit form
              resetState.propertyDetail();
              setEditingBasicInfo(true);
            }}
            disabled={propertyLoading || isSaving}
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Property Title
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.title}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Property Type
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.type}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Subtype
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.subtype}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Area
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.area}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Status
            </p>
            <div
              className={`inline-block text-sm px-3 py-1 rounded-full ${getStatusColor(
                displayProperty.status
              )}`}
            >
              {displayProperty.status.charAt(0).toUpperCase() +
                displayProperty.status.slice(1)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function PropertyDetails() {
    if (editingDetails) {
      return (
        <EditPropertyDetails
          propertyData={{
            bedroom: displayProperty.bedroom,
            bathroom: displayProperty.bathroom,
            carpark: displayProperty.carpark,
            furnishing: displayProperty.furnishing,
            "built-up": displayProperty["built-up"],
            "rent price": displayProperty["rent price"],
            "sale price": displayProperty["sale price"],
          }}
          onCancel={handleDetailsCancel}
          onSubmit={handleDetailsUpdate}
          isLoading={propertyLoading || isSaving}
          isError={!!propertyError}
          errorMessage={propertyError || ""}
          isSuccess={propertySuccess}
        />
      );
    }

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Property Details
          </h2>

          <button
            className="ml-2 px-3 py-1 text-sm rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1"
            onClick={() => {
              console.log("Opening details edit form");
              // Reset state before opening edit form
              resetState.propertyDetail();
              setEditingDetails(true);
            }}
            disabled={propertyLoading || isSaving}
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Bedrooms
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.bedroom}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Bathrooms
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.bathroom}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Car Parks
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty.carpark}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Furnishing
            </p>
            <div
              className={`inline-block text-sm px-3 py-1 rounded-full ${getFurnishingColor(
                displayProperty.furnishing
              )}`}
            >
              {displayProperty.furnishing.charAt(0).toUpperCase() +
                displayProperty.furnishing.slice(1)}{" "}
              Furnished
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Built-up Size
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {displayProperty["built-up"]} sq ft
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Rent Price
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              RM{displayProperty["rent price"].toLocaleString()}/month
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Sale Price
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              RM{displayProperty["sale price"].toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Wrapper box containing all property components */}
          <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
            <div className="space-y-6">
              <PropertyHeader />
              <BasicInformation />
              <PropertyDetails />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
