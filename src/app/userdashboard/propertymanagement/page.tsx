// src/app/userdashboard/propertymanagement/page.tsx

import { Metadata } from "next";
import PropertyManagementClient from "./client";

export const metadata: Metadata = {
  title: "Property Management | User Dashboard",
  description:
    "Manage your property listings, track performance, and stay organized",
};

export default function PropertyManagementPage() {
  return <PropertyManagementClient />;
}
