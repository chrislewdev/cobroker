// app/userdashboard/userprofile/page.tsx

import React from "react";
import DashboardClientPage from "./client-page";

export const metadata = {
  title: "User Dashboard",
  description: "View and edit your profile information",
};

export default function DashboardPage() {
  return <DashboardClientPage />;
}
