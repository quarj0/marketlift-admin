import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 20, children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const Icons = {
  dashboard: (p: IconProps) => <IconBase {...p}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></IconBase>,
  users: (p: IconProps) => <IconBase {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></IconBase>,
  store: (p: IconProps) => <IconBase {...p}><path d="M3 9l1.5-5h15L21 9"/><path d="M5 13v8h14v-8"/><path d="M9 21v-6h6v6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></IconBase>,
  tag: (p: IconProps) => <IconBase {...p}><path d="M20.59 13.41 11 3.83V3H4v7h.83l9.58 9.59a2 2 0 0 0 2.82 0l3.36-3.36a2 2 0 0 0 0-2.82z"/><circle cx="7.5" cy="6.5" r=".8" fill="currentColor"/></IconBase>,
  layers: (p: IconProps) => <IconBase {...p}><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></IconBase>,
  shield: (p: IconProps) => <IconBase {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></IconBase>,
  alert: (p: IconProps) => <IconBase {...p}><path d="M10.3 3.5 2.4 17.5A2 2 0 0 0 4.1 20h15.8a2 2 0 0 0 1.7-2.5L13.7 3.5a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></IconBase>,
  credit: (p: IconProps) => <IconBase {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/></IconBase>,
  chart: (p: IconProps) => <IconBase {...p}><path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/></IconBase>,
  ticket: (p: IconProps) => <IconBase {...p}><path d="M2 9a3 3 0 0 0 0 6v4h20v-4a3 3 0 0 0 0-6V5H2v4z"/><path d="M13 5v2M13 11v2M13 17v2"/></IconBase>,
  activity: (p: IconProps) => <IconBase {...p}><path d="M3 12h4l2-6 4 12 2-6h6"/></IconBase>,
  settings: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.1A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.1A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.1A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.23.38.58.7 1 .9.3.14.64.2 1 .2h.1v4h-.1a1.7 1.7 0 0 0-2 1z"/></IconBase>,
  search: (p: IconProps) => <IconBase {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></IconBase>,
  bell: (p: IconProps) => <IconBase {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></IconBase>,
  menu: (p: IconProps) => <IconBase {...p}><path d="M4 6h16M4 12h16M4 18h16"/></IconBase>,
  close: (p: IconProps) => <IconBase {...p}><path d="m6 6 12 12M18 6 6 18"/></IconBase>,
  chevronRight: (p: IconProps) => <IconBase {...p}><path d="m9 18 6-6-6-6"/></IconBase>,
  arrowUp: (p: IconProps) => <IconBase {...p}><path d="m18 15-6-6-6 6"/></IconBase>,
  arrowDown: (p: IconProps) => <IconBase {...p}><path d="m6 9 6 6 6-6"/></IconBase>,
  more: (p: IconProps) => <IconBase {...p}><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></IconBase>,
  external: (p: IconProps) => <IconBase {...p}><path d="M15 3h6v6M10 14 21 3M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7"/></IconBase>,
  download: (p: IconProps) => <IconBase {...p}><path d="M12 3v12m-5-5 5 5 5-5M5 21h14"/></IconBase>,
  filter: (p: IconProps) => <IconBase {...p}><path d="M4 5h16M7 12h10M10 19h4"/></IconBase>,
  check: (p: IconProps) => <IconBase {...p}><path d="m5 12 4 4L19 6"/></IconBase>,
  x: (p: IconProps) => <IconBase {...p}><path d="m6 6 12 12M18 6 6 18"/></IconBase>,
  clock: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></IconBase>,
  eye: (p: IconProps) => <IconBase {...p}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/></IconBase>,
  eyeOff: (p: IconProps) => <IconBase {...p}><path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 4.2A11 11 0 0 1 12 4c6.5 0 10 8 10 8a18 18 0 0 1-2.1 3.1"/><path d="M6.2 6.2A17.7 17.7 0 0 0 2 12s3.5 8 10 8a10.7 10.7 0 0 0 4.1-.8"/></IconBase>,
  arrowRight: (p: IconProps) => <IconBase {...p}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></IconBase>,
  lock: (p: IconProps) => <IconBase {...p}><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></IconBase>,
  logout: (p: IconProps) => <IconBase {...p}><path d="M10 17l5-5-5-5M15 12H3M21 3v18"/></IconBase>,
  mail: (p: IconProps) => <IconBase {...p}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></IconBase>,
  phone: (p: IconProps) => <IconBase {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z"/></IconBase>,
  calendar: (p: IconProps) => <IconBase {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></IconBase>,
  money: (p: IconProps) => <IconBase {...p}><circle cx="12" cy="12" r="9"/><path d="M16 8h-5a2 2 0 1 0 0 4h2a2 2 0 1 1 0 4H8M12 6v12"/></IconBase>,
  megaphone: (p: IconProps) => <IconBase {...p}><path d="m3 11 15-6v14L3 13v-2z"/><path d="M11 16v4H7l-2-6"/></IconBase>,
  verify: (p: IconProps) => <IconBase {...p}><path d="M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3z"/><path d="m9 12 2 2 4-4"/></IconBase>,
  image: (p: IconProps) => <IconBase {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></IconBase>,
};
