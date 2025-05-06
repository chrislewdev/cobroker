// stores/taskStore.ts

import { create } from "zustand";
import { taskService } from "@/services/listingService";
import {
  AsyncState,
  initialAsyncState,
  loadingState,
  successState,
  errorState,
} from "@/utils/asyncState";
import {
  createStoreResetFunctions,
  createResetFunction,
  ResetOptions,
} from "@/utils/stateResetUtils";

// Owner type
export interface TaskOwner {
  id: string;
  name: string;
  profilePic: string;
}

// Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  owner: TaskOwner;
  topic: string;
  subject: string;
  dateCreated: string;
  deadline: string;
  budget: number;
  status: "to do" | "in progress" | "completed" | "pending review";
}

// Sort options for tasks
export type TaskSortOption =
  | "deadline-asc"
  | "deadline-desc"
  | "budget-asc"
  | "budget-desc"
  | "date-created-asc"
  | "date-created-desc";

// Filter options
export interface TaskFilters {
  priority: ("high" | "medium" | "low")[];
  topics: string[];
  subjects: string[];
  budgetRange: {
    min: number | null;
    max: number | null;
  };
}

// Define task store state
interface TaskState {
  // Task data
  tasks: Task[];
  filteredTasks: Task[];
  currentTask: Task | null;

  // UI state
  sortBy: TaskSortOption;
  filters: TaskFilters;
  activeFilterCount: number;

  // Async states
  taskListState: AsyncState<Task[]>;
  taskDetailState: AsyncState<Task>;
  taskMutationState: AsyncState<Task | void>;

  // Task actions
  fetchTasks: () => Promise<Task[] | null>;
  fetchTaskById: (taskId: string) => Promise<Task | null>;
  createTask: (taskData: Omit<Task, "id">) => Promise<Task | null>;
  updateTask: (taskId: string, taskData: Partial<Task>) => Promise<Task | null>;
  deleteTask: (taskId: string) => Promise<void | null>;

  // Filter actions
  setFilter: <K extends keyof TaskFilters>(
    filterType: K,
    value: TaskFilters[K]
  ) => void;
  clearFilters: () => void;
  clearFilter: <K extends keyof TaskFilters>(filterType: K) => void;
  applyFilters: () => void;

  // Sort actions
  setSortOption: (option: TaskSortOption) => void;

  // State management
  resetState: {
    taskList: (options?: ResetOptions) => void;
    taskDetail: (options?: ResetOptions) => void;
    taskMutation: (options?: ResetOptions) => void;
    all: (options?: ResetOptions) => void;
  };
}

// Default empty filters
const defaultFilters: TaskFilters = {
  priority: [],
  topics: [],
  subjects: [],
  budgetRange: {
    min: null,
    max: null,
  },
};

// AsyncState mapping for reset functions
const asyncStateMap = {
  taskListState: initialAsyncState,
  taskDetailState: initialAsyncState,
  taskMutationState: initialAsyncState,
};

// Helper function to sort tasks based on sort option
function sortTasks(tasks: Task[], sortOption: TaskSortOption): Task[] {
  const sortedTasks = [...tasks]; // Create a copy to avoid mutating the original

  switch (sortOption) {
    case "deadline-asc":
      return sortedTasks.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );

    case "deadline-desc":
      return sortedTasks.sort(
        (a, b) =>
          new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      );

    case "budget-asc":
      return sortedTasks.sort((a, b) => a.budget - b.budget);

    case "budget-desc":
      return sortedTasks.sort((a, b) => b.budget - a.budget);

    case "date-created-asc":
      return sortedTasks.sort(
        (a, b) =>
          new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
      );

    case "date-created-desc":
      return sortedTasks.sort(
        (a, b) =>
          new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
      );

    default:
      // Default to deadline ascending (earliest first)
      return sortedTasks.sort(
        (a, b) =>
          new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      );
  }
}

// Calculate priority based on deadline
function calculateTaskPriority(deadline: string): "high" | "medium" | "low" {
  const deadlineDate = new Date(deadline);
  const currentDate = new Date();

  // Calculate the difference in days
  const diffInTime = deadlineDate.getTime() - currentDate.getTime();
  const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

  // Determine priority based on difference
  if (diffInDays <= 7) {
    return "high";
  } else if (diffInDays <= 14) {
    return "medium";
  } else {
    return "low";
  }
}

// Check if a task matches the budget range filter
function matchesBudgetRange(
  task: Task,
  budgetRange: TaskFilters["budgetRange"]
): boolean {
  const { min, max } = budgetRange;

  if (min !== null && task.budget < min) {
    return false;
  }

  if (max !== null && task.budget > max) {
    return false;
  }

  return true;
}

// Apply all filters to the tasks
function applyFiltersToTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter((task) => {
    // Calculate task priority
    const taskPriority = calculateTaskPriority(task.deadline);

    // Check if task matches priority filter
    const matchesPriority =
      filters.priority.length === 0 || filters.priority.includes(taskPriority);

    // Check if task matches topic filter
    const matchesTopic =
      filters.topics.length === 0 || filters.topics.includes(task.topic);

    // Check if task matches subject filter
    const matchesSubject =
      filters.subjects.length === 0 || filters.subjects.includes(task.subject);

    // Check if task matches budget range filter
    const matchesBudget = matchesBudgetRange(task, filters.budgetRange);

    // Task must match all active filters
    return matchesPriority && matchesTopic && matchesSubject && matchesBudget;
  });
}

// Calculate the number of active filters
function calculateActiveFilterCount(filters: TaskFilters): number {
  let count = 0;

  if (filters.priority.length > 0) count++;
  if (filters.topics.length > 0) count++;
  if (filters.subjects.length > 0) count++;

  if (filters.budgetRange.min !== null || filters.budgetRange.max !== null) {
    count++;
  }

  return count;
}

// Create task store
const useTaskStore = create<TaskState>()((set, get) => {
  // Initialize the store
  const store = {
    // Task data
    tasks: [],
    filteredTasks: [],
    currentTask: null,

    // UI state
    sortBy: "deadline-asc" as TaskSortOption, // Default sort by deadline ascending (earliest first)
    filters: defaultFilters,
    activeFilterCount: 0,

    // Async states
    taskListState: initialAsyncState,
    taskDetailState: initialAsyncState,
    taskMutationState: initialAsyncState,

    // Task actions
    fetchTasks: async () => {
      try {
        set({ taskListState: loadingState(get().taskListState) });

        const tasks = await taskService.fetchTasks();

        // Sort the tasks based on current sort option
        const sortedTasks = sortTasks(tasks, get().sortBy);

        // Apply existing filters if any
        const filteredTasks = applyFiltersToTasks(sortedTasks, get().filters);

        set({
          taskListState: successState(tasks),
          tasks: sortedTasks,
          filteredTasks,
        });

        return tasks;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({ taskListState: errorState(errorMessage, get().taskListState) });
        return null;
      }
    },

    fetchTaskById: async (taskId: string) => {
      try {
        set({ taskDetailState: loadingState(get().taskDetailState) });

        const task = await taskService.fetchTaskById(taskId);

        set({
          taskDetailState: successState(task),
          currentTask: task,
        });

        return task;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          taskDetailState: errorState(errorMessage, get().taskDetailState),
        });
        return null;
      }
    },

    createTask: async (taskData: Omit<Task, "id">) => {
      try {
        set({ taskMutationState: loadingState(get().taskMutationState) });

        const newTask = await taskService.createTask(taskData);

        // Get the current tasks and sort option
        const tasks = [...get().tasks, newTask];
        const sortBy = get().sortBy;

        // Sort tasks with the new task included
        const sortedTasks = sortTasks(tasks, sortBy);

        // Apply existing filters to the new set of tasks
        const filteredTasks = applyFiltersToTasks(sortedTasks, get().filters);

        set({
          taskMutationState: successState(newTask),
          tasks: sortedTasks,
          filteredTasks,
        });

        return newTask;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          taskMutationState: errorState(errorMessage, get().taskMutationState),
        });
        return null;
      }
    },

    updateTask: async (taskId: string, taskData: Partial<Task>) => {
      try {
        set({ taskMutationState: loadingState(get().taskMutationState) });

        const updatedTask = await taskService.updateTask(taskId, taskData);

        // Update tasks list with the updated task
        const tasks = get().tasks.map((task) =>
          task.id === taskId ? updatedTask : task
        );

        // Sort tasks with the updated task
        const sortedTasks = sortTasks(tasks, get().sortBy);

        // Apply existing filters to the new set of tasks
        const filteredTasks = applyFiltersToTasks(sortedTasks, get().filters);

        // Update current task if it's the one being updated
        const currentTask =
          get().currentTask?.id === taskId ? updatedTask : get().currentTask;

        set({
          taskMutationState: successState(updatedTask),
          tasks: sortedTasks,
          filteredTasks,
          currentTask,
        });

        return updatedTask;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          taskMutationState: errorState(errorMessage, get().taskMutationState),
        });
        return null;
      }
    },

    deleteTask: async (taskId: string) => {
      try {
        set({ taskMutationState: loadingState(get().taskMutationState) });

        await taskService.deleteTask(taskId);

        // Remove the task from the tasks list
        const tasks = get().tasks.filter((task) => task.id !== taskId);

        // Apply existing filters to the new set of tasks
        const filteredTasks = applyFiltersToTasks(tasks, get().filters);

        // Clear current task if it's the one being deleted
        const currentTask =
          get().currentTask?.id === taskId ? null : get().currentTask;

        set({
          taskMutationState: successState(undefined),
          tasks,
          filteredTasks,
          currentTask,
        });

        return undefined;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          taskMutationState: errorState(errorMessage, get().taskMutationState),
        });
        return null;
      }
    },

    // Set a specific filter
    setFilter: <K extends keyof TaskFilters>(
      filterType: K,
      value: TaskFilters[K]
    ) => {
      const newFilters = {
        ...get().filters,
        [filterType]: value,
      };

      set({ filters: newFilters });
    },

    // Clear all filters
    clearFilters: () => {
      set({
        filters: defaultFilters,
        filteredTasks: get().tasks,
        activeFilterCount: 0,
      });
    },

    // Clear a specific filter
    clearFilter: <K extends keyof TaskFilters>(filterType: K) => {
      const newFilters = {
        ...get().filters,
        [filterType]: defaultFilters[filterType],
      };

      // Apply the updated filters
      const filteredTasks = applyFiltersToTasks(get().tasks, newFilters);

      // Calculate active filter count
      const activeFilterCount = calculateActiveFilterCount(newFilters);

      set({
        filters: newFilters,
        filteredTasks,
        activeFilterCount,
      });
    },

    // Apply all current filters to the tasks
    applyFilters: () => {
      const filteredTasks = applyFiltersToTasks(get().tasks, get().filters);
      const activeFilterCount = calculateActiveFilterCount(get().filters);

      set({
        filteredTasks,
        activeFilterCount,
      });
    },

    setSortOption: (option: TaskSortOption) => {
      // Get current tasks
      const tasks = [...get().tasks];

      // Sort tasks based on new option
      const sortedTasks = sortTasks(tasks, option);

      // Apply existing filters to the sorted tasks
      const filteredTasks = applyFiltersToTasks(sortedTasks, get().filters);

      // Update state with new sort option and sorted tasks
      set({
        sortBy: option,
        tasks: sortedTasks,
        filteredTasks,
      });
    },

    // State management
    resetState: {} as any,
  };

  // Generate reset functions using factory but with only the needed parts of StoreApi
  const storeApi = { setState: set, getState: get };
  const resetFunctions = createStoreResetFunctions<TaskState>(storeApi, {
    taskListState: initialAsyncState,
    taskDetailState: initialAsyncState,
    taskMutationState: initialAsyncState,
  });

  // Map the generated reset functions to our preferred naming
  store.resetState = {
    taskList: resetFunctions.taskListState,
    taskDetail: resetFunctions.taskDetailState,
    taskMutation: resetFunctions.taskMutationState,
    all: resetFunctions.all,
  };

  return store;
});

export default useTaskStore;
