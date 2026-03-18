import { NextRequest, NextResponse } from "next/server";
import { fetchAllGuests } from "@/app/lib/guests";
import { createServerClient } from "@/app/lib/supabase";
import {
  getAdminAuthCookie,
  verifyAdminToken,
} from "@/app/lib/adminAuth";

export async function GET(request: NextRequest) {
  const cookie = getAdminAuthCookie(request.headers.get("cookie"));
  if (!cookie || !verifyAdminToken(cookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const guests = await fetchAllGuests();

    const rows = guests.map((g) => ({
      id: g.id,
      invite_code: g.invite_code,
      name: g.name,
      email: g.email ?? "",
      comments: g.comments ?? "",
      invite_received: g.invite_received ?? false,
      is_attending: g.is_attending,
      offered_hotel: g.offered_hotel ?? false,
      accepted_hotel: g.accepted_hotel ?? null,
      rsvp_by: g.rsvp_by ?? null,
    }));

    const hotelStats = {
      offered: rows.filter((r) => r.offered_hotel).length,
      accepted: rows.filter((r) => r.accepted_hotel === true).length,
      declined: rows.filter((r) => r.accepted_hotel === false).length,
    };

    return NextResponse.json({ rows, hotelStats });
  } catch (error) {
    console.error("Admin guests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(request: NextRequest) {
  const cookie = getAdminAuthCookie(request.headers.get("cookie"));
  if (!cookie || !verifyAdminToken(cookie)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name?: string; rsvp_by?: string | null } = {};
  try {
    body = await request.json();
  } catch {
    // no body
  }

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Try up to 5 times to find a unique invite code
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    const { error } = await supabase.from("guests").insert({
      name: body.name.trim(),
      invite_code: code,
      rsvp_by: body.rsvp_by ?? null,
      invite_received: false,
      is_attending: null,
      offered_hotel: false,
      accepted_hotel: null,
    });

    if (!error) return NextResponse.json({ success: true, invite_code: code });
    // If not a uniqueness conflict, bail immediately
    if (error.code !== "23505") {
      console.error("Admin create guest error:", error.message);
      return NextResponse.json({ error: "Failed to create guest" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Could not generate unique invite code" }, { status: 500 });
}
