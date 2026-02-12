"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Guest } from "@/app/lib/database.types";
import type { Language } from "@/app/i18n/translations";

export interface GuestGroup {
  guests: Guest[];
  rsvpByDate: string | null;
  defaultLanguage: Language;
}

const GuestContext = createContext<GuestGroup | null>(null);

export function GuestProvider({
  guestGroup,
  children,
}: {
  guestGroup: GuestGroup | null;
  children: ReactNode;
}) {
  return (
    <GuestContext.Provider value={guestGroup}>
      {children}
    </GuestContext.Provider>
  );
}

/**
 * Returns the guest group data, or null for anonymous visitors.
 */
export function useGuests(): GuestGroup | null {
  return useContext(GuestContext);
}
