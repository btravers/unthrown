// @unthrown/pattern — a thin `ts-pattern` integration for `Result`.
//
// `ts-pattern` already matches tagged unions natively, so this package is
// deliberately small: `toMatchable` exposes a Result's otherwise-hidden
// ok/err/defect channels as a discriminated union `ts-pattern` can match, and
// `tag` is sugar for matching a `TaggedError` by its `_tag`. The matching power
// is `ts-pattern`'s; `matchTags` from `unthrown` covers the everyday exhaustive
// case.

import type { Result } from "unthrown";

/**
 * A discriminated view of a `Result`'s three channels, suitable for
 * `ts-pattern`'s `match`. The `_kind` discriminant is distinct from any `_tag`
 * an error value may carry, so the two never collide in nested patterns.
 *
 * @typeParam T - the success value type.
 * @typeParam E - the modeled error type.
 */
export type ResultMatchable<T, E> =
  | { readonly _kind: "Ok"; readonly value: T }
  | { readonly _kind: "Err"; readonly error: E }
  | { readonly _kind: "Defect"; readonly cause: unknown };

/**
 * Adapt a `Result` into a discriminated union `ts-pattern` can match on,
 * exposing the otherwise-hidden ok / err / defect channels.
 *
 * @typeParam T - the success value type.
 * @typeParam E - the modeled error type.
 * @param result - the result to view.
 *
 * @example
 * ```ts
 * import { match } from "ts-pattern";
 * import { toMatchable, tag } from "@unthrown/pattern";
 *
 * match(toMatchable(result))
 *   .with({ _kind: "Ok" }, ({ value }) => `ok ${value}`)
 *   .with({ _kind: "Err", error: tag("NotFound") }, () => 404)
 *   .with({ _kind: "Defect" }, ({ cause }) => `bug ${String(cause)}`)
 *   .exhaustive();
 * ```
 */
export function toMatchable<T, E>(result: Result<T, E>): ResultMatchable<T, E> {
  return result.match<ResultMatchable<T, E>>({
    ok: (value) => ({ _kind: "Ok", value }),
    err: (error) => ({ _kind: "Err", error }),
    defect: (cause) => ({ _kind: "Defect", cause }),
  });
}

/**
 * `ts-pattern` sugar: a pattern matching any value whose `_tag` equals `value`
 * (e.g. a `TaggedError`). Equivalent to the object pattern `{ _tag: value }`,
 * but reads better nested inside an `Err` pattern and narrows to the matching
 * variant — including its payload.
 *
 * @typeParam Tag - the string literal tag to match.
 * @param value - the `_tag` to match.
 *
 * @example
 * ```ts
 * .with({ _kind: "Err", error: tag("Forbidden") }, ({ error }) => error.user)
 * ```
 */
export function tag<const Tag extends string>(value: Tag): { _tag: Tag } {
  return { _tag: value };
}
