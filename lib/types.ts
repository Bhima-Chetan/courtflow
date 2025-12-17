export interface PriceBreakdown {
  basePrice: number;
  courtType: string;
  surcharges: {
    name: string;
    amount: number;
    type: string;
  }[];
  equipmentCost: number;
  coachFee: number;
  totalPrice: number;
}

export interface BookingRequest {
  userId: string;
  courtId: string;
  coachId?: string;
  startTime: Date;
  endTime: Date;
  equipment?: {
    equipmentId: string;
    quantity: number;
  }[];
}

export interface AvailabilitySlot {
  time: string;
  available: boolean;
  availableCourts: string[];
  availableCoaches: string[];
  availableEquipment: {
    id: string;
    name: string;
    type: string;
    available: number;
  }[];
}

export interface PricingRuleCondition {
  courtType?: 'INDOOR' | 'OUTDOOR';
  dayOfWeek?: string[];
  startTime?: string;
  endTime?: string;
  isWeekend?: boolean;
  requiresCoach?: boolean;
  requiresEquipment?: boolean;
}
