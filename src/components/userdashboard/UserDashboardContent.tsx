// src/components/userdashboard/UserDashboardContent.tsx

import React from "react";

export default function DashboardContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Property Management Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Welcome back. Here&apos;s an overview of your property portfolio.
        </p>
      </div>

      {/* Placeholder Grid - 3x2 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 6 empty placeholder boxes with property-related labels */}
        {[
          "Total Properties",
          "Active Listings",
          "Monthly Revenue",
          "Occupancy Rate",
          "Recent Inquiries",
          "Performance Overview",
        ].map((label, index) => (
          <div
            key={index}
            className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-6 h-64 flex items-center justify-center"
          >
            <p className="text-gray-400 dark:text-gray-500 text-center">
              {label}
              <br />
              <span className="text-sm">Coming Soon</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
