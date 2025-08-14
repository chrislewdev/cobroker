// src/components/propertylist/PropertyListingPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PropertyListing } from "@/types/propertyType";
import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import usePropertyStore, { PropertySortOption } from "@/stores/propertyStore";
import PropertyActiveFilters from "@/components/property_filter/PropertyActiveFilters";
import PropertyFilterPanel from "@/components/property_filter/PropertyFilterPanel";
import PropertyAreaFilter from "@/components/property_filter/PropertyAreaFilter";
import PropertyTitleFilter from "@/components/property_filter/PropertyTitleFilter";
import PropertyStatusFilter from "@/components/property_filter/PropertyStatusFilter";

// Number of items to display per page
const ITEMS_PER_PAGE = 10;

const PropertyListingPage: React.FC = () => {
  const {
    filteredProperties,
    propertyListState,
    fetchProperties,
    sortBy,
    setSortOption,
    activeFilterCount,
    activeFilterCountExcludingAreas,
    resetState,
  } = usePropertyStore();

  // Destructure loading and error from propertyListState
  const { loading } = propertyListState;

  // State for current page (for pagination)
  const [currentPage, setCurrentPage] = useState<number>(1);
  // State for sort dropdown visibility
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // State for filter panel visibility
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  // Last active filter count for tracking changes
  const [lastFilterCount, setLastFilterCount] = useState(activeFilterCount);
  // State to track screen size
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Detect screen size
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Check on initial load
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  // Fetch properties on component mount
  useEffect(() => {
    // Reset property list state before fetching
    resetState.propertyList();
    fetchProperties();
  }, [fetchProperties, resetState]);

  // Reset pagination when filters change
  useEffect(() => {
    // React to changes in the filter count
    if (activeFilterCount !== lastFilterCount) {
      setLastFilterCount(activeFilterCount);
      setCurrentPage(1);
    }
  }, [activeFilterCount, lastFilterCount]);

  const activeProperties = filteredProperties;

  // Set pagination
  const getPaginatedProperties = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return activeProperties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Calculate total pages (ensures at least 1 page even if empty)
  const getTotalPages = () => {
    const total = activeProperties.length;
    return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  };

  // Handle sort selection
  const handleSortChange = (option: PropertySortOption) => {
    setSortOption(option);
    setShowSortDropdown(false);
    // Reset to first page when sorting changes
    resetPage();
  };

  // Reset page function
  const resetPage = () => {
    setCurrentPage(1);
  };

  // Toggle filter panel
  const toggleFilterPanel = () => {
    setShowFilterPanel(!showFilterPanel);
  };

  // Get sort option display text
  const getSortDisplayText = (option: PropertySortOption) => {
    switch (option) {
      case "rent-price-asc":
        return "Rent Price (Low to High)";
      case "rent-price-desc":
        return "Rent Price (High to Low)";
      case "sale-price-asc":
        return "Sale Price (Low to High)";
      case "sale-price-desc":
        return "Sale Price (High to Low)";
      case "bedroom-asc":
        return "Bedrooms (Low to High)";
      case "bedroom-desc":
        return "Bedrooms (High to Low)";
      case "built-up-asc":
        return "Built-up (Small to Large)";
      case "built-up-desc":
        return "Built-up (Large to Small)";
      default:
        return "Sort";
    }
  };

  // Skeleton loader component
  const PropertySkeleton: React.FC<{ count: number }> = ({ count }) => {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-200 dark:bg-zinc-700 rounded-lg h-24 mb-2"
          ></div>
        ))}
      </>
    );
  };

  // Horizontal property card component
  const HorizontalPropertyCard: React.FC<{ property: PropertyListing }> = ({
    property,
  }) => {
    const router = useRouter();

    const handleClick = () => {
      router.push(`/userdashboard/properties/${property.id}`);
    };

    // Get furnishing color
    const getFurnishingColor = (furnishing: string) => {
      switch (furnishing) {
        case "fully":
          return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        case "partially":
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
        case "unfurnished":
          return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
        default:
          return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
      }
    };

    return (
      <div
        className="flex items-center justify-between p-4 bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {property.unit} • {property.area}
          </p>
        </div>

        <div className="shrink-0 w-20 text-sm text-gray-600 dark:text-gray-400 text-center">
          {property.bedroom} bed
        </div>

        <div className="shrink-0 w-20 text-sm text-gray-600 dark:text-gray-400 text-center">
          {property.bathroom} bath
        </div>

        <div className="shrink-0 w-32">
          <div
            className={`text-sm px-2.5 py-1 rounded-full text-center ${getFurnishingColor(
              property.furnishing
            )}`}
          >
            {property.furnishing.charAt(0).toUpperCase() +
              property.furnishing.slice(1)}
          </div>
        </div>

        <div className="shrink-0 w-36 text-sm text-gray-500 dark:text-gray-400 text-center">
          {property["built-up"]} sq ft
        </div>

        <div className="shrink-0 w-32 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
          <div>RM{property["rent price"].toLocaleString()}/mo</div>
          <div className="text-xs text-gray-500">
            RM{property["sale price"].toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  // Pagination component
  const renderPagination = () => {
    const totalPages = getTotalPages();

    if (totalPages <= 1) return null;

    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, "...");
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push("...", totalPages);
      } else {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    return (
      <div className="flex items-center justify-between border-t border-gray-200 dark:border-zinc-700 pt-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-600 dark:hover:bg-zinc-700"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing{" "}
              <span className="font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  currentPage * ITEMS_PER_PAGE,
                  activeProperties.length
                )}
              </span>{" "}
              of <span className="font-medium">{activeProperties.length}</span>{" "}
              results
            </p>
          </div>
          <div>
            <nav
              className="isolate inline-flex -space-x-px rounded-md shadow-sm"
              aria-label="Pagination"
            >
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-zinc-600 dark:hover:bg-zinc-700"
              >
                <span className="sr-only">Previous</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {getVisiblePages().map((page, index) =>
                page === "..." ? (
                  <span
                    key={index}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0 dark:text-gray-300 dark:ring-zinc-600"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(page as number)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:ring-zinc-600 dark:hover:bg-zinc-700 ${
                      currentPage === page
                        ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        : "text-gray-900 dark:text-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed dark:ring-zinc-600 dark:hover:bg-zinc-700"
              >
                <span className="sr-only">Next</span>
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest("[data-sort-dropdown]")) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showSortDropdown]);

  return (
    <div className="space-y-6">
      {/* Filtering and sorting controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Property Listings
        </h1>
        <div className="flex items-center gap-3">
          {/* Status filter button */}
          <PropertyStatusFilter resetPage={resetPage} />

          {/* Title filter button */}
          <PropertyTitleFilter resetPage={resetPage} />

          {/* Area filter button */}
          <PropertyAreaFilter resetPage={resetPage} />

          {/* Filter button */}
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
            onClick={toggleFilterPanel}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCountExcludingAreas > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                {activeFilterCountExcludingAreas}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative" data-sort-dropdown>
            <button
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
              onClick={(e) => {
                e.stopPropagation();
                setShowSortDropdown(!showSortDropdown);
              }}
            >
              <ArrowsUpDownIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {getSortDisplayText(sortBy)}
              </span>
              <span className="sm:hidden">Sort</span>
            </button>

            {showSortDropdown && (
              <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-zinc-800 dark:ring-zinc-700">
                <div className="py-1">
                  {[
                    {
                      value: "rent-price-asc",
                      label: "Rent Price (Low to High)",
                    },
                    {
                      value: "rent-price-desc",
                      label: "Rent Price (High to Low)",
                    },
                    {
                      value: "sale-price-asc",
                      label: "Sale Price (Low to High)",
                    },
                    {
                      value: "sale-price-desc",
                      label: "Sale Price (High to Low)",
                    },
                    { value: "bedroom-asc", label: "Bedrooms (Low to High)" },
                    { value: "bedroom-desc", label: "Bedrooms (High to Low)" },
                    {
                      value: "built-up-asc",
                      label: "Built-up (Small to Large)",
                    },
                    {
                      value: "built-up-desc",
                      label: "Built-up (Large to Small)",
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      className={`block px-4 py-2 text-sm w-full text-left ${
                        sortBy === option.value
                          ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                          : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSortChange(option.value as PropertySortOption);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PropertyActiveFilters resetPage={resetPage} />

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Property count indicator */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
              Available Properties
            </h2>
            <span className="rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              {loading ? "..." : activeProperties.length}
            </span>
          </div>

          {/* Property items */}
          <div className="space-y-2">
            {loading ? (
              <PropertySkeleton count={5} />
            ) : activeProperties.length > 0 ? (
              getPaginatedProperties().map((property) => (
                <HorizontalPropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                No properties match your criteria
              </div>
            )}
          </div>

          {/* Pagination */}
          {activeProperties.length > 0 && renderPagination()}
        </div>
      </div>

      {/* Filter Panel */}
      <PropertyFilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        resetPage={resetPage}
      />
    </div>
  );
};

export default PropertyListingPage;
