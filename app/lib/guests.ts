import { createServerClient } from "./supabase";
import type { Guest } from "./database.types";

/**
 * Splits an invite URL code into 2-letter guest codes.
 * e.g. "abcdef" → ["ab", "cd", "ef"]
 * Returns empty array if the code is invalid.
 */
export function parseInviteCode(code: string): string[] {
  const upper = code.toUpperCase();

  // Must be even length, only alphanumeric chars
  if (upper.length === 0 || upper.length % 2 !== 0 || !/^[A-Z0-9]+$/.test(upper)) {
    return [];
  }

  const codes: string[] = [];
  for (let i = 0; i < upper.length; i += 2) {
    codes.push(upper.slice(i, i + 2));
  }
  return codes;
}

/**
 * Fetches guest records matching the given 2-letter codes.
 */
export async function fetchGuestsByCode(codes: string[]): Promise<Guest[]> {
  if (codes.length === 0) return [];

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .in("invite_code", codes);

  if (error) {
    console.error("Supabase query error:", error.message, error.code, error.details, error.hint);
    return [];
  }

  return (data as Guest[]) ?? [];
}

/**
 * Returns the earliest rsvp_by date from a group of guests, formatted as a string.
 * Returns null if no guests have an rsvp_by date.
 */
export function getEarliestRsvpBy(guests: Guest[]): string | null {
  const dates = guests
    .map((g) => g.rsvp_by)
    .filter((d): d is string => d !== null)
    .sort();

  if (dates.length === 0) return null;

  // Format as "Jun 1" style
  const date = new Date(dates[0] + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
