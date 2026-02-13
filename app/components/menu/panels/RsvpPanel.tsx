"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/app/i18n";
import { useGuests } from "@/app/context/GuestContext";
import { aggregateGuestNames } from "@/app/lib/guestUtils";

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function RsvpPanel() {
  const { t } = useLanguage();
  const guestGroup = useGuests();

  // Anonymous visitor — no invite code
  if (!guestGroup) {
    return (
      <div className="text-cream flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-amber text-base sm:text-lg mb-4">{t("rsvpUseInviteLink")}</p>
      </div>
    );
  }

  return <RsvpForm />;
}

function RsvpForm() {
  const { t } = useLanguage();
  const guestGroup = useGuests()!;
  const { guests } = guestGroup;
  const groupName = useMemo(() => aggregateGuestNames(guests), [guests]);

  // Per-guest attendance: invite_code → boolean | null
  const [attendance, setAttendance] = useState<Record<string, boolean | null>>(() => {
    const initial: Record<string, boolean | null> = {};
    for (const guest of guests) {
      initial[guest.invite_code] = guest.is_attending;
    }
    return initial;
  });

  const [email, setEmail] = useState(guests[0]?.email ?? "");
  const [comments, setComments] = useState(guests[0]?.comments ?? "");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const toggleAttendance = (code: string, value: boolean) => {
    setAttendance((prev) => ({ ...prev, [code]: value }));
  };

  // All guests must have an attendance decision
  const allDecided = guests.every((g) => attendance[g.invite_code] !== null);
  const canSubmit = allDecided && email.trim() !== "" && submitState !== "submitting";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitState("submitting");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guests: guests.map((g) => ({
            invite_code: g.invite_code,
            is_attending: attendance[g.invite_code],
          })),
          email: email.trim(),
          comments: comments.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to submit RSVP");
      setSubmitState("success");
    } catch {
      setSubmitState("error");
    }
  };

  // Success state
  if (submitState === "success") {
    const anyAttending = guests.some((g) => attendance[g.invite_code] === true);
    return (
      <div className="text-cream flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-amber text-base sm:text-lg mb-4">{t("rsvpReceived")}</p>
        {anyAttending ? (
          <>
            <p className="text-xs sm:text-sm leading-relaxed text-center opacity-80">
              {t("seeYouAt")}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-center opacity-80 mt-1">
              Villa Bettoni!
            </p>
          </>
        ) : (
          <p className="text-xs sm:text-sm leading-relaxed text-center opacity-80">
            {t("wellMissYou")}
          </p>
        )}
        <button
          onClick={() => setSubmitState("idle")}
          className="mt-6 text-cream/40 text-[10px] hover:text-cream transition-colors cursor-pointer bg-transparent border-none"
        >
          {t("submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <div className="text-cream">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Per-guest attendance toggles */}
        {guests.map((guest) => (
          <div key={guest.invite_code}>
            <label className="block text-xs sm:text-sm mb-2 text-amber">
              {guest.name}, {t("rsvpJoiningUs")}
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => toggleAttendance(guest.invite_code, true)}
                className={`
                  text-xs sm:text-sm
                  px-5 py-2 border-2 min-h-[44px]
                  cursor-pointer transition-colors
                  ${
                    attendance[guest.invite_code] === true
                      ? "bg-amber text-charcoal border-amber"
                      : "bg-transparent text-cream border-cream/50 hover:bg-amber hover:text-charcoal"
                  }
                `}
              >
                {t("yes")}
              </button>
              <button
                type="button"
                onClick={() => toggleAttendance(guest.invite_code, false)}
                className={`
                  text-xs sm:text-sm
                  px-5 py-2 border-2 min-h-[44px]
                  cursor-pointer transition-colors
                  ${
                    attendance[guest.invite_code] === false
                      ? "bg-coral text-charcoal border-coral"
                      : "bg-transparent text-cream border-cream/50 hover:bg-coral hover:text-charcoal"
                  }
                `}
              >
                {t("no")}
              </button>
            </div>
          </div>
        ))}

        {/* Contact Email */}
        <div>
          <label className="block text-xs sm:text-sm mb-2 text-amber">
            {t("email")}
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="retro-input"
            placeholder={t("emailPlaceholder")}
          />
        </div>

        {/* Additional Info */}
        <div>
          <label className="block text-xs sm:text-sm mb-1 text-amber">
            {t("additionalInfo")}
          </label>
          <p className="text-cream text-[10px] sm:text-xs opacity-80 mb-2">
            {t("additionalInfoHint")}
          </p>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="retro-input"
            rows={3}
            placeholder={t("optionalMessage")}
          />
        </div>

        {/* Error message */}
        {submitState === "error" && (
          <p className="text-coral text-xs sm:text-sm text-center">
            {t("rsvpError")}
          </p>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className={`
              w-full text-xs sm:text-sm
              py-3 border-2 min-h-[44px]
              cursor-pointer transition-colors
              ${
                !canSubmit
                  ? "bg-transparent text-cream/30 border-cream/30 cursor-not-allowed"
                  : "bg-amber text-charcoal border-amber hover:bg-coral hover:border-coral"
              }
            `}
          >
            {submitState === "submitting" ? t("rsvpSubmitting") : t("sendRsvp")}
          </button>
        </div>
      </form>
    </div>
  );
}
