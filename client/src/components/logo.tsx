import { Sprout } from "lucide-react";
import { Link } from "wouter";

interface LogoProps {
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
  linkTo?: string;
}

export function Logo({ showIcon = true, size = "md", linkTo = "/" }: LogoProps) {
  const sizeClasses = {
    sm: { icon: "w-5 h-5", iconWrapper: "p-1", text: "text-lg" },
    md: { icon: "w-6 h-6", iconWrapper: "p-1.5", text: "text-xl" },
    lg: { icon: "w-8 h-8", iconWrapper: "p-2", text: "text-2xl" },
  };

  const content = (
    <div className="flex items-center gap-2 cursor-pointer group">
      {showIcon && (
        <div className={`bg-primary text-white ${sizeClasses[size].iconWrapper} rounded-lg group-hover:scale-110 transition-transform`}>
          <Sprout className={sizeClasses[size].icon} />
        </div>
      )}
      <span className={`font-display font-bold ${sizeClasses[size].text} tracking-tight`}>
        carbonio<span className="text-primary">o</span><span className="text-muted-foreground">.ai</span>
      </span>
    </div>
  );

  if (linkTo) {
    return <Link href={linkTo}>{content}</Link>;
  }

  return content;
}

export function LogoText({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl", 
    lg: "text-2xl",
  };

  return (
    <span className={`font-display font-bold ${sizeClasses[size]} tracking-tight`}>
      carbonio<span className="text-primary">o</span><span className="text-muted-foreground">.ai</span>
    </span>
  );
}
