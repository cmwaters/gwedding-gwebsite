"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Screen, SITE_CONFIG } from "@/app/config";
import { useLanguage, TranslationKey } from "@/app/i18n";
import { useGuests } from "@/app/context/GuestContext";
import MenuItem from "./MenuItem";

interface RetroMenuProps {
  onSelect: (screen: Screen) => void;
}

interface MenuEntry {
  labelKey: TranslationKey;
  screen: Screen;
  locked?: boolean;
}

const MENU_ITEMS: MenuEntry[] = [
  { labelKey: "menuStart", screen: "instructions" },
  { labelKey: "menuSchedule", screen: "schedule" },
  { labelKey: "menuTravelStay", screen: "travel" },
  { labelKey: "menuInfo", screen: "info" },
  { labelKey: "menuGallery", screen: "gallery", locked: !SITE_CONFIG.galleryUnlocked },
  { labelKey: "menuRsvp", screen: "rsvp" },
];

export default function RetroMenu({ onSelect }: RetroMenuProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { language, setLanguage, t } = useLanguage();
  const guestGroup = useGuests();

  const handleSelect = useCallback(
    (index: number) => {
      const item = MENU_ITEMS[index];
      if (item.locked) return;
      onSelect(item.screen);
    },
    [onSelect]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.code) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev <= 0 ? MENU_ITEMS.length - 1 : prev - 1
          );
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev >= MENU_ITEMS.length - 1 ? 0 : prev + 1
          );
          break;
        case "Enter":
        case "Space":
          e.preventDefault();
          handleSelect(selectedIndex);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, handleSelect]);

  return (
    <div className="w-full h-full bg-cornflower/70 flex flex-col items-center justify-center p-6 sm:p-8 animate-fade-in relative">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={() => setLanguage("en")}
          className={`cursor-pointer bg-transparent border-none p-1 transition-opacity ${
            language === "en" ? "opacity-100" : "opacity-40"
          }`}
          aria-label="English"
        >
          <Image
            src="/new_zealand.png"
            alt="English"
            width={36}
            height={36}
            style={{ imageRendering: "pixelated" }}
          />
        </button>
        <button
          onClick={() => setLanguage("es")}
          className={`cursor-pointer bg-transparent border-none p-1 transition-opacity ${
            language === "es" ? "opacity-100" : "opacity-40"
          }`}
          aria-label="Español"
        >
          <Image
            src="/venezuela.png"
            alt="Español"
            width={36}
            height={36}
            style={{ imageRendering: "pixelated" }}
          />
        </button>
      </div>

      {/* Pixel art characters */}
      <div className="mb-5 flex justify-center">
        <Image
          src="/cal_and_euge_and_luke.png"
          alt="Cal and Euge and Luke"
          width={180}
          height={180}
          className="mx-auto"
          style={{ imageRendering: "pixelated" }}
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-amber text-xl sm:text-3xl text-center" style={{ marginBottom: '1.25rem' }}>
        {SITE_CONFIG.coupleNames}
      </h1>

      {/* Subtitle */}
      <p className="text-cream text-xs sm:text-sm text-center" style={{ marginBottom: '0.75rem' }}>
        {t("menuInvite")}
      </p>
      <p className="text-white text-xs sm:text-sm font-bold text-center" style={{ marginBottom: '2rem' }}>
        {t("menuDate")}
      </p>

      {/* Menu items */}
      <nav className="w-full max-w-sm">
        {MENU_ITEMS.slice(0, -1).map((item, index) => {
          return (
            <MenuItem
              key={item.screen}
              label={t(item.labelKey)}
              isSelected={selectedIndex === index}
              isLocked={item.locked}
              onClick={() => {
                setSelectedIndex(index);
                handleSelect(index);
              }}
            />
          );
        })}
      </nav>

      {/* RSVP button — separated with white border */}
      {(() => {
        const rsvpIndex = MENU_ITEMS.length - 1;
        const rsvpItem = MENU_ITEMS[rsvpIndex];
        let rsvpLabel = t(rsvpItem.labelKey);
        if (guestGroup?.rsvpByDate) {
          rsvpLabel = `${rsvpLabel} (${t("rsvpByPrefix")} ${guestGroup.rsvpByDate})`;
        }
        return (
          <div className="w-full max-w-sm border-2 border-white rounded" style={{ marginTop: '1rem' }}>
            <MenuItem
              label={rsvpLabel}
              isSelected={selectedIndex === rsvpIndex}
              onClick={() => {
                setSelectedIndex(rsvpIndex);
                handleSelect(rsvpIndex);
              }}
            />
          </div>
        );
      })()}

      {/* Footer hint */}
      <p className="text-cream/60 text-[10px] sm:text-xs text-center" style={{ marginTop: '1.5rem' }}>
        {t("menuFooter")}
      </p>
    </div>
  );
}
