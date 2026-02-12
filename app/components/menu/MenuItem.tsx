"use client";

import { useLanguage } from "@/app/i18n";

interface MenuItemProps {
  label: string;
  isSelected: boolean;
  isLocked?: boolean;
  onClick: () => void;
}

export default function MenuItem({
  label,
  isSelected,
  isLocked = false,
  onClick,
}: MenuItemProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3
        py-3 px-4 text-left
        text-sm sm:text-base
        transition-colors duration-100
        cursor-pointer bg-transparent border-none
        min-h-[44px]
        ${
          isLocked
            ? "text-cream/50 cursor-not-allowed"
            : isSelected
              ? "text-amber"
              : "text-cream hover:text-amber"
        }
      `}
    >
      {/* Blinking cursor */}
      <span
        className={`
          inline-block w-4 text-coral
          ${isSelected ? "animate-blink" : "invisible"}
        `}
      >
        &gt;
      </span>

      {/* Label */}
      <span>{label}</span>

      {/* Lock indicator */}
      {isLocked && (
        <span className="text-[10px] sm:text-xs ml-1 text-cream/50">
          {t("locked")}
        </span>
      )}
    </button>
  );
}
