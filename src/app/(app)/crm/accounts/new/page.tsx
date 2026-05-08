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
import { ArrowLeft } from "lucide-react";

const SEGMENTS = [
  { value: "OTA", label: "OTA" },
  { value: "TRAVEL_AGENCY", label: "여행사" },
  { value: "WHOLESALER", label: "홀세일러" },
  { value: "DMC", label: "DMC" },
  { value: "API_PARTNER", label: "API 파트너" },
  { value: "OFFLINE_AGENT", label: "오프라인 에이전트" },
  { value: "HOTEL", label: "호텔" },
];

const COUNTRIES = [
  { code: "KR", name: "🇰🇷 대한민국" }, { code: "JP", name: "🇯🇵 일본" },
  { code: "VN", name: "🇻🇳 베트남" },   { code: "TH", name: "🇹🇭 태국" },
  { code: "CN", name: "🇨🇳 중국" },     { code: "ID", name: "🇮🇩 인도네시아" },
  { code: "PH", name: "🇵🇭 필리핀" },   { code: "SG", name: "🇸🇬 싱가포르" },
  { code: "TW", name: "🇹🇼 대만" },     { code: "HK", name: "🇭🇰 홍콩" },
];

const GROWTH = [
  { value: "HIGH", label: "높음" }, { value: "MID", label: "중간" }, { value: "LOW", label: "낮음" },
];

export default function NewAccountPage() {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [growth, setGrowth] = useState("MID");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.length > 0 && segment.length > 0 && country.length > 0 && !submitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      toast.success("고객사 생성 완료", `${name} (${segment}, ${country})`);
      router.push("/crm/accounts");
    }, 400);
  };

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/crm/accounts" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />고객사
        </Link>
        <span>/</span>
        <span className="text-foreground">새 고객사</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight">새 고객사 등록</h1>

      <Card>
        <CardHeader><CardTitle>기본 정보</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="고객사명" required>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ABC Travel Holdings"
                required
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="타입" required>
                <Select value={segment} onValueChange={setSegment}>
                  <SelectTrigger><SelectValue placeholder="선택..." /></SelectTrigger>
                  <SelectContent>
                    {SEGMENTS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="국가" required>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger><SelectValue placeholder="선택..." /></SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="도시">
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="호치민" />
              </Field>

              <Field label="성장 가능성">
                <Select value={growth} onValueChange={setGrowth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GROWTH.map((g) => (
                      <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="웹사이트">
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." type="url" />
            </Field>

            <Field label="비고">
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="고객사 배경, 첫 컨택 경위 등"
                rows={3}
              />
            </Field>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.push("/crm/accounts")}>
                취소
              </Button>
              <Button type="submit" disabled={!canSubmit}>
                {submitting ? "저장 중..." : "고객사 생성"}
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
