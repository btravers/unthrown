# Pattern Matching

A `Result` is a **discriminated union** — `{ tag: "Ok"; value } | { tag: "Err";
error } | { tag: "Defect"; cause }` — so you can pattern-match it **natively**,
no adapter required.

For the everyday exhaustive fold over a tagged _error_ union,
[`matchTags`](./tagged-errors) is the simplest tool. When you want
[ts-pattern](https://github.com/gvergnaud/ts-pattern)'s full power — guards,
nested patterns, wildcards, selection — match the `Result` directly.

## Matching a Result directly

Because `tag` is a real discriminant, ts-pattern matches a `Result` out of the
box, and `.exhaustive()` works:

```ts
import { match } from "ts-pattern";

const status = match(result)
  .with({ tag: "Ok" }, ({ value }) => 200)
  .with({ tag: "Err" }, ({ error }) => 400)
  .with({ tag: "Defect" }, ({ cause }) => 500)
  .exhaustive(); // ✅ omit a variant and it won't compile
```

The payload (`value` / `error` / `cause`) is reachable only inside the matching
arm — exactly like the type guards.

## `@unthrown/pattern` — pattern sugar

`@unthrown/pattern` adds small constructors so you don't write the raw object
patterns, plus `tag` for matching a [`TaggedError`](./tagged-errors).

::: code-group

```sh [pnpm]
pnpm add @unthrown/pattern ts-pattern
```

```sh [npm]
npm install @unthrown/pattern ts-pattern
```

:::

```ts
import { match } from "ts-pattern";
import * as P from "@unthrown/pattern";

const status = match(result)
  .with(P.Ok(), ({ value }) => 200)
  .with(P.Err(P.tag("NotFound")), () => 404)
  .with(P.Err(P.tag("Forbidden")), ({ error }) => {
    audit(error.user); // narrowed to Forbidden — payload available
    return 403;
  })
  .with(P.Defect(), ({ cause }) => 500)
  .exhaustive();
```

- `P.Ok(sub?)` / `P.Err(sub?)` / `P.Defect(sub?)` — match a channel; pass a
  sub-pattern to constrain or select the payload: a literal, or any `ts-pattern`
  pattern.
- `P.tag(t)` — sugar for `{ _tag: t }`; nested in `P.Err(...)` it narrows to the
  matching tagged-error variant, payload and all.

Above, `P` is `@unthrown/pattern`. To also use `ts-pattern`'s own patterns
(wildcards, `P.select()`, `P.string`, …), import them from `ts-pattern` under a
different name:

```ts
import { match, P as t } from "ts-pattern";
import * as P from "@unthrown/pattern";

match(result)
  .with(P.Ok(t.select()), (value) => value) // t.select() is ts-pattern's
  .otherwise(() => 0);
```

`ts-pattern` is a peer dependency.

## Matching an AsyncResult

`ts-pattern`'s `match` is synchronous, so `await` an `AsyncResult` first — the
result is a plain, matchable `Result`:

```ts
const status = match(await asyncResult)
  .with(P.Ok(), () => 200)
  .with(P.Err(), () => 400)
  .with(P.Defect(), () => 500)
  .exhaustive();
```

## Which should I use?

- **`matchTags`** (core, zero-dep) — the everyday exhaustive fold over a tagged
  error union. No `.exhaustive()` to forget.
- **`ts-pattern`** (+ `@unthrown/pattern` sugar) — when you need guards, nested
  matching on payloads, wildcards, or to match on the success value's shape.
