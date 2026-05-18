import { MOCK_DEALS } from "@/lib/mock/deals";
import { QuoteClient } from "./QuoteClient";

export function generateStaticParams() {
  return MOCK_DEALS.map((d) => ({ id: d.id }));
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QuoteClient id={id} />;
}
