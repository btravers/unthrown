// @unthrown/boxed — interop between unthrown's `Result`/`AsyncResult` and
// Boxed's `Result`/`Future<Result>`.
//
// Boxed's `Result` has two channels (`Ok`/`Error`) and no defect channel.
// Coming *in*, every Boxed result is an `Ok` or `Error` — never a `Defect`.
// Going *out*, a `Defect` has nowhere to live, so `toBoxed` forces you to triage
// it with `onDefect` (Thesis #3): no defect is ever silently folded into your
// domain error type.
//
//   import { ok } from "unthrown";
//   import { toBoxed, fromBoxed } from "@unthrown/boxed";
//
//   toBoxed(ok(1), (cause) => ({ _tag: "Bug", cause })); // Result.Ok(1)
//   fromBoxed(Result.Ok(1));                              // Result<number, never>

import { Future, Result as BoxedResult } from "@bloodyowl/boxed";
import { err, fromSafePromise, ok } from "unthrown";
import type { AsyncResult, Result } from "unthrown";

/**
 * Convert a `Result` into a Boxed `Result`, triaging any defect.
 *
 * @remarks
 * Boxed's `Result` has no defect channel, so `onDefect` **must** fold a
 * `Defect`'s cause into a modeled error `E` (an `Error`). `Ok → Result.Ok`,
 * `Err → Result.Error`, `Defect → Result.Error(onDefect(cause))`.
 *
 * @typeParam T - the success value type.
 * @typeParam E - the modeled error type.
 * @param result - the result to convert.
 * @param onDefect - folds a defect's unknown cause into a modeled `E`.
 */
export function toBoxed<T, E>(
  result: Result<T, E>,
  onDefect: (cause: unknown) => E,
): BoxedResult<T, E> {
  return result.match<BoxedResult<T, E>>({
    ok: (value) => BoxedResult.Ok(value),
    err: (error) => BoxedResult.Error(error),
    defect: (cause) => BoxedResult.Error(onDefect(cause)),
  });
}

/**
 * Convert a Boxed `Result` into a `Result`.
 *
 * @remarks
 * `Result.Ok → Ok`, `Result.Error → Err`. Boxed's `Result` carries no defect, so
 * the result is never a `Defect`.
 *
 * @typeParam T - the success value type.
 * @typeParam E - the modeled error type.
 * @param result - the Boxed result to convert.
 */
export function fromBoxed<T, E>(result: BoxedResult<T, E>): Result<T, E> {
  return result.match({
    Ok: (value) => ok(value),
    Error: (error) => err(error),
  });
}

/**
 * Convert an `AsyncResult` into a Boxed `Future<Result>`, triaging any
 * defect.
 *
 * @remarks
 * The async counterpart of {@link toBoxed}: `onDefect` is required for the same
 * reason. The `AsyncResult` is awaited (it never rejects) and its settled
 * `Result` is converted, then resolved into the `Future`.
 *
 * @typeParam T - the success value type.
 * @typeParam E - the modeled error type.
 * @param asyncResult - the async result to convert.
 * @param onDefect - folds a defect's unknown cause into a modeled `E`.
 */
export function toBoxedFuture<T, E>(
  asyncResult: AsyncResult<T, E>,
  onDefect: (cause: unknown) => E,
): Future<BoxedResult<T, E>> {
  return Future.make<BoxedResult<T, E>>((resolve) => {
    void settle(asyncResult).then((result) => {
      resolve(toBoxed(result, onDefect));
    });
  });
}

/**
 * Convert a Boxed `Future<Result>` into an `AsyncResult`.
 *
 * @remarks
 * The async counterpart of {@link fromBoxed}. A `Result.Error` stays an `Err`;
 * an *unexpected* rejection of the underlying promise becomes a `Defect`. The
 * returned `AsyncResult` never throws when awaited.
 *
 * @typeParam T - the success value type.
 * @typeParam E - the modeled error type.
 * @param future - the Boxed future to convert.
 */
export function fromBoxedFuture<T, E>(future: Future<BoxedResult<T, E>>): AsyncResult<T, E> {
  return fromSafePromise(future.toPromise()).flatMap((result) => fromBoxed(result));
}

function settle<T, E>(asyncResult: AsyncResult<T, E>): Promise<Result<T, E>> {
  return (async () => await asyncResult)();
}
