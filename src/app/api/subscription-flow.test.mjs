import assert from "node:assert/strict";
import test from "node:test";

import { read } from "@/testing/repository-helpers.mjs";

test("contact form keeps localized copy on the server and sends through a client boundary", async () => {
  const [page, form, client, route, resend] = await Promise.all([
    read("src/app/_components/contact-page-content.tsx"),
    read("src/features/contact/contact-form.tsx"),
    read("src/features/contact/contact-form-client.tsx"),
    Promise.all([
      read("src/app/api/contact/route.ts"),
      read("src/features/contact/server/send-contact-message.ts"),
    ]).then((parts) => parts.join("\n")),
    read("src/lib/resend.ts"),
  ]);

  assert.match(page, /ContactForm locale=\{locale\}/);
  assert.match(page, /className="contact-grid"/);
  assert.doesNotMatch(form, /"use client"/);
  assert.match(form, /ContactFormClient\s+copy=\{copy\[locale\]\}/);
  assert.match(form, /title: "Send a Message"/);
  assert.doesNotMatch(form, /Start A Conversation|label: "Send A Message"/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(client, /"use client"/);
  assert.match(client, /sendContactMessage\(/);
  assert.match(client, /contact-form\.module\.css/);
  assert.doesNotMatch(client, /headingLabel/);
  assert.match(client, /<HoneypotField \/>/);
  assert.match(route, /CONTACT_TO_EMAIL/);
  assert.match(route, /CONTACT_FROM_EMAIL/);
  assert.match(resend, /contact@mail\.modernfundamentalanalyst\.com/);
  assert.match(route, /replyTo:\s*email/);
  assert.match(route, /getResendIdempotencyKey\(request, "contact"\)/);
  assert.match(resend, /process\.env\.RESEND_API_KEY/);
  assert.doesNotMatch(client, /RESEND_API_KEY/);
});

test("subscribe form stores contacts and triggers a localized welcome automation", async () => {
  const [page, form, client, route, service, footer] = await Promise.all([
    read("src/app/_components/contact-page-content.tsx"),
    read("src/features/subscriptions/subscribe-form.tsx"),
    read("src/features/subscriptions/subscribe-form-client.tsx"),
    read("src/app/api/subscribe/route.ts"),
    read("src/features/subscriptions/server/subscription-service.ts"),
    read("src/components/site-footer.tsx"),
  ]);

  assert.doesNotMatch(page, /SubscribeForm/);
  assert.doesNotMatch(form, /"use client"/);
  assert.match(form, /SubscribeFormClient\s+copy=\{copy\[locale\]\}/);
  assert.match(form, /"zh-tw"/);
  assert.match(form, /"zh-cn"/);
  assert.match(client, /"use client"/);
  assert.match(client, /subscribeToUpdates\(/);
  assert.match(client, /<HoneypotField \/>/);
  assert.match(
    footer,
    /className="footer-social-link footer-x"\s+href="https:\/\/x\.com\/DavidLi0510"\s+target="_blank"\s+rel="noreferrer"/,
  );
  assert.match(footer, /footer-x[\s\S]*?<svg aria-hidden="true"[\s\S]*?<span>X \(formerly Twitter\)<\/span>/);
  assert.match(route, /subscribeContact\(email, locale, getLatestMemo\)/);
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
  assert.match(service, /memo_url:.*getLocalizedPath/);
  assert.match(service, /preferences_url: createPreferenceUrl\(email, locale\)/);
  assert.doesNotMatch(route, /ok: true, preferencesUrl/);
  assert.match(service, /unsubscribed:\s*true/);
  assert.match(form, /secure preferences link/);
  assert.match(form, /安全偏好設定連結/);
  assert.match(form, /安全偏好设置链接/);
  assert.match(route, /readProtectedObjectJson/);
  assert.doesNotMatch(client, /RESEND_API_KEY/);
  assert.match(footer, /\{subscription\}/);
  assert.doesNotMatch(footer, /features\/subscriptions/);
  assert.match(await read("src/app/_components/page-footer.tsx"), /SubscribeForm locale=\{locale\}/);
});

test("subscription preferences use encrypted expiring links and update Resend contacts", async () => {
  const [tokens, route, requestRoute, page, form, requestForm, segments, subscriptionService, emailTemplate] =
    await Promise.all([
      read("src/features/subscriptions/server/subscription-preferences.ts"),
      Promise.all([
        read("src/app/api/subscription-preferences/route.ts"),
        read("src/features/subscriptions/server/update-subscription-preferences.ts"),
      ]).then((parts) => parts.join("\n")),
      read("src/app/api/subscription-preferences/request/route.ts"),
      read("src/app/_components/subscription-preferences-page.tsx"),
      read("src/features/subscriptions/subscription-preferences-form.tsx"),
      read("src/features/subscriptions/subscription-preferences-request-form.tsx"),
      read("src/features/subscriptions/server/resend-segments.ts"),
      read("src/features/subscriptions/server/subscription-service.ts"),
      read("src/features/subscriptions/preference-email.tsx"),
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
  assert.match(
    route,
    /rollbackLanguageSegments = await syncPreferredLanguageSegment\(resend, payload\.email, locale\)/,
  );
  assert.match(route, /unsubscribed: true/);
  assert.match(route, /readProtectedObjectJson/);
  assert.match(await read("src/features/subscriptions/saved-preferences.tsx"), /maskEmail\(email\)/);
  assert.match(page, /Save Preferences/);
  assert.doesNotMatch(form, /RESEND_API_KEY/);
  assert.match(requestRoute, /createPreferenceUrl\(email, locale, 30 \* 60 \* 1000\)/);
  assert.match(requestRoute, /resend\.emails\.send/);
  assert.match(requestRoute, /getResendIdempotencyKey\(request, "preferences"\)/);
  assert.match(requestRoute, /renderPreferenceEmail/);
  assert.match(emailTemplate, /EmailLayout/);
  assert.doesNotMatch(emailTemplate, />MODERN FUNDAMENTAL ANALYST</);
  assert.match(requestRoute, /existing\.error\?\.statusCode !== 404/);
  assert.match(requestRoute, /return NextResponse\.json\(\{ ok: true \}\)/);
  assert.match(requestForm, /requestPreferencesLink\(/);
  assert.match(page, /SubscriptionPreferencesRequestForm/);
  assert.match(segments, /PreferredLanguageSegments|preferredLanguageSegments/);
  assert.match(segments, /process\.env\.RESEND_SEGMENT_EN/);
  assert.match(segments, /contacts\.segments\.add/);
  assert.match(segments, /contacts\.segments\.remove/);
  assert.match(subscriptionService, /segments: \[\{ id: getPreferredLanguageSegmentId\(locale\) \}\]/);
});
