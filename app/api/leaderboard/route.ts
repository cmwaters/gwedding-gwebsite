import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/app/lib/supabase";

interface ScorePayload {
  name: string;
  score: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: ScorePayload = await request.json();

    // Validate payload
    if (!body.name || typeof body.name !== "string" || body.name.trim().length === 0) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (typeof body.score !== "number" || body.score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Upsert score — only updates if new score is higher (atomic via SQL function)
    const { error } = await supabase.rpc("upsert_score", {
      p_name: body.name.trim(),
      p_score: body.score,
    });

    if (error) {
      console.error("Leaderboard upsert error:", error.message);
      return NextResponse.json(
        { error: "Failed to submit score" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leaderboard submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all scores ordered by score descending
    const { data, error } = await supabase
      .from("leaderboard")
      .select("id, name, score, created_at")
      .order("score", { ascending: false });

    if (error) {
      console.error("Leaderboard fetch error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      );
    }

    return NextResponse.json({ scores: data ?? [] });
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
