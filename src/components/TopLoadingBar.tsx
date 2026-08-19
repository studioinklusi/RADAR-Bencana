import React from 'react';

interface TopLoadingBarProps {
  isLoading: boolean;
}

export const TopLoadingBar: React.FC<TopLoadingBarProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[99999] pointer-events-none h-1 bg-emerald-950/20 overflow-hidden">
      <div className="h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 animate-pulse shadow-sm shadow-emerald-500/50" />
    </div>
  );
};
