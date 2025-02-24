import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[100px] w-full rounded-lg border-2 border-indigo-300",
        "bg-white px-4 py-3 text-sm font-medium text-gray-900",
        "transition-colors duration-200 focus:border-indigo-500",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500",
        "placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
        "dark:focus:border-indigo-500 dark:focus-visible:ring-indigo-400",
        "dark:placeholder:text-gray-400",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
