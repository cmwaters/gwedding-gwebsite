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
        <div>
          <p>
            <a href="https://www.hotelspiaggiadoro.com/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-80">
              Hotel Spiaggia d&apos;Oro
            </a>
          </p>
          <p style={{ marginTop: '0.2rem' }}>
            <a href="https://maps.google.com/?q=Via+Spiaggia+d'Oro+15+Barbarano+di+Salo+Italy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
              Via Spiaggia d&apos;Oro 15, 25087 Barbarano di Salò
            </a>
          </p>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
          <p>
            <a href="https://www.hotelgaleazzi.it/en/" target="_blank" rel="noopener noreferrer" className="font-bold underline hover:opacity-80">
              Hotel Galeazzi
            </a>
          </p>
          <p style={{ marginTop: '0.2rem' }}>
            <a href="https://maps.google.com/?q=Via+Trento+17+Barbarano+di+Salo+Italy" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-80">
              Via Trento 17, 25087 Barbarano di Salò
            </a>
          </p>
        </div>
      </PanelSection>
      <PanelSection title={t("gettingAround")} border={false}>
        <p>{t("gettingAroundCar")}</p>
        <p style={{ marginTop: '0.5rem' }}>{t("gettingAroundShuttle")}</p>
      </PanelSection>
    </div>
  );
}
