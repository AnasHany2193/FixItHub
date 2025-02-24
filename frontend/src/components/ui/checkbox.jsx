import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded border-2 border-gray-300",
      "focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:ring-offset-2",
      "dark:border-gray-600 dark:focus:ring-indigo-400 dark:focus:ring-offset-gray-900",
      "data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600",
      "dark:data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:border-indigo-600",
      "disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-white")}
    >
      <Check className="h-4 w-4 stroke-[3] dark:text-white" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
