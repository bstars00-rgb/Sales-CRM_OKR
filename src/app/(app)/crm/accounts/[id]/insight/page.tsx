import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { CustomerInsightClient } from "./CustomerInsightClient";

export function generateStaticParams() {
  return MOCK_ACCOUNTS.map((a) => ({ id: a.id }));
}

export default async function CustomerInsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerInsightClient id={id} />;
}
