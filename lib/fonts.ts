import { Jost, Noto_Sans_SC, Noto_Sans_TC } from "next/font/google";

export const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: "variable",
  display: "swap",
});

export const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const notoSansSc = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});
