import { cn } from "@/lib/utils";
import React from "react";

const Input = React.forwardRef(
  ({ className, type, startIcon, ...props }, ref) => {
    return (
      <div className="relative">
        {startIcon && (
          <div className="absolute -translate-y-1/2 left-3 top-1/2 text-muted-foreground">
            {React.cloneElement(startIcon, {
              className: "w-4 h-4",
            })}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-lg border border-blue-300  bg-white/80 px-3 py-2 text-base shadow-sm transition-colors",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
            "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400",
            "dark:border-indigo-800/30 dark:bg-indigo-900/20 dark:file:text-indigo-100 dark:placeholder:text-indigo-200/80 dark:focus-visible:ring-indigo-500",
            startIcon && "pl-10", // Add padding when icon exists
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
