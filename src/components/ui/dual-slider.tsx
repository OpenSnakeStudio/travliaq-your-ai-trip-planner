/**
 * Dual Slider Component
 * Slider with Travliaq brand colors: turquoise left, golden sand right
 */

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

// Travliaq brand colors - same for ALL sliders
const TRAVLIAQ_LEFT_COLOR = "hsl(193, 100%, 42%)"; // Turquoise
const TRAVLIAQ_RIGHT_COLOR = "hsl(45, 100%, 70%)"; // Golden Sand

const DualSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const value = (props.value?.[0] ?? props.defaultValue?.[0] ?? 50);
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center h-6", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-3 w-full grow overflow-hidden rounded-full shadow-inner bg-muted/30">
        {/* Left side - Turquoise */}
        <div 
          className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-150"
          style={{ 
            width: `${value}%`,
            background: TRAVLIAQ_LEFT_COLOR,
          }}
        />
        {/* Right side - Golden Sand */}
        <div 
          className="absolute inset-y-0 right-0 rounded-r-full transition-all duration-150"
          style={{ 
            width: `${100 - value}%`,
            background: TRAVLIAQ_RIGHT_COLOR,
          }}
        />
        {/* Center marker */}
        <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-background/60 -translate-x-1/2 z-10" />
      </SliderPrimitive.Track>
      
      <SliderPrimitive.Thumb className="relative block h-5 w-5 rounded-full bg-background border-2 border-foreground/50 shadow-md ring-offset-background transition-all hover:scale-110 hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
    </SliderPrimitive.Root>
  );
});
DualSlider.displayName = "DualSlider";

export { DualSlider };
