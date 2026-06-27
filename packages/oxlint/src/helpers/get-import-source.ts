import type { ESTree, Scope } from "@oxlint/plugins";

/**
 * Resolve the module a given identifier was imported from, via scope analysis —
 * e.g. the `Result` in `Result<T, E>` resolves to `"unthrown"` when it was
 * `import type { Result } from "unthrown"`. Returns `undefined` if it cannot be
 * resolved to an import (so callers stay conservative — no false positives).
 */
export const getImportSource = (scope: Scope, target: ESTree.Node): string | undefined => {
  const variable = scope.references.find((ref) => ref.identifier === target)?.resolved;
  const node = variable?.defs[0]?.parent;
  if (node?.type !== "ImportDeclaration") return undefined;
  return node.source.value;
};
