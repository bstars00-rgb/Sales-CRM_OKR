import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { AlertTriangle, Loader2, Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}) {
  return (
    <Card className={cn("border-dashed bg-muted/20", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-3 text-muted-foreground">
          {icon ?? <Inbox className="h-10 w-10" />}
        </div>
        <h3 className="text-base font-medium">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
        {action && (
          <Button onClick={action.onClick} variant="outline" size="sm" className="mt-4">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function LoadingCard({ label = "로딩 중...", className }: { label?: string; className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mb-2" />
        <span className="text-sm">{label}</span>
      </CardContent>
    </Card>
  );
}

export function ErrorCard({
  title = "오류가 발생했습니다",
  description,
  retry,
  className,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn("border-destructive/30 bg-destructive/5", className)}>
      <CardContent className="flex items-start gap-3 py-5">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{title}</div>
          {description && <div className="text-sm text-muted-foreground mt-0.5">{description}</div>}
          {retry && (
            <Button onClick={retry} variant="outline" size="sm" className="mt-3">
              다시 시도
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
