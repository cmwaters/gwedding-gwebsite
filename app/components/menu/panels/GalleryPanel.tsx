"use client";

import { SITE_CONFIG } from "@/app/config";
import { useLanguage } from "@/app/i18n";

export default function GalleryPanel() {
  const { t } = useLanguage();

  if (!SITE_CONFIG.galleryUnlocked) {
    return (
      <div className="text-cream flex flex-col items-center justify-center min-h-[200px]">
        <p className="text-amber text-base sm:text-lg mb-4">{t("galleryLocked")}</p>
        <p className="text-[10px] sm:text-xs leading-relaxed text-center opacity-80">
          {t("comingSoonAfter")}
        </p>
        <p className="text-[10px] sm:text-xs leading-relaxed text-center opacity-80 mt-1">
          {t("theBigDay")}
        </p>
        <div className="mt-6 text-[24px]">
          <span className="text-amber animate-blink">*</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-cream">
      <p className="text-[10px] sm:text-xs leading-relaxed text-center opacity-80 mb-6">
        {t("weddingPhotosHere")}
      </p>

      {/* Placeholder grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square border-2 border-cream/20 flex items-center justify-center"
          >
            <span className="text-cream/30 text-[10px]">{t("photo")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
