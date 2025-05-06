// components/tasks/ActiveFilters.tsx

// show active filter, used in filter related components

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import useTaskStore, { TaskFilters } from "@/stores/taskStore";

interface ActiveFiltersProps {
  resetPage: () => void;
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ resetPage }) => {
  const { filters, clearFilter, clearFilters, activeFilterCount } =
    useTaskStore();

  // If no active filters, don't render
  if (activeFilterCount === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap gap-2 items-center">
      {/* Priority filter chips */}
      {filters.priority.map((priority) => (
        <div
          key={`priority-${priority}`}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getPriorityChipColor(
            priority
          )}`}
        >
          <span>
            Priority: {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </span>
          <button
            onClick={() => {
              const newPriorities = filters.priority.filter(
                (p) => p !== priority
              );
              clearFilter("priority");
              useTaskStore.getState().setFilter("priority", newPriorities);
              useTaskStore.getState().applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${priority} priority filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Topic filter chips */}
      {filters.topics.map((topic) => (
        <div
          key={`topic-${topic}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
        >
          <span>Topic: {topic}</span>
          <button
            onClick={() => {
              const newTopics = filters.topics.filter((t) => t !== topic);
              clearFilter("topics");
              useTaskStore.getState().setFilter("topics", newTopics);
              useTaskStore.getState().applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${topic} topic filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Subject filter chips */}
      {filters.subjects.map((subject) => (
        <div
          key={`subject-${subject}`}
          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
        >
          <span>Subject: {subject}</span>
          <button
            onClick={() => {
              const newSubjects = filters.subjects.filter((s) => s !== subject);
              clearFilter("subjects");
              useTaskStore.getState().setFilter("subjects", newSubjects);
              useTaskStore.getState().applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label={`Remove ${subject} subject filter`}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Budget range filter chip */}
      {(filters.budgetRange.min !== null ||
        filters.budgetRange.max !== null) && (
        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          <span>Budget: {formatBudgetRange(filters.budgetRange)}</span>
          <button
            onClick={() => {
              clearFilter("budgetRange");
              useTaskStore.getState().applyFilters();
              resetPage();
            }}
            className="ml-1 focus:outline-none"
            aria-label="Remove budget range filter"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Clear all filters button */}
      <button
        onClick={() => {
          clearFilters();
          resetPage();
        }}
        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
      >
        Clear All Filters
      </button>
    </div>
  );
};

// Helper function to get priority chip color
function getPriorityChipColor(priority: string): string {
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

// Helper function to format budget range
function formatBudgetRange(budgetRange: TaskFilters["budgetRange"]): string {
  const { min, max } = budgetRange;

  if (min === 0 && max === 500) return "Under $500";
  if (min === 500 && max === 1000) return "$500 - $1000";
  if (min === 1000 && max === null) return "Over $1000";

  if (min !== null && max !== null) return `$${min} - $${max}`;
  if (min !== null) return `Min $${min}`;
  if (max !== null) return `Max $${max}`;

  return "Any";
}

export default ActiveFilters;
