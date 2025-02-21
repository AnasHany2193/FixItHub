import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const InputOTP = React.forwardRef(
  ({ className, containerClassName, ...props }, ref) => (
    <OTPInput
      ref={ref}
      containerClassName={cn(
        "flex justify-evenly items-center gap-2 m-2 has-[:disabled]:opacity-50",
        containerClassName
      )}
      className={cn(
        "disabled:cursor-not-allowed transition-colors duration-200",
        className
      )}
      {...props}
    />
  )
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = React.forwardRef(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center",
        "border-2 border-indigo-300 dark:border-indigo-700 rounded-lg",
        "text-indigo-900 dark:text-indigo-100 text-xl font-semibold",
        "shadow-sm transition-all duration-150 ease-out",
        "hover:border-indigo-400 dark:hover:border-indigo-500",
        "focus-within:ring-2 ring-indigo-500/30 dark:ring-indigo-400/30",
        isActive && "border-indigo-500 dark:border-indigo-400 ring-1",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-px h-6 duration-1000 bg-indigo-600 animate-caret-blink dark:bg-indigo-300" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    className="mx-2 text-indigo-400 dark:text-indigo-600"
    {...props}
  >
    <Minus className="w-8" strokeWidth={3} />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
