import { match } from "ts-pattern";
import { err, ok, type Result, TaggedError } from "unthrown";
import { describe, expect, it } from "vitest";

import { tag, toMatchable } from "./index.js";

class NotFound extends TaggedError("NotFound") {}
class Forbidden extends TaggedError("Forbidden")<{ user: string }> {}
type ApiError = NotFound | Forbidden;

const boom = new Error("boom");
const aDefect: Result<number, never> = ok(0).map<number>(() => {
  throw boom;
});

describe("toMatchable", () => {
  it("exposes the ok / err / defect channels as a discriminated union", () => {
    expect(toMatchable(ok(1))).toEqual({ _kind: "Ok", value: 1 });
    expect(toMatchable(err("e"))).toEqual({ _kind: "Err", error: "e" });
    expect(toMatchable(aDefect)).toMatchObject({ _kind: "Defect", cause: boom });
  });

  it("lets ts-pattern match across all three channels", () => {
    const fold = (r: Result<number, string>): string =>
      match(toMatchable(r))
        .with({ _kind: "Ok" }, ({ value }) => `ok:${value}`)
        .with({ _kind: "Err" }, ({ error }) => `err:${error}`)
        .with({ _kind: "Defect" }, () => "defect")
        .exhaustive();

    expect(fold(ok(2))).toBe("ok:2");
    expect(fold(err("x"))).toBe("err:x");
    expect(fold(aDefect)).toBe("defect");
  });
});

describe("tag", () => {
  it("returns the { _tag } object pattern", () => {
    expect(tag("Foo")).toEqual({ _tag: "Foo" });
  });

  it("matches a TaggedError by _tag and narrows to the variant's payload", () => {
    const fold = (r: Result<number, ApiError>): string =>
      match(toMatchable(r))
        .with({ _kind: "Ok" }, ({ value }) => `ok:${value}`)
        // `error.user` below only typechecks because `tag` narrows to Forbidden.
        .with({ _kind: "Err", error: tag("Forbidden") }, ({ error }) => `forbidden:${error.user}`)
        .with({ _kind: "Err", error: tag("NotFound") }, () => "not-found")
        .with({ _kind: "Defect" }, () => "defect")
        .exhaustive();

    expect(fold(err(new Forbidden({ user: "bob" })))).toBe("forbidden:bob");
    expect(fold(err(new NotFound()))).toBe("not-found");
    expect(fold(ok(5))).toBe("ok:5");
  });
});
