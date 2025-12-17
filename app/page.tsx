'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DatePicker } from '@/components/booking/date-picker';
import { TimeSlotGrid } from '@/components/booking/time-slot-grid';
import { CourtCard } from '@/components/booking/court-card';
import { CoachCard } from '@/components/booking/coach-card';
import { PriceBreakdownPanel } from '@/components/booking/price-breakdown-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Calendar, MapPin, Users, CreditCard, CheckCircle, Clock } from 'lucide-react';
import TextReveal from '@/components/animations/TextReveal';
import FadeIn from '@/components/animations/FadeIn';
import { format } from 'date-fns/format';
import type { AvailabilitySlot, PriceBreakdown as PriceBreakdownType } from '@/lib/types';
import { Input } from '@/components/ui/input';

interface Court {
  id: string;
  name: string;
  type: 'INDOOR' | 'OUTDOOR';
  baseRate: number;
  description?: string | null;
  imageUrl?: string | null;
}

interface Coach {
  id: string;
  name: string;
  bio?: string | null;
  specialization?: string | null;
  hourlyRate: number;
  imageUrl?: string | null;
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  totalQuantity: number;
  availableQty: number;
  pricePerHour: number;
  perSlotMax: number;
}

type PriceBreakdownUi = PriceBreakdownType & {
  slots?: number;
  pricePerSlot?: number;
};

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null);
  const [selectedCoach, setSelectedCoach] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<{ equipmentId: string; quantity: number }[]>([]);
  
  const [availability, setAvailability] = useState<AvailabilitySlot[] | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdownUi | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState<Date[]>([]);

  useEffect(() => {
    fetchCourts();
    fetchCoaches();
    fetchEquipment();
    checkMonthAvailability(new Date());
  }, []);

  // Clamp selected equipment quantities based on current slot availability
  useEffect(() => {
    if (!availability || selectedTimes.length === 0 || selectedEquipment.length === 0) return;

    const getMinAvailableForEquipment = (equipmentId: string): number => {
      const perSlotAvailabilities = selectedTimes
        .map((time) => availability.find((s) => s.time === time))
        .filter(Boolean)
        .map((slot) => slot!.availableEquipment.find((e) => e.id === equipmentId)?.available ?? 0);

      if (perSlotAvailabilities.length === 0) return 0;
      return Math.min(...perSlotAvailabilities);
    };

    setSelectedEquipment((prev) => {
      const clamped = prev
        .map((item) => {
          const equipmentRow = equipment.find((e) => e.id === item.equipmentId);
          const perSlotMax = equipmentRow?.perSlotMax ?? 0;
          const minAvailable = getMinAvailableForEquipment(item.equipmentId);
          const maxAllowed = Math.max(0, Math.min(minAvailable, perSlotMax || minAvailable));
          return { ...item, quantity: Math.max(0, Math.min(item.quantity, maxAllowed)) };
        })
        .filter((item) => item.quantity > 0);

      const unchanged =
        clamped.length === prev.length &&
        clamped.every((c, i) => c.equipmentId === prev[i]?.equipmentId && c.quantity === prev[i]?.quantity);
      return unchanged ? prev : clamped;
    });
  }, [availability, selectedTimes, equipment, selectedEquipment.length]);

  const checkMonthAvailability = async (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const bookedDates: Date[] = [];

    console.log('🔍 Checking month availability for:', format(date, 'MMMM yyyy'));
    
    
    const daysToCheck = Math.min(daysInMonth, 7);
    
    for (let day = 1; day <= daysToCheck; day++) {
      const checkDate = new Date(year, month, day);
      if (checkDate < new Date()) continue; // Skip past dates
      
      try {
        // Use local date string; toISOString() can shift the day due to UTC conversion.
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const res = await fetch(`/api/availability?date=${dateStr}`);
        const data: AvailabilitySlot[] = await res.json();
        
        const hasAvailableSlots = data.some((slot) => slot.available);
        console.log(`📅 ${dateStr}: ${hasAvailableSlots ? 'Available' : '🔴 FULLY BOOKED'}`);
        
        if (!hasAvailableSlots) {
          const dateToAdd = new Date(year, month, day);
          dateToAdd.setHours(0, 0, 0, 0);
          bookedDates.push(dateToAdd);
        }
      } catch (error) {
        console.error('Error checking availability for', checkDate, error);
      }
    }
    
    console.log('🔴 Fully booked dates found:', bookedDates.map(d => d.toDateString()));
    
    setFullyBookedDates(prev => {
      const combined = [...prev, ...bookedDates];
      // Remove duplicates
      const unique = combined.filter((date, index, self) => 
        index === self.findIndex(d => d.toDateString() === date.toDateString())
      );
      return unique;
    });
  };

  const fetchCourts = async () => {
    try {
      const res = await fetch('/api/admin/courts');
      const data = await res.json();
      setCourts(data);
    } catch (error) {
      console.error('Error fetching courts:', error);
    }
  };

  const fetchCoaches = async () => {
    try {
      const res = await fetch('/api/admin/coaches');
      const data = await res.json();
      setCoaches(data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const fetchEquipment = async () => {
    try {
      const res = await fetch('/api/admin/equipment');
      const data = await res.json();
      setEquipment(data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    }
  };

  const fetchAvailability = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // Use local date string; toISOString() can shift the day due to UTC conversion.
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      // Add timestamp to prevent caching
      const res = await fetch(`/api/availability?date=${dateStr}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data: AvailabilitySlot[] = await res.json();
      console.log('📊 Availability data for', dateStr, ':', data);
      setAvailability(data);
      
      // Check if the selected date is fully booked
      const hasAvailableSlots = data.some((slot) => slot.available);
      if (!hasAvailableSlots) {
        const dateToAdd = new Date(selectedDate);
        dateToAdd.setHours(0, 0, 0, 0);
        setFullyBookedDates(prev => {
          const exists = prev.some(d => d.toDateString() === dateToAdd.toDateString());
          if (!exists) {
            return [...prev, dateToAdd];
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      void fetchAvailability();
    }
  }, [selectedDate, fetchAvailability]);

  const calculatePrice = useCallback(async () => {
    if (!selectedCourt || selectedTimes.length === 0) return;

    try {
      // Calculate price for all selected time slots
      const prices = await Promise.all(selectedTimes.map(async (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hours + 1, minutes, 0, 0);

        const res = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courtId: selectedCourt,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            coachId: selectedCoach,
            equipment: selectedEquipment,
          }),
        });

        return (await res.json()) as PriceBreakdownType;
      }));

      // Combine all prices
      const totalPrice = prices.reduce((sum, p) => sum + p.totalPrice, 0);
      const combinedBreakdown = {
        ...prices[0],
        totalPrice,
        slots: selectedTimes.length,
        pricePerSlot: prices[0]?.totalPrice || 0,
      };
      
      setPriceBreakdown(combinedBreakdown);
    } catch (error) {
      console.error('Error calculating price:', error);
    }
  }, [selectedCourt, selectedTimes, selectedDate, selectedCoach, selectedEquipment]);

  useEffect(() => {
    // Trigger price recalculation when inputs change.
    void calculatePrice();
  }, [calculatePrice]);

  // Refresh availability when moving to step 2 to ensure fresh court data
  useEffect(() => {
    if (step === 2) {
      void fetchAvailability();
    }
  }, [step, fetchAvailability]);

  const handleBooking = async () => {
    if (!selectedCourt || selectedTimes.length === 0) return;

    setIsLoading(true);
    try {
      console.log('🚀 Starting booking for time slots:', selectedTimes);
      
      // Pre-validate: Check selected court/coach/equipment are available for ALL selected times
      const failures: string[] = [];
      const invalidTimes = new Set<string>();

      for (const time of selectedTimes) {
        const slot = availability?.find((s) => s.time === time);

        if (!slot?.available || !slot.availableCourts?.includes(selectedCourt)) {
          failures.push(`${time}: Court is no longer available`);
          invalidTimes.add(time);
          continue;
        }

        if (selectedCoach && !slot.availableCoaches?.includes(selectedCoach)) {
          failures.push(`${time}: Coach is no longer available`);
          invalidTimes.add(time);
          continue;
        }

        if (selectedEquipment.length > 0) {
          for (const req of selectedEquipment) {
            const eq = slot.availableEquipment?.find((e) => e.id === req.equipmentId);
            const availableCount = eq?.available ?? 0;
            if (availableCount < req.quantity) {
              failures.push(`${time}: Insufficient equipment (${availableCount} available)`);
              invalidTimes.add(time);
              break;
            }
          }
        }
      }

      if (failures.length > 0) {
        console.error('❌ Pre-validation failed:', failures);
        alert(
          `Some selections are no longer available:\n${failures.join('\n')}\n\nRefreshing availability...`
        );

        // Remove invalid times from selection
        if (invalidTimes.size > 0) {
          setSelectedTimes(selectedTimes.filter((t) => !invalidTimes.has(t)));
        }

        await fetchAvailability();
        setIsLoading(false);
        return;
      }
      
      // Create bookings for all selected time slots
      const bookingPromises = selectedTimes.map(async (timeStr) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const startTime = new Date(selectedDate);
        startTime.setHours(hours, minutes, 0, 0);
        
        const endTime = new Date(startTime);
        endTime.setHours(hours + 1, minutes, 0, 0);

        console.log(`  📤 Creating booking for ${timeStr} (${startTime.toISOString()} - ${endTime.toISOString()})`);

        return fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user_demo',
            courtId: selectedCourt,
            coachId: selectedCoach,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            equipment: selectedEquipment,
          }),
        });
      });

      const results = await Promise.all(bookingPromises);
      const failedBookings = [];
      const failedReasons = [];
      
      for (let i = 0; i < results.length; i++) {
        if (!results[i].ok) {
          failedBookings.push(results[i]);
          const errorData = await results[i].json();
          failedReasons.push(`${selectedTimes[i]}: ${errorData.error}`);
        }
      }
      
      if (failedBookings.length > 0) {
        console.error('❌ Booking failed:', failedReasons);
        alert(`Failed to book some time slots:\n${failedReasons.join('\n')}\n\nThese slots may have been booked by someone else. Refreshing availability...`);
        
        // Clear selections and refresh
        setSelectedTimes([]);
        setSelectedCourt(null);
        setSelectedCoach(null);
        setSelectedEquipment([]);
        setPriceBreakdown(null);
        await fetchAvailability();
        setStep(1); // Go back to step 1 to select new times
        setIsLoading(false);
        return;
      }

      console.log('✅ All bookings successful, refreshing availability...');
      
      // Clear selections FIRST
      setSelectedTimes([]);
      setSelectedCourt(null);
      setSelectedCoach(null);
      setSelectedEquipment([]);
      setPriceBreakdown(null);
      
      // Refresh availability to get updated data
      await fetchAvailability();
      
      // Then show success and move to confirmation
      alert(`Successfully booked ${results.length} time slot(s)!`);
      setStep(4);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert(error instanceof Error ? error.message : 'Failed to create booking. Please try again.');
      // Refresh availability even on error to show current state
      await fetchAvailability();
    } finally {
      setIsLoading(false);
    }
  };

  const canProceedToStep2 = selectedDate && selectedTimes.length > 0;
  const canProceedToStep3 = canProceedToStep2 && selectedCourt;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-12 text-center">
        <div className="flex flex-col items-center gap-6">
          <TextReveal
            text="CourtFlow"
            className="text-5xl md:text-7xl font-bold text-accent-neon"
            tag="h1"
            delay={60}
            type="chars"
            animation="scale"
            threshold={0.2}
          />
          <TextReveal
            text="Book your perfect badminton court in seconds"
            className="text-lg md:text-xl text-dark-300"
            tag="p"
            delay={40}
            type="words"
            animation="fade-up"
            threshold={0.2}
          />
        </div>
      </div>

      <FadeIn delay={200} direction="up" threshold={0.1}>
        <div className="mb-8">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((stepNum) => (
              <React.Fragment key={stepNum}>
                <div className={cn(
                  'flex items-center gap-3 flex-1',
                  step >= stepNum && 'opacity-100',
                  step < stepNum && 'opacity-40'
                )}>
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200',
                    step > stepNum && 'bg-accent-neon text-dark-900',
                    step === stepNum && 'bg-accent-neon text-dark-900 shadow-glow',
                    step < stepNum && 'bg-dark-800 text-dark-400'
                  )}>
                    {step > stepNum ? <CheckCircle className="h-5 w-5" /> : stepNum}
                  </div>
                  <span className={cn(
                    'font-medium hidden sm:inline',
                    step >= stepNum && 'text-white',
                    step < stepNum && 'text-dark-400'
                  )}>
                    {stepNum === 1 && 'Date & Time'}
                    {stepNum === 2 && 'Select Court'}
                    {stepNum === 3 && 'Review & Book'}
                  </span>
                </div>
                {stepNum < 3 && <div className="w-12 h-0.5 bg-dark-700" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {step === 1 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-accent-neon" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DatePicker
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    minDate={new Date()}
                    fullyBookedDates={fullyBookedDates}
                  />
                </CardContent>
              </Card>

              {availability && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-accent-neon" />
                        <h3 className="text-lg font-semibold text-white">Available Time Slots</h3>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => fetchAvailability()}
                        disabled={isRefreshing}
                        className="text-xs"
                      >
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                      </Button>
                    </div>
                    <TimeSlotGrid
                      slots={availability}
                      selectedTimes={selectedTimes}
                      onTimeSelect={(time) => {
                        if (selectedTimes.includes(time)) {
                          setSelectedTimes(selectedTimes.filter(t => t !== time));
                        } else {
                          setSelectedTimes([...selectedTimes, time]);
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              )}

              {canProceedToStep2 && (
                <div className="flex justify-end">
                  <Button size="lg" onClick={() => setStep(2)}>
                    Continue to Court Selection
                  </Button>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-accent-neon" />
                    Select Court
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courts.map((court) => {
                    // Check if the court is available for ALL selected time slots
                    const isAvailable = selectedTimes.length === 0 || selectedTimes.every(time => {
                      const slot = availability?.find((s) => s.time === time);
                      return slot?.availableCourts?.includes(court.id);
                    });
                    
                    return (
                      <CourtCard
                        key={court.id}
                        court={court}
                        isSelected={selectedCourt === court.id}
                        isAvailable={isAvailable}
                        onSelect={setSelectedCourt}
                      />
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent-neon" />
                    Add a Coach (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCoach(null)}
                    className={!selectedCoach ? 'border-accent-neon' : ''}
                  >
                    No Coach
                  </Button>
                  
                  {coaches.map((coach) => {
                    // Check if the coach is available for ALL selected time slots
                    const isAvailable = selectedTimes.length === 0 || selectedTimes.every(time => {
                      const slot = availability?.find((s) => s.time === time);
                      return slot?.availableCoaches?.includes(coach.id);
                    });
                    
                    return (
                      <CoachCard
                        key={coach.id}
                        coach={coach}
                        isSelected={selectedCoach === coach.id}
                        isAvailable={isAvailable}
                        onSelect={setSelectedCoach}
                      />
                    );
                  })}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent-neon" />
                    Add Equipment (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {equipment.length === 0 && (
                    <p className="text-sm text-dark-400">No equipment available.</p>
                  )}

                  {equipment.map((item) => {
                    const currentQty =
                      selectedEquipment.find((e) => e.equipmentId === item.id)?.quantity ?? 0;

                    const minAvailableAcrossSelectedTimes =
                      selectedTimes.length === 0
                        ? item.totalQuantity
                        : Math.min(
                            ...selectedTimes.map((time) => {
                              const slot = availability?.find((s) => s.time === time);
                              const eq = slot?.availableEquipment?.find((e) => e.id === item.id);
                              return eq?.available ?? 0;
                            })
                          );

                    const maxAllowed = Math.max(
                      0,
                      Math.min(minAvailableAcrossSelectedTimes, item.perSlotMax || minAvailableAcrossSelectedTimes)
                    );

                    const isDisabled = selectedTimes.length > 0 && maxAllowed <= 0;

                    const setQty = (nextQty: number) => {
                      const normalized = Math.max(0, Math.min(nextQty, maxAllowed));
                      setSelectedEquipment((prev) => {
                        const without = prev.filter((e) => e.equipmentId !== item.id);
                        return normalized > 0
                          ? [...without, { equipmentId: item.id, quantity: normalized }]
                          : without;
                      });
                    };

                    return (
                      <div
                        key={item.id}
                        className={cn(
                          'flex items-center justify-between gap-4 rounded-lg border border-dark-700 bg-dark-900/30 p-4',
                          isDisabled && 'opacity-60'
                        )}
                      >
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{item.name}</div>
                          <div className="text-xs text-dark-400">
                            {selectedTimes.length === 0
                              ? `Total: ${item.totalQuantity}`
                              : `Available for selected time(s): ${minAvailableAcrossSelectedTimes}`}
                            {item.perSlotMax ? ` · Max per slot: ${item.perSlotMax}` : ''}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQty(currentQty - 1)}
                            disabled={isDisabled || currentQty <= 0}
                          >
                            -
                          </Button>
                          <Input
                            type="number"
                            min={0}
                            max={maxAllowed}
                            value={currentQty}
                            disabled={isDisabled}
                            onChange={(e) => setQty(Number(e.target.value))}
                            className="w-20 text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQty(currentQty + 1)}
                            disabled={isDisabled || currentQty >= maxAllowed}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {selectedEquipment.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEquipment([])}
                    >
                      Clear Equipment
                    </Button>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                {canProceedToStep3 && (
                  <Button size="lg" onClick={() => setStep(3)}>
                    Review Booking
                  </Button>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-accent-neon" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-dark-400 mb-1">Date</p>
                      <p className="text-white font-medium">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-dark-400 mb-1">Time</p>
                      <div className="text-white font-medium">
                        {selectedTimes.map((time, index) => (
                          <div key={time}>
                            {time} - {`${parseInt(time.split(':')[0]) + 1}:${time.split(':')[1]}`}
                            {index < selectedTimes.length - 1 && ', '}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-dark-400 mb-1">Court</p>
                      <p className="text-white font-medium">
                        {courts.find(c => c.id === selectedCourt)?.name}
                      </p>
                    </div>
                    {selectedCoach && (
                      <div>
                        <p className="text-sm text-dark-400 mb-1">Coach</p>
                        <p className="text-white font-medium">
                          {coaches.find(c => c.id === selectedCoach)?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="min-w-[200px]"
                >
                  {isLoading ? 'Processing...' : 'Confirm Booking'}
                </Button>
              </div>
            </>
          )}

          {step === 4 && (
            <Card className="border-accent-neon/50">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="w-20 h-20 rounded-full bg-accent-neon/10 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-12 w-12 text-accent-neon" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h2>
                <p className="text-dark-400 mb-8">
                  Your court has been successfully booked. Check your email for confirmation details.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button onClick={() => window.location.href = '/bookings'}>
                    View My Bookings
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setStep(1);
                      setSelectedTimes([]);
                      setSelectedCourt(null);
                      setSelectedCoach(null);
                      setSelectedEquipment([]);
                    }}
                  >
                    Book Another Court
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <PriceBreakdownPanel 
            breakdown={priceBreakdown} 
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
}
