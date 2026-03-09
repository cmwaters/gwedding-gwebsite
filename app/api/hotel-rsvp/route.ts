import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/app/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body: { invite_codes: string[]; accepted_hotel: boolean } = await request.json();

    if (!Array.isArray(body.invite_codes) || body.invite_codes.length === 0) {
      return NextResponse.json({ error: "No invite codes provided" }, { status: 400 });
    }

    if (typeof body.accepted_hotel !== "boolean") {
      return NextResponse.json({ error: "accepted_hotel must be a boolean" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from("guests")
      .update({
        accepted_hotel: body.accepted_hotel,
        updated_at: new Date().toISOString(),
      })
      .in("invite_code", body.invite_codes);

    if (error) {
      console.error("Hotel RSVP error:", error.message);
      return NextResponse.json({ error: "Failed to save hotel response" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Hotel RSVP error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
