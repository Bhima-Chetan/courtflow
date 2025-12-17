'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Zap, Lock, TrendingUp, Layers, GitBranch } from 'lucide-react';

export default function SystemDesignPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">System Design & Architecture</h1>
        <p className="text-dark-400">
          Comprehensive overview of CourtFlow&apos;s technical architecture and design decisions
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-6 w-6 text-accent-neon" />
              Database Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Core Models</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium text-accent-500 mb-2">User Management</h4>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>• User - Account information</li>
                    <li>• Account - OAuth providers</li>
                    <li>• Session - Authentication sessions</li>
                  </ul>
                </div>
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium text-accent-500 mb-2">Resources</h4>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>• Court - 4 badminton courts</li>
                    <li>• Coach - 3 coaches with availability</li>
                    <li>• Equipment - Rackets & shoes inventory</li>
                    <li>• CoachAvailability - Weekly + override schedules</li>
                  </ul>
                </div>
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium text-accent-500 mb-2">Booking System</h4>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>• Booking - Main reservation record</li>
                    <li>• BookingItem - Equipment associations</li>
                    <li>• WaitlistEntry - Waitlist management</li>
                  </ul>
                </div>
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium text-accent-500 mb-2">Pricing</h4>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>• PricingRule - Dynamic pricing rules</li>
                    <li>• JSON conditions for flexible matching</li>
                    <li>• Priority-based rule application</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Data Integrity</h3>
              <div className="bg-dark-900 p-4 rounded-lg border border-dark-700">
                <ul className="text-sm text-dark-300 space-y-2">
                  <li>• <strong className="text-accent-500">Unique Constraints:</strong> Prevent duplicate bookings for same court/time/status</li>
                  <li>• <strong className="text-accent-500">Foreign Keys:</strong> Enforce referential integrity across all relationships</li>
                  <li>• <strong className="text-accent-500">Cascade Deletes:</strong> Automatic cleanup of related records</li>
                  <li>• <strong className="text-accent-500">Indexes:</strong> Optimized queries on courtId, userId, startTime</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-accent-neon" />
              Pricing Engine
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-neon/10 text-accent-neon flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Base Rate Calculation</h4>
                    <p className="text-sm text-dark-400">
                      Start with court&apos;s base hourly rate multiplied by booking duration
                    </p>
                    <code className="text-xs text-accent-500 mt-1 block">
                      basePrice = court.baseRate × durationHours
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-neon/10 text-accent-neon flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Rule Evaluation</h4>
                    <p className="text-sm text-dark-400">
                      Fetch all active pricing rules ordered by priority, evaluate conditions
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-dark-300 bg-dark-900 p-2 rounded">
                        • <strong className="text-secondary-400">Court Type</strong> - Check if INDOOR/OUTDOOR matches
                      </div>
                      <div className="text-xs text-dark-300 bg-dark-900 p-2 rounded">
                        • <strong className="text-secondary-400">Time of Day</strong> - Check if time falls in peak hours (18:00-21:00)
                      </div>
                      <div className="text-xs text-dark-300 bg-dark-900 p-2 rounded">
                        • <strong className="text-secondary-400">Weekend</strong> - Check if booking date is Saturday/Sunday
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-neon/10 text-accent-neon flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Apply Surcharges</h4>
                    <p className="text-sm text-dark-400">
                      Stack all matching surcharges (percentage or flat fees)
                    </p>
                    <code className="text-xs text-accent-500 mt-1 block">
                      surcharge = isPercentage ? basePrice × (amount / 100) : amount × durationHours
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-neon/10 text-accent-neon flex items-center justify-center flex-shrink-0 font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Add Resource Costs</h4>
                    <p className="text-sm text-dark-400">
                      Calculate equipment and coach fees separately
                    </p>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="text-dark-300">Equipment: sum(item.pricePerHour × quantity × duration)</div>
                      <div className="text-dark-300">Coach: coach.hourlyRate × duration</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-neon/10 text-accent-neon flex items-center justify-center flex-shrink-0 font-bold">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-1">Return Breakdown</h4>
                    <p className="text-sm text-dark-400">
                      Provide detailed breakdown showing all components
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Example Calculation</h3>
              <div className="bg-dark-900 p-4 rounded-lg border border-dark-700 space-y-2 text-sm">
                <div className="flex justify-between text-dark-300">
                  <span>Indoor Court (1 hour)</span>
                  <span className="text-white">$50.00</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>+ Indoor Premium (10%)</span>
                  <span className="text-yellow-400">+$5.00</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>+ Peak Hours (flat $10)</span>
                  <span className="text-yellow-400">+$10.00</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>+ Weekend (15%)</span>
                  <span className="text-yellow-400">+$7.50</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>+ Coach Fee</span>
                  <span className="text-white">$60.00</span>
                </div>
                <div className="flex justify-between text-dark-300">
                  <span>+ Equipment (2 rackets)</span>
                  <span className="text-white">$10.00</span>
                </div>
                <div className="border-t border-dark-700 pt-2 flex justify-between font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-accent-neon text-xl">$142.50</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-6 w-6 text-accent-neon" />
              Atomic Booking System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Transaction Flow</h3>
              <div className="space-y-3">
                <div className="p-4 bg-dark-900 rounded-lg border-l-4 border-accent-500">
                  <h4 className="font-medium text-accent-500 mb-2">Pre-Transaction Validation</h4>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>1. Check court availability for time slot</li>
                    <li>2. Verify coach availability (schedule + no conflicts)</li>
                    <li>3. Validate equipment inventory (sufficient quantity)</li>
                    <li>4. Calculate total price with breakdown</li>
                  </ul>
                </div>

                <div className="p-4 bg-dark-900 rounded-lg border-l-4 border-secondary-500">
                  <h4 className="font-medium text-secondary-400 mb-2">Transaction Execution</h4>
                  <div className="text-sm text-dark-300 space-y-1">
                    <p className="font-mono text-xs text-accent-500 mb-2">await prisma.$transaction(async (tx) =&gt;</p>
                    <ul className="space-y-1 ml-4">
                      <li>1. Create Booking record</li>
                      <li>2. Create BookingItem records for equipment</li>
                      <li>3. Decrement equipment.availableQty</li>
                      <li>4. Return complete booking with relations</li>
                    </ul>
                    <p className="font-mono text-xs text-accent-500 mt-2">);</p>
                  </div>
                </div>

                <div className="p-4 bg-dark-900 rounded-lg border-l-4 border-yellow-500">
                  <h4 className="font-medium text-yellow-400 mb-2">Failure Handling</h4>
                  <ul className="text-sm text-dark-300 space-y-1">
                    <li>• Any error = automatic rollback (no partial state)</li>
                    <li>• Database constraints prevent double-booking</li>
                    <li>• Inventory checks prevent over-allocation</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Cancellation & Waitlist</h3>
              <div className="bg-dark-900 p-4 rounded-lg border border-dark-700">
                <ul className="text-sm text-dark-300 space-y-2">
                  <li>1. <strong className="text-accent-500">Mark booking as CANCELED</strong></li>
                  <li>2. <strong className="text-accent-500">Restore equipment inventory</strong> (increment availableQty)</li>
                  <li>3. <strong className="text-accent-500">Check waitlist</strong> for matching court/time</li>
                  <li>4. <strong className="text-accent-500">Auto-promote</strong> first waiting user</li>
                  <li>5. <strong className="text-accent-500">Create new booking</strong> for promoted user</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-accent-neon" />
              Service Architecture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-dark-800 rounded-lg">
                <h4 className="font-semibold text-secondary-400 mb-3">Booking Service</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• createBooking()</li>
                  <li>• cancelBooking()</li>
                  <li>• getUserBookings()</li>
                  <li>• addToWaitlist()</li>
                </ul>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg">
                <h4 className="font-semibold text-secondary-400 mb-3">Pricing Service</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• calculatePrice()</li>
                  <li>• getApplicableRules()</li>
                  <li>• applySurcharge()</li>
                  <li>• createOrUpdateRule()</li>
                </ul>
              </div>
              <div className="p-4 bg-dark-800 rounded-lg">
                <h4 className="font-semibold text-secondary-400 mb-3">Availability Service</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• getAvailabilityForDate()</li>
                  <li>• checkAvailability()</li>
                  <li>• validateResources()</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-accent-neon" />
              Performance & Scalability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Database Optimizations</h3>
                <ul className="space-y-2 text-sm text-dark-300">
                  <li>• Indexed columns: courtId, userId, startTime for fast lookups</li>
                  <li>• Unique constraints prevent race conditions</li>
                  <li>• Connection pooling via Prisma</li>
                  <li>• Efficient JOIN queries with select optimization</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Concurrency Handling</h3>
                <ul className="space-y-2 text-sm text-dark-300">
                  <li>• Transaction isolation prevents dirty reads</li>
                  <li>• Optimistic locking on inventory updates</li>
                  <li>• Database-level unique constraints</li>
                  <li>• Atomic read-check-write operations</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-6 w-6 text-accent-neon" />
              Tech Stack Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-accent-500 mb-2">Frontend</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• Next.js 14+ (App Router)</li>
                  <li>• React 19 with TypeScript</li>
                  <li>• Tailwind CSS</li>
                  <li>• Radix UI components</li>
                  <li>• React Query (TanStack Query)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-accent-500 mb-2">Backend</h4>
                <ul className="text-sm text-dark-300 space-y-1">
                  <li>• Next.js API Routes</li>
                  <li>• PostgreSQL database</li>
                  <li>• Prisma ORM</li>
                  <li>• NextAuth.js (auth scaffold)</li>
                  <li>• TypeScript end-to-end</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
