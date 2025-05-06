// src/components/listing_filter/CustomFilterPanel.tsx

// A modified version of FilterPanel

import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useListingStore, { ListingFilters } from "@/stores/listingStore";

interface CustomFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  resetPage: () => void;
}

const CustomFilterPanel: React.FC<CustomFilterPanelProps> = ({
  isOpen,
  onClose,
  resetPage,
}) => {
  const { filters, setFilter, applyFilters, clearFilters } = useListingStore();

  // Local state for filters (before applying)
  const [localFilters, setLocalFilters] = useState<ListingFilters>(filters);

  // Update local filters when store filters change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Handle priority changes
  const handlePriorityChange = (priority: "high" | "medium" | "low") => {
    let newPriorities: ("high" | "medium" | "low")[];

    // Select/deselect priority
    if (localFilters.priority.includes(priority)) {
      newPriorities = localFilters.priority.filter((p) => p !== priority);
    } else {
      newPriorities = [...localFilters.priority, priority];
    }

    setLocalFilters({
      ...localFilters,
      priority: newPriorities,
    });
  };

  // Handle topic changes
  const handleTopicChange = (topic: string) => {
    let newTopics: string[];

    // Select/deselect topic
    if (localFilters.topics.includes(topic)) {
      newTopics = localFilters.topics.filter((t) => t !== topic);
    } else {
      newTopics = [...localFilters.topics, topic];
    }

    setLocalFilters({
      ...localFilters,
      topics: newTopics,
    });
  };

  // Handle subject changes
  const handleSubjectChange = (subject: string) => {
    let newSubjects: string[];

    // Select/deselect subject
    if (localFilters.subjects.includes(subject)) {
      newSubjects = localFilters.subjects.filter((s) => s !== subject);
    } else {
      newSubjects = [...localFilters.subjects, subject];
    }

    setLocalFilters({
      ...localFilters,
      subjects: newSubjects,
    });
  };

  // Handle budget range changes
  const handleBudgetRangeChange = (range: string) => {
    let min: number | null = null;
    let max: number | null = null;

    switch (range) {
      case "under-500":
        min = 0;
        max = 500;
        break;
      case "500-1000":
        min = 500;
        max = 1000;
        break;
      case "over-1000":
        min = 1000;
        max = null;
        break;
      default:
        // Clear the budget range
        break;
    }

    setLocalFilters({
      ...localFilters,
      budgetRange: { min, max },
    });
  };

  // Apply filters and close panel
  const handleApplyFilters = () => {
    // Apply local filters to the store
    for (const [key, value] of Object.entries(localFilters)) {
      setFilter(key as keyof ListingFilters, value);
    }

    // Apply filters
    applyFilters();

    // Close the filter panel
    onClose();
  };

  // Reset local filters and close panel
  const handleCancelFilters = () => {
    // Reset local filters to store filters
    setLocalFilters(filters);

    // Close the filter panel
    onClose();
  };

  // Reset all filters
  const handleResetFilters = () => {
    // Reset local filters
    setLocalFilters({
      priority: [],
      topics: [],
      subjects: [],
      budgetRange: {
        min: null,
        max: null,
      },
    });
  };

  // Define common topics from your data
  const topics = [
    "Social Media",
    "TikTok",
    "YouTube",
    "Content Writing",
    "Photography",
    "Video Production",
    "Live Stream",
    "LinkedIn",
    "Pinterest",
    "Podcast",
    "Instagram",
  ];

  // Define common subjects from your data
  const subjects = [
    "Content Creation",
    "Product Review",
    "Fashion",
    "Product Launch",
    "Beauty",
    "Technology",
    "Food",
    "Sustainability",
    "Home Decor",
    "Fitness",
    "Travel",
    "Wellness",
    "Cooking",
    "Professional",
    "Mobile Apps",
    "PR",
    "Crisis Management",
  ];

  // Get budget range value for radio buttons
  const getBudgetRangeValue = () => {
    const { min, max } = localFilters.budgetRange;

    if (min === 0 && max === 500) return "under-500";
    if (min === 500 && max === 1000) return "500-1000";
    if (min === 1000 && max === null) return "over-1000";

    return "";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleCancelFilters}
        ></div>

        {/* This element is to trick the browser into centering the modal contents. */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Panel content */}
        <div className="inline-block align-bottom bg-white dark:bg-zinc-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Filter Listings
              </h3>
              <button
                onClick={handleCancelFilters}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-2 space-y-6">
              {/* Priority Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority Level
                </h4>
                <div className="flex flex-wrap gap-2">
                  {["high", "medium", "low"].map((priority) => (
                    <button
                      key={priority}
                      onClick={() =>
                        handlePriorityChange(
                          priority as "high" | "medium" | "low"
                        )
                      }
                      className={`px-3 py-1 rounded-full text-sm ${
                        localFilters.priority.includes(
                          priority as "high" | "medium" | "low"
                        )
                          ? getPriorityButtonColor(priority)
                          : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Topic Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic / Platform
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-2">
                  {topics.map((topic) => (
                    <label key={topic} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.topics.includes(topic)}
                        onChange={() => handleTopicChange(topic)}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 dark:bg-zinc-800 dark:border-zinc-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {topic}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </h4>
                <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-2">
                  {subjects.map((subject) => (
                    <label key={subject} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localFilters.subjects.includes(subject)}
                        onChange={() => handleSubjectChange(subject)}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 dark:bg-zinc-800 dark:border-zinc-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {subject}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Budget Range Filter */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Budget Range
                </h4>
                <div className="space-y-2">
                  {[
                    { id: "under-500", label: "Under $500" },
                    { id: "500-1000", label: "$500 - $1000" },
                    { id: "over-1000", label: "Over $1000" },
                    { id: "", label: "Any Budget" },
                  ].map((option) => (
                    <label key={option.id} className="flex items-center">
                      <input
                        type="radio"
                        name="budget-range"
                        value={option.id}
                        checked={getBudgetRangeValue() === option.id}
                        onChange={() => handleBudgetRangeChange(option.id)}
                        className="rounded-full border-gray-300 text-rose-600 focus:ring-rose-500 dark:bg-zinc-800 dark:border-zinc-700"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-zinc-800 px-4 py-3 sm:px-6 flex justify-between">
            <button
              onClick={handleResetFilters}
              className="text-sm font-medium text-gray-700 hover:text-gray-500 dark:text-gray-300 dark:hover:text-gray-400"
            >
              Reset Filters
            </button>
            <div className="flex space-x-2">
              <button
                onClick={handleCancelFilters}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none dark:bg-zinc-700 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get priority button color
function getPriorityButtonColor(priority: string): string {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300";
  }
}

export default CustomFilterPanel;
