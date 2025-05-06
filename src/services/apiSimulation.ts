// services/apiSimulation.ts

// mock API for task related components

import initialTaskData from "@/lib/userTaskData.json";
import { Task } from "@/stores/listingStore";

// Simulate creating and fetching task without backend and db
// Use a persistent in-memory database that survives page reloads and navigation by storing it in the global window object (only in browser environment)
const getDatabase = (): { tasks: Task[]; nextId: number } => {
  // Only run in browser environment
  if (typeof window === "undefined") {
    return {
      tasks: getInitialData(),
      nextId: calculateNextId(getInitialData()),
    };
  }

  // Initialize global storage if it doesn't exist
  if (!(window as any).__API_SIMULATION) {
    (window as any).__API_SIMULATION = {
      tasks: getInitialData(),
      nextId: calculateNextId(getInitialData()),
    };
  }

  return (window as any).__API_SIMULATION;
};

// Create a function to get a deep clone of the data to avoid references
const getInitialData = (): Task[] =>
  JSON.parse(JSON.stringify(initialTaskData));

// Calculate next ID based on the highest existing ID
const calculateNextId = (tasks: Task[]): number => {
  const highestId = tasks.reduce(
    (max, task) => Math.max(max, parseInt(task.id, 10) || 0),
    0
  );
  return highestId + 1;
};

// Utility to simulate network delay with random variation
const simulateNetworkDelay = async (baseMs = 300): Promise<void> => {
  const variation = Math.random() * 200;
  const delay = baseMs + variation;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// API simulation methods
export const apiSimulation = {
  // Tasks API
  tasks: {
    // Get all tasks
    async getAll(): Promise<Task[]> {
      await simulateNetworkDelay();
      const db = getDatabase();
      return [...db.tasks]; // Return a copy to prevent direct modification
    },

    // Get task by ID
    async getById(id: string): Promise<Task> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const task = db.tasks.find((task) => task.id === id);

      if (!task) {
        throw new Error(`Task with ID ${id} not found`);
      }

      return { ...task }; // Return a copy to prevent direct modification
    },

    // Create a new task
    async create(taskData: Omit<Task, "id">): Promise<Task> {
      await simulateNetworkDelay(500);
      const db = getDatabase();

      // Simulate basic validation
      if (!taskData.title?.trim()) {
        throw new Error("Task title is required");
      }

      if (!taskData.deadline) {
        throw new Error("Task deadline is required");
      }

      // Create new task with generated ID
      const newTask: Task = {
        id: String(db.nextId++),
        ...taskData,
      };

      // Add to database
      db.tasks.push(newTask);

      return { ...newTask }; // Return a copy to prevent direct modification
    },

    // Update an existing task
    async update(id: string, updates: Partial<Task>): Promise<Task> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const taskIndex = db.tasks.findIndex((task) => task.id === id);

      if (taskIndex === -1) {
        throw new Error(`Task with ID ${id} not found`);
      }

      // Update the task
      const updatedTask: Task = {
        ...db.tasks[taskIndex],
        ...updates,
      };

      // Replace in database
      db.tasks[taskIndex] = updatedTask;

      return { ...updatedTask }; // Return a copy to prevent direct modification
    },

    // Delete a task
    async delete(id: string): Promise<void> {
      await simulateNetworkDelay();
      const db = getDatabase();

      const taskIndex = db.tasks.findIndex((task) => task.id === id);

      if (taskIndex === -1) {
        throw new Error(`Task with ID ${id} not found`);
      }

      // Remove from database
      db.tasks.splice(taskIndex, 1);
    },

    // Reset the database to initial state (useful for testing)
    async reset(): Promise<void> {
      if (typeof window !== "undefined") {
        (window as any).__API_SIMULATION = {
          tasks: getInitialData(),
          nextId: calculateNextId(getInitialData()),
        };
      }
    },
  },
};
