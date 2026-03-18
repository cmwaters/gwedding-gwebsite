import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/app/lib/supabase";
import { getAdminAuthCookie, verifyAdminToken } from "@/app/lib/adminAuth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = getAdminAuthCookie(request.headers.get("cookie"));
  if (!cookie || !verifyAdminToken(cookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: { action?: string; offered_hotel?: boolean; is_attending?: boolean | null; accepted_hotel?: boolean | null; name?: string; rsvp_by?: string | null } = {};
  try {
    body = await request.json();
  } catch {
    // No body — treat as mark_invited (backwards compat)
  }

  const action = body.action ?? "mark_invited";

  try {
    const supabase = createServerClient();

    if (action === "mark_invited") {
      const { error } = await supabase
        .from("guests")
        .update({ invite_received: true, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Admin mark invited error:", error.message);
        return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
      }
    } else if (action === "toggle_hotel") {
      const newValue = body.offered_hotel ?? false;
      const update: Record<string, unknown> = {
        offered_hotel: newValue,
        updated_at: new Date().toISOString(),
      };
      // Clear acceptance when uninviting
      if (!newValue) update.accepted_hotel = null;

      const { error } = await supabase
        .from("guests")
        .update(update)
        .eq("id", id);

      if (error) {
        console.error("Admin toggle hotel error:", error.message);
        return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
      }
    } else if (action === "set_hotel_accepted") {
      const { error } = await supabase
        .from("guests")
        .update({ accepted_hotel: body.accepted_hotel ?? null, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Admin set hotel accepted error:", error.message);
        return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
      }
    } else if (action === "set_attending") {
      const { error } = await supabase
        .from("guests")
        .update({ is_attending: body.is_attending ?? null, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Admin set attending error:", error.message);
        return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
      }
    } else if (action === "update_name") {
      const { error } = await supabase
        .from("guests")
        .update({ name: body.name ?? "", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Admin update name error:", error.message);
        return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
      }
    } else if (action === "update_rsvp_by") {
      const { error } = await supabase
        .from("guests")
        .update({ rsvp_by: body.rsvp_by ?? null, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) {
        console.error("Admin update rsvp_by error:", error.message);
        return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin guest PATCH error:", error);
    return NextResponse.json({ error: "Failed to update guest" }, { status: 500 });
  }
}
