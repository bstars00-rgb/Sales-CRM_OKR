import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke test — 핵심 사용자 흐름이 끊기지 않는지만 확인.
 * mock 인증·mock 데이터 가정.
 */

const MANAGER_SESSION = {
  id: "user-manager",
  orgId: "00000000-0000-0000-0000-000000000001",
  teamId: "team-korea",
  role: "SALES_MANAGER",
  name: "김민수",
  email: "manager@demo.com",
  jobTitle: "Sales Manager",
  locale: "ko",
  timezone: "Asia/Seoul",
};

async function loginAs(page: Page, session = MANAGER_SESSION) {
  // 페이지 로드 전 localStorage에 세션을 주입 — AppShell의 useEffect가 mount 시점에 읽음
  await page.addInitScript((s) => {
    window.localStorage.setItem("sales-crm-session", JSON.stringify(s));
  }, session);
}

test.describe("Sales CRM smoke", () => {
  test("로그인 페이지 렌더링", async ({ page }) => {
    await page.goto("/login/");
    await expect(page.getByText("Sales CRM + OKR")).toBeVisible();
    await expect(page.getByText(/빠른 시연 계정/)).toBeVisible();
  });

  test("매니저 대시보드 진입 + 핵심 카드 표시", async ({ page }) => {
    await loginAs(page);
    await page.goto("/dashboard/manager/");

    await expect(page.getByRole("heading", { name: /내 대시보드/ })).toBeVisible();
    // Critical 6 카드 (CardTitle에 들어가는 굵은 텍스트)
    await expect(page.getByText(/Critical 6/).first()).toBeVisible();
    // 내 핵심 고객사 섹션
    await expect(page.getByText(/핵심 고객사/)).toBeVisible();
  });

  test("고객사 상세 → 미팅 모드 진입", async ({ page }) => {
    await loginAs(page);
    await page.goto("/crm/accounts/acc-001/");

    await expect(page.getByRole("heading", { name: /ABC Travel Holdings/ })).toBeVisible();

    // 미팅 모드 버튼 클릭
    await page.getByRole("link", { name: /미팅 모드/ }).click();
    await page.waitForURL(/\/insight\//);
    await expect(page.getByText(/Customer Mode/)).toBeVisible();
  });

  test("딜 칸반 → 딜 상세 표시", async ({ page }) => {
    await loginAs(page);
    await page.goto("/crm/deals/kanban/");
    await expect(page.getByRole("heading", { name: /딜 칸반/ })).toBeVisible();

    await page.goto("/crm/deals/deal-1/");
    await expect(page.getByRole("heading", { name: /ABC Travel Q4/ })).toBeVisible();

    // Win 버튼 존재 (OPEN 딜)
    await expect(page.getByRole("button", { name: /^Win$/ })).toBeVisible();
  });

  test("OKR 트리 뷰", async ({ page }) => {
    await loginAs(page);
    await page.goto("/okr/tree/");
    await expect(page.getByRole("heading", { name: /OKR 정렬 트리/ })).toBeVisible();
  });
});
