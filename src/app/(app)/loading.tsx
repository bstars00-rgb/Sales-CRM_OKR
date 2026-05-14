import { LoadingCard } from "@/components/common/StateCards";

export default function AppLoading() {
  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <LoadingCard label="화면 로딩 중..." />
    </div>
  );
}
