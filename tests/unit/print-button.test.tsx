// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PrintButton } from "@/components/common/PrintButton";

describe("PrintButton", () => {
  beforeEach(() => {
    Object.defineProperty(window, "print", {
      value: vi.fn(),
      writable: true,
    });
  });

  it("기본 라벨로 렌더링", () => {
    render(<PrintButton />);
    expect(screen.getByRole("button", { name: /인쇄/i })).toBeInTheDocument();
  });

  it("커스텀 라벨 적용", () => {
    render(<PrintButton label="보고서 인쇄" />);
    expect(screen.getByRole("button", { name: "보고서 인쇄" })).toBeInTheDocument();
  });

  it("no-print 클래스 적용", () => {
    render(<PrintButton label="인쇄" />);
    expect(screen.getByRole("button").className).toContain("no-print");
  });

  it("클릭 시 window.print 호출", async () => {
    const user = userEvent.setup();
    render(<PrintButton />);
    await user.click(screen.getByRole("button"));
    expect(window.print).toHaveBeenCalledOnce();
  });
});
