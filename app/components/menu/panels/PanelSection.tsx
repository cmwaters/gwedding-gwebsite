"use client";

interface PanelSectionProps {
  title?: string;
  children: React.ReactNode;
  /** Whether to show a bottom border (omit for the last section) */
  border?: boolean;
}

export default function PanelSection({ title, children, border = true }: PanelSectionProps) {
  return (
    <div className={`pb-4 ${border ? "border-b border-cream/20" : ""}`} style={{ marginBottom: border ? '1.5rem' : 0 }}>
      {title && (
        <p className="text-amber text-xs sm:text-sm" style={{ marginBottom: '0.5rem' }}>
          {title}
        </p>
      )}
      <div className="text-[10px] sm:text-xs leading-relaxed opacity-80">
        {children}
      </div>
    </div>
  );
}
