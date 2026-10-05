/**
 * Seeds a development Supabase project with realistic KSC content.
 *
 *   npm run seed        # insert / update seed rows
 *   npm run seed:reset  # delete all rows first, then insert
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * The seed content itself lives in src/lib/seed.ts, the same module the app
 * falls back to in preview mode — so development data never drifts from what
 * the read-only preview shows.
 *
 * Run with: node scripts/seed.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Load .env.local without adding a dependency.
try {
  const env = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
} catch {
  // .env.local is optional; environment variables may come from the shell.
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
      "Copy .env.example to .env.local and fill both in, then run this script again.",
  );
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const seed = await import("../src/lib/seed.ts");

async function replace(table, rows) {
  if (reset) {
    const { error } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) throw new Error(`${table}: ${error.message}`);
  }
  const { error } = await supabase.from(table).upsert(rows, { onConflict: "id" });
  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`  ✓ ${table}: ${rows.length} rows`);
}

console.log(`Seeding ${url}${reset ? " (reset first)" : ""}…`);

try {
  await replace("members", seed.seedMembers);
  await replace("events", seed.seedEvents);
  await replace("notices", seed.seedNotices);
  await replace("gallery", seed.seedGallery);
  await replace("applications", seed.seedApplications);

  const settingsRows = Object.entries(seed.seedSettings).map(([key, value]) => ({ key, value }));
  const { error: settingsError } = await supabase
    .from("settings")
    .upsert(settingsRows, { onConflict: "key" });
  if (settingsError) throw new Error(`settings: ${settingsError.message}`);
  console.log(`  ✓ settings: ${settingsRows.length} keys`);

  console.log("\nSeed complete.");
  console.log(
    "Admin users are NOT seeded — create the first Super Admin by following the README " +
      "(\"Create the first Super Admin\").",
  );
} catch (error) {
  console.error("\nSeed failed:", error.message);
  process.exit(1);
}
