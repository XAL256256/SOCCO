import { cn, initials } from "@/lib/utils";

type Props = {
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
};

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-xl",
};

// Deterministically choose an accent gradient per person.
function gradientFor(name: string): string {
  const palettes = [
    "from-primary-400 to-primary-600",
    "from-secondary-400 to-secondary-600",
    "from-accent-400 to-accent-600",
    "from-primary-500 to-accent-500",
    "from-secondary-500 to-accent-500",
    "from-primary-600 to-secondary-500",
  ];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return palettes[h % palettes.length];
}

export function Avatar({ name, size = "md", className }: Props) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full font-display font-bold text-white shadow-soft bg-gradient-to-br ring-2 ring-white",
        sizes[size],
        gradientFor(name),
        className
      )}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
