import { describe, it, expect, beforeEach } from "vitest";
import {
  addActivity, addTask, toggleTask, deleteTask,
  markDealWon, markDealLost, moveDealStage, updateDeal,
  toggleCriticalSix, replaceCriticalSix,
} from "@/lib/store/sales-store";
import { MOCK_ACTIVITIES, MOCK_TASKS } from "@/lib/mock/activities";
import { MOCK_DEALS } from "@/lib/mock/deals";
import { MOCK_CRITICAL_6 } from "@/lib/mock/kpi";

describe("sales-store: Activities", () => {
  it("addActivity prepends to MOCK_ACTIVITIES and assigns id", () => {
    const before = MOCK_ACTIVITIES.length;
    const a = addActivity({
      activityType: "CALL",
      userId: "user-mock-1",
      userName: "김민수",
      accountId: "acc-001",
      accountName: "ABC Travel",
      subject: "Test call",
    });
    expect(MOCK_ACTIVITIES.length).toBe(before + 1);
    expect(MOCK_ACTIVITIES[0]).toBe(a);
    expect(a.id).toMatch(/^act-new-/);
    expect(a.occurredAt).toBeTruthy();
  });

  it("addActivity respects custom occurredAt", () => {
    const iso = "2026-01-01T00:00:00.000Z";
    const a = addActivity({
      activityType: "NOTE",
      userId: "user-mock-1",
      userName: "김민수",
      accountId: "acc-001",
      occurredAt: iso,
    });
    expect(a.occurredAt).toBe(iso);
  });
});

describe("sales-store: Tasks", () => {
  it("addTask + toggleTask round-trip", () => {
    const t = addTask({
      title: "Test task",
      ownerUserId: "user-mock-1",
      priority: "HIGH",
    });
    expect(t.status).toBe("TODO");
    expect(MOCK_TASKS[0]).toBe(t);

    const after = toggleTask(t.id);
    expect(after?.status).toBe("DONE");
    expect(after?.completedAt).toBeTruthy();

    const back = toggleTask(t.id);
    expect(back?.status).toBe("TODO");
  });

  it("deleteTask removes from MOCK_TASKS", () => {
    const t = addTask({ title: "To delete", ownerUserId: "user-mock-1", priority: "LOW" });
    const before = MOCK_TASKS.length;
    const ok = deleteTask(t.id);
    expect(ok).toBe(true);
    expect(MOCK_TASKS.length).toBe(before - 1);
    expect(MOCK_TASKS.find((x) => x.id === t.id)).toBeUndefined();
  });

  it("toggleTask returns null for unknown id", () => {
    expect(toggleTask("nonexistent")).toBeNull();
  });

  it("deleteTask returns false for unknown id", () => {
    expect(deleteTask("nonexistent")).toBe(false);
  });
});

describe("sales-store: Deals — Win/Lost/Stage", () => {
  // 각 테스트는 격리: 기존 deal을 mutate하지 않게 새 deal 추가 후 테스트
  let testDealId: string;

  beforeEach(() => {
    const fresh = {
      id: `deal-test-${Date.now()}-${Math.random()}`,
      name: "Test Deal",
      accountId: "acc-001",
      accountName: "ABC Travel",
      ownerUserId: "user-mock-1",
      ownerName: "김민수",
      dealType: "NEW" as const,
      outcome: "OPEN" as const,
      amount: 100_000_000,
      expectedGp: 15_000_000,
      currency: "KRW",
      probabilityPct: 50,
      expectedCloseDate: "2026-12-31",
      stageId: "stg-4",
      stageName: "Meeting Done",
      stageOrder: 4,
      daysInStage: 5,
      countryCode: "VN",
      grade: "GROWTH" as const,
    };
    MOCK_DEALS.push(fresh);
    testDealId = fresh.id;
  });

  it("markDealWon sets outcome WON + stg-9", () => {
    const d = markDealWon(testDealId, "PRICE");
    expect(d?.outcome).toBe("WON");
    expect(d?.stageId).toBe("stg-9");
    expect(d?.probabilityPct).toBe(100);
    expect(d?.winReasonCode).toBe("PRICE");
  });

  it("markDealLost sets outcome LOST + stg-10", () => {
    const d = markDealLost(testDealId, "COMPETITOR");
    expect(d?.outcome).toBe("LOST");
    expect(d?.stageId).toBe("stg-10");
    expect(d?.probabilityPct).toBe(0);
    expect(d?.lostReasonCode).toBe("COMPETITOR");
  });

  it("moveDealStage to OPEN stage updates fields", () => {
    const d = moveDealStage(testDealId, "stg-5");
    expect(d?.stageId).toBe("stg-5");
    expect(d?.stageName).toBe("Proposal Sent");
    expect(d?.outcome).toBe("OPEN");
    expect(d?.daysInStage).toBe(0);
  });

  it("moveDealStage to Won stage sets outcome WON", () => {
    const d = moveDealStage(testDealId, "stg-9");
    expect(d?.outcome).toBe("WON");
    expect(d?.probabilityPct).toBe(100);
  });

  it("updateDeal patches selected fields", () => {
    const d = updateDeal(testDealId, { amount: 200_000_000, probabilityPct: 80 });
    expect(d?.amount).toBe(200_000_000);
    expect(d?.probabilityPct).toBe(80);
    // 다른 필드는 안 바뀜
    expect(d?.name).toBe("Test Deal");
  });

  it("markDealWon auto-completes linked Critical 6", () => {
    // Critical 6에 해당 deal과 연결된 항목 추가
    MOCK_CRITICAL_6.push({ title: "Test C6", linkedDealId: testDealId, done: false });
    markDealWon(testDealId, "RELATIONSHIP");
    const c6 = MOCK_CRITICAL_6.find((c) => c.linkedDealId === testDealId);
    expect(c6?.done).toBe(true);
    // cleanup
    MOCK_CRITICAL_6.splice(MOCK_CRITICAL_6.findIndex((c) => c.linkedDealId === testDealId), 1);
  });
});

describe("sales-store: Critical 6", () => {
  it("toggleCriticalSix flips done state", () => {
    const before = MOCK_CRITICAL_6[0].done;
    toggleCriticalSix(0);
    expect(MOCK_CRITICAL_6[0].done).toBe(!before);
    // restore
    toggleCriticalSix(0);
  });

  it("replaceCriticalSix replaces all items", () => {
    const original = [...MOCK_CRITICAL_6];
    replaceCriticalSix([
      { title: "New 1", done: false },
      { title: "New 2", done: false },
    ]);
    expect(MOCK_CRITICAL_6.length).toBe(2);
    expect(MOCK_CRITICAL_6[0].title).toBe("New 1");
    // restore
    replaceCriticalSix(original);
  });

  it("toggleCriticalSix returns false for out-of-range idx", () => {
    expect(toggleCriticalSix(999)).toBe(false);
  });
});
