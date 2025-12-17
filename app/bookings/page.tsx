'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, User, DollarSign, X } from 'lucide-react';
import { formatCurrency, formatTime } from '@/lib/utils';

type BookingStatus = 'CONFIRMED' | 'CANCELED' | 'COMPLETED' | 'WAITLISTED';

interface BookingCourt {
  name: string;
  type: string;
}

interface BookingCoach {
  name: string;
}

interface Booking {
  id: string;
  court: BookingCourt;
  coach?: BookingCoach | null;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: BookingStatus;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const includeHistory = filter === 'past' || filter === 'all';
      const res = await fetch(`/api/bookings?userId=user_demo&includeHistory=${includeHistory}`);
      const data = (await res.json()) as Booking[];
      
      let filtered: Booking[] = data;
      if (filter === 'upcoming') {
        filtered = data.filter((b) => new Date(b.startTime) >= new Date());
      } else if (filter === 'past') {
        filtered = data.filter((b) => new Date(b.startTime) < new Date());
      }
      
      setBookings(filtered);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user_demo' }),
      });

      if (res.ok) {
        fetchBookings();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
      alert('Failed to cancel booking');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Bookings</h1>
        <p className="text-dark-400">Manage your court reservations</p>
      </div>

      <div className="flex gap-3 mb-6">
        {(['upcoming', 'all', 'past'] as const).map((filterOption) => (
          <Button
            key={filterOption}
            variant={filter === filterOption ? 'primary' : 'outline'}
            onClick={() => setFilter(filterOption)}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-dark-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-dark-700 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-dark-400">No bookings found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="hover:border-accent-500 transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-accent-neon mt-0.5" />
                      <div>
                        <p className="text-xs text-dark-400 mb-1">Court</p>
                        <p className="text-white font-medium">{booking.court.name}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-primary-800 text-primary-300 mt-1">
                          {booking.court.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-accent-neon mt-0.5" />
                      <div>
                        <p className="text-xs text-dark-400 mb-1">Date & Time</p>
                        <p className="text-white font-medium">
                          {new Date(booking.startTime).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-dark-400">
                          {formatTime(new Date(booking.startTime))} - {formatTime(new Date(booking.endTime))}
                        </p>
                      </div>
                    </div>

                    {booking.coach && (
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 text-accent-neon mt-0.5" />
                        <div>
                          <p className="text-xs text-dark-400 mb-1">Coach</p>
                          <p className="text-white font-medium">{booking.coach.name}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <DollarSign className="h-5 w-5 text-accent-neon mt-0.5" />
                      <div>
                        <p className="text-xs text-dark-400 mb-1">Total Price</p>
                        <p className="text-accent-neon font-bold text-xl">
                          {formatCurrency(booking.totalPrice)}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          booking.status === 'CONFIRMED' ? 'bg-green-900 text-green-300' :
                          booking.status === 'CANCELED' ? 'bg-red-900 text-red-300' :
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.status === 'CONFIRMED' && new Date(booking.startTime) > new Date() && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                      className="ml-4"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
