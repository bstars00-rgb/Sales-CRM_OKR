// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import axe, { type AxeResults } from "axe-core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PrintButton } from "@/components/common/PrintButton";

async function checkA11y(container: HTMLElement): Promise<AxeResults> {
  return await axe.run(container, {
    rules: {
      // 색상 대비는 별도 디자인 토큰 감사 (테스트 환경에서 정확 불가)
      "color-contrast": { enabled: false },
      // 단독 컴포넌트 테스트라 region/landmark 규칙은 제외
      "region": { enabled: false },
    },
  });
}

describe("a11y: axe-core 자동 감사", () => {
  it("Button — 키보드 접근 가능, label 있음", async () => {
    const { container } = render(<Button>저장</Button>);
    const results = await checkA11y(container);
    expect(results.violations).toEqual([]);
  });

  it("Button (aria-label만) — 시각 텍스트 없을 때도 통과", async () => {
    const { container } = render(
      <Button aria-label="삭제">
        <svg width="16" height="16" aria-hidden />
      </Button>
    );
    const results = await checkA11y(container);
    expect(results.violations).toEqual([]);
  });

  it("Badge — semantic 위반 없음", async () => {
    const { container } = render(<Badge>긴급</Badge>);
    const results = await checkA11y(container);
    expect(results.violations).toEqual([]);
  });

  it("PrintButton — label 명확 + 키보드 작동", async () => {
    const { container } = render(<PrintButton />);
    const results = await checkA11y(container);
    expect(results.violations).toEqual([]);
  });

  it("복합 폼 (input + label 연결)", async () => {
    const { container } = render(
      <form>
        <label htmlFor="email-input">이메일</label>
        <input id="email-input" type="email" />
        <Button type="submit">제출</Button>
      </form>
    );
    const results = await checkA11y(container);
    expect(results.violations).toEqual([]);
  });

  it("위반 사례 — aria-label 없는 icon-only 버튼은 잡아냄", async () => {
    const { container } = render(
      <button>
        <svg width="16" height="16" />
      </button>
    );
    const results = await checkA11y(container);
    // 이 케이스는 위반이 있어야 정상 (음성 reader가 이름 없는 버튼 감지)
    expect(results.violations.length).toBeGreaterThan(0);
  });
});
