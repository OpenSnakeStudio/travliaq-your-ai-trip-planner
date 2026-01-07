/**
 * Dual Slider Component
 * Slider with vibrant colors on both sides
 */

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface DualSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  leftColor?: string;
  rightColor?: string;
}

const DualSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  DualSliderProps
>(({ className, leftColor = "hsl(200, 80%, 50%)", rightColor = "hsl(340, 80%, 55%)", ...props }, ref) => {
  const value = (props.value?.[0] ?? props.defaultValue?.[0] ?? 50);
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center h-8", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full bg-muted/20 shadow-inner">
        {/* Left side - gradient fill */}
        <div 
          className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-150"
          style={{ 
            width: `${value}%`,
            background: `linear-gradient(90deg, ${leftColor} 0%, ${leftColor} 100%)`,
            opacity: 0.9,
          }}
        />
        {/* Right side - gradient fill */}
        <div 
          className="absolute inset-y-0 right-0 rounded-r-full transition-all duration-150"
          style={{ 
            width: `${100 - value}%`,
            background: `linear-gradient(90deg, ${rightColor} 0%, ${rightColor} 100%)`,
            opacity: 0.9,
          }}
        />
        {/* Center marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-background/60 -translate-x-1/2 z-10" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-6 w-6 rounded-full bg-background border-3 border-foreground/80 shadow-lg ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
    </SliderPrimitive.Root>
  );
});
DualSlider.displayName = "DualSlider";

export { DualSlider };
