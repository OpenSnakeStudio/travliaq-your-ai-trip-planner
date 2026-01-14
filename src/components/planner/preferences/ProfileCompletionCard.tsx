/**
 * Profile Completion Card Component
 * Shows profile completion progress and summary
 */

import { memo } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

interface ProfileCompletionCardProps {
  completion: number;
  summary: string;
  lastUpdated: Date;
  detectedFromChat: boolean;
  compact?: boolean;
}

export const ProfileCompletionCard = memo(function ProfileCompletionCard({
  completion,
  summary,
  lastUpdated,
  detectedFromChat,
  compact = false,
}: ProfileCompletionCardProps) {
  const { t, i18n } = useTranslation();
  
  const getCompletionColor = () => {
    if (completion >= 75) return "text-green-500";
    if (completion >= 50) return "text-amber-500";
    return "text-muted-foreground";
  };

  const getCompletionLabel = () => {
    if (completion >= 75) return t("planner.preferences.profile.complete");
    if (completion >= 50) return t("planner.preferences.profile.goodStart");
    if (completion >= 25) return t("planner.preferences.profile.someInfo");
    return t("planner.preferences.profile.toComplete");
  };

  const dateLocale = i18n.language?.startsWith("en") ? "en-US" : "fr-FR";

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      completion >= 75 
        ? "bg-green-500/5 border-green-500/20" 
        : "bg-muted/30 border-border/30",
      compact && "p-2"
    )}>
      {/* Header with progress */}
      <div className={cn("p-3", compact && "p-2")}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {completion >= 75 ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <Circle className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={cn("text-sm font-medium", getCompletionColor())}>
              {getCompletionLabel()}
            </span>
          </div>
          <span className={cn("text-sm font-bold", getCompletionColor())}>
            {completion}%
          </span>
        </div>
        
        <Progress 
          value={completion} 
          className={cn(
            "h-2",
            completion >= 75 && "[&>div]:bg-green-500"
          )}
        />
      </div>

      {/* Summary */}
      {!compact && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-xs text-foreground leading-relaxed">
            {summary}
          </p>
          
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>
              {t("planner.preferences.profile.updated")}: {lastUpdated.toLocaleDateString(dateLocale)}
            </span>
            {detectedFromChat && (
              <span className="flex items-center gap-1 text-blue-500">
                <Sparkles className="w-3 h-3" />
                {t("planner.preferences.profile.detectedByAI")}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProfileCompletionCard;
