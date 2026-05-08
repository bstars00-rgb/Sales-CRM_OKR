import { test, expect } from "@playwright/test";

/**
 * Smoke test — 핵심 사용자 흐름이 끊기지 않는지만 확인.
 * mock 인증·mock 데이터 가정.
 */

test.describe("Sales CRM smoke", () => {
  test("로그인 → 매니저 대시보드 진입", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Sales CRM + OKR")).toBeVisible();

    // 빠른 시연 계정 (Sales Manager) 클릭
    await page.getByRole("button", { name: /김민수/ }).click();

    // /dashboard/manager 로 리다이렉트되어야 함
    await expect(page).toHaveURL(/\/dashboard\/manager/);
    await expect(page.getByRole("heading", { name: /내 대시보드/ })).toBeVisible();
  });

  test("고객사 리스트 → 상세 → 미팅 모드", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /김민수/ }).click();
    await page.waitForURL(/\/dashboard\/manager/);

    // 고객사 메뉴 진입
    await page.getByRole("link", { name: /고객사/ }).first().click();
    await expect(page).toHaveURL(/\/crm\/accounts/);

    // ABC Travel 클릭
    await page.getByRole("link", { name: /ABC Travel Holdings/ }).click();
    await expect(page).toHaveURL(/\/crm\/accounts\/acc-001/);

    // 미팅 모드 진입
    await page.getByRole("link", { name: /미팅 모드/ }).click();
    await expect(page).toHaveURL(/\/insight/);
    await expect(page.getByText(/Customer Mode/)).toBeVisible();
  });

  test("딜 칸반 → 딜 상세 → Win 모달 열기", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /김민수/ }).click();
    await page.waitForURL(/\/dashboard\/manager/);

    await page.goto("/crm/deals/kanban/");
    await expect(page.getByRole("heading", { name: /딜 칸반/ })).toBeVisible();

    // 첫 번째 OPEN 딜 카드 클릭 (deal-1)
    await page.goto("/crm/deals/deal-1/");
    await expect(page.getByRole("heading", { name: /ABC Travel Q4/ })).toBeVisible();

    // Win 버튼 클릭 → 모달
    await page.getByRole("button", { name: /^Win$/ }).click();
    await expect(page.getByText(/Deal Won/)).toBeVisible();
  });
});
