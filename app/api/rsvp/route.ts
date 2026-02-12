import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/app/lib/supabase";

interface GuestRsvp {
  invite_code: string;
  is_attending: boolean;
}

interface RsvpPayload {
  guests: GuestRsvp[];
  email: string;
  comments: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RsvpPayload = await request.json();

    // Validate payload
    if (!body.guests || !Array.isArray(body.guests) || body.guests.length === 0) {
      return NextResponse.json({ error: "No guests provided" }, { status: 400 });
    }

    if (!body.email || typeof body.email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    for (const guest of body.guests) {
      if (!guest.invite_code || typeof guest.is_attending !== "boolean") {
        return NextResponse.json(
          { error: `Invalid guest data for code: ${guest.invite_code}` },
          { status: 400 }
        );
      }
    }

    const supabase = createServerClient();
    const errors: string[] = [];

    // Update each guest's record
    for (const guest of body.guests) {
      const { error } = await supabase
        .from("guests")
        .update({
          is_attending: guest.is_attending,
          email: body.email,
          comments: body.comments || null,
          has_responded: true,
          updated_at: new Date().toISOString(),
        })
        .eq("invite_code", guest.invite_code);

      if (error) {
        console.error(`Error updating guest ${guest.invite_code}:`, error.message);
        errors.push(guest.invite_code);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `Failed to update guests: ${errors.join(", ")}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RSVP submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
