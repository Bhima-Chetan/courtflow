'use client';

import React from 'react';
import Image from 'next/image';
import { User, Star, Check } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface Coach {
  id: string;
  name: string;
  bio?: string | null;
  specialization?: string | null;
  hourlyRate: number;
  imageUrl?: string | null;
}

interface CoachCardProps {
  coach: Coach;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: (coachId: string) => void;
}

export function CoachCard({ coach, isSelected, isAvailable, onSelect }: CoachCardProps) {
  return (
    <button
      onClick={() => isAvailable && onSelect(coach.id)}
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
        <div className="relative">
          {coach.imageUrl ? (
            <Image
              src={coach.imageUrl}
              alt={coach.name}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-accent-500"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center">
              <User className="h-8 w-8 text-dark-900" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-dark-800 border-2 border-dark-900 flex items-center justify-center">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
          </div>
        </div>

        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white mb-1">{coach.name}</h4>
          
          {coach.specialization && (
            <p className="text-xs text-accent-500 font-medium mb-1">
              {coach.specialization}
            </p>
          )}
          
          {coach.bio && (
            <p className="text-sm text-dark-400 mb-2 line-clamp-2">{coach.bio}</p>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-accent-neon font-semibold">
              {formatCurrency(coach.hourlyRate)}/hour
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
