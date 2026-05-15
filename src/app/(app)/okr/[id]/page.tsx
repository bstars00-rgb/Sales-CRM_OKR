import { MOCK_OBJECTIVES } from "@/lib/mock/kpi";
import { ObjectiveDetailClient } from "./ObjectiveDetailClient";

export function generateStaticParams() {
  return MOCK_OBJECTIVES.map((o) => ({ id: o.id }));
}

export default async function ObjectiveDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ObjectiveDetailClient id={id} />;
}
