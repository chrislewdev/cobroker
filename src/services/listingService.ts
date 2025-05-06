// services/listingService.ts

// used in listingStore

import { Task } from "@/stores/listingStore";
import { apiSimulation } from "@/services/apiSimulation";

// Service layer that interfaces with the API (simulation for now)
export const taskService = {
  // Fetch all tasks
  async fetchTasks(): Promise<Task[]> {
    return apiSimulation.tasks.getAll();
  },

  // Fetch task by ID
  async fetchTaskById(taskId: string): Promise<Task> {
    return apiSimulation.tasks.getById(taskId);
  },

  // Create a new task
  async createTask(taskData: Omit<Task, "id">): Promise<Task> {
    return apiSimulation.tasks.create(taskData);
  },

  // Update a task
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task> {
    return apiSimulation.tasks.update(taskId, taskData);
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<void> {
    return apiSimulation.tasks.delete(taskId);
  },

  // Reset the database (useful for testing)
  async resetData(): Promise<void> {
    return apiSimulation.tasks.reset();
  },
};
