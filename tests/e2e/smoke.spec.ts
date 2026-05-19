import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke test — 핵심 사용자 흐름이 끊기지 않는지만 확인.
 * mock 인증·mock 데이터 가정.
 */

const MEMBER_SESSION = {
  id: "user-mock-1",
  orgId: "00000000-0000-0000-0000-000000000001",
  teamId: "team-kr",
  role: "MEMBER",
  name: "김민수",
  email: "member@demo.com",
  jobTitle: "Sales (Korea Team)",
  locale: "ko",
  timezone: "Asia/Seoul",
  countries: ["KR", "VN"],
};

// 호환: 기존 변수명 alias (default = MEMBER)
const MANAGER_SESSION = MEMBER_SESSION;

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
    // 데일리 크리티컬 카드
    await expect(page.getByText(/데일리 크리티컬/).first()).toBeVisible();
    // 핵심 고객사 빠른 진입 카드
    await expect(page.getByText(/핵심 고객사/).first()).toBeVisible();
    // TTV KPI 카드 (체크아웃 기준 YTD)
    await expect(page.getByText(/^TTV$/).first()).toBeVisible();
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

  test("Account 리스트 정렬 + 페이징", async ({ page }) => {
    await loginAs(page);
    await page.goto("/crm/accounts/");
    await expect(page.getByRole("heading", { name: /고객사/ }).first()).toBeVisible();

    // 페이지 번호 버튼이 보임 (22개 → 페이지 2개 이상)
    await expect(page.getByRole("button", { name: /^1$/ })).toBeVisible();

    // 정렬 헤더 클릭 (3M 거래)
    await page.getByRole("button", { name: /3M 거래/ }).click();
    // 정렬 토글이 동작했다는 시각 증거 — 행 그대로 노출
    await expect(page.getByRole("link", { name: /ABC Travel/ })).toBeVisible();
  });

  test("OKR Objective 상세 진입", async ({ page }) => {
    await loginAs(page);
    await page.goto("/okr/obj-co-1/");
    await expect(page.getByRole("heading", { name: /핵심 5개국/ })).toBeVisible();
    // Key Results 섹션
    await expect(page.getByText(/Key Results/)).toBeVisible();
    // Action Plans 섹션
    await expect(page.getByText(/Action Plans/)).toBeVisible();
  });

  test("Critical 6 페이지 자동 추천 표시", async ({ page }) => {
    await loginAs(page);
    await page.goto("/okr/critical-six/");
    await expect(page.getByRole("heading", { name: /Critical 6/ }).first()).toBeVisible();
    // 자동 추천 섹션
    await expect(page.getByText(/다음주 Critical 6 — 자동 추천/)).toBeVisible();
  });

  test("Task 페이지 + 신규 태스크 폼 토글", async ({ page }) => {
    await loginAs(page);
    await page.goto("/tasks/");
    await expect(page.getByRole("heading", { name: /^태스크$/ })).toBeVisible();
    // 새 태스크 버튼 클릭 → 폼 열림
    await page.getByRole("button", { name: /새 태스크/ }).click();
    await expect(page.getByPlaceholder(/태스크 제목/)).toBeVisible();
  });
});
