import { describe, expect, it } from "vitest";

import plugin from "./index.js";

describe("@unthrown/oxlint plugin", () => {
  it("exposes both rules under the `unthrown` plugin name", () => {
    expect(plugin.meta?.name).toBe("unthrown");
    expect(Object.keys(plugin.rules).sort()).toEqual([
      "no-ambiguous-error-type",
      "prefer-async-result",
    ]);
  });

  it("ships a `recommended` preset that enables both rules as errors", () => {
    expect(plugin.recommended.rules).toMatchObject({
      "unthrown/no-ambiguous-error-type": "error",
      "unthrown/prefer-async-result": "error",
    });
  });
});
