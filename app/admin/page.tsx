import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, MapPin, Users } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import prisma from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

async function getAdminStats() {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const [totalBookings, bookingsWithRevenue, activeCourts, activeCoaches] = await Promise.all([
    prisma.booking.count({
      where: {
        createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
    }),
    prisma.booking.findMany({
      where: {
        createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        status: { in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
      },
      select: { totalPrice: true },
    }),
    prisma.court.count({ where: { status: 'ACTIVE' } }),
    prisma.coach.count({ where: { status: 'ACTIVE' } }),
  ]);

  const totalRevenue = bookingsWithRevenue.reduce((sum, booking) => sum + booking.totalPrice, 0);

  return {
    totalBookings,
    totalRevenue,
    activeCourts,
    activeCoaches,
  };
}

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-dark-400">Manage your facility resources and bookings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-accent-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-dark-400 font-medium">Total Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-accent-neon/10">
                <Calendar className="h-6 w-6 text-accent-neon" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                <p className="text-xs text-dark-400">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-secondary-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-dark-400 font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-secondary-800/50">
                <DollarSign className="h-6 w-6 text-secondary-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-dark-400">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-dark-400 font-medium">Active Courts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary-800/50">
                <MapPin className="h-6 w-6 text-primary-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.activeCourts}</p>
                <p className="text-xs text-dark-400">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-dark-400 font-medium">Active Coaches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-900/50">
                <Users className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{stats.activeCoaches}</p>
                <p className="text-xs text-dark-400">Available</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/admin/courts" className="block p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
              <h3 className="font-semibold text-white mb-1">Manage Courts</h3>
              <p className="text-sm text-dark-400">Add, edit, or disable courts</p>
            </a>
            <a href="/admin/coaches" className="block p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
              <h3 className="font-semibold text-white mb-1">Manage Coaches</h3>
              <p className="text-sm text-dark-400">Add coaches and set availability</p>
            </a>
            <a href="/admin/equipment" className="block p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
              <h3 className="font-semibold text-white mb-1">Manage Equipment</h3>
              <p className="text-sm text-dark-400">Track inventory and pricing</p>
            </a>
            <a href="/admin/pricing" className="block p-4 rounded-lg bg-dark-800 hover:bg-dark-700 transition-colors">
              <h3 className="font-semibold text-white mb-1">Pricing Rules</h3>
              <p className="text-sm text-dark-400">Configure dynamic pricing</p>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-dark-400 mb-2">Pricing Engine</h4>
              <p className="text-white">
                Dynamic pricing based on court type, time of day, weekday/weekend, and selected resources.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-dark-400 mb-2">Booking System</h4>
              <p className="text-white">
                Atomic transactions ensure no double bookings with real-time availability checks.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-dark-400 mb-2">Database</h4>
              <p className="text-white">
                PostgreSQL with Prisma ORM for robust data management and relationships.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
