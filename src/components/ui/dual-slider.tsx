/**
 * Dual Slider Component
 * Slider with colors on both sides - for style equalizer
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
>(({ className, leftColor = "hsl(var(--primary))", rightColor = "hsl(var(--secondary))", ...props }, ref) => {
  const value = (props.value?.[0] ?? props.defaultValue?.[0] ?? 50);
  
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2.5 w-full grow overflow-hidden rounded-full bg-muted/30">
        {/* Left side color */}
        <div 
          className="absolute inset-y-0 left-0 rounded-l-full transition-all"
          style={{ 
            width: `${value}%`,
            background: `linear-gradient(90deg, ${leftColor} 0%, ${leftColor}90 100%)`
          }}
        />
        {/* Right side color */}
        <div 
          className="absolute inset-y-0 right-0 rounded-r-full transition-all"
          style={{ 
            width: `${100 - value}%`,
            background: `linear-gradient(90deg, ${rightColor}90 0%, ${rightColor} 100%)`
          }}
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-background bg-foreground shadow-md ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
    </SliderPrimitive.Root>
  );
});
DualSlider.displayName = "DualSlider";

export { DualSlider };
