// app/userdashboard/userlisting/page.tsx

import { Metadata } from "next";
import ListingsPageClient from "./client";

export const metadata: Metadata = {
  title: "Listing Management | User Dashboard",
  description: "Manage your listings, track progress, and stay organized",
};

export default function ListingsPage() {
  return <ListingsPageClient />;
}
