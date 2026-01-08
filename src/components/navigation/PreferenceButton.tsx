import React from 'react';
import { cn } from '@/lib/utils';

interface PreferenceButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

const PreferenceButton: React.FC<PreferenceButtonProps> = ({
  onClick,
  children,
  className,
  active = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center px-3 py-2 text-sm font-medium transition-colors',
        'hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20',
        'border-r border-white/20 last:border-r-0',
        active && 'bg-white/10',
        className
      )}
    >
      {children}
    </button>
  );
};

export default PreferenceButton;
