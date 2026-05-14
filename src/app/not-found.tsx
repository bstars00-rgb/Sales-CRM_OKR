import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-muted-foreground mb-2">404</div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-muted-foreground mb-6">
          URL이 변경되었거나 삭제됐을 수 있습니다.
        </p>
        <div className="flex justify-center gap-2">
          <Button variant="outline" asChild>
            <Link href="/crm/accounts">
              <Search className="h-4 w-4" />고객사 둘러보기
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />홈으로
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
