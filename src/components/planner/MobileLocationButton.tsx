import { useState } from "react";
import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLocationButtonProps {
  onLocate: () => Promise<void> | void;
  widgetOpen?: boolean;
}

export default function MobileLocationButton({
  onLocate,
  widgetOpen = false,
}: MobileLocationButtonProps) {
  const [isLocating, setIsLocating] = useState(false);

  const handleClick = async () => {
    if (isLocating) return;
    setIsLocating(true);
    try {
      await onLocate();
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocating}
      className={cn(
        "absolute z-20 right-3 p-3 rounded-full",
        "bg-background shadow-lg border border-border/50",
        "transition-all duration-300 ease-out",
        "hover:scale-105 active:scale-95",
        "disabled:opacity-70",
        // Position adjusts based on widget state
        widgetOpen ? "bottom-[calc(35vh+1rem)]" : "bottom-24"
      )}
      aria-label="Locate me"
    >
      <LocateFixed
        className={cn(
          "h-5 w-5 text-foreground transition-colors",
          isLocating && "animate-pulse text-primary"
        )}
      />
    </button>
  );
}
