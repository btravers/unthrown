# @unthrown/oxlint

> An [oxlint](https://oxc.rs/docs/guide/usage/linter) plugin that enforces
> [unthrown](https://github.com/btravstack/unthrown)'s conventions.

📖 **[Documentation](https://btravstack.github.io/unthrown/guide/linting)**

```sh
pnpm add -D @unthrown/oxlint oxlint
```

A small set of lint rules that keep unthrown code honest — turning two of the
library's theses into automated checks.

## Rules

| Rule                               | What it enforces                                                                                                                                                                                                                                                                                   |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `unthrown/no-ambiguous-error-type` | The `E` in `Result<T, E>` / `AsyncResult<T, E>` must name a concrete domain error — no `unknown`, `any`, `Error`, `object`, bare `{}`, or primitives. (`never` is allowed.) This is [Thesis #1](https://btravstack.github.io/unthrown/guide/why-unthrown): `E` is only the _anticipated_ failures. |
| `unthrown/prefer-async-result`     | Prefer `AsyncResult<T, E>` over `Promise<Result<T, E>>` — a raw `Promise<Result>` can still reject. Autofixable.                                                                                                                                                                                   |

Both rules resolve the import source via scope analysis, so they only fire on
unthrown's own `Result` / `AsyncResult` — a `Result` from another library is left
alone.

## Usage

oxlint JS plugins are configured in `.oxlintrc.json`. Enable the bundled
`recommended` preset:

```js
// oxlint.config.js
import unthrown from "@unthrown/oxlint";

export default [unthrown.recommended];
```

Or wire the rules by hand:

```json
{
  "jsPlugins": [{ "name": "unthrown", "specifier": "@unthrown/oxlint" }],
  "rules": {
    "unthrown/no-ambiguous-error-type": "error",
    "unthrown/prefer-async-result": "error"
  }
}
```

`oxlint` is a peer dependency. JS plugins require a recent oxlint (≥ 1.69).

## License

[MIT](../../LICENSE) © Benoit TRAVERS
