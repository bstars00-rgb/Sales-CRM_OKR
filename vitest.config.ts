import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
    // .tsx 파일은 파일 상단 `// @vitest-environment jsdom` directive로 지정
    environment: "node",
    setupFiles: ["./tests/unit/setup.ts"],
    globals: false,
    reporters: process.env.CI ? ["default"] : ["verbose"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
