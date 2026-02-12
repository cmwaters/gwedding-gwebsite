"use client";

import { useEffect } from "react";
import { useLanguage } from "@/app/i18n";

interface RetroPanelProps {
  title: string;
  onBack: () => void;
  children: React.ReactNode;
}

export default function RetroPanel({ title, onBack, children }: RetroPanelProps) {
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        e.preventDefault();
        onBack();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onBack]);

  return (
    <div className="w-full h-full bg-cornflower/70 flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in">
      <div className="w-full max-w-2xl">
        {/* Title */}
        <h2 className="text-amber text-base sm:text-lg text-center" style={{ marginBottom: '1.5rem' }}>
          {title}
        </h2>

        {/* Content */}
        {children}

        {/* Back button */}
        <button
          onClick={onBack}
          className="text-cream text-xs sm:text-sm hover:text-amber transition-colors cursor-pointer bg-transparent border-none min-h-[44px] flex items-center justify-center w-full"
          style={{ marginTop: '1.5rem' }}
        >
          {t("back")}
        </button>
      </div>
    </div>
  );
}
