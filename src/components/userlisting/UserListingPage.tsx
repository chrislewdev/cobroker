// src/components/userlisting/UserListingPage.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Listing } from "@/types/listingType";
import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import useListingStore, { ListingSortOption } from "@/stores/listingStore";
import ActiveFilters from "@/components/listing_filter/ActiveFilters";
import CustomFilterPanel from "@/components/listing_filter/CustomFilterPanel";

// Number of items to display per page
const ITEMS_PER_PAGE = 10;

const UserListingPage: React.FC = () => {
  const {
    listings,
    filteredListings,
    listingListState,
    fetchListings,
    sortBy,
    setSortOption,
    filters,
    activeFilterCount,
    resetState,
  } = useListingStore();

  // Destructure loading and error from listingListState
  const { loading, error } = listingListState;

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

  // Fetch listings on component mount
  useEffect(() => {
    // Reset listing list state before fetching
    resetState.listingList();
    fetchListings();
  }, [fetchListings, resetState]);

  // Reset pagination when filters change
  useEffect(() => {
    // React to changes in the filter count
    if (activeFilterCount !== lastFilterCount) {
      setLastFilterCount(activeFilterCount);
      setCurrentPage(1);
    }
  }, [activeFilterCount, lastFilterCount]);

  // Filter listings to only show "to do" items
  const todoListings = filteredListings.filter(
    (listing) => listing.status === "to do"
  );

  // Set pagination
  const getPaginatedListings = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return todoListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  // Calculate total pages (ensures at least 1 page even if empty)
  const getTotalPages = () => {
    const total = todoListings.length;
    return Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  };

  // Handle sort selection
  const handleSortChange = (option: ListingSortOption) => {
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
  const getSortDisplayText = (option: ListingSortOption) => {
    switch (option) {
      case "deadline-asc":
        return "Deadline (Earliest First)";
      case "deadline-desc":
        return "Deadline (Latest First)";
      case "budget-asc":
        return "Budget (Low to High)";
      case "budget-desc":
        return "Budget (High to Low)";
      case "date-created-asc":
        return "Date Created (Oldest First)";
      case "date-created-desc":
        return "Date Created (Newest First)";
      default:
        return "Sort Listings";
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
      let end = Math.min(totalPages, start + 4);

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
  const ListingSkeleton = ({ count = 5 }) => (
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

  // Custom Horizontal ListingCard
  const HorizontalListingCard = ({ listing }: { listing: Listing }) => {
    const router = useRouter();

    const handleClick = () => {
      router.push(`/userdashboard/listings/${listing.id}`);
    };

    // Format the deadline date
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;

        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return `${
          months[date.getMonth()]
        } ${date.getDate()}, ${date.getFullYear()}`;
      } catch (error) {
        return dateString;
      }
    };

    // Get topic color
    const getTopicColor = (topic: string) => {
      const topicColors: Record<string, string> = {
        "Social Media":
          "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
        "Product Review":
          "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
        TikTok:
          "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
        YouTube: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        LinkedIn:
          "bg-blue-200 text-blue-900 dark:bg-blue-900/40 dark:text-blue-300",
        "Live Stream":
          "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
        Photography:
          "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
        "Content Writing":
          "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300",
        Pinterest:
          "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        Podcast:
          "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
        "Video Production":
          "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
        "Web Development":
          "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
      };

      return (
        topicColors[topic] ||
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
            {listing.title}
          </h3>
        </div>

        <div className="shrink-0 w-32">
          <div
            className={`text-sm px-2.5 py-1 rounded-full text-center ${getTopicColor(
              listing.topic
            )}`}
          >
            {listing.topic}
          </div>
        </div>

        <div className="shrink-0 w-36 text-sm text-gray-500 dark:text-gray-400 text-center">
          Due: {formatDate(listing.deadline)}
        </div>

        <div className="shrink-0 w-24 text-sm font-medium text-gray-700 dark:text-gray-300 text-right">
          ${listing.budget.toLocaleString()}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filtering and sorting controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          To Do List
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
                      sortBy === "deadline-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("deadline-desc");
                    }}
                  >
                    Deadline (Latest First)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "deadline-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("deadline-asc");
                    }}
                  >
                    Deadline (Earliest First)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "budget-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("budget-desc");
                    }}
                  >
                    Budget (High to Low)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "budget-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("budget-asc");
                    }}
                  >
                    Budget (Low to High)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "date-created-desc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("date-created-desc");
                    }}
                  >
                    Date Created (Newest First)
                  </button>
                  <button
                    className={`block px-4 py-2 text-sm w-full text-left ${
                      sortBy === "date-created-asc"
                        ? "bg-gray-100 text-gray-900 dark:bg-zinc-700 dark:text-zinc-100"
                        : "text-gray-700 hover:bg-gray-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSortChange("date-created-asc");
                    }}
                  >
                    Date Created (Oldest First)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActiveFilters resetPage={resetPage} />

      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6">
          {/* Task count indicator */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
              To Do
            </h2>
            <span className="rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
              {loading ? "..." : todoListings.length}
            </span>
          </div>

          {/* Listing items */}
          <div className="space-y-2">
            {loading ? (
              <ListingSkeleton count={5} />
            ) : todoListings.length > 0 ? (
              getPaginatedListings().map((listing) => (
                <HorizontalListingCard key={listing.id} listing={listing} />
              ))
            ) : (
              <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                No listings in this category
              </div>
            )}
          </div>

          {/* Pagination */}
          {todoListings.length > 0 && renderPagination()}
        </div>
      </div>

      {/* Filter Panel */}
      <CustomFilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        resetPage={resetPage}
      />
    </div>
  );
};

export default UserListingPage;
