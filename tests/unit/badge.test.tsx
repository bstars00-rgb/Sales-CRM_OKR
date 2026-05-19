// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/badge";

describe("Badge 컴포넌트", () => {
  it("자식 텍스트 렌더링", () => {
    render(<Badge>새 항목</Badge>);
    expect(screen.getByText("새 항목")).toBeInTheDocument();
  });

  it("기본 variant 클래스", () => {
    render(<Badge data-testid="b">기본</Badge>);
    expect(screen.getByTestId("b").className).toContain("bg-primary/10");
  });

  it("destructive variant", () => {
    render(<Badge variant="destructive" data-testid="b">긴급</Badge>);
    expect(screen.getByTestId("b").className).toContain("bg-destructive/10");
  });

  it("custom className 병합", () => {
    render(<Badge className="ml-4" data-testid="b">CSV</Badge>);
    expect(screen.getByTestId("b").className).toContain("ml-4");
    expect(screen.getByTestId("b").className).toContain("bg-primary/10");
  });
});
