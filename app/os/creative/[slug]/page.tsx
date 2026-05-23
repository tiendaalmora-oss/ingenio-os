import React from "react";
import CreativeHQClient from "./CreativeHQClient";
import { getCreativeData } from "./actions";

export default async function CreativeHQPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = await getCreativeData(resolvedParams.slug);

  return <CreativeHQClient slug={resolvedParams.slug} initialData={data} />;
}
