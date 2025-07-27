// src/app/userdashboard/layout.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, User, Building2 } from "lucide-react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import { cn } from "@/utils/utils";
import UserDashboardHeader, {
  HEADER_HEIGHT,
} from "@/components/userdashboard/UserDashboardHeader";
import useAuthStore from "@/stores/authStore";
import FormStatus from "@/components/ui_blocks/FormStatus";
import { useResetOnUnmount } from "@/hooks/useStateReset";

interface UserDashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/userdashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/userdashboard/userprofile", icon: User },
  {
    name: "Property Management",
    href: "/userdashboard/propertymanagement",
    icon: Building2,
  },
];

export default function UserDashboardLayout({
  children,
}: UserDashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Authentication state and router
  const { isAuthenticated, authState, resetState } = useAuthStore();
  const { loading, error } = authState;
  const router = useRouter();

  // Reset auth state on component unmount - consistent pattern
  useResetOnUnmount(resetState.auth);

  // Authentication check
  useEffect(() => {
    // Allow some time for the auth state to be hydrated from localStorage
    // In a real app, we might add a loading state while this happens
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Handle screen size detection and set sidebar state
  useEffect(() => {
    const checkIsMobile = () => {
      const mobileView = window.innerWidth < 1024; // lg breakpoint in tailwind
      setIsMobile(mobileView);
      // Set sidebar state based on screen size
      setSidebarOpen(!mobileView);
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

  // Handle clicks outside the sidebar to close it on mobile
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isMobile &&
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobile, sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle navigation click on mobile
  const handleNavClick = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // If still loading auth state, show loading indicator
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  // If auth error, show error message
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
        <div className="max-w-md w-full p-6">
          <FormStatus
            type="error"
            title="Authentication Error"
            message={error}
          />
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render the dashboard layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-zinc-900">
        <div className="max-w-md w-full p-6">
          <FormStatus
            type="info"
            title="Authentication Required"
            message="Please log in to access this area."
          />
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col">
      {/* Header - pass toggleSidebar for mobile use */}
      <UserDashboardHeader toggleSidebar={toggleSidebar} />

      <div className="flex flex-1">
        {/* Overlay for mobile when sidebar is open */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600/50 backdrop-blur-sm z-20"
            aria-hidden="true"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar - positioned below header with offset based on the HEADER_HEIGHT constant */}
        <aside
          ref={sidebarRef}
          style={{
            top: HEADER_HEIGHT,
            height: `calc(100vh - ${HEADER_HEIGHT})`,
          }}
          className={cn(
            "bg-white dark:bg-zinc-800 shadow-lg fixed left-0 z-20 transition-all duration-300 overflow-hidden",
            isMobile
              ? sidebarOpen
                ? "w-64 translate-x-0"
                : "w-0 -translate-x-full"
              : sidebarOpen
              ? "w-70"
              : "w-20"
          )}
        >
          <div
            className={cn(
              "border-b border-gray-200 dark:border-zinc-700 flex items-center transition-all duration-300",
              sidebarOpen
                ? "p-4 justify-between"
                : isMobile
                ? "hidden"
                : "justify-center py-4"
            )}
          >
            {sidebarOpen && (
              <span className="font-medium text-gray-800 dark:text-white">
                Menu
              </span>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Bars3Icon className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>
          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                        isActive
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-zinc-700",
                        !sidebarOpen && "justify-center py-3"
                      )}
                      title={!sidebarOpen ? item.name : undefined}
                    >
                      <item.icon size={24} />
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main content - spacing adjusted based on HEADER_HEIGHT */}
        <main
          style={{ paddingTop: "1.5rem" }}
          className={cn(
            "flex-1 p-6 transition-all duration-300",
            isMobile ? "ml-0" : sidebarOpen ? "ml-56" : "ml-20",
            isMobile && sidebarOpen ? "pointer-events-none" : ""
          )}
        >
          <div
            className={cn(
              "mx-auto transition-all duration-300 max-w-[95%] lg:max-w-[90%]", // Increased container width here
              isMobile && sidebarOpen ? "blur-sm" : ""
            )}
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
