// src/components/propertylist/PropertyListingPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PropertyListing } from "@/types/propertyType";
import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import usePropertyStore, { PropertySortOption } from "@/stores/propertyStore";
import PropertyActiveFilters from "@/components/property_filter/PropertyActiveFilters";
import PropertyFilterPanel from "@/components/property_filter/PropertyFilterPanel";

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
    resetState,
  } = usePropertyStore();

  // Destructure loading and error from propertyListState
  const { loading } = propertyListState;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // Filter properties to only show "active" items
  const activeProperties = filteredProperties.filter(
    (property) => property.status === "active"
  );

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
        return "Sort Properties";
    }
  };

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showSortDropdown && !target.closest("[data-sort-dropdown]")) {
        setShowSortDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSortDropdown]);

  // Pagination
  const renderPagination = () => {
    const totalPages = getTotalPages();

    // Function to determine which page numbers to show
    const getVisiblePageNumbers = () => {
      // On mobile, show max 3 page numbers
      if (isMobile) {
        // Determine which page numbers to show (current, previous, next)
        const pageNumbers = new Set<number>();

        // Always add current page
        pageNumbers.add(currentPage);

        // Add previous page if it exists
        if (currentPage > 1) {
          pageNumbers.add(currentPage - 1);
        }

        // Add next page if it exists
        if (currentPage < totalPages) {
          pageNumbers.add(currentPage + 1);
        }

        // Convert to array and sort
        return Array.from(pageNumbers).sort((a, b) => a - b);
      }

      // On desktop, show max 5 page numbers
      // Show current page in the middle when possible, with 2 pages before and 2 after
      let start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + 4);

      // Adjust start if upper limit
      if (end === totalPages) {
        start = Math.max(1, end - 4);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    const visiblePageNumbers = getVisiblePageNumbers();
    const pageNumbersContainerWidth = isMobile ? "120px" : "200px";

    return (
      <div className="mt-6 flex justify-center">
        <nav className="flex items-center">
          {/* Previous button */}
          <div className="w-20">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              Previous
            </button>
          </div>

          {/* Page numbers container */}
          <div
            className="flex items-center justify-center"
            style={{ width: pageNumbersContainerWidth }}
          >
            {visiblePageNumbers.map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 mx-1 flex items-center justify-center rounded-md text-sm font-medium ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next button */}
          <div className="w-20 text-right">
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, getTotalPages()))
              }
              disabled={currentPage === getTotalPages()}
              className="px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
            >
              Next
            </button>
          </div>
        </nav>
      </div>
    );
  };

  // Render skeleton loading UI
  const PropertySkeleton = ({ count = 5 }) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 h-20 mb-4 animate-pulse flex items-center"
        >
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-1/4 mr-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-1/6 mr-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-1/5 mr-4"></div>
          <div className="ml-auto flex">
            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-20 mr-4"></div>
            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
          </div>
        </div>
      ))}
    </>
  );

  // Custom Horizontal PropertyCard
  const HorizontalPropertyCard = ({
    property,
  }: {
    property: PropertyListing;
  }) => {
    const router = useRouter();

    const handleClick = () => {
      router.push(`/userdashboard/properties/${property.id}`);
    };

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

    return (
      <div
        className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 mb-4 flex items-center cursor-pointer hover:shadow-md transition-all duration-200"
        onClick={handleClick}
      >
        <div className="flex-1 mr-4">
          <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
            {property.title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {property.area} • {property.bedroom}BR/{property.bathroom}BA
          </p>
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

  return (
    <div className="space-y-6">
      {/* Filtering and sorting controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Property Listings
        </h1>
        <div className="flex items-center gap-3">
          {/* Filter button */}
          <button
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none dark:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-700"
            onClick={toggleFilterPanel}
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
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
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "rent-price-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("rent-price-asc");
                    }}
                  >
                    Rent Price (Low to High)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "rent-price-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("rent-price-desc");
                    }}
                  >
                    Rent Price (High to Low)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "sale-price-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("sale-price-asc");
                    }}
                  >
                    Sale Price (Low to High)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "sale-price-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("sale-price-desc");
                    }}
                  >
                    Sale Price (High to Low)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "bedroom-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("bedroom-asc");
                    }}
                  >
                    Bedrooms (Low to High)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "bedroom-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("bedroom-desc");
                    }}
                  >
                    Bedrooms (High to Low)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "built-up-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("built-up-asc");
                    }}
                  >
                    Built-up (Small to Large)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "built-up-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("built-up-desc");
                    }}
                  >
                    Built-up (Large to Small)
                  </button>
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
