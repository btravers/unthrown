import type { ESTree } from "@oxlint/plugins";

/**
 * Narrow a `TSTypeReference` to one whose `typeName` is a bare `Identifier`,
 * optionally one of `names`. unthrown's `Result` / `AsyncResult` are used as
 * bare identifiers (not namespaced), so this is how we spot them.
 */
export const isIdentifierTypeName = (
  node: ESTree.TSTypeReference,
  names?: readonly string[],
): node is ESTree.TSTypeReference & { typeName: ESTree.IdentifierReference } => {
  return node.typeName.type === "Identifier" && (!names || names.includes(node.typeName.name));
};
