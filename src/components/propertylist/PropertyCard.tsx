// src/components/propertylist/PropertyCard.tsx

// PropertyCard component used in PropertyMainContent.tsx

import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/utils";
import { PropertyListing } from "@/types/propertyType";

interface PropertyCardProps {
  property: PropertyListing;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const router = useRouter();

  const handleClick = () => {
    // Always navigate to the dashboard property detail page
    router.push(`/userdashboard/properties/${property.id}`);
  };

  // Get furnishing color based on furnishing type
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

  // Get status color based on status
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

  return (
    <div
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 flex flex-col h-64 cursor-pointer hover:shadow-md transition-all duration-200"
      onClick={handleClick}
    >
      <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
        {property.title}
      </h3>

      {/* Property details */}
      <div className="flex-1 space-y-2">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>{property.area}</p>
          <p>
            {property.bedroom} bed • {property.bathroom} bath •{" "}
            {property.carpark} parking
          </p>
          <p>Built-up: {property["built-up"]} sq ft</p>
        </div>

        {/* Furnishing badge */}
        <div
          className={cn(
            "text-xs px-2.5 py-1 rounded-full w-fit",
            getFurnishingColor(property.furnishing)
          )}
        >
          {property.furnishing.charAt(0).toUpperCase() +
            property.furnishing.slice(1)}{" "}
          Furnished
        </div>
      </div>

      {/* Price and status at the bottom */}
      <div className="mt-auto pt-2 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <div className="font-medium text-gray-700 dark:text-gray-300">
              Rent: RM{property["rent price"].toLocaleString()}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              Sale: RM{property["sale price"].toLocaleString()}
            </div>
          </div>
          <div
            className={cn(
              "text-xs px-2.5 py-1 rounded-full",
              getStatusColor(property.status)
            )}
          >
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
