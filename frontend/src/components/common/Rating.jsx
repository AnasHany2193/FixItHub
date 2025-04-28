// components/common/Rating.jsx
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Rating({
  value = 0,
  onChange,
  readOnly = false,
  size = "md",
  className,
}) {
  const [hoverValue, setHoverValue] = useState(null);
  const displayValue = hoverValue ?? value;
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const handleClick = (newValue) => {
    if (!readOnly && onChange) {
      onChange(newValue);
    }
  };

  const handleMouseEnter = (newValue) => {
    if (!readOnly) {
      setHoverValue(newValue);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverValue(null);
    }
  };

  return (
    <div
      className={cn("flex items-center gap-1", className, {
        "cursor-pointer": !readOnly,
      })}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = index <= displayValue;
        const isHalfFilled = !isFilled && index - 0.5 <= displayValue;

        return (
          <div
            key={index}
            className="relative"
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          >
            {/* Empty Star */}
            <Star
              className={cn(
                sizes[size],
                "text-muted-foreground/30 fill-muted-foreground/10"
              )}
              strokeWidth={1.5}
            />

            {/* Filled Layer */}
            <div
              className={cn(
                "absolute top-0 left-0 overflow-hidden",
                isFilled ? "w-full" : isHalfFilled ? "w-1/2" : "w-0",
                !readOnly && "transition-all duration-150"
              )}
            >
              <Star
                className={cn(
                  sizes[size],
                  "text-yellow-400 fill-yellow-400",
                  !readOnly && "hover:text-yellow-500 hover:fill-yellow-500"
                )}
                strokeWidth={1.5}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
