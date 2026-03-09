"use client";

import { useLanguage } from "@/app/i18n";
import PanelSection from "./PanelSection";

export default function InfoPanel() {
  const { t } = useLanguage();

  return (
    <div className="text-cream">
      <PanelSection title={t("venue")}>
        <p>
          <a href="https://maps.app.goo.gl/cXWvxknccLBs5c8d8" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            {t("venueIsa")}
          </a>
        </p>
        <p style={{ marginTop: '0.25rem' }}>
          <a href="https://maps.app.goo.gl/gud7Qd3FtgfX5Z4x9" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
            {t("venueBettoni")}
          </a>
        </p>
      </PanelSection>
      <PanelSection title={t("dressCode")}>
        <p className="font-bold">{t("dressCodeAperitivoTitle")}</p>
        <p style={{ marginTop: '0.2rem' }}>{t("dressCodeAperitivoDesc")}</p>
        <p className="font-bold" style={{ marginTop: '0.75rem' }}>{t("dressCodeWeddingTitle")}</p>
        <p style={{ marginTop: '0.2rem' }}>{t("dressCodeWeddingDesc")}</p>
      </PanelSection>
      <PanelSection title={t("shuttleTimetable")}>
        <p>{t("shuttleTimetableSoon")}</p>
      </PanelSection>
      <PanelSection border={false}>
        <p>{t("stillHaveQuestions")}</p>
        <p style={{ marginTop: '0.25rem' }}>{t("feelFreeReachOut")}</p>
      </PanelSection>
    </div>
  );
}
