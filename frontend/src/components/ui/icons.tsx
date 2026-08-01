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

export function UserIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="8" r="3.4" />
      <path d="M4.8 20a7.2 7.2 0 0 1 14.4 0" />
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

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function SunIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
    </svg>
  );
}

export function MoonIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.7 6.7 0 0 0 10.2 10.2Z" />
    </svg>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 6.5 8 6 8-6" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 7h16" />
      <path d="M9 7V4.8c0-.4.4-.8.9-.8h4.2c.5 0 .9.4.9.8V7" />
      <path d="M6 7l.8 12.1c0 1 .9 1.9 1.9 1.9h6.6c1 0 1.9-.8 1.9-1.9L18 7" />
    </svg>
  );
}

export function KeyIcon({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="8" cy="15" r="4" />
      <path d="M11 12l8-8M16 5.5 18.5 8M19 3l2 2" />
    </svg>
  );
}
