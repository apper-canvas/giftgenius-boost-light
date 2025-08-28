import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(
  ({ className, variant = "default", hoverable = false, children, ...props }, ref) => {
    const baseClasses = "bg-surface rounded-card shadow-card border border-gray-100";
    
const variantClasses = {
      default: "p-6",
      compact: "p-4",
      spacious: "p-8",
      flush: "p-0",
      trending: "p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200"
    };
    
    const hoverClasses = hoverable 
      ? "hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 ease-out cursor-pointer" 
      : "";

    return (
      <div
        className={cn(
          baseClasses,
          variantClasses[variant],
          hoverClasses,
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;