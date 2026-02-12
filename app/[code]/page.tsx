import { notFound } from "next/navigation";
import { LanguageProvider } from "../i18n";
import { GuestProvider, GuestGroup } from "../context/GuestContext";
import { parseInviteCode, fetchGuestsByCode, getEarliestRsvpBy } from "../lib/guests";
import HomeContent from "../components/HomeContent";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function InvitePage({ params }: PageProps) {
  const { code } = await params;
  const codes = parseInviteCode(code);

  if (codes.length === 0) {
    notFound();
  }

  const guests = await fetchGuestsByCode(codes);

  if (guests.length === 0) {
    notFound();
  }

  const defaultLanguage = guests[0].language;
  const rsvpByDate = getEarliestRsvpBy(guests);

  const guestGroup: GuestGroup = {
    guests,
    rsvpByDate,
    defaultLanguage,
  };

  return (
    <GuestProvider guestGroup={guestGroup}>
      <LanguageProvider defaultLanguage={defaultLanguage}>
        <HomeContent />
      </LanguageProvider>
    </GuestProvider>
  );
}
