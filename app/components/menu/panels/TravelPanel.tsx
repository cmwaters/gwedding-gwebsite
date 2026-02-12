"use client";

import { useLanguage } from "@/app/i18n";
import PanelSection from "./PanelSection";

export default function TravelPanel() {
  const { t } = useLanguage();

  return (
    <div className="text-cream">
      <PanelSection title={t("gettingThere")}>
        <p>{t("travelNearestAirports")}</p>
        <p style={{ marginTop: '0.5rem' }}>{t("travelMilanAirports")}</p>
      </PanelSection>
      <PanelSection title={t("whereToStay")}>
        <p>{t("accommodationSoon")}</p>
      </PanelSection>
      <PanelSection title={t("gettingAround")} border={false}>
        <p>{t("localTransportSoon")}</p>
      </PanelSection>
    </div>
  );
}
