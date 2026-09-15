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

export function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 20 20" fill="none">
      <path d="M4 10.5l4 4 8-9" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
