"use client";

import { useLanguage } from "@/app/i18n";
import PanelSection from "./PanelSection";

export default function InfoPanel() {
  const { t } = useLanguage();

  return (
    <div className="text-cream">
      <PanelSection title={t("venue")}>
        <p>{t("venueIsa")}</p>
        <p style={{ marginTop: '0.25rem' }}>{t("venueBettoni")}</p>
      </PanelSection>
      <PanelSection title={t("dressCode")}>
        <p>{t("detailsSoon")}</p>
      </PanelSection>
      <PanelSection title={t("gifts")}>
        <p>{t("detailsSoon")}</p>
      </PanelSection>
      <PanelSection border={false}>
        <p>{t("stillHaveQuestions")}</p>
        <p style={{ marginTop: '0.25rem' }}>{t("feelFreeReachOut")}</p>
      </PanelSection>
    </div>
  );
}
