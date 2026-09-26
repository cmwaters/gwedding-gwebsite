"use client";

import { useLanguage } from "@/app/i18n";
import PanelSection from "./PanelSection";

export default function SchedulePanel() {
  const { t } = useLanguage();

  return (
    <div className="text-cream">
      {/* Saturday */}
      <p className="text-amber text-xs sm:text-sm text-center" style={{ marginBottom: '1.25rem' }}>
        {t("saturdayTitle")}
      </p>
      <PanelSection title={t("tennis")}>
        <p>{t("tennisDetails")}</p>
      </PanelSection>
      <PanelSection title={t("eveningGathering")}>
        <p>{t("eveningGatheringDetails")}</p>
        <p style={{ marginTop: '0.25rem' }}>{t("eveningGatheringDesc")}</p>
      </PanelSection>

      {/* Sunday */}
      <p className="text-amber text-xs sm:text-sm text-center" style={{ marginBottom: '1.25rem' }}>
        {t("sundayTitle")}
      </p>
      <PanelSection title={t("guestArrival")}>
        <p>{t("guestArrivalDetails")}</p>
        <p style={{ marginTop: '0.25rem' }}>{t("ceremonyAccess")}</p>
      </PanelSection>
      <PanelSection title={t("ceremony")}>
        <p>{t("ceremonyDetails")}</p>
      </PanelSection>
      <PanelSection title={t("dinnerAndParty")} border={false}>
        <p>{t("dinnerAndPartyDetails")}</p>
        <p style={{ marginTop: '0.5rem' }}>{t("receptionShuttleDetails")}</p>
        <p style={{ marginTop: '0.5rem' }}>{t("weddingDinnerDetails")}</p>
        <p style={{ marginTop: '0.5rem' }}>{t("earlyReturnDetails")}</p>
        <p style={{ marginTop: '0.5rem' }}>{t("celebrationEndDetails")}</p>
      </PanelSection>
    </div>
  );
}
