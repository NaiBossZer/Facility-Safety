// Deploy with: supabase functions deploy process-notifications
// Invoke from Supabase Cron every minute. Secrets stay server-side.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);
const webhook = Deno.env.get("NOTIFICATION_WEBHOOK_URL");

Deno.serve(async () => {
  if (!webhook) return new Response("NOTIFICATION_WEBHOOK_URL is not configured", { status: 503 });
  const { data: jobs, error } = await db
    .from("notification_jobs")
    .select("*")
    .in("status", ["pending", "failed"])
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at")
    .limit(20);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const results = [];
  for (const job of jobs || []) {
    await db.from("notification_jobs").update({ status: "processing", attempts: job.attempts + 1 }).eq("id", job.id);
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json", "x-fsa-event": job.kind },
        body: JSON.stringify({ id: job.id, eventKey: job.event_key, payload: job.payload }),
      });
      if (!response.ok) throw new Error(`notification provider ${response.status}`);
      await db.from("notification_jobs").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      results.push({ id: job.id, status: "sent" });
    } catch (sendError) {
      const attempts = job.attempts + 1;
      await db.from("notification_jobs").update({
        status: "failed",
        last_error: String(sendError),
        next_attempt_at: new Date(Date.now() + Math.min(30 * 60_000, 1000 * 2 ** Math.min(attempts, 10))).toISOString(),
      }).eq("id", job.id);
      results.push({ id: job.id, status: "failed" });
    }
  }
  return Response.json({ processed: results.length, results });
});

