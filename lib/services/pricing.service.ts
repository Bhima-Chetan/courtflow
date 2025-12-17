import prisma from '@/lib/prisma';
import { PriceBreakdown, PricingRuleCondition } from '@/lib/types';
import { isWeekend, isPeakHours } from '@/lib/utils';
import { CourtType, PricingRuleType, type Prisma } from '@prisma/client';

export class PricingService {
  async calculatePrice(
    courtId: string,
    startTime: Date,
    endTime: Date,
    coachId?: string,
    equipmentIds?: { equipmentId: string; quantity: number }[]
  ): Promise<PriceBreakdown> {
    const court = await prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court) {
      throw new Error('Court not found');
    }

    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const basePrice = court.baseRate * durationHours;

    const breakdown: PriceBreakdown = {
      basePrice,
      courtType: court.type,
      surcharges: [],
      equipmentCost: 0,
      coachFee: 0,
      totalPrice: 0,
    };

    const applicableRules = await this.getApplicableRules(court.type, startTime);

    for (const rule of applicableRules) {
      const surcharge = this.applySurcharge(rule, basePrice, durationHours);
      
      if (surcharge > 0) {
        breakdown.surcharges.push({
          name: rule.name,
          amount: surcharge,
          type: rule.type,
        });
      }
    }

    if (equipmentIds && equipmentIds.length > 0) {
      const equipmentCost = await this.calculateEquipmentCost(equipmentIds, durationHours);
      breakdown.equipmentCost = equipmentCost;
    }

    if (coachId) {
      const coach = await prisma.coach.findUnique({
        where: { id: coachId },
      });
      
      if (coach) {
        breakdown.coachFee = coach.hourlyRate * durationHours;
      }
    }

    const totalSurcharges = breakdown.surcharges.reduce((sum, s) => sum + s.amount, 0);
    breakdown.totalPrice = breakdown.basePrice + totalSurcharges + breakdown.equipmentCost + breakdown.coachFee;

    return breakdown;
  }

  private async getApplicableRules(courtType: CourtType, startTime: Date) {
    const allRules = await prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    return allRules.filter(rule => {
      if (!rule.conditions) return true;

      const conditions = rule.conditions as PricingRuleCondition;

      if (conditions.courtType && conditions.courtType !== courtType) {
        return false;
      }

      if (conditions.isWeekend !== undefined && conditions.isWeekend !== isWeekend(startTime)) {
        return false;
      }

      if (rule.type === PricingRuleType.TIME_OF_DAY) {
        const timeStr = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
        return isPeakHours(timeStr);
      }

      return true;
    });
  }

  private applySurcharge(rule: { isPercentage: boolean; amount: number }, basePrice: number, durationHours: number): number {
    if (rule.isPercentage) {
      return basePrice * (rule.amount / 100);
    }
    return rule.amount * durationHours;
  }

  private async calculateEquipmentCost(
    equipmentIds: { equipmentId: string; quantity: number }[],
    durationHours: number
  ): Promise<number> {
    let total = 0;

    for (const item of equipmentIds) {
      const equipment = await prisma.equipment.findUnique({
        where: { id: item.equipmentId },
      });

      if (equipment) {
        total += equipment.pricePerHour * item.quantity * durationHours;
      }
    }

    return total;
  }

  async createOrUpdateRule(
    id: string | undefined,
    data: {
      name: string;
      type: PricingRuleType;
      conditions?: PricingRuleCondition;
      amount: number;
      isPercentage: boolean;
      priority?: number;
      isActive?: boolean;
    }
  ) {
    if (id) {
      return prisma.pricingRule.update({
        where: { id },
        data: {
          ...data,
          conditions: data.conditions as Prisma.InputJsonValue,
        },
      });
    }

    return prisma.pricingRule.create({
      data: {
        ...data,
        conditions: data.conditions as Prisma.InputJsonValue,
      },
    });
  }

  async getAllRules() {
    return prisma.pricingRule.findMany({
      orderBy: { priority: 'desc' },
    });
  }

  async toggleRuleStatus(id: string, isActive: boolean) {
    return prisma.pricingRule.update({
      where: { id },
      data: { isActive },
    });
  }

  async deleteRule(id: string) {
    return prisma.pricingRule.delete({
      where: { id },
    });
  }
}

export const pricingService = new PricingService();
