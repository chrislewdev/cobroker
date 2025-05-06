// src/components/userdashboard/UserDashboardHeader.tsx

// header for userdashboard

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bars3Icon } from "@heroicons/react/24/outline";
import useAuthStore from "@/stores/authStore";
import useProfileStore from "@/stores/profileStore";
import { useWindowSize } from "@/hooks/useWindowSize";
import { useResetOnUnmount } from "@/hooks/useStateReset";

// Define a consistent header height
export const HEADER_HEIGHT = "84px";

interface UserDashboardHeaderProps {
  toggleSidebar?: () => void;
}

export const UserDashboardHeader: React.FC<UserDashboardHeaderProps> = ({
  toggleSidebar,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {
    isAuthenticated,
    user,
    logout,
    resetState: authResetState,
  } = useAuthStore();
  const {
    profile,
    fetchProfile,
    clearProfile,
    resetState: profileResetState,
  } = useProfileStore();
  const { width } = useWindowSize();
  const isMobile = width ? width < 1024 : false; // 1024px is the lg breakpoint in Tailwind

  // Reset both auth and profile states on component unmount
  useResetOnUnmount(authResetState.auth);
  useResetOnUnmount(profileResetState.profile);

  // Fetch profile if authenticated but no profile loaded
  useEffect(() => {
    if (isAuthenticated && user && !profile) {
      // Reset profile state before fetching to ensure clean slate
      profileResetState.profile();
      fetchProfile(user.id);
    }
  }, [isAuthenticated, user, profile, fetchProfile, profileResetState]);

  // Get display user data from profile if available, fallback to auth user
  const displayUser = profile || user;

  // Handle logout
  const handleLogout = () => {
    // Close the user menu first
    setUserMenuOpen(false);

    // Timeout to prevent potential recursive calls
    // Ensures state updates from closing the menu are processed before logout operations
    setTimeout(() => {
      // Clear profile first
      clearProfile();

      // Then perform logout (which will clear auth state)
      logout();
    }, 0);
  };

  return (
    <header
      className="bg-white dark:bg-zinc-800 sticky top-0 z-40 border-b border-gray-200 dark:border-zinc-700 shadow-sm"
      style={{ height: HEADER_HEIGHT }}
    >
      {/* Header content omitted for brevity */}
      <nav
        aria-label="Global"
        className="flex items-center justify-between p-4 lg:px-8 h-full"
      >
        {/* Mobile layout: Sidebar toggle on left, logo in center, user menu on right */}
        <div className="flex items-center lg:hidden">
          {toggleSidebar && (
            <button
              type="button"
              onClick={() => {
                if (userMenuOpen) {
                  setUserMenuOpen(false);
                }
                toggleSidebar();
              }}
              className="rounded-md p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Toggle sidebar"
            >
              <span className="sr-only">Toggle sidebar</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Logo - centered on mobile, left-aligned on desktop */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <Link href="/" className="-m-1.5 p-1.5 block">
            <span className="sr-only">Asia Influencer X</span>
            <div className="bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center p-3">
              <img
                alt=""
                src="https://asiainfluencerx.com/wp-content/uploads/2022/10/Logo_AIX-White.png"
                className="h-8 w-auto"
              />
            </div>
          </Link>
        </div>

        {/* Desktop right-side items: theme toggle and user menu */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isAuthenticated && displayUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3"
              >
                <span className="text-sm/6 font-semibold text-gray-800 dark:text-gray-200">
                  {displayUser.firstName} {displayUser.lastName}
                </span>
                {displayUser.profilePic ? (
                  <img
                    src={displayUser.profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200">
                    {displayUser.firstName?.[0]}
                    {displayUser.lastName?.[0]}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-zinc-800 rounded-md shadow-lg z-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm/6 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Sign-Up / Log in here <span aria-hidden="true">&rarr;</span>
            </Link>
          )}
        </div>

        {/* Mobile right-side user menu button */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <span className="sr-only">Open user menu</span>
            {displayUser?.profilePic ? (
              <img
                src={displayUser.profilePic}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover border border-gray-300 dark:border-gray-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200">
                {displayUser?.firstName?.[0]}
                {displayUser?.lastName?.[0] || ""}
              </div>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay and dropdown omitted for brevity */}
    </header>
  );
};

export default UserDashboardHeader;
