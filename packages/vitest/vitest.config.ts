import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      // Lock in the matcher suite (incl. every failure-message branch). Lines
      // sit just below 100 only because of the defensive `render` fallback for a
      // value that is Result-like but not Ok/Err/Defect — unreachable for a real
      // Result, kept for return-exhaustiveness.
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95,
      },
    },
  },
});
