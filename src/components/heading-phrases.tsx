import type { Locale } from "@/lib/i18n";

export function ResponsiveHeadingBreak({ locale }: { locale: Locale }) {
  if (locale !== "en") return <br />;
  return (
    <>
      {" "}
      <br className="compact:hidden" />
    </>
  );
}

export function HeadingPhrases({ text }: { text: string | readonly string[] }) {
  if (typeof text === "string") return text;
  return text.map((phrase) =>
    phrase.trim() === "" ? (
      phrase
    ) : (
      <span key={phrase} className="compact:inline-block compact:max-w-full">
        {phrase}
      </span>
    ),
  );
}
