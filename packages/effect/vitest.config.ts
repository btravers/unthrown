import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // The interop surface is fully exercised, including every Cause-reduction
      // branch of `fromExit` (fail, die, interrupt) and the forced-triage path
      // of `toEither`.
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 100,
      },
    },
  },
});
