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

  try {
    const supabase = createServerClient();
    const { error } = await supabase
      .from("guests")
      .update({
        invite_received: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Admin mark invited error:", error.message);
      return NextResponse.json(
        { error: "Failed to update guest" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin mark invited error:", error);
    return NextResponse.json(
      { error: "Failed to update guest" },
      { status: 500 }
    );
  }
}
