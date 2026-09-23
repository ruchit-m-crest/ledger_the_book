export function HomeIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11L12 5l8 6v7a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-7z"
        fill={active ? 'var(--blue)' : 'none'}
        stroke={active ? 'var(--blue)' : 'var(--label-3)'}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InsightsIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 18V11M12 18V6M19 18v-8"
        stroke={active ? 'var(--blue)' : 'var(--label-3)'}
        strokeWidth={active ? '2.3' : '2'}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AddIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9.5" stroke="var(--blue)" strokeWidth="1.7" />
      <path d="M12 8v8M8 12h8" stroke="var(--blue)" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function HistoryIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 6h14M5 12h14M5 18h9"
        stroke={active ? 'var(--blue)' : 'var(--label-3)'}
        strokeWidth={active ? '2.3' : '2'}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ProfileIcon({ active }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.6" stroke={active ? 'var(--blue)' : 'var(--label-3)'} strokeWidth="2" />
      <path
        d="M4.5 20a7.5 7.5 0 0 1 15 0"
        stroke={active ? 'var(--blue)' : 'var(--label-3)'}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="9" cy="9" r="5.5" stroke="var(--label-3)" strokeWidth="1.8" />
      <path d="M17 17l-3.5-3.5" stroke="var(--label-3)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M12.5 4.5L6.5 10l6 5.5" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 20 20" fill="none">
      <path
        d="M4.5 6h11M8 6V4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V6m-6.5 0 .6 9.6a1.5 1.5 0 0 0 1.5 1.4h4.8a1.5 1.5 0 0 0 1.5-1.4L15.5 6"
        stroke="var(--red)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M4 10.5l4 4 8-9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
