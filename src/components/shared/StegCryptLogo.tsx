interface StegCryptLogoProps {
  className?: string;
  size?: number;
}

export function StegCryptLogo({ className = 'h-9 w-9', size = 64 }: StegCryptLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      aria-label="StegCrypt Logo"
    >
      <rect
        width="64"
        height="64"
        rx="14"
        className="fill-white dark:fill-[#121212] stroke-[#121212] dark:stroke-white stroke-[2px] transition-colors"
        strokeOpacity="0.25"
      />
      <g
        transform="translate(10, 10) scale(1.8333)"
        fill="none"
        className="stroke-[#121212] dark:stroke-white stroke-[2px] transition-colors"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2.5" />
        <rect
          width="8"
          height="5"
          x="14"
          y="17"
          rx="1"
          className="fill-white dark:fill-[#121212] stroke-[#121212] dark:stroke-white stroke-[2px] transition-colors"
        />
        <path d="M20 17v-2a2 2 0 1 0-4 0v2" />
      </g>
    </svg>
  );
}
