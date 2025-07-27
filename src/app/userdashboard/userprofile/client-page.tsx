// src/app/userdashboard/userprofile/client-page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  InstagramIcon,
  XIcon,
  TikTokIcon,
  XiaohongshuIcon,
} from "@/components/ui_blocks/SocialIcons";
import EditPersonalInfo from "@/components/userprofile/EditPersonalInfo";
import EditAddress from "@/components/userprofile/EditAddress";
import useAuthStore from "@/stores/authStore";
import useProfileStore from "@/stores/profileStore";
import { useResetOnUnmount } from "@/hooks/useStateReset";
import { User } from "@/stores/authStore";

interface ProfilePendingUpdate {
  section: "personal" | "address";
  data: Partial<User>;
}

function EditIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

export default function DashboardClientPage() {
  const { user } = useAuthStore();
  const { profile, profileState, fetchProfile, updateProfile, resetState } =
    useProfileStore();

  const {
    loading: profileLoading,
    error: profileError,
    success: profileSuccess,
  } = profileState;

  const [editingPersonalInfo, setEditingPersonalInfo] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);

  // State used during saving process to prevent UI flashes
  const [pendingUpdates, setPendingUpdates] =
    useState<ProfilePendingUpdate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset profile state on component unmount
  useResetOnUnmount(resetState.profile);

  // Fetch profile if not already loaded
  useEffect(() => {
    if (user && !profile) {
      // Reset profile state before fetching to ensure clean slate
      resetState.profile();
      fetchProfile(user.id);
    }
  }, [user, profile, fetchProfile, resetState]);

  // Handle success state - apply to both personal info and address
  useEffect(() => {
    if (profileSuccess && isSaving) {
      // Close edit forms after success on save
      const timer = setTimeout(() => {
        setEditingPersonalInfo(false);
        setEditingAddress(false);
        setIsSaving(false);
        setPendingUpdates(null);

        // Reset success state
        resetState.profile({ preserve: true });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [profileSuccess, isSaving, resetState]);

  // Unified handler for profile updates
  const handleProfileUpdate = async (
    section: "personal" | "address",
    data: Partial<User>
  ) => {
    try {
      // Set saving state to true to track the process of saving
      setIsSaving(true);

      // Store and display pending updates to user (optimistic UI update)
      setPendingUpdates({ section, data });

      // Reset profile state before updating
      resetState.profile();

      // Perform the update
      await updateProfile(data);
    } catch (error) {
      console.error(`Error updating ${section}:`, error);
      // Stop saving if error
      setIsSaving(false);
      setPendingUpdates(null);
    }
  };

  // Handle personal info update with the unified handler
  const handlePersonalInfoUpdate = async (data: Partial<User>) => {
    await handleProfileUpdate("personal", data);
  };

  // Handle address update with the unified handler
  const handleAddressUpdate = async (data: Partial<User>) => {
    await handleProfileUpdate("address", data);
  };

  // If profile is loading, show loading state
  if (profileLoading && !profile && !isSaving) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-2">Loading profile data...</span>
      </div>
    );
  }

  // Error loading the profile
  if (profileError && !isSaving) {
    return (
      <div className="flex justify-center p-8 text-red-500">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md max-w-md">
          <p className="font-semibold">Error loading profile</p>
          <p>{profileError}</p>
        </div>
      </div>
    );
  }

  // If no profile, show error (not during saving process)
  if (!profile && !isSaving) {
    return (
      <div className="flex justify-center p-8">
        <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 px-4 py-3 rounded-md max-w-md">
          <p>No profile data available. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Create a merged user object that includes both profile and pending updates, show the user the values they currently editing
  const currentUser = profile
    ? {
        ...profile,
        // Apply pending personal updates if available
        ...(pendingUpdates && pendingUpdates.section === "personal"
          ? pendingUpdates.data
          : {}),
        // Apply pending address updates if available
        ...(pendingUpdates && pendingUpdates.section === "address"
          ? pendingUpdates.data
          : {}),
      }
    : null;

  // Safety check
  if (!currentUser) {
    return <div>Loading profile...</div>;
  }

  function ProfileCard() {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6 mb-6">
        {/* Profile card content */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
          <div className="flex flex-col md:flex-row items-center mb-4 md:mb-0">
            <div className="relative overflow-hidden rounded-full w-20 h-20 mb-4 md:mb-0 md:mr-4 border-4 border-white dark:border-zinc-600 shadow">
              <Image
                src={currentUser.profilePic || "/images/photos/profile-pic.jpg"}
                alt="Profile picture"
                width={80}
                height={80}
                className="object-cover"
                priority
              />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {currentUser.firstName} {currentUser.lastName}
              </h3>
              <p className="text-blue-600 dark:text-blue-400">
                {currentUser.title || "Team Manager"}
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {currentUser.location || "Arizona, United States"}
              </p>
            </div>
          </div>

          {/* Social icons section */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link href="#" className="hover:opacity-80">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <InstagramIcon className="h-4 w-4 fill-current" />
              </div>
            </Link>
            <Link href="#" className="hover:opacity-80">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <XIcon className="h-4 w-4 fill-current" />
              </div>
            </Link>
            <Link href="#" className="hover:opacity-80">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <TikTokIcon className="h-4 w-4 fill-current" />
              </div>
            </Link>
            <Link href="#" className="hover:opacity-80">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <XiaohongshuIcon className="h-4 w-4 fill-current" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function PersonalInformation() {
    if (editingPersonalInfo) {
      return (
        <EditPersonalInfo
          profileData={{
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            phone: currentUser.phone || "",
            bio: currentUser.bio || "",
          }}
          onCancel={() => {
            setEditingPersonalInfo(false);
            setIsSaving(false);
            setPendingUpdates(null);
            resetState.profile({ preserve: true });
          }}
          onSubmit={handlePersonalInfoUpdate}
          isLoading={profileLoading || isSaving}
          isError={!!profileError}
          errorMessage={profileError || ""}
          isSuccess={profileSuccess}
        />
      );
    }

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Personal Information
          </h2>

          <button
            className="ml-2 px-3 py-1 text-sm rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1"
            onClick={() => {
              // Reset state before opening edit form
              resetState.profile();
              setEditingPersonalInfo(true);
            }}
            disabled={profileLoading || isSaving}
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              First Name
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.firstName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Last Name
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Email address
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Phone
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.phone || "+09 343 398 45"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Bio</p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.bio || "Team Manager"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  function Address() {
    if (editingAddress) {
      return (
        <EditAddress
          addressData={{
            country: currentUser.country || "",
            cityState: currentUser.cityState || "",
            postalCode: currentUser.postalCode || "",
            taxId: currentUser.taxId || "",
          }}
          onCancel={() => {
            setEditingAddress(false);
            setIsSaving(false);
            setPendingUpdates(null);
            resetState.profile({ preserve: true });
          }}
          onSubmit={handleAddressUpdate}
          isLoading={profileLoading || isSaving}
          isError={!!profileError}
          errorMessage={profileError || ""}
          isSuccess={profileSuccess}
        />
      );
    }

    return (
      <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            Address
          </h2>

          <button
            className="ml-2 px-3 py-1 text-sm rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1"
            onClick={() => {
              // Reset state before opening edit form
              resetState.profile();
              setEditingAddress(true);
            }}
            disabled={profileLoading || isSaving}
          >
            <EditIcon className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Country
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.country || "United States"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              City/State
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.cityState || "Arizona, United States."}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Postal Code
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.postalCode || "ERT 2489"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              TAX ID
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {currentUser.taxId || "AS4568384"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main profile header outside of cards */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Profile
            </h1>
          </div>

          {/* Wrapper box containing all profile components */}
          <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-gray-200 dark:border-zinc-700 shadow-sm p-6">
            <div className="space-y-6">
              <ProfileCard />
              <PersonalInformation />
              <Address />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
