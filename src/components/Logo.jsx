import { useId } from "react";

/**
 * The Mail to Telegram mark as inline SVG: an email in a chat bubble with a new-mail dot,
 * on a Telegram-blue tile. Same drawing as public/favicon.svg. `round` makes it a circle (bot avatar).
 */
export default function Logo({ size = 30, round = false, className, title }) {
  const id = useId().replace(/:/g, "");
  const r = round ? 32 : 16;
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 64 64" role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#40bcf5" /><stop offset="1" stopColor="#1679c9" />
        </linearGradient>
        <linearGradient id={`${id}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".22" /><stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx={r} fill={`url(#${id}b)`} />
      <rect width="64" height="64" rx={r} fill={`url(#${id}h)`} />
      <path d="M20 13H44A8 8 0 0 1 52 21V35A8 8 0 0 1 44 43H28L17.5 51 20 43A8 8 0 0 1 12 35V21A8 8 0 0 1 20 13Z" fill="#fff" />
      <rect x="21" y="20" width="22" height="16" rx="3.2" fill="none" stroke="#1a86d4" strokeWidth="2.8" />
      <path d="M22.6 22.4 32 29 41.4 22.4" fill="none" stroke="#1a86d4" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="49.5" cy="14.5" r="6.2" fill="#ea4335" stroke="#fff" strokeWidth="2.6" />
    </svg>
  );
}
