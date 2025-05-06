// src/components/userlisting/UserListingPage.tsx

// used in userlisting client file

"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ListingCard from "./ListingCard";
import { Listing } from "@/types/listingType";
import { FunnelIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import useListingStore, { ListingSortOption } from "@/stores/listingStore";
import FilterPanel from "@/components/listing_filter/FilterPanel";
import ActiveFilters from "@/components/listing_filter/ActiveFilters";

// Different page sizes based on screen size
const DESKTOP_ITEMS_PER_PAGE = 12; // 3 columns x 4 rows
const MOBILE_ITEMS_PER_PAGE = 4; // 4 items for mobile view

// Number of items to display in a column
const ITEMS_PER_COLUMN = 4;

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

  // Reset listing list state on component unmount

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State for current page (for tab views)
  const [currentPage, setCurrentPage] = useState<number>(1);
  // State for sort dropdown visibility
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  // State for filter panel visibility
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  // Last active filter count for tracking changes
  const [lastFilterCount, setLastFilterCount] = useState(activeFilterCount);
  // State for active tab
  const [activeTab, setActiveTab] = useState<string>("all");
  // State to track screen size
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // States for window positions (starting indices) in each column
  const [todoWindowStart, setTodoWindowStart] = useState<number>(0);
  const [inProgressWindowStart, setInProgressWindowStart] = useState<number>(0);
  const [pendingReviewWindowStart, setPendingReviewWindowStart] =
    useState<number>(0);
  const [completedWindowStart, setCompletedWindowStart] = useState<number>(0);

  // Loading states for each column
  const [isTodoLoading, setIsTodoLoading] = useState<boolean>(false);
  const [isInProgressLoading, setIsInProgressLoading] =
    useState<boolean>(false);
  const [isPendingReviewLoading, setIsPendingReviewLoading] =
    useState<boolean>(false);
  const [isCompletedLoading, setIsCompletedLoading] = useState<boolean>(false);

  // Container refs for each column
  const todoColumnRef = useRef<HTMLDivElement>(null);
  const inProgressColumnRef = useRef<HTMLDivElement>(null);
  const pendingReviewColumnRef = useRef<HTMLDivElement>(null);
  const completedColumnRef = useRef<HTMLDivElement>(null);

  // Refs to prevent scroll handlers during programmatic scrolling
  const isUserScrollingTodo = useRef<boolean>(true);
  const isUserScrollingInProgress = useRef<boolean>(true);
  const isUserScrollingPendingReview = useRef<boolean>(true);
  const isUserScrollingCompleted = useRef<boolean>(true);

  // Scroll timers for debouncing
  const todoScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const inProgressScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const pendingReviewScrollTimer = useRef<NodeJS.Timeout | null>(null);
  const completedScrollTimer = useRef<NodeJS.Timeout | null>(null);

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

  // Check if tab parameter in URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (
      tab &&
      ["all", "todo", "inprogress", "pendingreview", "completed"].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Fetch listings on component mount
  useEffect(() => {
    // Reset listing list state before fetching
    resetState.listingList();
    fetchListings();
  }, [fetchListings, resetState]);

  // Reset window positions & pagination when filters change
  useEffect(() => {
    // React to changes in the filter count
    if (activeFilterCount !== lastFilterCount) {
      setLastFilterCount(activeFilterCount);
      setCurrentPage(1);

      // Reset all window positions to 0
      setTodoWindowStart(0);
      setInProgressWindowStart(0);
      setPendingReviewWindowStart(0);
      setCompletedWindowStart(0);
    }
  }, [activeFilterCount, lastFilterCount]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);

    // Reset window positions when changing tabs
    setTodoWindowStart(0);
    setInProgressWindowStart(0);
    setPendingReviewWindowStart(0);
    setCompletedWindowStart(0);

    // Update URL with the tab
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Filter listings based on status
  const todoListings = filteredListings.filter(
    (listing) => listing.status === "to do"
  );
  const inProgressListings = filteredListings.filter(
    (listing) => listing.status === "in progress"
  );
  const pendingReviewListings = filteredListings.filter(
    (listing) => listing.status === "pending review"
  );
  const completedListings = filteredListings.filter(
    (listing) => listing.status === "completed"
  );

  // Get Todo window listings
  const getTodoWindowListings = () => {
    return todoListings.slice(
      todoWindowStart,
      todoWindowStart + ITEMS_PER_COLUMN
    );
  };

  // Get In Progress window listings
  const getInProgressWindowListings = () => {
    return inProgressListings.slice(
      inProgressWindowStart,
      inProgressWindowStart + ITEMS_PER_COLUMN
    );
  };

  // Get Pending Review window listings
  const getPendingReviewWindowListings = () => {
    return pendingReviewListings.slice(
      pendingReviewWindowStart,
      pendingReviewWindowStart + ITEMS_PER_COLUMN
    );
  };

  // Get Completed window listings
  const getCompletedWindowListings = () => {
    return completedListings.slice(
      completedWindowStart,
      completedWindowStart + ITEMS_PER_COLUMN
    );
  };

  // Set pagination based on screen size
  const getPaginatedListings = (listingList: Listing[]) => {
    const itemsPerPage = isMobile
      ? MOBILE_ITEMS_PER_PAGE
      : DESKTOP_ITEMS_PER_PAGE;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return listingList.slice(startIndex, startIndex + itemsPerPage);
  };

  // Get listings based on active tab
  const getListingsForActiveTab = () => {
    switch (activeTab) {
      case "todo":
        return getPaginatedListings(todoListings);
      case "inprogress":
        return getPaginatedListings(inProgressListings);
      case "pendingreview":
        return getPaginatedListings(pendingReviewListings);
      case "completed":
        return getPaginatedListings(completedListings);
      default:
        return [];
    }
  };

  // Calculate total pages (ensures at least 1 page even if empty)
  const getTotalPages = () => {
    let total;
    switch (activeTab) {
      case "todo":
        total = todoListings.length;
        break;
      case "inprogress":
        total = inProgressListings.length;
        break;
      case "pendingreview":
        total = pendingReviewListings.length;
        break;
      case "completed":
        total = completedListings.length;
        break;
      default:
        total = 0;
    }

    const itemsPerPage = isMobile
      ? MOBILE_ITEMS_PER_PAGE
      : DESKTOP_ITEMS_PER_PAGE;
    return Math.max(1, Math.ceil(total / itemsPerPage));
  };

  // Handle sort selection
  const handleSortChange = (option: ListingSortOption) => {
    setSortOption(option);
    setShowSortDropdown(false);
    // Reset to first page when sorting changes
    resetPage();

    // Reset window positions when sorting changes
    setTodoWindowStart(0);
    setInProgressWindowStart(0);
    setPendingReviewWindowStart(0);
    setCompletedWindowStart(0);
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

  // Array of tab data for mapping
  const tabData = [
    {
      id: "all",
      label: "All Listings",
      count: filteredListings.length,
    },
    {
      id: "todo",
      label: "To Do",
      count: todoListings.length,
    },
    {
      id: "inprogress",
      label: "In Progress",
      count: inProgressListings.length,
    },
    {
      id: "pendingreview",
      label: "Pending Review",
      count: pendingReviewListings.length,
    },
    {
      id: "completed",
      label: "Completed",
      count: completedListings.length,
    },
  ];

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

  // Render loading indicator for infinite scroll
  const renderLoader = () => (
    <div className="flex justify-center py-4">
      <div className="animate-spin h-6 w-6 border-4 border-blue-500 rounded-full border-t-transparent"></div>
    </div>
  );

  // Render skeleton loading UI
  const ListingSkeleton = ({ count = 4 }) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700 p-4 h-40 animate-pulse"
        >
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-3/4 mb-4"></div>
          <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/2 mb-2"></div>
          <div className="mt-auto flex justify-between">
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-1/4"></div>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div className="space-y-6">
      {/* Filtering and sorting controls */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Listing Management
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
        <div className="border-b border-gray-200 dark:border-zinc-700">
          {/* Mobile view: 2x3 grid layout */}
          <div className="grid grid-cols-2 md:hidden">
            {tabData.map((tab) => (
              <button
                key={tab.id}
                className={`px-3 py-3 text-sm font-medium flex flex-col items-center justify-center ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                <div className="flex items-center">
                  {tab.label}{" "}
                  <span className="ml-1 rounded-full bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 text-xs">
                    {loading ? "..." : tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {/* Desktop view: horizontal tabs */}
          <div className="hidden md:flex overflow-x-auto">
            {tabData.map((tab) => (
              <button
                key={tab.id}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}{" "}
                <span className="ml-1 rounded-full bg-gray-100 dark:bg-zinc-700 px-2 py-0.5 text-xs">
                  {loading ? "..." : tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* All Listings View (Kanban-style) with Sliding Window Scroll */}
        {activeTab === "all" && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* To Do Column */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                    To Do
                  </h2>
                  <span className="rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {loading ? "..." : todoListings.length}
                  </span>
                </div>
                {/* Make the container scrollable with a fixed height */}
                <div
                  ref={todoColumnRef}
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar listing-column"
                  style={{ height: "640px" }}
                >
                  {loading ? (
                    <ListingSkeleton count={4} />
                  ) : todoListings.length > 0 ? (
                    <>
                      {/* Sliding window of listings */}
                      {getTodoWindowListings().map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}

                      {/* Loading indicator shown when loading more listings */}
                      {isTodoLoading && renderLoader()}

                      {/* Show a message if reach the end */}
                      {todoWindowStart + ITEMS_PER_COLUMN >=
                        todoListings.length &&
                        todoListings.length > ITEMS_PER_COLUMN && (
                          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                            End of listings reached
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                      No listings in this category
                    </div>
                  )}
                </div>
                {/* Scroll to view more */}
                {todoListings.length > ITEMS_PER_COLUMN && (
                  <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Scroll to view more ({todoWindowStart + 1}-
                    {Math.min(
                      todoWindowStart + ITEMS_PER_COLUMN,
                      todoListings.length
                    )}{" "}
                    of {todoListings.length})
                  </div>
                )}
              </div>

              {/* In Progress Column */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                    In Progress
                  </h2>
                  <span className="rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {loading ? "..." : inProgressListings.length}
                  </span>
                </div>
                {/* Make the container scrollable with a fixed height */}
                <div
                  ref={inProgressColumnRef}
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar listing-column"
                  style={{ height: "640px" }}
                >
                  {loading ? (
                    <ListingSkeleton count={4} />
                  ) : inProgressListings.length > 0 ? (
                    <>
                      {/* Sliding window of listings */}
                      {getInProgressWindowListings().map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}

                      {/* Loading indicator shown when loading more listings */}
                      {isInProgressLoading && renderLoader()}

                      {/* Show a message if reach the end */}
                      {inProgressWindowStart + ITEMS_PER_COLUMN >=
                        inProgressListings.length &&
                        inProgressListings.length > ITEMS_PER_COLUMN && (
                          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                            End of listings reached
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                      No listings in this category
                    </div>
                  )}
                </div>
                {/* Scroll to view more */}
                {inProgressListings.length > ITEMS_PER_COLUMN && (
                  <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Scroll to view more ({inProgressWindowStart + 1}-
                    {Math.min(
                      inProgressWindowStart + ITEMS_PER_COLUMN,
                      inProgressListings.length
                    )}{" "}
                    of {inProgressListings.length})
                  </div>
                )}
              </div>

              {/* Pending Review Column */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                    Pending Review
                  </h2>
                  <span className="rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {loading ? "..." : pendingReviewListings.length}
                  </span>
                </div>
                {/* Make the container scrollable with a fixed height */}
                <div
                  ref={pendingReviewColumnRef}
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar listing-column"
                  style={{ height: "640px" }}
                >
                  {loading ? (
                    <ListingSkeleton count={4} />
                  ) : pendingReviewListings.length > 0 ? (
                    <>
                      {/* Sliding window of listings */}
                      {getPendingReviewWindowListings().map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}

                      {/* Loading indicator shown when loading more listings */}
                      {isPendingReviewLoading && renderLoader()}

                      {/* Show a message if reach the end */}
                      {pendingReviewWindowStart + ITEMS_PER_COLUMN >=
                        pendingReviewListings.length &&
                        pendingReviewListings.length > ITEMS_PER_COLUMN && (
                          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                            End of listings reached
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                      No listings in this category
                    </div>
                  )}
                </div>
                {/* Scroll to view more */}
                {pendingReviewListings.length > ITEMS_PER_COLUMN && (
                  <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Scroll to view more ({pendingReviewWindowStart + 1}-
                    {Math.min(
                      pendingReviewWindowStart + ITEMS_PER_COLUMN,
                      pendingReviewListings.length
                    )}{" "}
                    of {pendingReviewListings.length})
                  </div>
                )}
              </div>

              {/* Completed Column */}
              <div className="md:col-span-1">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-semibold text-lg text-gray-800 dark:text-white">
                    Completed
                  </h2>
                  <span className="rounded-full bg-gray-100 dark:bg-zinc-700 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                    {loading ? "..." : completedListings.length}
                  </span>
                </div>
                {/* Make the container scrollable with a fixed height */}
                <div
                  ref={completedColumnRef}
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar listing-column"
                  style={{ height: "640px" }}
                >
                  {loading ? (
                    <ListingSkeleton count={4} />
                  ) : completedListings.length > 0 ? (
                    <>
                      {/* Sliding window of listings */}
                      {getCompletedWindowListings().map((listing) => (
                        <ListingCard key={listing.id} listing={listing} />
                      ))}

                      {/* Loading indicator shown when loading more listings */}
                      {isCompletedLoading && renderLoader()}

                      {/* Show a message if reach the end */}
                      {completedWindowStart + ITEMS_PER_COLUMN >=
                        completedListings.length &&
                        completedListings.length > ITEMS_PER_COLUMN && (
                          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                            End of listings reached
                          </div>
                        )}
                    </>
                  ) : (
                    <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                      No listings in this category
                    </div>
                  )}
                </div>
                {/* Scroll to view more */}
                {completedListings.length > ITEMS_PER_COLUMN && (
                  <div className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
                    Scroll to view more ({completedWindowStart + 1}-
                    {Math.min(
                      completedWindowStart + ITEMS_PER_COLUMN,
                      completedListings.length
                    )}{" "}
                    of {completedListings.length})
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Specific Tab Views (with pagination) */}
        {activeTab !== "all" && (
          <div className="p-6 flex flex-col">
            {/* Fixed height container for listing cards */}
            <div style={{ height: "680px", position: "relative" }}>
              {/* Listing grid that doesn't flex to fill space */}
              <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 content-start"
                style={{ gridAutoRows: "160px" }}
              >
                {loading ? (
                  <ListingSkeleton count={12} />
                ) : getListingsForActiveTab().length > 0 ? (
                  getListingsForActiveTab().map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))
                ) : (
                  <div className="col-span-3 flex items-center justify-center p-8 text-gray-500 dark:text-gray-400">
                    No listings found in this category
                  </div>
                )}
              </div>
            </div>

            {/* Pagination - fixed position at the bottom */}
            {renderPagination()}
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        resetPage={resetPage}
      />
    </div>
  );
};

export default UserListingPage;
