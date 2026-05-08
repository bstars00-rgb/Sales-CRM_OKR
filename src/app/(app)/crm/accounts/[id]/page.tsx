import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { AccountDetailClient } from "./AccountDetailClient";

export function generateStaticParams() {
  return MOCK_ACCOUNTS.map((a) => ({ id: a.id }));
}

export default async function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AccountDetailClient id={id} />;
}
