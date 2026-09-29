import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
};

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-8 w-8", className)} aria-hidden>
      <path
        fill="#25D366"
        d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z"
      />
      <path
        fill="#fff"
        d="M16.7 14.2c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.5.1l-.7 1c-.1.1-.3.2-.5.1a6.4 6.4 0 0 1-1.9-1.2 7 7 0 0 1-1.3-1.7c-.1-.2 0-.3.1-.5l.3-.4.1-.2c0-.1 0-.3-.1-.4l-.7-1.7c-.2-.4-.3-.4-.5-.4h-.4c-.2 0-.4.1-.5.3a2 2 0 0 0-.6 1.5 3.5 3.5 0 0 0 .7 1.8 8 8 0 0 0 3 3 10 10 0 0 0 2 .8 1.9 1.9 0 0 0 1.7-.8 1.6 1.6 0 0 0 .3-1c0-.1-.1-.2-.3-.3z"
      />
    </svg>
  );
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-8 w-8", className)} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        fill="#fff"
        d="M13.4 19v-6.3h2.1l.3-2.5h-2.4V8.6c0-.7.2-1.2 1.2-1.2H16V5.2A15 15 0 0 0 13.6 5c-2.2 0-3.7 1.3-3.7 3.8v1.5H8v2.5h1.9V19h3.5z"
      />
    </svg>
  );
}

const tikTokNote =
  "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";

export function TikTokIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-8 w-8", className)} aria-hidden>
      <circle cx="12" cy="12" r="12" fill="#111" />
      <g transform="translate(4.2 3.4) scale(0.65)">
        <path fill="#25F4EE" d={tikTokNote} transform="translate(-1.1 0.8)" />
        <path fill="#FE2C55" d={tikTokNote} transform="translate(1.1 -0.6)" />
        <path fill="#fff" d={tikTokNote} />
      </g>
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <radialGradient id="instagram-badge" cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="12" fill="url(#instagram-badge)" />
      <rect x="6.4" y="6.4" width="11.2" height="11.2" rx="3.2" fill="none" stroke="#fff" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3.05" fill="none" stroke="#fff" strokeWidth="1.5" />
      <circle cx="15.55" cy="8.45" r="0.9" fill="#fff" />
    </svg>
  );
}
