# Database Design and Pricing Engine (Short Write-up)

## Database design

CourtFlow models the booking domain around a small set of normalized entities and a few deliberate denormalizations for auditability.

- **Court** stores the facility inventory (type, status, baseRate). A court is bookable if it is `ACTIVE`.
- **Coach** represents optional add-on staff, and **CoachAvailability** captures weekly schedules (dayOfWeek + start/end times). This design supports predictable recurring availability and can be extended with date-specific overrides.
- **Booking** is the central transactional record. It references a user, one court, optional coach, and a time window (`startTime`, `endTime`). It also stores `totalPrice` and a `priceBreakdown` JSON snapshot so that invoices remain reproducible even if pricing rules change later.
- **Equipment** is rentable inventory (rackets/shoes) and **BookingItem** links equipment requests to a booking with `quantity` and the computed equipment pricing.
- **PricingRule** persists rule configuration in the database. Rules have a `type`, `priority`, `isActive`, `amount`, `isPercentage`, and JSON `conditions` so new rule shapes can be added without schema churn.

To avoid double-booking, availability checks use overlap logic and bookings are keyed by court + time range, while cancellations are tracked via `status` (rather than deleting records) to preserve history. Indexes on `courtId` and time fields support fast day-level availability scans.

## Pricing engine approach

Pricing is computed server-side in a dedicated pricing service.

1. Start with the **court base rate** (from `Court.baseRate`) for the selected time window.
2. Load **active pricing rules**, order them by `priority` (higher first), and apply rules whose JSON `conditions` match the request context (e.g., TIME_OF_DAY window, WEEKEND flag, COURT_TYPE).
3. Each rule contributes either a flat surcharge (`isPercentage = false`) or a percentage multiplier (`isPercentage = true`) applied to the relevant base.
4. Add resource costs:
   - **Coach fee** is derived from the coach hourly rate for the booked duration.
   - **Equipment cost** is computed from selected equipment quantities and their per-hour prices.
5. Return a full breakdown object (base, surcharges list, equipmentCost, coachFee, total). On booking creation, the breakdown is persisted into `Booking.priceBreakdown` for auditing.

This design keeps pricing configurable by admins (rules live in the DB), deterministic (rule priority), and safe for future changes (each booking stores the final breakdown snapshot).
