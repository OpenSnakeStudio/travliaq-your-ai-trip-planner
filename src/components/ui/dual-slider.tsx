/**
 * Dual Slider Component
 * Slider with vibrant colors on both sides - ALWAYS visible
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
>(({ 
  className, 
  leftColor = "hsl(200, 75%, 55%)", 
  rightColor = "hsl(340, 75%, 55%)", 
  ...props 
}, ref) => {
  const value = (props.value?.[0] ?? props.defaultValue?.[0] ?? 50);
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center h-8", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-4 w-full grow overflow-hidden rounded-full shadow-inner bg-muted/40">
        {/* Left side - ALWAYS has vibrant color */}
        <div 
          className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-150"
          style={{ 
            width: `${value}%`,
            background: `linear-gradient(90deg, ${leftColor} 0%, ${leftColor} 100%)`,
          }}
        />
        {/* Right side - ALWAYS has vibrant color */}
        <div 
          className="absolute inset-y-0 right-0 rounded-r-full transition-all duration-150"
          style={{ 
            width: `${100 - value}%`,
            background: `linear-gradient(90deg, ${rightColor} 0%, ${rightColor} 100%)`,
          }}
        />
        {/* Center marker - subtle line */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-background/70 -translate-x-1/2 z-10" />
      </SliderPrimitive.Track>
      
      <SliderPrimitive.Thumb className="relative block h-6 w-6 rounded-full bg-background border-2 border-foreground/60 shadow-lg ring-offset-background transition-all hover:scale-110 hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
    </SliderPrimitive.Root>
  );
});
DualSlider.displayName = "DualSlider";

export { DualSlider };
