"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/common/ToastContext";
import { MOCK_ACCOUNTS } from "@/lib/mock/accounts";
import { MOCK_STAGES } from "@/lib/mock/deals";
import { ArrowLeft } from "lucide-react";

const DEAL_TYPES = [
  { value: "NEW", label: "신규" },
  { value: "RENEWAL", label: "Renewal" },
  { value: "UPSELL", label: "Upsell" },
  { value: "API_INTEGRATION", label: "API 연동" },
  { value: "HOTEL_SUPPLY", label: "호텔 공급" },
  { value: "TICKET_SUPPLY", label: "티켓 공급" },
  { value: "CO_PROMOTION", label: "공동 프로모션" },
];

export default function NewDealPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [accountId, setAccountId] = useState("");
  const [dealType, setDealType] = useState("NEW");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("KRW");
  const [stageId, setStageId] = useState("stg-1");
  const [closeDate, setCloseDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const openStages = MOCK_STAGES.filter((s) => s.stageKind === "OPEN");
  const canSubmit = name.length > 0 && accountId.length > 0 && amount.length > 0 && closeDate.length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      const account = MOCK_ACCOUNTS.find((a) => a.id === accountId);
      toast.success("딜 생성 완료", `${name} · ${account?.name} · ${currency} ${amount}`);
      router.push("/crm/deals/kanban");
    }, 400);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/crm/deals/kanban" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />칸반
        </Link>
        <span>/</span>
        <span className="text-foreground">새 딜</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">새 딜 등록</h1>

      <Card>
        <CardHeader><CardTitle>거래 정보</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="딜명" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ABC Travel Q4 객실 공급"
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="고객사" required>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger><SelectValue placeholder="고객사 선택..." /></SelectTrigger>
                  <SelectContent>
                    {MOCK_ACCOUNTS.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="딜 타입" required>
                <Select value={dealType} onValueChange={setDealType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEAL_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="예상 거래액" required>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100000000"
                  required
                  min={0}
                  className="col-span-2"
                />
              </Field>

              <Field label="통화">
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KRW">KRW</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="단계" required>
                <Select value={stageId} onValueChange={setStageId}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {openStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="클로징 예정일" required>
              <Input
                type="date"
                value={closeDate}
                onChange={(e) => setCloseDate(e.target.value)}
                required
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/crm/deals/kanban")}>
                취소
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {submitting ? "저장 중..." : "딜 생성"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
}
