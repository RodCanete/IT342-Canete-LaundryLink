# Database Scripts

## `seed_demo.sql`

One-shot demo seed for local/dev databases. Inserts 5 shops, a STANDARD + PRIORITY service per shop, and 7 days of PRIORITY slot windows. Re-running is safe (idempotent — uses `ON CONFLICT` and `WHERE NOT EXISTS`).

This replaces the deleted `DataSeeder.java`. Slot configurations are no longer hardcoded in Java; they live in `slot_configs` and are managed by shop owners through the `/api/owner/slots` endpoints.

### Apply

**Supabase SQL editor:** paste the contents of `seed_demo.sql` and run.

**psql:**
```
psql "$DATABASE_URL" -f backend/laundrylink/db/seed_demo.sql
```

### After seeding — link a shop to an owner

Shops are created with `owner_id = NULL`. To make a SHOP_OWNER user able to manage a shop:

```sql
UPDATE shops
SET owner_id = '<owner-user-uuid>'
WHERE name = 'GF22 Laundry Hub';
```

## `insert_slots_2026_05_26_27.sql`

Adds **hourly** `slot_configs` for **every shop** and both **STANDARD** and **PRIORITY** services on **2026-05-26** and **2026-05-27**.

| Setting | Value |
|---------|--------|
| Dates | 2026-05-26, 2026-05-27 |
| Hours | 08:00–09:00 through 17:00–18:00 (10 windows per day) |
| Capacity | `max_slots = 5` per window |

**Expected row count:** `shops × services (STANDARD + PRIORITY) × 2 dates × 10 hours`  
Example: 5 shops × 2 services × 2 × 10 = **200 rows** (if seed has 5 shops).

Re-running is safe (`ON CONFLICT DO NOTHING` on `shop_id`, `service_id`, `date`, `start_time`, `end_time`).

### Apply

**Supabase SQL editor:** paste the contents of `insert_slots_2026_05_26_27.sql` and run (includes a post-check `SELECT`).

**psql:**

```
psql "$DATABASE_URL" -f backend/laundrylink/db/insert_slots_2026_05_26_27.sql
```

### Verify in the app

1. Booking flow: `/shops/{id}/book` → date **May 26 or 27** → time step shows slots (e.g. 8:00 AM–5:00 PM).
2. API: `GET /api/slots?shopId={uuid}&serviceId={uuid}&date=2026-05-26`

To add more dates (e.g. May 25), duplicate the date `VALUES` in the script and run again.
