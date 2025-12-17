import 'dotenv/config';
import { PrismaClient, CourtType, CourtStatus, EquipmentType, DayOfWeek, PricingRuleType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(' Seeding database...');

  await prisma.waitlistEntry.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.pricingRule.deleteMany();
  await prisma.coachAvailability.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.court.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log(' Cleared existing data');

  await prisma.user.create({
    data: {
      id: 'user_demo',
      email: 'demo@courtflow.com',
      name: 'Demo User',
    },
  });
  console.log(' Created demo user');

  await prisma.court.createMany({
    data: [
      {
        name: 'Court 1 - Indoor Premium',
        type: CourtType.INDOOR,
        status: CourtStatus.ACTIVE,
        baseRate: 4000,
        description: 'Professional indoor badminton court with climate control',
      },
      {
        name: 'Court 2 - Indoor Standard',
        type: CourtType.INDOOR,
        status: CourtStatus.ACTIVE,
        baseRate: 3500,
        description: 'Standard indoor badminton court',
      },
      {
        name: 'Court 3 - Outdoor',
        type: CourtType.OUTDOOR,
        status: CourtStatus.ACTIVE,
        baseRate: 2800,
        description: 'Outdoor badminton court with natural lighting',
      },
      {
        name: 'Court 4 - Outdoor',
        type: CourtType.OUTDOOR,
        status: CourtStatus.ACTIVE,
        baseRate: 2800,
        description: 'Outdoor badminton court with shade',
      },
    ],
  });
  console.log(' Created 4 courts');

  await prisma.equipment.createMany({
    data: [
      {
        name: 'Professional Racket',
        type: EquipmentType.RACKET,
        totalQuantity: 20,
        availableQty: 20,
        pricePerHour: 400,
        perSlotMax: 4,
        description: 'High-quality badminton racket',
      },
      {
        name: 'Standard Racket',
        type: EquipmentType.RACKET,
        totalQuantity: 30,
        availableQty: 30,
        pricePerHour: 250,
        perSlotMax: 4,
        description: 'Standard badminton racket',
      },
      {
        name: 'Court Shoes - Size 8',
        type: EquipmentType.SHOES,
        size: '8',
        totalQuantity: 10,
        availableQty: 10,
        pricePerHour: 300,
        perSlotMax: 2,
        description: 'Non-marking court shoes',
      },
      {
        name: 'Court Shoes - Size 9',
        type: EquipmentType.SHOES,
        size: '9',
        totalQuantity: 10,
        availableQty: 10,
        pricePerHour: 300,
        perSlotMax: 2,
        description: 'Non-marking court shoes',
      },
      {
        name: 'Court Shoes - Size 10',
        type: EquipmentType.SHOES,
        size: '10',
        totalQuantity: 10,
        availableQty: 10,
        pricePerHour: 300,
        perSlotMax: 2,
        description: 'Non-marking court shoes',
      },
    ],
  });
  console.log(' Created equipment inventory');

  await prisma.coach.create({
    data: {
      name: 'Sarah Chen',
      bio: 'Former national player with 10+ years of coaching experience',
      specialization: 'Singles & Doubles Strategy',
      hourlyRate: 5000,
      status: 'ACTIVE',
      availability: {
        create: [
          { dayOfWeek: DayOfWeek.MONDAY, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: DayOfWeek.TUESDAY, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: DayOfWeek.THURSDAY, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: DayOfWeek.FRIDAY, startTime: '09:00', endTime: '17:00', isActive: true },
        ],
      },
    },
  });

  await prisma.coach.create({
    data: {
      name: 'Michael Rodriguez',
      bio: 'Specialized in beginner and intermediate training',
      specialization: 'Fundamentals & Technique',
      hourlyRate: 4000,
      status: 'ACTIVE',
      availability: {
        create: [
          { dayOfWeek: DayOfWeek.MONDAY, startTime: '14:00', endTime: '21:00', isActive: true },
          { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '14:00', endTime: '21:00', isActive: true },
          { dayOfWeek: DayOfWeek.FRIDAY, startTime: '14:00', endTime: '21:00', isActive: true },
          { dayOfWeek: DayOfWeek.SATURDAY, startTime: '09:00', endTime: '17:00', isActive: true },
          { dayOfWeek: DayOfWeek.SUNDAY, startTime: '09:00', endTime: '17:00', isActive: true },
        ],
      },
    },
  });

  await prisma.coach.create({
    data: {
      name: 'Emily Tanaka',
      bio: 'Youth development specialist and competitive coach',
      specialization: 'Youth Development & Competition',
      hourlyRate: 4500,
      status: 'ACTIVE',
      availability: {
        create: [
          { dayOfWeek: DayOfWeek.TUESDAY, startTime: '15:00', endTime: '20:00', isActive: true },
          { dayOfWeek: DayOfWeek.THURSDAY, startTime: '15:00', endTime: '20:00', isActive: true },
          { dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '18:00', isActive: true },
          { dayOfWeek: DayOfWeek.SUNDAY, startTime: '10:00', endTime: '18:00', isActive: true },
        ],
      },
    },
  });
  console.log(' Created 3 coaches with availability');

  await prisma.pricingRule.createMany({
    data: [
      {
        name: 'Peak Hours Surcharge',
        type: PricingRuleType.TIME_OF_DAY,
        isActive: true,
        priority: 10,
        conditions: {
          startTime: '18:00',
          endTime: '21:00',
        },
        amount: 800,
        isPercentage: false,
      },
      {
        name: 'Weekend Premium',
        type: PricingRuleType.WEEKEND,
        isActive: true,
        priority: 9,
        conditions: {
          isWeekend: true,
        },
        amount: 15,
        isPercentage: true,
      },
      {
        name: 'Indoor Court Premium',
        type: PricingRuleType.COURT_TYPE,
        isActive: true,
        priority: 8,
        conditions: {
          courtType: 'INDOOR',
        },
        amount: 10,
        isPercentage: true,
      },
    ],
  });
  console.log(' Created pricing rules');

  console.log(' Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(' Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
