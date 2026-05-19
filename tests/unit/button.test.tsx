// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button 컴포넌트", () => {
  it("자식 텍스트를 렌더링한다", () => {
    render(<Button>저장</Button>);
    expect(screen.getByRole("button", { name: "저장" })).toBeInTheDocument();
  });

  it("variant prop이 클래스에 반영된다", () => {
    const { rerender } = render(<Button variant="destructive">삭제</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-destructive");
    rerender(<Button variant="ghost">취소</Button>);
    expect(screen.getByRole("button").className).toContain("hover:bg-accent");
  });

  it("size prop이 클래스에 반영된다", () => {
    render(<Button size="sm">작은</Button>);
    expect(screen.getByRole("button").className).toContain("h-9");
  });

  it("disabled prop이 적용된다", () => {
    render(<Button disabled>비활성</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("onClick 핸들러가 호출된다", async () => {
    const user = userEvent.setup();
    let clicked = 0;
    render(<Button onClick={() => clicked++}>클릭</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(1);
  });

  it("disabled 시 onClick이 호출되지 않는다", async () => {
    const user = userEvent.setup();
    let clicked = 0;
    render(<Button disabled onClick={() => clicked++}>차단</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(0);
  });

  it("asChild로 다른 요소를 슬롯한다", () => {
    render(
      <Button asChild>
        <a href="/test">링크</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: "링크" });
    expect(link).toBeInTheDocument();
    expect(link.getAttribute("href")).toBe("/test");
  });
});
