import assert from "node:assert/strict";
import test from "node:test";

import { read } from "./repository-helpers.mjs";

test("contact form keeps localized copy on the server and sends through a client boundary", async () => {
  const [page, form, client, styles, route, resend] = await Promise.all([
    read("components/contact-page-content.tsx"),
    read("components/contact-form.tsx"),
    read("components/contact-form-client.tsx"),
    read("components/contact-form.module.css"),
    read("app/api/contact/route.ts"),
    read("lib/resend.ts"),
  ]);

  assert.match(page, /ContactForm locale=\{locale\}/);
  assert.match(page, /className="contact-grid"/);
  assert.doesNotMatch(form, /"use client"/);
  assert.match(form, /ContactFormClient copy=\{copy\[locale\]\}/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(client, /"use client"/);
  assert.match(client, /fetch\("\/api\/contact"/);
  assert.match(client, /contact-form\.module\.css/);
  assert.match(styles, /\.form\s*\{[^}]*display:\s*grid/s);
  assert.match(styles, /\.form\s*\{[^}]*padding:\s*40px 40px 0/s);
  assert.match(styles, /@media \(max-width:\s*800px\)[\s\S]*?\.form\s*\{[^}]*padding:\s*26px 22px 0/s);
  assert.match(styles, /\.section\s*\{[^}]*background:\s*var\(--bright-blue\);[^}]*color:\s*var\(--black\)/s);
  assert.match(styles, /\.form\s*\{[^}]*border:\s*0;[^}]*background:\s*transparent/s);
  assert.match(styles, /\.control\s*\{[^}]*border:\s*1px solid var\(--black\)/s);
  assert.match(styles, /\.control\s*\{[^}]*background:\s*var\(--background-gray\)/s);
  assert.match(styles, /\.honeypot\s*\{[^}]*position:\s*absolute !important/s);
  assert.match(route, /CONTACT_TO_EMAIL/);
  assert.match(route, /CONTACT_FROM_EMAIL/);
  assert.match(resend, /contact@mail\.modernfundamentalanalyst\.com/);
  assert.match(route, /replyTo:\s*email/);
  assert.match(resend, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(client, /RESEND_API_KEY/);
});

test("subscribe form stores contacts and triggers a localized welcome automation", async () => {
  const [page, form, client, styles, route, service, footer] = await Promise.all([
    read("components/contact-page-content.tsx"),
    read("components/subscribe-form.tsx"),
    read("components/subscribe-form-client.tsx"),
    read("components/subscribe-form.module.css"),
    read("app/api/subscribe/route.ts"),
    read("lib/subscription-service.ts"),
    read("components/site-footer.tsx"),
  ]);

  assert.doesNotMatch(page, /SubscribeForm/);
  assert.doesNotMatch(form, /"use client"/);
  assert.match(form, /SubscribeFormClient copy=\{copy\[locale\]\}/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(client, /"use client"/);
  assert.match(client, /fetch\("\/api\/subscribe"/);
  assert.match(styles, /\.section h2\s*\{[^}]*color:\s*var\(--white\)/s);
  assert.match(styles, /\.section\s*\{[^}]*align-self:\s*start/s);
  assert.match(styles, /\.form\s*\{[^}]*align-items:\s*start[^}]*margin-top:\s*24px/s);
  assert.match(styles, /\.submit\s*\{[^}]*background:\s*var\(--white\);[^}]*color:\s*var\(--black\)/s);
  assert.match(styles, /\.submit:hover:not\(:disabled\)\s*\{[^}]*background:\s*var\(--bright-blue\);[^}]*color:\s*var\(--black\)/s);
  assert.match(styles, /\.honeypot\s*\{[^}]*position:\s*absolute !important/s);
  assert.match(route, /subscribeContact\(email, locale\)/);
  assert.match(service, /resend\.contacts\.create/);
  assert.match(service, /resend\.contacts\.update/);
  assert.match(service, /resend\.contacts\.get/);
  assert.match(service, /unsubscribed:\s*false/);
  assert.match(service, /preferred_language: localeConfig\[locale\]\.label/);
  assert.match(service, /resend\.events\.send/);
  assert.match(service, /event:\s*"subscriber\.created"/);
  assert.match(service, /shouldSendWelcome = !existing\.data \|\| existing\.data\.unsubscribed/);
  assert.match(service, /memo_title:\s*latestMemo\.title/);
  assert.match(service, /memo_summary:\s*latestMemo\.summary/);
  assert.match(service, /memo_url:\s*`\$\{SITE_URL\}\$\{prefix\}\/memos\/\$\{latestMemo\.slug\}`/);
  assert.match(service, /preferences_url: createPreferenceUrl\(email, locale\)/);
  assert.doesNotMatch(route, /ok: true, preferencesUrl/);
  assert.match(service, /unsubscribed:\s*true/);
  assert.match(form, /secure preferences link/);
  assert.match(form, /安全偏好設定連結/);
  assert.match(form, /安全偏好设置链接/);
  assert.match(route, /isSameOrigin/);
  assert.match(route, /await isRateLimited\(request\)/);
  assert.doesNotMatch(client, /RESEND_API_KEY/);
  assert.match(footer, /SubscribeForm locale=\{locale\}/);
});

test("subscription preferences use encrypted expiring links and update Resend contacts", async () => {
  const [tokens, route, requestRoute, page, form, requestForm, segments, subscriptionService, emailTemplate] = await Promise.all([
    read("lib/subscription-preferences.ts"),
    read("app/api/subscription-preferences/route.ts"),
    read("app/api/subscription-preferences/request/route.ts"),
    read("components/subscription-preferences-page.tsx"),
    read("components/subscription-preferences-form.tsx"),
    read("components/subscription-preferences-request-form.tsx"),
    read("lib/resend-segments.ts"),
    read("lib/subscription-service.ts"),
    read("lib/email-template.ts"),
  ]);

  assert.match(tokens, /createCipheriv\("aes-256-gcm"/);
  assert.match(tokens, /payload\.expiresAt <= Date\.now\(\)/);
  assert.match(tokens, /process\.env\.SUBSCRIPTION_PREFERENCES_SECRET/);
  assert.match(tokens, /process\.env\.RESEND_API_KEY/);
  assert.match(route, /readPreferenceToken\(token\)/);
  assert.match(route, /preferred_language: localeConfig\[locale\]\.label/);
  assert.match(route, /await rollbackLanguageSegments\(\)\.catch/);
  assert.match(subscriptionService, /await rollbackLanguageSegments\(\)\.catch/);
  assert.match(route, /syncPreferredLanguageSegment\(resend, payload\.email, locale\)/);
  assert.match(route, /rollbackLanguageSegments = await syncPreferredLanguageSegment\(resend, payload\.email, locale\)/);
  assert.match(route, /unsubscribed: true/);
  assert.match(route, /await isRateLimited\(request\)/);
  assert.match(page, /maskEmail\(payload\.email\)/);
  assert.match(page, /Save Preferences/);
  assert.doesNotMatch(form, /RESEND_API_KEY/);
  assert.match(requestRoute, /createPreferenceUrl\(email, locale, 30 \* 60 \* 1000\)/);
  assert.match(requestRoute, /resend\.emails\.send/);
  assert.match(requestRoute, /renderPreferenceEmail/);
  assert.match(emailTemplate, /Modern Fundamental Analyst<span style="color:#008cff">\.<\/span>/);
  assert.doesNotMatch(emailTemplate, />MODERN FUNDAMENTAL ANALYST</);
  assert.match(requestRoute, /existing\.error\?\.statusCode !== 404/);
  assert.match(requestRoute, /return NextResponse\.json\(\{ ok: true \}\)/);
  assert.match(requestForm, /subscription-preferences\/request/);
  assert.match(page, /SubscriptionPreferencesRequestForm/);
  assert.match(segments, /PreferredLanguageSegments|preferredLanguageSegments/);
  assert.match(segments, /process\.env\.RESEND_SEGMENT_EN/);
  assert.match(segments, /contacts\.segments\.add/);
  assert.match(segments, /contacts\.segments\.remove/);
  assert.match(subscriptionService, /segments: \[\{ id: getPreferredLanguageSegmentId\(locale\) \}\]/);
});
