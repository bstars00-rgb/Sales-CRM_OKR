"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/common/ToastContext";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils/format";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";

interface IncentiveRule {
  id: string;
  kpiCode: string;
  appliesToRole: "MEMBER" | "MANAGER" | "DIRECTOR" | "ALL";
  thresholdPct: number;
  ratePerUnit: number;
  capAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

const KPI_OPTIONS = [
  { code: "REVENUE",      label: "거래액 (REVENUE)" },
  { code: "GP",           label: "GP" },
  { code: "NEW_ACCOUNTS", label: "신규 활성 고객사" },
  { code: "MEETINGS",     label: "미팅 수" },
  { code: "PROPOSALS",    label: "제안서 발송 수" },
  { code: "CONTRACTS",    label: "계약 건수" },
];

const SEED_RULES: IncentiveRule[] = [
  { id: "r1", kpiCode: "REVENUE",      appliesToRole: "MEMBER",  thresholdPct: 80, ratePerUnit: 30_000,  capAmount: 15_000_000, effectiveFrom: "2026-01-01" },
  { id: "r2", kpiCode: "GP",           appliesToRole: "MEMBER",  thresholdPct: 80, ratePerUnit: 30_000,  capAmount: 15_000_000, effectiveFrom: "2026-01-01" },
  { id: "r3", kpiCode: "NEW_ACCOUNTS", appliesToRole: "MEMBER",  thresholdPct: 80, ratePerUnit: 30_000,                         effectiveFrom: "2026-01-01" },
  { id: "r4", kpiCode: "REVENUE",      appliesToRole: "MANAGER", thresholdPct: 75, ratePerUnit: 50_000,  capAmount: 25_000_000, effectiveFrom: "2026-01-01" },
];

export default function IncentiveRulesPage() {
  const toast = useToast();
  const [rules, setRules] = useState<IncentiveRule[]>(SEED_RULES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<IncentiveRule>>({});

  const startEdit = (rule: IncentiveRule) => {
    setEditingId(rule.id);
    setDraft(rule);
  };

  const startNew = () => {
    setEditingId("new");
    setDraft({
      kpiCode: "REVENUE",
      appliesToRole: "MEMBER",
      thresholdPct: 80,
      ratePerUnit: 30_000,
      effectiveFrom: new Date().toISOString().split("T")[0],
    });
  };

  const save = () => {
    if (!draft.kpiCode || !draft.appliesToRole) return;
    if (editingId === "new") {
      setRules((prev) => [...prev, { ...(draft as IncentiveRule), id: `r-${Date.now()}` }]);
      toast.success("인센티브 룰 추가됨");
    } else {
      setRules((prev) => prev.map((r) => (r.id === editingId ? { ...(draft as IncentiveRule) } : r)));
      toast.success("인센티브 룰 수정됨");
    }
    setEditingId(null);
    setDraft({});
  };

  const remove = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    toast.warning("인센티브 룰 삭제됨");
  };

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/kpi" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />KPI
        </Link>
        <span>/</span>
        <span className="text-foreground">인센티브 룰</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">인센티브 룰 편집</h1>
          <p className="text-sm text-muted-foreground mt-1">
            LEAD+ 권한. 룰 변경은 effective_from 이후의 정산부터 반영됩니다.
          </p>
        </div>
        <Button size="sm" onClick={startNew} disabled={editingId !== null}>
          <Plus className="h-4 w-4" />새 룰
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">선형 인센티브 공식</CardTitle></CardHeader>
        <CardContent>
          <code className="text-sm bg-muted px-3 py-2 rounded block">
            인센티브 = max(0, 달성률% − 임계치%) × 단가
          </code>
          <p className="text-xs text-muted-foreground mt-2">
            구간/누진 룰은 v2에서 지원. 지금은 KPI당 선형 1개 룰만 허용.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {rules.map((rule) => (
          <Card key={rule.id} className={editingId === rule.id ? "border-primary" : ""}>
            <CardContent className="p-4">
              {editingId === rule.id ? (
                <EditForm
                  draft={draft}
                  onChange={setDraft}
                  onSave={save}
                  onCancel={() => { setEditingId(null); setDraft({}); }}
                />
              ) : (
                <RuleRow
                  rule={rule}
                  onEdit={() => startEdit(rule)}
                  onRemove={() => remove(rule.id)}
                />
              )}
            </CardContent>
          </Card>
        ))}
        {editingId === "new" && (
          <Card className="border-primary">
            <CardContent className="p-4">
              <EditForm
                draft={draft}
                onChange={setDraft}
                onSave={save}
                onCancel={() => { setEditingId(null); setDraft({}); }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function RuleRow({
  rule, onEdit, onRemove,
}: { rule: IncentiveRule; onEdit: () => void; onRemove: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Badge variant="default">{rule.kpiCode}</Badge>
        <Badge variant="muted">{rule.appliesToRole}</Badge>
        <div className="text-sm">
          임계치 <span className="font-medium">{rule.thresholdPct}%</span> 초과부터,
          {" "}1%p당 <span className="font-medium">{formatCurrency(rule.ratePerUnit)}</span>
          {rule.capAmount && <> (상한 <span className="font-medium">{formatCurrency(rule.capAmount)}</span>)</>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>편집</Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onRemove} aria-label="삭제">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EditForm({
  draft, onChange, onSave, onCancel,
}: {
  draft: Partial<IncentiveRule>;
  onChange: (d: Partial<IncentiveRule>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const canSave =
    draft.kpiCode && draft.appliesToRole &&
    typeof draft.thresholdPct === "number" &&
    typeof draft.ratePerUnit === "number" &&
    draft.effectiveFrom;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>KPI</Label>
          <Select value={draft.kpiCode} onValueChange={(v) => onChange({ ...draft, kpiCode: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {KPI_OPTIONS.map((k) => <SelectItem key={k.code} value={k.code}>{k.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>적용 역할</Label>
          <Select
            value={draft.appliesToRole}
            onValueChange={(v) => onChange({ ...draft, appliesToRole: v as IncentiveRule["appliesToRole"] })}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="MEMBER">팀원</SelectItem>
              <SelectItem value="MANAGER">매니저</SelectItem>
              <SelectItem value="DIRECTOR">디렉터</SelectItem>
              <SelectItem value="ALL">전체</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>임계 달성률 (%)</Label>
          <Input
            type="number" min={0} max={200}
            value={draft.thresholdPct ?? ""}
            onChange={(e) => onChange({ ...draft, thresholdPct: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>1%p당 단가 (KRW)</Label>
          <Input
            type="number" min={0}
            value={draft.ratePerUnit ?? ""}
            onChange={(e) => onChange({ ...draft, ratePerUnit: Number(e.target.value) })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>상한 (선택)</Label>
          <Input
            type="number" min={0}
            value={draft.capAmount ?? ""}
            onChange={(e) => onChange({ ...draft, capAmount: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>효력 시작일</Label>
          <Input
            type="date"
            value={draft.effectiveFrom ?? ""}
            onChange={(e) => onChange({ ...draft, effectiveFrom: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label>효력 종료일 (선택)</Label>
          <Input
            type="date"
            value={draft.effectiveTo ?? ""}
            onChange={(e) => onChange({ ...draft, effectiveTo: e.target.value || undefined })}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={onCancel}>취소</Button>
        <Button size="sm" onClick={onSave} disabled={!canSave}>
          <Save className="h-4 w-4" />저장
        </Button>
      </div>
    </div>
  );
}
