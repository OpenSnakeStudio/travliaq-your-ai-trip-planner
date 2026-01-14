/**
 * MessageActions - Copy, Like, Dislike buttons for assistant messages
 * Extracted from PlannerChat for better maintainability
 */

import { useState, memo } from "react";
import { Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MessageActionsProps {
  messageId: string;
  text: string;
}

export const MessageActions = memo(function MessageActions({ messageId, text }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copié !");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier");
    }
  };

  const handleLike = () => {
    setFeedback(feedback === "like" ? null : "like");
    // TODO: Send feedback to analytics
  };

  const handleDislike = () => {
    setFeedback(feedback === "dislike" ? null : "dislike");
    // TODO: Send feedback to analytics
  };

  return (
    <div className="flex items-center gap-1 mt-1 max-w-[85%]">
      <button
        onClick={handleCopy}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        title="Copier"
        aria-label="Copier le message"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
      <button
        onClick={handleLike}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          feedback === "like" 
            ? "text-green-500 bg-green-500/10" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="J'aime"
        aria-label="J'aime cette réponse"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleDislike}
        className={cn(
          "p-1.5 rounded-md transition-colors",
          feedback === "dislike" 
            ? "text-red-500 bg-red-500/10" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        title="Je n'aime pas"
        aria-label="Je n'aime pas cette réponse"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});
