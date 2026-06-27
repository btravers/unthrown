---
"unthrown": major
"@unthrown/standard-schema": patch
---

**BREAKING:** capitalize the value constructors so they match the
discriminated-union tags (`"Ok"`/`"Err"`/`"Defect"`) and the capitalized `Do`:

- `ok` → `Ok`, `err` → `Err`, `defect` → `Defect`
- facade: `Result.ok`/`err`/`defect` → `Result.Ok`/`Err`/`Defect`
- `@unthrown/pattern`: `P.ok`/`err`/`defect` → `P.Ok`/`Err`/`Defect`

Unchanged: the `match` handler keys (`r.match({ ok, err, defect })`), the guards
(`isOk`/`isErr`/`isDefect`), and the `"defect channel"` terminology. Migration is
a near-mechanical rename of the constructor call sites (`ok(` → `Ok(`, etc.).
Note `Err`, not `Error`, to avoid shadowing the global `Error`.
