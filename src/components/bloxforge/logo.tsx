import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-500/20"
        style={{ width: size, height: size }}
      >
        <svg
          width={size * 0.6}
          height={size * 0.6}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 4h11.5L19 7v13H5V4z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="rgba(0,0,0,0.15)"
          />
          <path
            d="M16 4v3.5H19"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M8.5 11.5l2 2 3.5-3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M8 16.5h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <span className="font-display text-lg font-extrabold tracking-tight">
        BloxForge
        <span className="ml-1 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
          AI
        </span>
      </span>
    </div>
  );
}
