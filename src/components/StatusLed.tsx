import React from 'react';
import { cn } from '../lib/utils';

interface StatusLedProps {
  label: string;
  status: 'off' | 'on' | 'blinking' | 'error';
  color?: 'green' | 'red' | 'orange' | 'blue';
  className?: string;
}

export const StatusLed: React.FC<StatusLedProps> = ({ 
  label, 
  status, 
  color = 'green',
  className 
}) => {
  const getColorClass = () => {
    if (status === 'off') return 'bg-zinc-800 shadow-inner';
    
    switch (color) {
      case 'red': return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
      case 'orange': return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]';
      case 'blue': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]';
      default: return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div 
        className={cn(
          "w-2 h-2 rounded-full transition-all duration-300",
          getColorClass(),
          status === 'blinking' && "animate-pulse"
        )}
      />
      <span className="text-[10px] font-mono uppercase tracking-tighter text-zinc-500">
        {label}
      </span>
    </div>
  );
};
