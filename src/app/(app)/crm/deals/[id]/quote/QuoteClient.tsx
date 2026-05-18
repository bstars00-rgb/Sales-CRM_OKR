"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PrintButton } from "@/components/common/PrintButton";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_CONTACTS } from "@/lib/mock/contacts";
import { getDefaultCommission } from "@/lib/hotel/metrics";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface LineItem {
  description: string;
  qty: number;
  unit: string;
  unitPrice: number;
}

export function QuoteClient({ id }: { id: string }) {
  const deal = MOCK_DEALS.find((d) => d.id === id);
  if (!deal) notFound();

  const account = MOCK_ACCOUNTS.find((a) => a.id === deal.accountId);
  const primaryContact = MOCK_CONTACTS.find((c) => c.accountId === deal.accountId && c.isPrimary)
    ?? MOCK_CONTACTS.find((c) => c.accountId === deal.accountId);

  // 견적 라인 — Deal type에 따라 합리적 기본값 생성
  const defaultLines = generateDefaultLines(deal);
  const [lines, setLines] = useState<LineItem[]>(defaultLines);
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState<string>(
    "본 견적은 발행일로부터 30일간 유효합니다.\n계약 체결 시 별도 서면 약정 우선합니다.",
  );

  const subtotal = lines.reduce((s, l) => s + l.qty * l.unitPrice, 0);
  const commissionRate = getDefaultCommission(account?.segment ?? "");
  const commission = Math.round(subtotal * commissionRate);
  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  const today = new Date().toISOString().split("T")[0];
  const quoteNo = `Q-${id.toUpperCase()}-${today.replace(/-/g, "").slice(2)}`;

  const updateLine = (idx: number, patch: Partial<LineItem>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const addLine = () => {
    setLines((prev) => [...prev, { description: "", qty: 1, unit: "건", unitPrice: 0 }]);
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* 상단 액션 (인쇄 시 숨김) */}
      <div className="no-print flex items-center justify-between flex-wrap gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/crm/deals/${id}`}><ArrowLeft className="h-4 w-4" />딜로 돌아가기</Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={addLine}>+ 라인 추가</Button>
          <PrintButton label="견적서 PDF 저장 / 인쇄" />
        </div>
      </div>

      {/* 견적서 본문 */}
      <div className="bg-card border rounded-lg p-8 print:p-6 print:border-0 print:shadow-none space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">견적서 / Quotation</h1>
            <div className="text-xs text-muted-foreground mt-1">
              번호: <span className="font-mono">{quoteNo}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Sales CRM Co.</div>
            <div className="text-xs text-muted-foreground">서울특별시 강남구 · contact@example.com</div>
            <div className="text-xs text-muted-foreground">사업자등록: XXX-XX-XXXXX</div>
          </div>
        </div>

        {/* Customer + Validity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box title="고객사 / To">
            <div className="font-medium">{account?.name ?? deal.accountName}</div>
            <div className="text-xs text-muted-foreground">{account?.countryName} · {account?.city}</div>
            {primaryContact && (
              <div className="text-xs mt-1">
                담당: {primaryContact.firstName}{primaryContact.lastName ? ` ${primaryContact.lastName}` : ""}
                {primaryContact.title && ` (${primaryContact.title})`}
              </div>
            )}
            {primaryContact?.email && <div className="text-xs">{primaryContact.email}</div>}
          </Box>
          <Box title="유효 기간 / Validity">
            <div className="text-xs">발행일: <b className="tabular-nums">{today}</b></div>
            <div className="text-xs">유효 기간:
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="inline-block w-36 h-7 text-xs ml-1 no-print"
              />
              <span className="hidden print:inline tabular-nums ml-1">{validUntil}</span>
            </div>
            <div className="text-xs mt-1">담당 영업: <b>{deal.ownerName}</b></div>
            <div className="text-xs">딜 ID: <span className="font-mono">{deal.id}</span></div>
          </Box>
        </div>

        {/* Subject */}
        <Box title="제목 / Subject">
          <div className="font-medium">{deal.name}</div>
          <div className="text-xs text-muted-foreground mt-1">유형: {deal.dealType.replace("_", " ")}</div>
        </Box>

        {/* Lines */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">상세 / Line Items</div>
          <table className="w-full text-sm border-t border-b">
            <thead>
              <tr className="text-left text-xs text-muted-foreground border-b">
                <th className="py-2 px-2 w-8">#</th>
                <th className="py-2 px-2">설명</th>
                <th className="py-2 px-2 text-right w-20">수량</th>
                <th className="py-2 px-2 w-16">단위</th>
                <th className="py-2 px-2 text-right w-32">단가</th>
                <th className="py-2 px-2 text-right w-32">금액</th>
                <th className="py-2 px-2 w-8 no-print"></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l, i) => (
                <tr key={i} className="border-b last:border-0 align-top">
                  <td className="py-2 px-2 text-muted-foreground tabular-nums">{i + 1}</td>
                  <td className="py-2 px-2">
                    <Input
                      value={l.description}
                      onChange={(e) => updateLine(i, { description: e.target.value })}
                      className="h-8 text-sm no-print"
                    />
                    <span className="hidden print:inline text-sm">{l.description}</span>
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      value={l.qty}
                      onChange={(e) => updateLine(i, { qty: Number(e.target.value) })}
                      className="h-8 text-sm text-right no-print"
                    />
                    <span className="hidden print:inline text-sm tabular-nums">{l.qty}</span>
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      value={l.unit}
                      onChange={(e) => updateLine(i, { unit: e.target.value })}
                      className="h-8 text-sm no-print"
                    />
                    <span className="hidden print:inline text-sm">{l.unit}</span>
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      value={l.unitPrice}
                      onChange={(e) => updateLine(i, { unitPrice: Number(e.target.value) })}
                      className="h-8 text-sm text-right no-print"
                    />
                    <span className="hidden print:inline text-sm tabular-nums">{formatCurrency(l.unitPrice)}</span>
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums font-medium">
                    {formatCurrency(l.qty * l.unitPrice)}
                  </td>
                  <td className="py-2 px-2 no-print">
                    {lines.length > 1 && (
                      <button
                        onClick={() => removeLine(i)}
                        aria-label="삭제"
                        className="text-destructive hover:opacity-70 text-sm"
                      >
                        ✕
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">소계 / Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT (10%)</span>
              <span className="tabular-nums">{formatCurrency(vat)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t font-bold">
              <span>총액 / Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>예상 수수료 ({(commissionRate * 100).toFixed(0)}%)</span>
              <span className="tabular-nums">{formatCurrency(commission)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <Box title="비고 / Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full min-h-[80px] rounded border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-y no-print"
          />
          <div className="hidden print:block text-sm whitespace-pre-wrap">{notes}</div>
        </Box>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-12 print:pt-16">
          <SignatureLine label="고객사 서명" sub={account?.name} />
          <SignatureLine label="발행사 서명" sub="Sales CRM Co." />
        </div>
      </div>
    </div>
  );
}

function Box({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">{title}</div>
      <div>{children}</div>
    </div>
  );
}

function SignatureLine({ label, sub }: { label: string; sub?: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-8">{label}</div>
      <div className="border-t border-foreground/40" />
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function generateDefaultLines(deal: { dealType: string; amount: number; name: string }): LineItem[] {
  const amt = deal.amount;
  switch (deal.dealType) {
    case "HOTEL_SUPPLY":
      return [
        { description: `객실 공급 — ${deal.name}`, qty: 100, unit: "RN", unitPrice: Math.round(amt / 100) },
      ];
    case "TICKET_SUPPLY":
      return [
        { description: `항공권/패키지 공급 — ${deal.name}`, qty: 50, unit: "건", unitPrice: Math.round(amt / 50) },
      ];
    case "API_INTEGRATION":
      return [
        { description: "API 연동 셋업 / 라이선스", qty: 1, unit: "건", unitPrice: Math.round(amt * 0.4) },
        { description: "월간 트랜잭션 수수료 (12M)", qty: 12, unit: "월", unitPrice: Math.round((amt * 0.6) / 12) },
      ];
    case "RENEWAL":
      return [
        { description: `갱신 — ${deal.name} (연간)`, qty: 1, unit: "년", unitPrice: amt },
      ];
    case "UPSELL":
      return [
        { description: `Upsell — ${deal.name}`, qty: 1, unit: "건", unitPrice: amt },
      ];
    case "CO_PROMOTION":
      return [
        { description: `공동 프로모션 — ${deal.name}`, qty: 1, unit: "캠페인", unitPrice: amt },
      ];
    default:
      return [
        { description: deal.name, qty: 1, unit: "건", unitPrice: amt },
      ];
  }
}
