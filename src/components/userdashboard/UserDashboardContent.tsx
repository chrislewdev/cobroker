// src/components/userdashboard/UserDashboardContent.tsx

import React from "react";

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome back. Here's an overview of your account.
        </p>
      </div>

      {/* Placeholder Grid - 3x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 6 empty placeholder boxes */}
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 h-64 flex items-center justify-center"
          >
            <p className="text-gray-400 dark:text-gray-500">
              Placeholder {index + 1}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
