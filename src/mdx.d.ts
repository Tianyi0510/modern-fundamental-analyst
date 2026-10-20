/// <reference types="mdx" />

declare module "*.mdx" {
  export const memoTableOfContents: Array<{ id: string; title: string; level: 2 | 3 }>;
}
