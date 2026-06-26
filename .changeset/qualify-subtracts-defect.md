---
"unthrown": minor
---

Stop `fromPromise` / `fromThrowable` from leaking `Defect` into the error
channel. The modeled error type is now inferred as `Exclude<R, Defect>` (where
`R` is `qualify`'s return type), so a `qualify` that returns only `defect(cause)`
yields `AsyncResult<T, never>` / `Result<T, never>` instead of `…<T, Defect>` —
a defect stays out-of-band and no longer pollutes downstream combinator types.
Mixed `qualify`s keep exactly their modeled arm (e.g. `"not_found" | Defect` →
`"not_found"`). Sound because `Defect` is `unique symbol`-branded, so no domain
error is assignable to it. When every rejection is a defect, `fromSafePromise`
remains the right primitive.
