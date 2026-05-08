"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/common/ToastContext";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

interface KrDraft {
  id: number;
  title: string;
  metricKind: "NUMBER" | "CURRENCY" | "PERCENT" | "BOOLEAN";
  targetValue: string;
  unit: string;
}

export default function NewObjectivePage() {
  const router = useRouter();
  const toast = useToast();
  const [ownerKind, setOwnerKind] = useState<"COMPANY" | "TEAM" | "USER">("USER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [period, setPeriod] = useState("2026-Q2");
  const [krs, setKrs] = useState<KrDraft[]>([
    { id: 1, title: "", metricKind: "NUMBER", targetValue: "", unit: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const addKr = () => {
    setKrs((prev) => [
      ...prev,
      { id: Date.now(), title: "", metricKind: "NUMBER", targetValue: "", unit: "" },
    ]);
  };

  const updateKr = (id: number, patch: Partial<KrDraft>) => {
    setKrs((prev) => prev.map((kr) => (kr.id === id ? { ...kr, ...patch } : kr)));
  };

  const removeKr = (id: number) => {
    setKrs((prev) => prev.filter((kr) => kr.id !== id));
  };

  const validKrs = krs.filter((kr) => kr.title.length > 0 && kr.targetValue.length > 0);
  const canSubmit = title.length > 0 && validKrs.length >= 1 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      toast.success(
        "Objective 생성 완료",
        `${title} · KR ${validKrs.length}개 · ${period}`
      );
      router.push("/okr");
    }, 400);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/okr" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />OKR
        </Link>
        <span>/</span>
        <span className="text-foreground">새 Objective</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">새 Objective</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader><CardTitle>Objective</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="소유 단위" required>
                <Select value={ownerKind} onValueChange={(v) => setOwnerKind(v as typeof ownerKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPANY">회사</SelectItem>
                    <SelectItem value="TEAM">팀</SelectItem>
                    <SelectItem value="USER">개인 (나)</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="기간" required>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026-Q1">2026 Q1</SelectItem>
                    <SelectItem value="2026-Q2">2026 Q2</SelectItem>
                    <SelectItem value="2026-Q3">2026 Q3</SelectItem>
                    <SelectItem value="2026-Q4">2026 Q4</SelectItem>
                    <SelectItem value="2026-YEAR">2026 연간</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="제목 (Objective)" required>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 핵심 5개국에서 거래액 +35%, GP율 16% 유지"
                required
              />
            </Field>

            <Field label="설명">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="이 Objective의 배경, 의미, 핵심 가정"
                rows={3}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Key Results ({validKrs.length}/{krs.length})</span>
              <Button type="button" variant="outline" size="sm" onClick={addKr}>
                <Plus className="h-4 w-4" />KR 추가
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {krs.map((kr, idx) => (
              <div key={kr.id} className="rounded-lg border p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">KR{idx + 1}</span>
                  {krs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeKr(kr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <Input
                  value={kr.title}
                  onChange={(e) => updateKr(kr.id, { title: e.target.value })}
                  placeholder="KR 제목 (예: 연간 거래액 ₩42B → ₩57B)"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={kr.metricKind}
                    onValueChange={(v) => updateKr(kr.id, { metricKind: v as KrDraft["metricKind"] })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUMBER">건수</SelectItem>
                      <SelectItem value="CURRENCY">금액</SelectItem>
                      <SelectItem value="PERCENT">비율 %</SelectItem>
                      <SelectItem value="BOOLEAN">완료/미완료</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={kr.targetValue}
                    onChange={(e) => updateKr(kr.id, { targetValue: e.target.value })}
                    placeholder="목표값"
                  />
                  <Input
                    value={kr.unit}
                    onChange={(e) => updateKr(kr.id, { unit: e.target.value })}
                    placeholder="단위 (KRW, 건...)"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/okr")}>
            취소
          </Button>
          <Button type="submit" disabled={!canSubmit}>
            {submitting ? "저장 중..." : "Objective 생성"}
          </Button>
        </div>
      </form>
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
