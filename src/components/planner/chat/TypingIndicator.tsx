/**
 * TypingIndicator - Animated typing dots for loading states
 */

import { memo } from "react";

export const TypingIndicator = memo(function TypingIndicator() {
  return (
    <div className="flex gap-1 py-1">
      <span 
        className="w-2 h-2 bg-current rounded-full animate-bounce" 
        style={{ animationDelay: "0ms" }} 
      />
      <span 
        className="w-2 h-2 bg-current rounded-full animate-bounce" 
        style={{ animationDelay: "150ms" }} 
      />
      <span 
        className="w-2 h-2 bg-current rounded-full animate-bounce" 
        style={{ animationDelay: "300ms" }} 
      />
    </div>
  );
});
