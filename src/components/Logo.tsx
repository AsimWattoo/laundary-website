import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/**
 * Modern SVG Logo for Laundry Tracker.
 * Represents a clean, organized laundry basket.
 */
export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-8 h-8", className)}
      aria-hidden="true"
    >
      {/* Basket Base */}
      <path
        d="M3 8L5 19H19L21 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Basket Rim */}
      <path
        d="M2 8H22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Laundry Item (Shirt silhouette) */}
      <path
        d="M9 11L12 14L15 11"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 4V14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Sparkles/Clean indicators */}
      <circle cx="18" cy="5" r="1.5" fill="currentColor" />
      <circle cx="20" cy="3" r="1" fill="currentColor" />
    </svg>
  );
}
