interface IconProps {
  className?: string;
}

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function WalletIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="6" width="18" height="13" rx="2.5" />
      <path d="M16.5 6V4.7A1.7 1.7 0 0 0 14.8 3H5.5" />
      <circle cx="16.5" cy="13" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PlusCircleIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.3 1.9" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8.2" r="3" />
      <path d="M3.3 20a5.7 5.7 0 0 1 11.4 0" />
      <circle cx="17" cy="9.5" r="2.3" />
      <path d="M15.6 13.3a4.6 4.6 0 0 1 5.1 4.6" />
    </svg>
  );
}

export function SlidersIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 6h5M13 6h7" />
      <circle cx="10" cy="6" r="2" />
      <path d="M4 12h9M17 12h3" />
      <circle cx="14.5" cy="12" r="2" />
      <path d="M4 18h3M11 18h9" />
      <circle cx="8" cy="18" r="2" />
    </svg>
  );
}

export function ListIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M8.5 6h12M8.5 12h12M8.5 18h12" />
      <circle cx="3.7" cy="6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="3.7" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="3.7" cy="18" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 21H5.5A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3H9" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}
