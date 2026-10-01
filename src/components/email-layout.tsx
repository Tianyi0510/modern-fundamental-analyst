import type { ReactNode } from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from "react-email";
import { localeConfig, type Locale } from "@/lib/i18n";

export function EmailLayout({ locale, heading, children }: { locale: Locale; heading: string; children: ReactNode }) {
  return (
    <Html lang={localeConfig[locale].htmlLang}>
      <Tailwind config={{ presets: [pixelBasedPreset] }}>
        <Head />
        <Body
          style={{
            backgroundColor: "#ededed",
            padding: "32px 16px",
            margin: 0,
            fontFamily: "Inter,Arial,Helvetica,sans-serif",
          }}
        >
          <Preview>{heading}</Preview>
          <Container style={{ backgroundColor: "#ffffff", color: "#000000", maxWidth: "600px", margin: "0 auto" }}>
            <Section style={{ backgroundColor: "#002991", padding: "28px 32px" }}>
              <Text style={{ color: "#ffffff", fontSize: "14px", fontWeight: 700, margin: "0 0 8px" }}>
                Modern Fundamental Analyst<span style={{ color: "#008cff" }}>.</span>
              </Text>
              <Heading as="h1" style={{ color: "#ffffff", fontSize: "28px", lineHeight: "36px", margin: 0 }}>
                {heading}
              </Heading>
            </Section>
            <Section style={{ padding: "32px", overflowWrap: "anywhere" }}>{children}</Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Button
      href={href}
      className="box-border"
      style={{
        backgroundColor: "#5fcdfd",
        color: "#000000",
        fontSize: "15px",
        fontWeight: 700,
        padding: "14px 22px",
        textDecoration: "none",
      }}
    >
      {children} →
    </Button>
  );
}
