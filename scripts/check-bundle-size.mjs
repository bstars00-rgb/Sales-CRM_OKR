#!/usr/bin/env node
/**
 * Bundle size budget 검증 — next build 후 페이지별 자체 chunk 크기 점검.
 *
 * 룰 (페이지 자체 JS, vendor split 제외):
 * - 페이지 own chunk: ≤ 50 kB (대시보드/Analytics 차트 등 무거운 페이지 허용치)
 * - 페이지 own chunk: ≤ 30 kB 권장 (단순 페이지)
 *
 * Next.js가 자동 vendor split을 하므로 shared chunks는 별도 관리 X.
 * 페이지 자체에서 import한 라이브러리가 너무 많으면 lazy load 권장.
 */

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const NEXT_DIR = path.resolve(".next");
const BUDGETS = {
  pageMax: 50 * 1024,         // hard limit
  pageWarn: 30 * 1024,        // soft warning
};

if (!existsSync(NEXT_DIR)) {
  console.error("❌ .next 디렉토리가 없습니다. 먼저 `npm run build`를 실행하세요.");
  process.exit(1);
}

const appChunksDir = path.join(NEXT_DIR, "static", "chunks", "app");
const pageOwn = [];

if (existsSync(appChunksDir)) {
  async function walk(dir, rel = "") {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      const relPath = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) {
        await walk(full, relPath);
      } else if (e.name.endsWith(".js")) {
        const s = await stat(full);
        pageOwn.push({ path: relPath, size: s.size });
      }
    }
  }
  await walk(appChunksDir);
}

function fmt(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} kB`;
  return `${(b / (1024 * 1024)).toFixed(2)} MB`;
}

console.log("\n📦 Bundle Size Budget Check (페이지별 자체 chunk)\n");
console.log("━".repeat(70));

let hardViolations = 0;
let softWarnings = 0;
const sorted = pageOwn.sort((a, b) => b.size - a.size);

console.log("\n[Top 15 페이지 chunk (큰 순)]");
for (const p of sorted.slice(0, 15)) {
  let icon = "✅";
  if (p.size > BUDGETS.pageMax) {
    icon = "❌";
    hardViolations++;
  } else if (p.size > BUDGETS.pageWarn) {
    icon = "⚠️";
    softWarnings++;
  }
  console.log(`${icon} ${fmt(p.size).padStart(8)}  ${p.path}`);
}

const totalPages = pageOwn.length;
const totalSize = pageOwn.reduce((s, p) => s + p.size, 0);
const avgSize = totalPages > 0 ? totalSize / totalPages : 0;

console.log("\n━".repeat(70));
console.log(`📊 통계:`);
console.log(`   페이지 chunks: ${totalPages}개`);
console.log(`   평균 크기: ${fmt(avgSize)}`);
console.log(`   합계: ${fmt(totalSize)}`);
console.log(`   ❌ Hard 위반 (>${fmt(BUDGETS.pageMax)}): ${hardViolations}개`);
console.log(`   ⚠ Soft 경고 (>${fmt(BUDGETS.pageWarn)}): ${softWarnings}개`);
console.log("");

if (hardViolations === 0) {
  console.log("✅ Hard budget 위반 없음 — OK");
  process.exit(0);
} else {
  console.log(`❌ ${hardViolations}개 페이지가 ${fmt(BUDGETS.pageMax)} 초과 — lazy load 검토 필요`);
  // CI에서 hard violation 시 실패시키려면 exit 1
  // 지금은 warn-only (점진적 개선 단계)
  process.exit(0);
}
