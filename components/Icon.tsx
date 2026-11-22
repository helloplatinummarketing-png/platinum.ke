/**
 * Small inline icons (no icon library, nothing extra to download).
 * Decorative only: always aria-hidden.
 */
const paths: Record<string, string> = {
  monitor: "M3 5h18v11H3zM8 20h8M12 16v4",
  message: "M4 5h16v11H8l-4 4z",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5",
  check: "M5 12l5 5L20 7",
  alert: "M12 3l10 18H2zM12 10v4M12 17.5v.5",
  phoneOff: "M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2zM3 3l18 18",
  bot: "M5 9h14v10H5zM12 5v4M9 14h.01M15 14h.01M2 13v3M22 13v3",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  map: "M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  calendar: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4",
};

export type IconName = keyof typeof paths;

export function Icon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={paths[name] ?? paths.check} />
    </svg>
  );
}
