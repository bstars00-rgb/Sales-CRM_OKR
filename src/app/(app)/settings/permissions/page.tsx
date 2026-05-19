"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEFAULT_PERMISSIONS, PERMISSION_LABEL, RESOURCE_LABEL, type PermissionMatrix } from "@/lib/auth/permissions";
import { ROLE_LABEL, type UserRole } from "@/lib/auth/types";
import { Shield, Lock } from "lucide-react";

const ROLES: UserRole[] = ["MEMBER", "MANAGER", "DIRECTOR", "EXECUTIVE"];
const RESOURCES: (keyof PermissionMatrix)[] = [
  "accounts", "deals", "activities", "okr",
  "brief", "team_brief", "company_brief",
  "incentive_rules", "audit_log", "org_settings", "one_on_one",
];

export default function PermissionsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          권한 매트릭스
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          역할별 리소스 접근 권한 (읽기 전용 보기 — 편집은 ELLIS 연동 후)
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">기본 권한 매트릭스</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b">
                  <th className="text-left py-2.5 px-3 font-medium text-muted-foreground">리소스</th>
                  {ROLES.map((r) => (
                    <th key={r} className="text-center py-2.5 px-3 font-medium">
                      <div>{ROLE_LABEL[r]}</div>
                      <div className="text-[10px] text-muted-foreground font-normal">{r}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RESOURCES.map((res) => (
                  <tr key={res} className="border-b last:border-0 hover:bg-accent/20">
                    <td className="py-2.5 px-3 font-medium">{RESOURCE_LABEL[res]}</td>
                    {ROLES.map((role) => {
                      const perm = DEFAULT_PERMISSIONS[role][res];
                      const meta = PERMISSION_LABEL[perm];
                      return (
                        <td key={role} className="text-center py-2.5 px-3">
                          <Badge variant={meta.tone}>{meta.label}</Badge>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 권한 레벨 설명 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">권한 레벨</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <PermItem
              perm="admin"
              title="관리 — 타인 데이터·시스템 편집 가능"
              examples={["다른 담당자 딜 수정·삭제", "조직 설정 변경", "사용자 추가/삭제"]}
            />
            <PermItem
              perm="write"
              title="편집 — 본인 데이터 편집 가능"
              examples={["본인 담당 고객사·딜 편집", "활동 기록", "본인 OKR 진척률 입력"]}
            />
            <PermItem
              perm="read"
              title="보기 — 조회만 가능"
              examples={["대시보드 열람", "타인 데이터 참조", "보고서 다운로드"]}
            />
            <PermItem
              perm="none"
              title="없음 — 접근 불가"
              examples={["메뉴 표시 안 됨", "URL 직접 접근 시 차단", "API 호출 시 403"]}
            />
          </div>
        </CardContent>
      </Card>

      {/* ELLIS 통합 안내 */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <Lock className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <div className="font-medium">권한 편집은 ELLIS 연동 후 활성화</div>
            <p className="text-muted-foreground text-xs">
              현재는 코드에 하드코딩된 기본값을 표시합니다. ELLIS 사용자·조직 모델과 통합되면 사용자별 override 및 팀 단위 세분화 권한이 가능합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PermItem({
  perm, title, examples,
}: {
  perm: keyof typeof PERMISSION_LABEL;
  title: string;
  examples: string[];
}) {
  const meta = PERMISSION_LABEL[perm];
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant={meta.tone}>{meta.label}</Badge>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <ul className="text-xs text-muted-foreground space-y-0.5 list-disc pl-4">
        {examples.map((e, i) => <li key={i}>{e}</li>)}
      </ul>
    </div>
  );
}
