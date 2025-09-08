import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "default" | "compact";
}

export function Logo({ className, variant = "default" }: LogoProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-xl font-bold text-sm shadow-lg shadow-primary/30">
          E
        </div>
        <span className="font-semibold text-primary text-sm">ENI</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl font-bold text-lg shadow-lg shadow-primary/30">
        ENI
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-primary">ENI</span>
        <span className="text-xs text-muted-foreground leading-none">
          École Numérique
        </span>
      </div>
    </div>
  );
}
