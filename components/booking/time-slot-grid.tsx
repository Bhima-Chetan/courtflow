'use client';

import React from 'react';
import { Clock, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedTimes: string[];
  onTimeSelect: (time: string) => void;
}

export function TimeSlotGrid({ slots, selectedTimes, onTimeSelect }: TimeSlotGridProps) {
  React.useEffect(() => {
    console.log('⏰ TimeSlot Grid - Slots:', slots.map(s => ({ 
      time: s.time, 
      available: s.available 
    })));
  }, [slots]);

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-accent-neon" />
        <h3 className="text-lg font-semibold text-white">Select Time Slots</h3>
        {selectedTimes.length > 0 && (
          <span className="text-sm text-dark-400">
            ({selectedTimes.length} slot{selectedTimes.length !== 1 ? 's' : ''} selected)
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {slots.map((slot) => {
          const isSelected = selectedTimes.includes(slot.time);
          
          return (
            <button
              key={slot.time}
              onClick={() => slot.available && onTimeSelect(slot.time)}
              disabled={!slot.available}
              className={cn(
                'relative p-3 rounded-lg border-2 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-dark-900',
                slot.available && !isSelected && 'border-dark-700 bg-dark-800 hover:border-accent-500 hover:bg-dark-700 text-white',
                slot.available && isSelected && 'border-accent-neon bg-accent-neon/10 text-accent-neon',
                !slot.available && 'border-dark-800 bg-dark-900 text-dark-600 cursor-not-allowed opacity-50'
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm font-medium">{slot.time}</span>
                {isSelected && (
                  <Check className="h-4 w-4 text-accent-neon" />
                )}
              </div>
              
              {!slot.available && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 rotate-45 transform scale-x-150" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-accent-neon bg-accent-neon/10" />
          <span className="text-dark-400">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dark-700 bg-dark-800" />
          <span className="text-dark-400">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-dark-800 bg-dark-900 opacity-50" />
          <span className="text-dark-400">Booked</span>
        </div>
      </div>
    </div>
  );
}
