import { readSubscriptionJournal, resolveSubscriptionJournal } from "./subscription-journal.ts";
import { withSubscriberLock } from "./resend-coordination.ts";

const [command, email, expectedId] = process.argv.slice(2);
if (!email || !["status", "resolve"].includes(command) || (command === "resolve" && !expectedId)) {
  throw new Error("Usage: npm run subscription:journal -- status EMAIL | resolve EMAIL OPERATION_ID");
}
if (command === "status") console.log(JSON.stringify(await readSubscriptionJournal(email), null, 2));
else {
  await withSubscriberLock(email, () => resolveSubscriptionJournal(email, expectedId));
  console.log("Reconciled journal cleared. No provider writes or emails were sent.");
}
