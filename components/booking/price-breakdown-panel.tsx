'use client';

import React from 'react';
import { formatCurrency } from '@/lib/utils';
import { PriceBreakdown as PriceBreakdownType } from '@/lib/types';
import { DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type PriceBreakdownUi = PriceBreakdownType & {
  slots?: number;
  pricePerSlot?: number;
};

interface PriceBreakdownPanelProps {
  breakdown: PriceBreakdownUi | null;
  isLoading?: boolean;
}

export function PriceBreakdownPanel({ breakdown, isLoading }: PriceBreakdownPanelProps) {
  if (isLoading) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent-neon" />
            Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 animate-pulse">
            <div className="h-4 bg-dark-700 rounded w-3/4" />
            <div className="h-4 bg-dark-700 rounded w-1/2" />
            <div className="h-4 bg-dark-700 rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown) {
    return (
      <Card className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent-neon" />
            Price Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-dark-400 text-sm">
            Select a court and time to see pricing details
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-4 border-accent-neon/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent-neon" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {breakdown.slots && breakdown.slots > 1 && (
          <div className="bg-accent-neon/10 border border-accent-neon/30 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-accent-neon font-medium">Number of Time Slots</span>
              <span className="text-accent-neon font-bold">{breakdown.slots}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-dark-300 mt-1">
              <span>Price per slot</span>
              <span>{formatCurrency(breakdown.pricePerSlot || 0)}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-400">Base Court Rate{breakdown.slots && breakdown.slots > 1 ? ' (per slot)' : ''}</span>
            <span className="text-white font-medium">
              {formatCurrency(breakdown.basePrice)}
            </span>
          </div>

          {breakdown.courtType === 'INDOOR' && (
            <div className="flex items-center gap-1 text-xs text-secondary-400">
              <TrendingUp className="h-3 w-3" />
              <span>Indoor Premium</span>
            </div>
          )}
        </div>

        {breakdown.surcharges.length > 0 && (
          <div className="border-t border-dark-700 pt-3 space-y-2">
            <div className="text-xs font-medium text-dark-400 uppercase tracking-wide">
              Surcharges
            </div>
            {breakdown.surcharges.map((surcharge, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-dark-400">{surcharge.name}</span>
                <span className="text-yellow-400 font-medium">
                  +{formatCurrency(surcharge.amount)}
                </span>
              </div>
            ))}
          </div>
        )}

        {breakdown.equipmentCost > 0 && (
          <div className="border-t border-dark-700 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Equipment</span>
              <span className="text-white font-medium">
                {formatCurrency(breakdown.equipmentCost)}
              </span>
            </div>
          </div>
        )}

        {breakdown.coachFee > 0 && (
          <div className="border-t border-dark-700 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-dark-400">Coach Fee</span>
              <span className="text-white font-medium">
                {formatCurrency(breakdown.coachFee)}
              </span>
            </div>
          </div>
        )}

        <div className="border-t-2 border-accent-neon/30 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-white">Total</span>
            <span className="text-2xl font-bold text-accent-neon">
              {formatCurrency(breakdown.totalPrice)}
            </span>
          </div>
        </div>

        <div className="bg-dark-700/50 rounded-lg p-3 text-xs text-dark-400">
          <p className="leading-relaxed">
            Prices are calculated based on court type, time of day, and selected resources.
            Peak hours (6 PM - 9 PM) and weekends may have additional surcharges.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
