/**
 * TagMark — the Hound Tag glyph: a military dog-tag silhouette with a beaded
 * chain hole and a stamped "H". Used in the header wordmark and as a favicon.
 */
export function TagMark({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Tag body, rotated slightly like a tag on a chain. */}
      <g transform="rotate(-18 12 12)">
        <rect
          x="5.5"
          y="2.5"
          width="13"
          height="19"
          rx="4"
          fill="#1c2226"
          stroke="#3a444a"
          strokeWidth="1"
        />
        {/* Chain hole. */}
        <circle cx="12" cy="6" r="1.4" fill="#0b0d0e" stroke="#3a444a" strokeWidth="0.75" />
        {/* Stamped H. */}
        <path
          d="M9.5 11v6M14.5 11v6M9.5 14h5"
          stroke="#3ff08a"
          strokeWidth="1.6"
          strokeLinecap="square"
        />
      </g>
    </svg>
  );
}
