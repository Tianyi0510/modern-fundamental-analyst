// Build the outline and heading anchors from the same Markdown tree.
function plainText(node) {
  return node.value ?? node.alt ?? (node.children ?? []).map(plainText).join("");
}

function expression(value) {
  if (Array.isArray(value)) return { type: "ArrayExpression", elements: value.map(expression) };
  if (value && typeof value === "object") {
    return {
      type: "ObjectExpression",
      properties: Object.entries(value).map(([key, item]) => ({
        type: "Property",
        key: { type: "Identifier", name: key },
        value: expression(item),
        kind: "init",
        method: false,
        shorthand: false,
        computed: false,
      })),
    };
  }
  return { type: "Literal", value };
}

export default function remarkMemoToc() {
  return (tree) => {
    const entries = [];
    const used = new Set();
    function visit(node) {
      if (node.type === "heading" && (node.depth === 2 || node.depth === 3)) {
        // Author-defined anchors use Markdown's trailing {#id} convention.
        const last = node.children?.at(-1);
        const explicit = last?.type === "text" ? last.value.match(/\s+\{#([a-z][a-z0-9-]*)\}$/) : null;
        if (explicit) last.value = last.value.slice(0, explicit.index);
        const title = plainText(node).trim();
        const base =
          title
            .toLowerCase()
            .replace(/[^\p{L}\p{N}]+/gu, "-")
            .replace(/^-|-$/g, "") || "section";
        let id = base;
        for (let suffix = 2; used.has(id); suffix++) id = base + "-" + suffix;
        used.add(id);
        if (explicit && explicit[1] !== id) {
          // Reserve the generated name so later duplicate headings keep their URLs.
          const customBase = explicit[1];
          id = customBase;
          for (let suffix = 2; used.has(id); suffix++) id = customBase + "-" + suffix;
          used.add(id);
        }
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
        entries.push({ id, title, level: node.depth });
      }
      for (const child of node.children ?? []) visit(child);
    }
    visit(tree);
    tree.children.push({
      type: "mdxjsEsm",
      value: "",
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              specifiers: [],
              source: null,
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "memoTableOfContents" },
                    init: expression(entries),
                  },
                ],
              },
            },
          ],
        },
      },
    });
  };
}
