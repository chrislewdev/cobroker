// src/app/userdashboard/properties/[id]/page.tsx

import React from "react";
import PropertyDetailClient from "./client-page";

export const metadata = {
  title: "Property Details | User Dashboard",
  description: "View detailed information about this property",
};

interface PropertyDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { id } = await params;
  return <PropertyDetailClient propertyId={id} />;
}
