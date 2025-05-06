// src/app/userdashboard/page.tsx

import React from "react";
import UserDashboardClientPage from "./client-page";

export const metadata = {
  title: "User Dashboard",
  description: "User dashboard main page",
};

export default function UserDashboardPage() {
  return <UserDashboardClientPage />;
}
