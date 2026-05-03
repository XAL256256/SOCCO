import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ icon: Icon, title, description, action, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      {Icon && (
        <div className="mb-5 grid place-items-center h-20 w-20 rounded-full bg-gradient-to-br from-primary-100 to-accent-100 text-primary-600 shadow-soft">
          <Icon className="h-10 w-10" />
        </div>
      )}
      <h3 className="font-display text-xl font-bold text-gray-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
