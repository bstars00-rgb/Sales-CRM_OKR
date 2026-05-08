import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrgSettingsPage() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">조직 설정</h1>
        <p className="text-sm text-muted-foreground mt-1">
          MVP 프로토타입 — 실제 조직 설정은 v1에서 활성화됩니다.
        </p>
      </div>

      <Card>
        <CardHeader><CardTitle>조직 정보</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row k="이름" v="Demo Hotel B2B Co." />
          <Row k="기준 통화" v="KRW" />
          <Row k="기준 로케일" v="ko-KR" />
          <Row k="시간대" v="Asia/Seoul" />
          <Row k="회계연도 시작월" v="1월" />
          <Row k="플랜" v="PRO (Prototype)" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>운영 설정</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row k="Brief 마감" v="일요일 21:00" />
          <Row k="Critical 6 마감" v="월요일 09:00" />
          <Row k="DORMANT 임계치" v="90일 무접촉" />
          <Row k="단계 체류 경고" v="평균의 1.5×" />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1.5 border-b last:border-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}
