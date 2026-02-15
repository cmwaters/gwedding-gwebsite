import type { Guest } from "./database.types";

/**
 * Extracts plus-one request names from the comments field.
 * Comments may contain "Plus-one request: Name1, Name2" which we parse.
 */
export function extractPlusOnes(comments: string | null): string {
  if (!comments?.trim()) return "";
  const match = comments.match(/Plus-one request: (.+)/s);
  return match ? match[1].trim() : "";
}

/**
 * Joins guest names into a single display string.
 * 1 guest  → "Cal"
 * 2 guests → "Cal & Euge"
 * 3+ guests → "Cal, Euge & Luke"
 */
export function aggregateGuestNames(guests: Guest[]): string {
  const names = guests.map((g) => g.name);
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return names.slice(0, -1).join(", ") + " & " + names[names.length - 1];
}
