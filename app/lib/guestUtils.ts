import type { Guest } from "./database.types";

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
