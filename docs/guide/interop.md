# Interop

unthrown ships thin bridges to the three most common neighbours in the
errors-as-values space. Each is a separate, peer-dependency package with a small
`to*` / `from*` surface — nothing to learn beyond "which direction am I going."

| Package                                    | Peer dependency    | Bridges                    |
| ------------------------------------------ | ------------------ | -------------------------- |
| [`@unthrown/effect`](/api/effect/)         | `effect`           | `Exit`, `Either`, `Effect` |
| [`@unthrown/neverthrow`](/api/neverthrow/) | `neverthrow`       | `Result`, `ResultAsync`    |
| [`@unthrown/boxed`](/api/boxed/)           | `@bloodyowl/boxed` | `Result`, `Future<Result>` |

## The one rule: does the neighbour have a defect channel?

unthrown has **three** channels — `Ok`, `Err`, and the out-of-band `Defect`. Most
libraries have only two. That single difference decides every signature.

- **Coming _in_** (`from*`), a two-channel result is only ever an `Ok` or an
  `Err` — the bridge **never** produces a `Defect`.
- **Going _out_** (`to*`) to a two-channel type, a `Defect` has nowhere to live.
  Rather than silently fold it into your domain error, the bridge **forces** you
  to triage it with a mandatory `onDefect: (cause) => E` — the same
  boundary-qualification rule unthrown enforces everywhere. There is no one-arg
  form.

```ts
import { ok } from "unthrown";
import { toNeverthrow } from "@unthrown/neverthrow";

// onDefect is required — the compiler will not let you drop a defect.
toNeverthrow(ok(1), (cause) => ({ _tag: "Bug", cause }));
```

## Effect — a genuine bijection

Effect is the exception: it _does_ have a defect channel (`Cause.die`), so
`Result ↔ Exit` round-trips losslessly.

```ts
import { ok, err } from "unthrown";
import { toExit, fromEffect } from "@unthrown/effect";
import { Effect } from "effect";

toExit(ok(1)); // Exit.succeed(1)
toExit(err("e")); // Exit.fail("e")  — a modeled Cause.fail
// a Defect would become Exit.die(cause)

// Run an Effect and collect its outcome; a die/interrupt becomes a Defect:
await fromEffect(Effect.succeed(1)).match({ ok, err, defect: String });
```

`toEffect` also accepts an `AsyncResult` (the `AsyncResult → Effect` direction),
and `toEither` — since `Either` has no defect channel — takes the same mandatory
`onDefect`.

## Async

Every package mirrors its sync pair for the asynchronous types:

- `@unthrown/effect` — `fromEffect` returns an `AsyncResult`; `toEffect` accepts
  one.
- `@unthrown/neverthrow` — `toNeverthrowAsync` / `fromNeverthrowAsync` bridge
  `AsyncResult ↔ ResultAsync`.
- `@unthrown/boxed` — `toBoxedFuture` / `fromBoxedFuture` bridge `AsyncResult ↔
Future<Result>`.

On the way in, an _unexpected_ rejection inside the neighbour's async type
becomes a `Defect` — never a silently-swallowed error.
