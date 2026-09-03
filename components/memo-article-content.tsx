import type { MemoContent } from "@/data/memo-content";

export function MemoArticleContent({ content }: { content: MemoContent }) {
  const sourceLabelMatch = content.sourceLabel.match(/^(.+?[:：])\s*(.+)$/);
  const sourcePrefix = sourceLabelMatch?.[1] ?? "";
  const sourceDocument = sourceLabelMatch?.[2] ?? content.sourceLabel;

  return (
    <div className="article-body">
      {content.sections.map((section) => (
        <section className="memo-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.introduction?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          {section.subsections.map((subsection) => (
            <section className="memo-subsection" key={subsection.title}>
              <h3>{subsection.title}</h3>
              {subsection.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
        </section>
      ))}
      <section className="memo-references">
        <h2>{content.referencesTitle}</h2>
        <ol>{content.references.map((reference) => <li key={reference}>{reference}</li>)}</ol>
        <p className="article-source-note reference-note">{sourcePrefix && <><span>{sourcePrefix}</span> </>}<a className="source-link" href={content.sourceUrl} target="_blank" rel="noreferrer">{sourceDocument}</a></p>
      </section>
    </div>
  );
}
