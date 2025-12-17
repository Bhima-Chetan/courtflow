'use client';

import React from 'react';
import { Building2, TreePine, Check } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface Court {
  id: string;
  name: string;
  type: 'INDOOR' | 'OUTDOOR';
  baseRate: number;
  description?: string | null;
  imageUrl?: string | null;
}

interface CourtCardProps {
  court: Court;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: (courtId: string) => void;
}

export function CourtCard({ court, isSelected, isAvailable, onSelect }: CourtCardProps) {
  return (
    <button
      onClick={() => isAvailable && onSelect(court.id)}
      disabled={!isAvailable}
      className={cn(
        'relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left',
        'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900',
        isAvailable && !isSelected && 'border-dark-700 bg-dark-800 hover:border-accent-500 hover:shadow-card-hover',
        isAvailable && isSelected && 'border-accent-neon bg-accent-neon/5 shadow-glow',
        !isAvailable && 'border-dark-800 bg-dark-900 opacity-50 cursor-not-allowed'
      )}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-accent-neon flex items-center justify-center">
          <Check className="h-4 w-4 text-dark-900" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          'p-3 rounded-lg',
          court.type === 'INDOOR' ? 'bg-primary-800/50' : 'bg-secondary-800/50'
        )}>
          {court.type === 'INDOOR' ? (
            <Building2 className="h-6 w-6 text-accent-neon" />
          ) : (
            <TreePine className="h-6 w-6 text-accent-neon" />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-semibold text-white">{court.name}</h4>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              court.type === 'INDOOR' 
                ? 'bg-primary-800 text-primary-300' 
                : 'bg-secondary-800 text-secondary-300'
            )}>
              {court.type}
            </span>
          </div>
          
          {court.description && (
            <p className="text-sm text-dark-400 mb-2">{court.description}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-accent-neon font-semibold">
              {formatCurrency(court.baseRate)}/hour
            </span>
            
            {!isAvailable && (
              <span className="text-xs text-red-400 font-medium">Not Available</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
