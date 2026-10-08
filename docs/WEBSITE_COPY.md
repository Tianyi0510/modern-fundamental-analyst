# Website Copy

The single editing document for website copy. Edit English here; when you ask to apply the changes, update the website in English, Traditional Chinese and Simplified Chinese. Editing this file does not change or publish the website.

Structure last checked against the local workspace: **2026-10-08**. This is an editable outline, not a complete transcript or verification of the deployed site.

## How to Edit

| Change                 | What to do                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Replace wording        | Edit an existing label or message, or replace a `Title`, `Subtitle`, `Text` or numbered-item placeholder with complete English copy.                                           |
| Keep existing wording  | Leave the text or placeholder unchanged. Unfilled placeholders mean “keep existing copy,” not missing content.                                                                 |
| Edit a paragraph group | Replace the entire `Text × 3 paragraphs` slot with the intended paragraphs. Separate paragraphs with a blank line and keep them under the same heading.                        |
| Remove content         | Mark the specific item or block `[Remove]`. An omitted line alone is not a deletion instruction.                                                                               |
| Add or move content    | Mark it `[Add]` or `[Move to: destination]`, with enough context to identify its page and section.                                                                             |
| Change shared wording  | Edit the shared section once. It applies to every instance unless you name a page-specific exception.                                                                          |
| Update the website     | Ask to apply this document. Translate changed English into both Chinese locales, preserve meaning and deliberate locale differences, and verify the affected pages and states. |

Preserve dynamic fields and their data sources. Changes to a metric label must remain consistent with its calculation; changing a label does not change the calculation. Keep English headings, CTA labels and short annotations in APA Title Case; use sentence case for full explanations and status messages. Follow the [Style Guide](STYLE_GUIDE.md#content-and-localization).

### Reading the Outline

| Notation                                               | Meaning                                                                                                               |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `Title`, `Subtitle`, `Text`, `Summary`, numbered items | Existing content slots. Replace them only when requesting new wording.                                                |
| `[Dynamic]`, `[Date]`, `[Count]`, `[Year]`, `[Number]` | Runtime values. Edit surrounding copy without replacing the value with a fixed number or date.                        |
| `[Conditional: …]`                                     | Copy shown only in the named state. Preserve the distinction between success, failure, pending and unverified states. |
| `[Reference: …]`                                       | A shared block maintained elsewhere in this document; the annotation is not website copy.                             |
| Indentation                                            | Content grouping and reading order, not a prescribed HTML heading level or font size.                                 |

Section names such as “Portfolio Summary,” “Form Labels” and “Payment States” organize this document; they are not automatically visible headings. Labels such as `Chart 1:`, `Axis:` and `Placeholder:` identify a text field; edit the text after them. Line breaks inside a message are for readability unless explicitly requested as visible breaks.

Routes below use English paths. Traditional Chinese adds `/zh-tw`; Simplified Chinese adds `/zh-cn`. Language names are exact labels from [locale configuration](../src/lib/i18n.ts). The published memo body stays in its existing source language unless an article update is explicitly requested.

## Contents

- [How to Edit](#how-to-edit)
- [Header](#header)
- [Home](#home)
- [About](#about)
- [Portfolio](#portfolio)
- [Performance](#performance)
- [Investment Memos](#investment-memos)
- [Investment Memo Article](#investment-memo-article)
- [Contact](#contact)
- [Support](#support)
- [Disclaimer](#disclaimer)
- [Email Preferences](#email-preferences)
- [Footer](#footer)
- [Shared Subscription Form](#shared-subscription-form)
- [Subscription Confirmation](#subscription-confirmation)
- [Loading and Error States](#loading-and-error-states)
- [Supporting Sources and Maintenance](#supporting-sources-and-maintenance)

## Header

Shared navigation, language selection and responsive menu controls.

Source: [src/components/site-header.tsx](../src/components/site-header.tsx).

```text
Modern Fundamental Analyst.
Home
About
Portfolio
Performance
Investment Memos
Contact
Language Options
  English
  繁體中文
  简体中文
  [Dynamic: current language label]
  [Conditional: mobile disclosure lists only the other two languages]
Menu Controls [Conditional: responsive menu state]
  Open Menu
  Close Menu
  Change Language
```

## Home

Route: `/`.

Source: [src/app/_components/home-page-content.tsx](../src/app/_components/home-page-content.tsx).

```text
Home
  Title
  Subtitle
  View Portfolio
  Read the Latest Investment Memo
Portfolio Summary
  TWRR
    Value [Dynamic: reconstructed cumulative TWRR]
    Time-Weighted Return · Reconstructed · Cumulative
  Market Value
    Value [Dynamic]
    [Holding count] Stocks and ETFs [Dynamic]
  XIRR
    Value [Dynamic]
    Money-Weighted Return · Annualized
  As of [Date] · Updated Monthly
01 · About
  Title
  Text
  About the Process
02 · Portfolio
  Title
  Featured Holdings × 4
    Rank [Dynamic: 01–04]
    Position symbol [Dynamic]
    Market Value [Dynamic]
    Weight [Dynamic]
  Holdings Allocation
    Position symbols and weights [Dynamic]
    Other
  Full Portfolio
03 · Performance
  Title
  XIRR Comparison Chart [Home comparison graphic]
    Portfolio
      Value [Dynamic]
    SPY
      Value [Dynamic]
  Comparison Text [Includes dynamic SPY return]
  As of [Date] · Updated Monthly
  View Performance
04 · Investment Memos
  Title
  Memo Cards [Reference: Investment Memos → Featured Memo Cards]
  View All Investment Memos
05 · Contact
  Title
  Get in Touch
```

## About

Route: `/about`.

Source: [src/app/_components/about-page-content.tsx](../src/app/_components/about-page-content.tsx).

```text
About
  Title
  Subtitle
  Finance · BAIT · Philosophy · Music
01 · Introduction
  Title
  Text × 3 paragraphs
02 · What Is a Modern Fundamental Analyst?
  Title
  Text × 3 paragraphs
03 · Investment Philosophy
  Title
  Text × 3 paragraphs
04 · Transparency and Accountability
  Title
  Text × 3 paragraphs
05 · Research and Writing
  Title
  Text × 3 paragraphs
06 · Background
  Title
  Text × 3 paragraphs
What This Website Is
  Numbered item 01
  Numbered item 02
  Numbered item 03
What This Website Is Not
  Numbered item 01
  Numbered item 02
  Numbered item 03
Closing
  Title
  Text × 3 paragraphs
  Reference note
    Disclaimer link
    Performance link [Methodology is on the Performance page]
```

## Portfolio

Route: `/portfolio`.

Source: [src/app/_components/portfolio-page-content.tsx](../src/app/_components/portfolio-page-content.tsx).

```text
Portfolio
  Title
  Subtitle
  As of [Date] · Updated Monthly
Portfolio Summary
  Stock Market Value
    Value [Dynamic]
    USD
  Net Cost Basis
    Value [Dynamic]
    Purchases and Transaction Fees
  Total Return
    Value [Dynamic: cost-basis total return percentage, matching the table Total]
    Absolute Return
  Holdings
    Count [Dynamic]
    Stocks and ETFs
Current Holdings
  [Count] Disclosed Positions.
  Sorting instructions
  Prices and market values use closing prices as of [Date].
Holdings Table
  Position
  Shares
  Price
  Cost Basis
  Market Value
  Return
  Weight
  Total
Mobile Sorting
  Sort By
  Column options
  Ascending
  Descending
Return Note
  Each position's return compares market value with cost basis.
  Net dividends and financing interest are not allocated to positions;
  they are added and deducted, respectively, in the total cost-basis return
  shown in both the summary and the table.
Accessibility Labels
  Portfolio Summary
  Portfolio Holdings
  Sort By [Column]
  Sort By: [Ascending / Descending]
```

## Performance

Route: `/performance`.

Source: [src/app/_components/performance-page-content.tsx](../src/app/_components/performance-page-content.tsx).

```text
Performance
  Title
  Subtitle
  As of [Date] · Updated Monthly
Performance Summary
  TWRR
    Value [Dynamic: reconstructed cumulative TWR]
    Time-Weighted Return · Reconstructed · Cumulative
  Portfolio XIRR
    Value [Dynamic: annualized money-weighted return]
    Money-Weighted Return · Annualized
  SPY XIRR
    Value [Dynamic]
    Benchmark Comparison · Simulated · Annualized
Performance Chart
  Measured Consistently.
  Chart 1: Cumulative Reconstructed TWRR
    Note:
      Cumulative closing-price TWRR. Contributions are modeled at period start;
      net income and costs at period end. Not observed intraday TWRR.
    Axis: Cumulative Reconstructed TWRR
    Legend: Portfolio / SPY
    Dates and percentage ticks [Dynamic]
    Accessible chart summary [Dynamic]
    View Monthly Data
      Month End / Stock Market Value / Portfolio TWRR / SPY TWRR
  Chart 2: Annualized XIRR
    Note:
      Since-inception annualized XIRR at each month-end, not individual monthly returns.
      Periods shorter than 30 days are not annualized and are omitted from the lines.
    Axis: Annualized XIRR
    Legend: Portfolio / SPY
    Dates and percentage ticks [Dynamic]
    Accessible chart summary [Dynamic]
    View Monthly Data
      Month End / Stock Market Value / Portfolio XIRR / SPY XIRR
      Not annualized: less than 30 days [Conditional]
  Both Monthly Data Disclosures
    Swipe horizontally to compare columns; scroll vertically for earlier months.
    Caption: Month-End Data · Newest First
Methodology
  Cumulative Reconstructed TWRR.
    Text [Closing-price linking, contribution timing, gifts, splits, costs and limitations]
  Annualized XIRR.
    Text [Dated cash flows, month-end since-inception returns and 30-day threshold]
  SPY Comparison.
    Text [Separate hypothetical TWR and XIRR benchmark assumptions]
  Stocks and ETFs.
    Text [Measurement boundary, excluded balances, dividends, fees and interest]
Data Sources
  Updated monthly. Prices and market values reflect closing prices as of [Date],
  using the preceding trading close when markets are closed. They are not live quotes.
```

## Investment Memos

Route: `/memos`.

Source: [src/app/_components/memo-list-page.tsx](../src/app/_components/memo-list-page.tsx).

```text
Investment Memos
  Title
  Subtitle
  Last Updated on [Date]
Featured Memo Cards
  Published card
    Memo number
    Category
    Title
    Summary
    Publication date
    Reading time
  Planned card [Conditional]
    Memo number
    Planned
    Investment Memo [Number]
    Research is in progress.
    This space is reserved for a future investment thesis.
    Coming Soon
Memo Index
  View All Investment Memos
  Memo count [Dynamic]
  Each Entry
    Memo number
    Category
    Title
    Summary
    Publication date
    Reading time
```

## Investment Memo Article

Route: `/memos/[slug]`.

Source: [src/app/_components/memo-detail-page.tsx](../src/app/_components/memo-detail-page.tsx).

```text
Article Header
  Category
  Title
  Publication date
  Reading time
  Investment Memo [Number]
  Summary
Article Body
  Section Title
  Introduction paragraphs [Where present]
  Subsection Title
  Subsection Text
References:
  Numbered references
```

## Contact

Route: `/contact`.

The Subscribe block uses the [shared subscription form](#shared-subscription-form); its title and introduction remain specific to Contact.

Source: [src/app/_components/contact-page-content.tsx](../src/app/_components/contact-page-content.tsx).

```text
Contact
  Title
  Subtitle
Subscribe
  Subtitle
  Shared Subscription Form [Reference: Shared Subscription Form]
Send a Message
  Subtitle
  Form Labels
    Name
    Email
    Subject
    Message
  Button
    Send Message
    Sending… [Conditional]
  Success
    Your message has been sent.
    Thank you for reaching out.
  Error
    Your message could not be sent.
    Please try again later.
```

## Support

Route: `/support`.

Source: [src/features/support/support-copy.ts](../src/features/support/support-copy.ts).

```text
Support
  Title
  Subtitle
Choose an Amount.
  Subtitle
  Amount Selector
    One-Time Support Amount
    USD 6 / USD 12 / USD 18 [Dynamic: configured support amounts]
  Button
    Continue to Stripe
    Redirecting to Stripe… [Conditional]
    Try Again [Conditional]
    Retry This Checkout [Conditional]
  Recovery Note [Conditional]
    If navigation stopped or failed, retry this checkout with the same amount.
  Payment Note
    Securely processed by Stripe.
    This is voluntary support—not a charitable donation,
    investment product, or advisory service.
Payment States [Conditional]
  Pending
    Your payment is still processing.
    Check your Stripe confirmation before trying again.
  Unverified
    We could not confirm this payment.
    Check your Stripe confirmation before trying again.
  Success
    Thank you for supporting independent research.
    Stripe will send your payment confirmation by email.
  Cancelled
    You returned from Checkout. Payment status has not been verified.
    Check your Stripe confirmation before trying again.
  Error
    Checkout is temporarily unavailable.
    Please try again later.
  Retired Checkout
    This checkout attempt can no longer be resumed. Check your original Stripe confirmation
    before starting another payment.
  Rate Limited
    Too many checkout attempts. Wait 10 minutes before trying again.
    This attempt did not start a payment.
  Invalid Amount
    Choose USD 6, 12, or 18, then try again.
```

## Disclaimer

Route: `/disclaimer`.

Source: [src/app/_components/disclaimer-page-content.tsx](../src/app/_components/disclaimer-page-content.tsx).

```text
Disclaimer
  Title
  Subtitle
01 · No Investment Advice
  Title
  Text
02 · Investment Risks
  Title
  Text
03 · Limitation of Liability
  Title
  Text
```

## Email Preferences

Route: `/subscription-preferences`.

Source: [src/app/_components/subscription-preferences-page.tsx](../src/app/_components/subscription-preferences-page.tsx).

```text
Email Preferences
  Title
  Subtitle
Secure Link Request [Conditional: missing or invalid token]
  Privacy and secure-link explanation
  Email Address
  Button
    Send Secure Link
    Sending…
  Confirmation
    If this address is subscribed, a secure link is on its way.
  Error
    Your request could not be completed.
    Please try again.
Subscription Management [Conditional: valid token]
  Email Address
    Masked email [Dynamic]
  Preferred Language
    Choose a language
    English
    繁體中文
    简体中文
  Save Button
    Save Preferences
    Saving…
  Saved
    Your preferred language has been updated.
  Unsubscribe Button
    Unsubscribe
    Unsubscribing…
  Unsubscribed
    You have been unsubscribed.
  Error
    Your request could not be completed.
    Please try again.
```

## Footer

Used across normal page layouts. “Stay Updated.” uses the [shared subscription form](#shared-subscription-form).

Source: [src/components/site-footer.tsx](../src/components/site-footer.tsx).

```text
Modern Fundamental Analyst.
Independent research. Transparent thinking. Long-term orientation.
Quick Links
  Contact
  Support
  Disclaimer
  GitHub
  LinkedIn
  X (formerly Twitter)
Stay Updated.
  Shared Subscription Form [Reference: Shared Subscription Form]
© [Year] Modern Fundamental Analyst. All Rights Reserved.
```

## Shared Subscription Form

Shared by [Contact](#contact) and the [Footer](#footer). Edit common field labels and feedback here; keep placement-specific headings in their own sections.

Source: [src/features/subscriptions/subscribe-form.tsx](../src/features/subscriptions/subscribe-form.tsx).

```text
Email Address
  Placeholder: you@example.com
Subscribe
  Subscribing… [Conditional]
Email Preferences
Confirmation Requested [Conditional]
  Check your inbox and confirm your subscription.
Already Subscribed [Conditional]
  You've already subscribed
Error [Conditional]
  Subscription could not be completed. Please try again.
Hidden Anti-Spam Field
  Website [Not normal visible copy]
```

## Subscription Confirmation

Route: `/subscription-confirmation`.

Source: [src/app/_components/subscription-confirmation-page.tsx](../src/app/_components/subscription-confirmation-page.tsx).

```text
Confirm Your Subscription [Eyebrow and title]
  Confirm that you want to receive Modern Fundamental Analyst research updates.
  This link expires in 24 hours.
Confirm Subscription
  Confirming… [Conditional]
Success [Conditional]
  Your subscription is confirmed.
Error or Missing/Malformed Token [Conditional]
  This request could not be completed. Try again or request a new confirmation
  from the subscription form.
Home [Link to the localized home subscription section]
Shared Footer
```

## Loading and Error States

Source: [src/components/page-error.tsx](../src/components/page-error.tsx).

```text
Service Loading
  Loading…
Chart Fallback
  [TWR / XIRR]: This chart is temporarily unavailable.
  Try Again [After a caught client rendering failure]
Not Found
  404
  Nothing Invested Here.
  Return Home
Route Error
  This Page Could Not Be Loaded.
  Try Again
  Return Home
Global Error [English fallback]
  This Page Could Not Be Loaded.
  Try Again
  Return Home
Skip Navigation
  Skip to Main Content
```

## Supporting Sources and Maintenance

- [Navigation labels](../src/lib/navigation-copy.ts) and [locale labels](../src/lib/i18n.ts).
- [Chart labels and tables](../src/features/portfolio/performance-chart-view.tsx), [chart selection](../src/features/portfolio/performance-chart.tsx) and [chart fallback](../src/features/portfolio/chart-boundary.tsx).
- [Contact form](../src/features/contact/contact-form.tsx), [subscription states](../src/features/subscriptions/subscribe-form-client.tsx), [confirmation copy](../src/features/subscriptions/confirmation-copy.ts) and [confirmation form](../src/features/subscriptions/subscription-confirmation-form.tsx).
- [Support amount catalog](../src/features/support/server/support-catalog.ts).
- [Memo cards](../src/features/memos/memo-cards.tsx), [memo catalog](../src/features/memos/memos.ts) and [published article](../src/features/memos/articles/microsoft-stock-analysis-fiscal-year-2024.ts).
- [Loading](../src/components/service-loading.tsx), [English 404](<../src/app/(en)/not-found.tsx>), [Traditional Chinese 404](../src/app/zh-tw/not-found.tsx), [Simplified Chinese 404](../src/app/zh-cn/not-found.tsx), [global error](../src/app/global-error.tsx) and [skip navigation](../src/components/site-document.tsx).

After applying requested edits, reconcile this outline with the implemented page order, content slots and state flows. Remove resolved `[Add]`, `[Remove]` and `[Move to: …]` instructions. Verify affected translations, links, layout and behavior, and report what was checked. Commit or deploy only when requested.

Runtime source describes current behavior until document edits are implemented. Email bodies, provider-hosted Stripe screens, browser-generated validation messages and internal API diagnostics are outside this document’s scope.
