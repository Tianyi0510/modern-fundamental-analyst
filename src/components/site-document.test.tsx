import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTheme } from "next-themes";
import { expect, it, vi } from "vitest";
import { SiteDocument } from "./site-document";

vi.mock("@/lib/fonts", () => ({ jost: { variable: "font-jost" } }));
vi.mock("@vercel/analytics/next", () => ({ Analytics: () => null }));
vi.mock("@vercel/speed-insights/next", () => ({ SpeedInsights: () => null }));
vi.mock("./touch-press-feedback", () => ({ TouchPressFeedback: () => null }));

function PageThemeControl() {
  const { theme, setTheme } = useTheme();
  return <button onClick={() => setTheme("light")}>{theme ?? "No theme context"}</button>;
}

it("shares the persisted theme with page content outside the Header", async () => {
  localStorage.setItem("mfa:theme:v1", "dark");
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addListener() {}, removeListener() {} })),
  );
  try {
    render(
      <SiteDocument language="en">
        <main>
          <PageThemeControl />
        </main>
      </SiteDocument>,
      { container: document },
    );
    const control = screen.getByRole("button", { name: "dark" });
    expect(document.documentElement).toHaveAttribute("data-theme", "dark");
    await userEvent.setup().click(control);
    expect(control).toHaveTextContent("light");
    expect(document.documentElement).toHaveAttribute("data-theme", "light");
    expect(localStorage.getItem("mfa:theme:v1")).toBe("light");
  } finally {
    localStorage.clear();
    vi.unstubAllGlobals();
  }
});
