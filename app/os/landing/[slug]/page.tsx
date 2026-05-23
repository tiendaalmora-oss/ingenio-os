import React from "react";
import LandingHQClient from "./LandingHQClient";
import { getLandingData } from "./actions";

export default async function LandingHQPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getLandingData(resolvedParams.slug);

  return <LandingHQClient slug={resolvedParams.slug} initialData={data} />;
}
