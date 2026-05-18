"use client";

import { Button } from "@/components/ui/button";
import { useFollows, type FollowRefType } from "@/lib/store/follows";
import { useToast } from "@/components/common/ToastContext";
import { Bell, BellOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function FollowButton({
  refType,
  refId,
  label,
  variant = "outline",
  size = "sm",
}: {
  refType: FollowRefType;
  refId: string;
  label?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default";
}) {
  const follows = useFollows();
  const toast = useToast();
  const following = follows.isFollowing(refType, refId);

  const handleClick = () => {
    follows.toggle(refType, refId);
    if (!following) {
      toast.success("구독 시작", `이 ${refType === "deal" ? "딜" : "고객사"}의 변경사항이 알림에 표시됩니다`);
    } else {
      toast.warning("구독 해제");
    }
  };

  return (
    <Button
      variant={following ? "default" : variant}
      size={size}
      onClick={handleClick}
      title={following ? "구독 해제" : "이 변경사항 구독"}
    >
      {following ? (
        <>
          <Bell className={cn("h-4 w-4", "fill-current")} />
          {label ?? "구독 중"}
        </>
      ) : (
        <>
          <BellOff className="h-4 w-4" />
          {label ?? "구독"}
        </>
      )}
    </Button>
  );
}
