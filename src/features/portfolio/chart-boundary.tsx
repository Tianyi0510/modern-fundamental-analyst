"use client";

import { Component, Suspense, type ReactNode } from "react";
import { captureException } from "@sentry/nextjs";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

const copy = {
  en: { unavailable: "This chart is temporarily unavailable.", retry: "Try Again" },
  "zh-tw": { unavailable: "此圖表暫時無法顯示。", retry: "重試" },
  "zh-cn": { unavailable: "此图表暂时无法显示。", retry: "重试" },
};

type Props = { children: ReactNode; locale: Locale; measure: "twr" | "xirr" };

export class ChartBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    // Preserve the original stack; beforeSend removes chart error messages and payloads.
    captureException(error, {
      tags: { feature: "performance-chart", measure: this.props.measure },
    });
  }

  render() {
    const { locale, measure, children } = this.props;
    const text = copy[locale];
    const fallback = (
      <div role="status" className="py-8">
        <p>
          {measure.toUpperCase()}: {text.unavailable}
        </p>
        {this.state.failed ? (
          <Button type="button" onClick={() => this.setState({ failed: false })}>
            {text.retry}
          </Button>
        ) : null}
      </div>
    );
    // Streaming SSR uses this fallback; client failures are caught by this boundary.
    return this.state.failed ? fallback : <Suspense fallback={fallback}>{children}</Suspense>;
  }
}
