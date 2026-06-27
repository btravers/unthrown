// @unthrown/pattern — native `ts-pattern` interop for `Result`.
//
// A `Result` is a discriminated union (`{ tag: "Ok" | "Err" | "Defect" }`), so
// `ts-pattern` matches it directly — narrowing, selection, and `.exhaustive()`
// all work out of the box. This package is just sugar: pattern constructors so
// you can write `P.Ok(...)` instead of the raw `{ tag: "Ok", value: ... }`
// object pattern, plus `tag` for matching a `TaggedError` by its `_tag`.
//
//   import { match } from "ts-pattern";
//   import * as P from "@unthrown/pattern";
//
//   match(result)
//     .with(P.Ok(), ({ value }) => `ok: ${value}`)
//     .with(P.Err(P.tag("NotFound")), () => "404")
//     .with(P.Err(), ({ error }) => `error: ${error}`)
//     .with(P.Defect(), ({ cause }) => `bug: ${String(cause)}`)
//     .exhaustive();
//
// Here `P` is THIS package. To also use ts-pattern's own patterns (wildcards,
// `P.select()`, `P.string`, …), import ts-pattern's `P` under another name:
//
//   import { match, P as t } from "ts-pattern";
//   import * as P from "@unthrown/pattern";
//   match(result).with(P.Ok(t.select()), (value) => value).otherwise(() => …);

/**
 * A `ts-pattern` pattern matching the `Ok` variant of a `Result`. With no
 * argument it matches any `Ok`; pass a sub-pattern to constrain or select the
 * `value` — a literal, or any `ts-pattern` pattern (e.g. `ts-pattern`'s own
 * `P.string` / `P.select()`, imported from `ts-pattern`, not this package).
 *
 * @typeParam V - the sub-pattern matched against the `Ok` value.
 */
export function Ok(): { tag: "Ok" };
export function Ok<const V>(value: V): { tag: "Ok"; value: V };
export function Ok(...args: [] | [unknown]): { tag: "Ok"; value?: unknown } {
  return args.length === 0 ? { tag: "Ok" } : { tag: "Ok", value: args[0] };
}

/**
 * A `ts-pattern` pattern matching the `Err` variant of a `Result`. With no
 * argument it matches any `Err`; pass a sub-pattern (e.g. {@link tag}) to
 * constrain or select the `error`.
 *
 * @typeParam V - the sub-pattern matched against the `Err` error.
 */
export function Err(): { tag: "Err" };
export function Err<const V>(error: V): { tag: "Err"; error: V };
export function Err(...args: [] | [unknown]): { tag: "Err"; error?: unknown } {
  return args.length === 0 ? { tag: "Err" } : { tag: "Err", error: args[0] };
}

/**
 * A `ts-pattern` pattern matching the `Defect` variant of a `Result`. With no
 * argument it matches any `Defect`; pass a sub-pattern to constrain or select
 * the unknown `cause`.
 *
 * @typeParam V - the sub-pattern matched against the `Defect` cause.
 */
export function Defect(): { tag: "Defect" };
export function Defect<const V>(cause: V): { tag: "Defect"; cause: V };
export function Defect(...args: [] | [unknown]): { tag: "Defect"; cause?: unknown } {
  return args.length === 0 ? { tag: "Defect" } : { tag: "Defect", cause: args[0] };
}

/**
 * A `ts-pattern` pattern matching any value whose `_tag` equals `value` (e.g. a
 * `TaggedError`). Equivalent to the object pattern `{ _tag: value }`, but reads
 * better nested inside an {@link Err} pattern and narrows to the matching
 * variant — including its payload.
 *
 * @typeParam Tag - the string literal tag to match.
 * @param value - the `_tag` to match.
 *
 * @example
 * ```ts
 * .with(P.Err(P.tag("Forbidden")), ({ error }) => error.user)
 * ```
 */
export function tag<const Tag extends string>(value: Tag): { _tag: Tag } {
  return { _tag: value };
}
