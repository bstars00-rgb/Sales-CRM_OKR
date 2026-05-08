import { MOCK_DEALS } from "@/lib/mock/deals";
import { DealDetailClient } from "./DealDetailClient";

export function generateStaticParams() {
  return MOCK_DEALS.map((d) => ({ id: d.id }));
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DealDetailClient id={id} />;
}
