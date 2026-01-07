/**
 * Dual Slider Component
 * Slider with vibrant colors on both sides and visual graduations
 */

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface DualSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  leftColor?: string;
  rightColor?: string;
  showValue?: boolean;
  showGraduations?: boolean;
}

const DualSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualSliderProps
>(({ 
  className, 
  leftColor = "hsl(200, 80%, 50%)", 
  rightColor = "hsl(340, 80%, 55%)", 
  showValue = false,
  showGraduations = false,
  ...props 
}, ref) => {
  const value = (props.value?.[0] ?? props.defaultValue?.[0] ?? 50);
  
  return (
    <div className="relative">
      {/* Graduations */}
      {showGraduations && (
        <div className="absolute -top-3 left-0 right-0 flex justify-between px-0.5 pointer-events-none">
          {[0, 25, 50, 75, 100].map((mark) => (
            <div 
              key={mark} 
              className={cn(
                "w-0.5 h-1.5 rounded-full transition-colors",
                Math.abs(value - mark) < 10 ? "bg-foreground/40" : "bg-muted-foreground/20"
              )} 
            />
          ))}
        </div>
      )}
      
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full touch-none select-none items-center h-8", className)}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-muted/30 shadow-inner">
          {/* Left side - gradient fill */}
          <div 
            className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-150"
            style={{ 
              width: `${value}%`,
              background: `linear-gradient(90deg, ${leftColor}dd 0%, ${leftColor} 100%)`,
            }}
          />
          {/* Right side - gradient fill */}
          <div 
            className="absolute inset-y-0 right-0 rounded-r-full transition-all duration-150"
            style={{ 
              width: `${100 - value}%`,
              background: `linear-gradient(90deg, ${rightColor} 0%, ${rightColor}dd 100%)`,
            }}
          />
          {/* Center marker */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-background/80 -translate-x-1/2 z-10" />
        </SliderPrimitive.Track>
        
        <SliderPrimitive.Thumb className="relative block h-6 w-6 rounded-full bg-background border-2 border-foreground/70 shadow-lg ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing">
          {/* Value indicator */}
          {showValue && (
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-foreground/70 bg-background/80 px-1 rounded">
              {value}
            </span>
          )}
        </SliderPrimitive.Thumb>
      </SliderPrimitive.Root>
    </div>
  );
});
DualSlider.displayName = "DualSlider";

export { DualSlider };
