'use client';

import React from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  fullyBookedDates?: Date[];
}

export function DatePicker({ selectedDate, onDateChange, minDate, maxDate, fullyBookedDates = [] }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const paddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;
    
    onDateChange(newDate);
  };

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const isDateFullyBooked = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const isBooked = fullyBookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
    if (isBooked) {
      console.log('🔴 Date is fully booked:', date.toDateString());
    }
    return isBooked;
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="w-full max-w-md bg-dark-800 rounded-xl border border-dark-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevMonth}
          className="p-2"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2 text-white font-semibold">
          <Calendar className="h-5 w-5 text-accent-neon" />
          {format(currentMonth, 'MMMM yyyy')}
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextMonth}
          className="p-2"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs font-medium text-dark-400 p-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {paddingDays.map((_, i) => (
          <div key={`padding-${i}`} className="p-2" />
        ))}
        
        {days.map((day) => {
          const disabled = isDateDisabled(day);
          const selected = isDateSelected(day);
          const fullyBooked = isDateFullyBooked(day);
          
          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              disabled={disabled || fullyBooked}
              className={cn(
                'p-2 rounded-lg text-sm font-medium transition-all duration-200 relative',
                'hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-accent-500',
                disabled && 'opacity-30 cursor-not-allowed hover:bg-transparent',
                fullyBooked && !selected && 'text-red-400 line-through opacity-50 cursor-not-allowed hover:bg-transparent',
                selected && 'bg-accent-neon text-dark-900 hover:bg-accent-lime',
                !selected && !disabled && !fullyBooked && 'text-white'
              )}
              title={fullyBooked ? 'Fully Booked' : undefined}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
