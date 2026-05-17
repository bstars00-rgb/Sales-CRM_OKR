"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/common/ToastContext";
import { useNotificationRules, DEFAULT_RULES, type NotificationRules } from "@/lib/store/notification-rules";
import { Bell, RotateCcw, Save } from "lucide-react";

export default function NotificationSettingsPage() {
  const { rules, update, reset } = useNotificationRules();
  const toast = useToast();
  const [draft, setDraft] = useState<NotificationRules>(rules);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDraft(rules);
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dirty = JSON.stringify(draft) !== JSON.stringify(rules);

  const save = () => {
    update(draft);
    toast.success("알림 룰 저장됨", "변경사항이 즉시 적용됩니다");
  };

  const handleReset = () => {
    reset();
    setDraft(DEFAULT_RULES);
    toast.warning("기본값으로 초기화", "");
  };

  if (!hydrated) return null;

  return (
    <div className="space-y-5 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          알림 룰 설정
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          헤더 종 아이콘에 표시될 알림의 발생 조건을 사용자가 직접 정의합니다.
        </p>
      </div>

      {/* 토글 그룹 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">알림 종류별 ON/OFF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="🌙 미접촉 KEY/GROWTH 고객사"
            description="장기 미접촉 시 우선 처리 알림"
            checked={draft.enableDormant}
            onChange={(v) => setDraft({ ...draft, enableDormant: v })}
          />
          <ToggleRow
            label="⏱ 정체된 OPEN 딜"
            description="단계 평균보다 오래 머문 딜 알림"
            checked={draft.enableStaleDeal}
            onChange={(v) => setDraft({ ...draft, enableStaleDeal: v })}
          />
          <ToggleRow
            label="🔁 갱신 임박 계약"
            description="자동 갱신 아닌 계약이 만료 임박 시"
            checked={draft.enableRenewal}
            onChange={(v) => setDraft({ ...draft, enableRenewal: v })}
          />
          <ToggleRow
            label="🔴 지연된 태스크"
            description="마감일을 넘긴 태스크"
            checked={draft.enableOverdueTask}
            onChange={(v) => setDraft({ ...draft, enableOverdueTask: v })}
          />
          <hr className="border-border" />
          <ToggleRow
            label="🍞 Toast 자동 표시"
            description="활동/딜 변경 시 화면 우하단 Toast"
            checked={draft.toastOnEvent}
            onChange={(v) => setDraft({ ...draft, toastOnEvent: v })}
          />
        </CardContent>
      </Card>

      {/* 임계값 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">임계값 (일수)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ThresholdRow
            label="미접촉 알림 임계일"
            description="이 일수 이상 활동 없는 고객사 → 알림"
            value={draft.dormantDays}
            onChange={(v) => setDraft({ ...draft, dormantDays: v })}
            disabled={!draft.enableDormant}
            min={7}
            max={180}
            suffix="일"
          />
          <ThresholdRow
            label="딜 정체 임계일"
            description="이 일수 이상 같은 단계에 머문 딜 → 알림"
            value={draft.staleDealDays}
            onChange={(v) => setDraft({ ...draft, staleDealDays: v })}
            disabled={!draft.enableStaleDeal}
            min={3}
            max={90}
            suffix="일"
          />
          <ThresholdRow
            label="갱신 임박 임계일"
            description="이 일수 이내 만료되는 계약 → 알림"
            value={draft.renewalWarnDays}
            onChange={(v) => setDraft({ ...draft, renewalWarnDays: v })}
            disabled={!draft.enableRenewal}
            min={7}
            max={180}
            suffix="일"
          />
        </CardContent>
      </Card>

      {/* 저장/초기화 */}
      <div className="flex items-center gap-2 sticky bottom-4 bg-card border rounded-md p-3 shadow-md">
        <div className="text-xs text-muted-foreground flex-1">
          {dirty ? "⚠ 저장하지 않은 변경사항이 있습니다" : "변경사항 없음"}
        </div>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />기본값
        </Button>
        <Button size="sm" onClick={save} disabled={!dirty}>
          <Save className="h-4 w-4" />저장
        </Button>
      </div>

      <Card className="bg-muted/30">
        <CardContent className="p-4 text-xs text-muted-foreground space-y-1">
          <div>💡 설정은 브라우저 로컬에 저장되며 이 기기에서만 적용됩니다.</div>
          <div>💡 ELLIS 연동 시 사용자별 서버 저장으로 마이그레이션 예정.</div>
        </CardContent>
      </Card>
    </div>
  );
}

function ToggleRow({
  label, description, checked, onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 rounded border-input"
      />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
    </label>
  );
}

function ThresholdRow({
  label, description, value, onChange, disabled, min, max, suffix,
}: {
  label: string;
  description: string;
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div className={disabled ? "opacity-50" : ""}>
      <div className="flex justify-between items-baseline mb-1">
        <label className="text-sm font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            value={value}
            min={min}
            max={max}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) onChange(Math.max(min, Math.min(max, n)));
            }}
            disabled={disabled}
            className="h-8 w-20 text-right tabular-nums"
          />
          <span className="text-xs text-muted-foreground">{suffix}</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full mt-2 accent-primary"
      />
    </div>
  );
}
