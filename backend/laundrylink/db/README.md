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
