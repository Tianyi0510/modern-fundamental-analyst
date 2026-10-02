import { appearance } from "./memo-article-content.styles";
import type { MemoContent } from "@/features/memos/memo-content";

export function MemoArticleContent({ content }: { content: MemoContent }) {
  return (
    <div className={appearance["article-body"]}>
      {content.sections.map((section) => (
        <section className={appearance["memo-section"]} key={section.title}>
          <h2>{section.title}</h2>
          {section.introduction?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.subsections.map((subsection) => (
            <section className={appearance["memo-subsection"]} key={subsection.title}>
              <h3>{subsection.title}</h3>
              {subsection.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </section>
      ))}
      <section className={appearance["memo-references"]}>
        <h2>{content.referencesTitle}</h2>
        <ol>
          {content.references.map((reference) => (
            <li key={reference}>{reference}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
