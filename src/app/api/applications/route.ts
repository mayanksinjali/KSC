import { NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again.", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // No project configured yet: accept so the UI flow is fully testable in preview.
  if (!isSupabaseConfigured) {
    return NextResponse.json({ ok: true, stored: false });
  }

  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Applications are temporarily unavailable." }, { status: 503 });
  }

  const { error } = await supabase.from("applications").insert({
    name: parsed.data.name,
    class: parsed.data.class,
    contact: parsed.data.contact,
    message: parsed.data.message,
    status: "new",
  });

  if (error) {
    // Never leak raw database errors to the public.
    console.error("application insert failed:", error.message);
    return NextResponse.json(
      { error: "We couldn't submit your application. Please try again shortly." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, stored: true });
}
