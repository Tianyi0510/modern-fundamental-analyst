import { memoPublishedAt } from "@/data/memo-metadata";

export const memos = [
  {
    slug: "durable-pricing-power",
    number: "001",
    title: "The anatomy of durable pricing power",
    summary: "A practical framework for separating real customer value from temporary inflation pass-through.",
    publishedAt: memoPublishedAt["durable-pricing-power"],
    readTime: "8 min",
    tag: "Business quality",
  },
  {
    slug: "self-funded-growth",
    number: "002",
    title: "When growth becomes self-funded",
    summary: "Why cash conversion and reinvestment runway matter more than headline revenue acceleration.",
    publishedAt: memoPublishedAt["self-funded-growth"],
    readTime: "6 min",
    tag: "Financial analysis",
  },
  {
    slug: "capital-allocation",
    number: "003",
    title: "Reading capital allocation",
    summary: "A checklist for evaluating buybacks, acquisitions, dividends, and the discipline behind them.",
    publishedAt: memoPublishedAt["capital-allocation"],
    readTime: "10 min",
    tag: "Management",
  },
];
