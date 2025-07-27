// src/app/userdashboard/properties/[id]/page.tsx

import React from "react";
import PropertyDetailClient from "./client-page";

export const metadata = {
  title: "Property Details | User Dashboard",
  description: "View detailed information about this property",
};

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

export default function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  return <PropertyDetailClient propertyId={params.id} />;
}
