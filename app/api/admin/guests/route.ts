import { NextRequest, NextResponse } from "next/server";
import { fetchAllGuests } from "@/app/lib/guests";
import { extractPlusOnes } from "@/app/lib/guestUtils";
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
      plus_ones: extractPlusOnes(g.comments),
      comments: (g.comments ?? "").replace(/\n\nPlus-one request: .+/s, "").trim(),
      invite_received: g.invite_received ?? false,
      is_attending: g.is_attending,
    }));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Admin guests fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch guests" },
      { status: 500 }
    );
  }
}
