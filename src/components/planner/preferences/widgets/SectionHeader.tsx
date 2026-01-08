/**
 * Section Header Component
 * Consistent header style for preference sections
 */

import { memo } from "react";

interface SectionHeaderProps {
  icon: React.ElementType;
  title: string;
  badge?: string;
}

export const SectionHeader = memo(function SectionHeader({
  icon: Icon,
  title,
  badge
}: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-2.5">
      <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center">
        <Icon className="h-3 w-3 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground">{title}</span>
      {badge && (
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
          {badge}
        </span>
      )}
    </div>
  );
});

export default SectionHeader;
