import React from "react";
import ProductHQClient from "./ProductHQClient";
import { getProductData } from "./actions";

export default async function ProductHQPage({ params }: { params: Promise<{ slug: string }> }) {
  // Await the params Promise object correctly as required in Next.js 15
  const resolvedParams = await params;
  const data = await getProductData(resolvedParams.slug);

  return <ProductHQClient slug={resolvedParams.slug} initialData={data} />;
}
