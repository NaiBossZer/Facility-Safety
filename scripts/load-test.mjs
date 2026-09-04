// Concurrency smoke test for the server-side WO counter.
// Usage: LOAD_TEST_REQUESTS=50 LOAD_TEST_EMAIL=... LOAD_TEST_PASSWORD=... npm run test:load
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const email = process.env.LOAD_TEST_EMAIL;
const password = process.env.LOAD_TEST_PASSWORD;
const count = Number(process.env.LOAD_TEST_REQUESTS || 50);
if (!url || !key || !email || !password) {
  console.error("Set VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, LOAD_TEST_EMAIL and LOAD_TEST_PASSWORD");
  process.exit(2);
}

const client = createClient(url, key);
const login = await client.auth.signInWithPassword({ email, password });
if (login.error) throw login.error;
const started = performance.now();
const results = await Promise.all(Array.from({ length: count }, () =>
  client.rpc("reserve_work_order_number", { p_date: new Date().toISOString().slice(0, 10) })
));
const elapsed = performance.now() - started;
const errors = results.filter((r) => r.error);
const numbers = results.map((r) => r.data?.[0]?.work_order_number).filter(Boolean);
const unique = new Set(numbers);
const report = {
  requests: count,
  success: numbers.length,
  errors: errors.length,
  uniqueNumbers: unique.size,
  duplicateNumbers: numbers.length - unique.size,
  totalMs: Math.round(elapsed),
  p50Ms: "see Supabase dashboard logs",
};
console.log(JSON.stringify(report, null, 2));
if (errors.length || unique.size !== numbers.length) process.exitCode = 1;

