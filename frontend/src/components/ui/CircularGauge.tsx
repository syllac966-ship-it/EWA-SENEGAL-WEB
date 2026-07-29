import { useEffect, useState } from "react";

interface CircularGaugeProps {
  /** Valeur entre 0 et 100. */
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor?: string;
  valueLabel: string;
  sublabel?: string;
  label: string;
}

export function CircularGauge({
  percentage,
  size = 180,
  strokeWidth = 14,
  color,
  trackColor = "#e5e7eb",
  valueLabel,
  sublabel,
  label,
}: CircularGaugeProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Démarre à 0 puis anime vers la vraie valeur au montage (jauge qui se remplit).
    const raf = requestAnimationFrame(() => setAnimated(clamped));
    return () => cancelAnimationFrame(raf);
  }, [clamped]);

  const offset = circumference * (1 - animated / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.65, 0, 0.35, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-3 text-center">
          <span className="text-xl font-bold leading-tight text-gray-900 sm:text-2xl">{valueLabel}</span>
          {sublabel && <span className="mt-1 text-xs text-gray-500">{sublabel}</span>}
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-700">{label}</p>
    </div>
  );
}
