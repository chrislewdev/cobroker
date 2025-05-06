// src/app/userdashboard/client-page.tsx

"use client";

import React, { useEffect } from "react";
import UserDashboardContent from "@/components/userdashboard/UserDashboardContent";
import useAuthStore from "@/stores/authStore";
import useProfileStore from "@/stores/profileStore";
import { useResetOnUnmount } from "@/hooks/useStateReset";

export default function UserDashboardClientPage() {
  const { user, resetState: authResetState } = useAuthStore();
  const {
    profile,
    fetchProfile,
    resetState: profileResetState,
  } = useProfileStore();

  // Reset both auth and profile states on component unmount
  useResetOnUnmount(authResetState.auth);
  useResetOnUnmount(profileResetState.profile);

  // If authenticated but no profile loaded, fetch it
  useEffect(() => {
    if (user && !profile) {
      // Reset profile state before fetching
      profileResetState.profile();
      fetchProfile(user.id);
    }
  }, [user, profile, fetchProfile, profileResetState]);

  return <UserDashboardContent />;
}
