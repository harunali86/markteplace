# DOOSSH DETAILED EXECUTION PLAN
## Week-by-Week Task Breakdown with Dependencies

**Project:** Doossh Multi-Vendor Marketplace  
**Timeline:** 1 Month MVP  
**Date:** 12 Feb 2026

---

## WEEK 1: FOUNDATION & TENANT SECURITY

### Goal
Establish secure multi-tenant foundation with isolated tenant access, authentication system, and schema readiness.

### Tasks (Priority Order)

#### PHASE 1A: Setup & Infrastructure (Days 1-2)
**Task 1.1: Supabase Project Setup**
- Create Supabase project (production instance)
- Configure environment variables (.env.local, .env.production)
- Generate TypeScript types from schema
- Set up staging environment (optional but recommended)
- Test connection from local machine

**Task 1.2: Repository Structure (Turborepo)**
```
doossh/
├── apps/
│   ├── web/              # Next.js (vendor dashboard + admin panel + marketing)
│   ├── mobile/           # Expo (customer app)
│   └── admin/            # (if separate from web)
├── packages/
│   ├── contracts/        # Zod schemas, API DTOs, shared types
│   ├── db/               # SQL migrations, seed data, generated types
│   ├── ui/               # Shared components, Tailwind theme
│   └── config/           # ESLint, TS config, Prettier
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```
- Initialize with pnpm (faster than npm)
- Set up ESLint + Prettier with shared config
- Configure TypeScript path aliases

**Task 1.3: Environment & Secrets**
- Create .env.example files (no secrets)
- Document all required env vars:
  - SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
  - RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET (test keys)
  - FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY
  - VERCEL deployment URLs
- Use 1Password or similar for team secrets

#### PHASE 1B: Database Schema & RLS (Days 2-3)
**Task 1.4: Schema Migration Framework**
- Create `packages/db/migrations/` folder
- Set up migration naming: `001_initial_schema.sql`, `002_rls_policies.sql`, etc.
- Create migration runner script (Node.js + supabase-js)
- Test migration ↔️ rollback cycle

**Task 1.5: Core Schema Creation** (SQL migrations)
```sql
-- Migration: 001_initial_schema.sql

-- 1. Identity tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'vendor', 'customer')),
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name VARCHAR(255) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  plan_id UUID,
  kyc_verified BOOLEAN DEFAULT false,
  kyc_document_url TEXT,
  kyc_submitted_at TIMESTAMP,
  kyc_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS vendor_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL CHECK (membership_role IN ('owner', 'manager', 'staff')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, vendor_id)
);

-- 2. Marketplace tables (restaurants, clubs, halls)
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  cuisine_type TEXT, -- e.g., Indian, Chinese, Italian
  location_city VARCHAR(100),
  location_address TEXT,
  phone VARCHAR(20),
  email VARCHAR(255),
  avg_rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (vendor_id),
  INDEX ON (location_city, is_published)
);

CREATE TABLE IF NOT EXISTS clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  club_name VARCHAR(255) NOT NULL,
  location_city VARCHAR(100),
  location_address TEXT,
  phone VARCHAR(20),
  capacity INTEGER,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (vendor_id),
  INDEX ON (location_city, is_published)
);

CREATE TABLE IF NOT EXISTS party_halls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  hall_name VARCHAR(255) NOT NULL,
  location_city VARCHAR(100),
  location_address TEXT,
  capacity_min INTEGER,
  capacity_max INTEGER,
  price_per_plate DECIMAL(10, 2),
  phone VARCHAR(20),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (vendor_id),
  INDEX ON (location_city, is_published, capacity_max)
);

-- 3. Booking & Inventory
CREATE TABLE IF NOT EXISTS restaurant_time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  current_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (restaurant_id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES restaurant_time_slots(id),
  booking_date DATE NOT NULL,
  party_size INTEGER NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (customer_id),
  INDEX ON (restaurant_id, booking_date),
  INDEX ON (status, created_at)
);

-- 4. Events & Tickets
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  event_name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled')) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (vendor_id, event_date),
  INDEX ON (club_id, event_date)
);

CREATE TABLE IF NOT EXISTS ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  type_name VARCHAR(100), -- VIP, Standard, Budget
  price DECIMAL(10, 2) NOT NULL,
  total_capacity INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (event_id)
);

-- 5. Leads & Lead Unlocks
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guest_count INTEGER NOT NULL,
  budget_min DECIMAL(10, 2),
  budget_max DECIMAL(10, 2),
  event_date DATE,
  location_city VARCHAR(100),
  special_requirements TEXT,
  customer_name_masked VARCHAR(100), -- e.g., "A K, Delhi"
  customer_phone_masked VARCHAR(20), -- e.g., "+91-XXXX-XXXX"
  customer_phone_full VARCHAR(20), -- stored only for vendors with unlock
  is_lead_open BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (location_city, created_at),
  INDEX ON (customer_id)
);

CREATE TABLE IF NOT EXISTS lead_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  payment_id UUID, -- references payments table
  amount_paid DECIMAL(10, 2) NOT NULL,
  unlocked_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (lead_id),
  INDEX ON (vendor_id),
  UNIQUE(lead_id, vendor_id) -- each vendor unlocks each lead only once
);

-- 6. Payments & Subscriptions
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  payment_for TEXT NOT NULL CHECK (payment_for IN ('booking', 'ticket', 'lead_unlock', 'subscription')),
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('pending', 'captured', 'failed', 'refunded')) DEFAULT 'pending',
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe')), -- future-proof
  provider_payment_id VARCHAR(255) UNIQUE,
  provider_signature_verified BOOLEAN DEFAULT false,
  metadata JSONB, -- order_id, event_id, lead_id, etc.
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (provider_payment_id),
  INDEX ON (customer_id, status),
  INDEX ON (vendor_id, status),
  INDEX ON (status, created_at)
);

CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- razorpay, stripe
  provider_event_id VARCHAR(255) NOT NULL UNIQUE, -- e.g., razorpay event ID
  event_type TEXT NOT NULL, -- payment.authorized, payment.failed
  payload JSONB NOT NULL,
  payload_hash VARCHAR(255), -- SHA256(payload) for duplicate detection
  processed_at TIMESTAMP,
  processing_error TEXT,
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (provider_event_id),
  INDEX ON (processed_at)
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- starter, professional, enterprise
  plan_name VARCHAR(100),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  billing_interval TEXT CHECK (billing_interval IN ('monthly', 'yearly')),
  max_listings INTEGER,
  max_team_members INTEGER,
  features JSONB, -- list of feature flags
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled')) DEFAULT 'active',
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  INDEX ON (vendor_id, status)
);

-- 7. Operations & Audit
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('fcm', 'sms', 'email', 'in_app')),
  template_key VARCHAR(100), -- booking_confirmed, ticket_issued, lead_unlocked
  subject TEXT,
  message TEXT,
  metadata JSONB, -- booking_id, ticket_id, etc.
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMP,
  failed_reason TEXT,
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (user_id, status),
  INDEX ON (created_at)
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- create, update, delete, payment_captured, etc.
  entity_type TEXT NOT NULL, -- restaurant, booking, payment, lead_unlock
  entity_id UUID,
  entity_vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  before_state JSONB,
  after_state JSONB,
  trace_id VARCHAR(36), -- for request tracing
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now(),
  INDEX ON (actor_user_id, created_at),
  INDEX ON (entity_type, entity_id),
  INDEX ON (entity_vendor_id),
  INDEX ON (trace_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE party_halls ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

**Task 1.6: RLS Policies Foundation** (Migration: 002_rls_policies.sql)
```sql
-- CORE RLS HELPER FUNCTION
CREATE OR REPLACE FUNCTION get_user_allowed_vendors()
RETURNS TABLE(vendor_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT vendor_memberships.vendor_id
  FROM vendor_memberships
  WHERE vendor_memberships.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES TABLE RLS
CREATE POLICY "Profiles: users see own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR
         (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- VENDORS TABLE RLS
CREATE POLICY "Vendors: vendors see own vendor, admin sees all"
  ON vendors FOR SELECT
  USING (
    id IN (SELECT vendor_id FROM vendor_memberships WHERE user_id = auth.uid())
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- RESTAURANTS TABLE RLS
CREATE POLICY "Restaurants: vendors see own restaurants"
  ON restaurants FOR SELECT
  USING (vendor_id IN (SELECT vendor_id FROM get_user_allowed_vendors()));

CREATE POLICY "Restaurants: customers see published restaurants"
  ON restaurants FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer'
    AND is_published = true
  );

CREATE POLICY "Restaurants: vendor can insert own"
  ON restaurants FOR INSERT
  WITH CHECK (vendor_id IN (SELECT vendor_id FROM get_user_allowed_vendors()));

-- BOOKINGS TABLE RLS
CREATE POLICY "Bookings: customer sees own, vendor sees restaurant bookings"
  ON bookings FOR SELECT
  USING (
    customer_id = auth.uid()
    OR restaurant_id IN (
      SELECT id FROM restaurants WHERE vendor_id IN (SELECT vendor_id FROM get_user_allowed_vendors())
    )
  );

-- Similar policies for clubs, party_halls, events, tickets, leads, etc.

-- ADMIN BYPASS (service role can query anything)
-- Note: This is enforced at app layer, not RLS
```

#### PHASE 1C: Authentication & Actor Context (Days 3-4)
**Task 1.7: Auth Flows (Next.js + Supabase Auth)**
- Signup endpoint (email/password, phone/OTP)
- Login endpoint
- Session validation middleware
- Logout endpoint
- Profile creation on first signup
- Role assignment (customer by default, vendor/admin via admin panel)

**Task 1.8: Actor Context Resolver** (Backend utility)
```typescript
// packages/contracts/src/types/actor.ts
export interface ActorContext {
  userId: string;
  role: 'admin' | 'vendor' | 'customer';
  email: string;
  phone?: string;
  allowedVendorIds: string[]; // from vendor_memberships
  isServiceRole: boolean; // true if using service role key
}

// Backend function
async function resolveActorContext(request: Request): ActorContext {
  // 1. Check Authorization header
  // 2. Validate JWT with Supabase key
  // 3. Get user role from profiles table
  // 4. Get allowed vendors from vendor_memberships
  // 5. Return ActorContext
}

// Usage in API routes
async function GET(request: Request) {
  const actor = await resolveActorContext(request);
  if (!actor) return 401;
  
  // actor.allowedVendorIds used for RLS enforcement
}
```

**Task 1.9: Vendor Onboarding Endpoint**
- POST /api/vendors/register (KYC doc upload)
- GET /api/admin/vendors/pending (list pending for approval)
- POST /api/admin/vendors/{id}/approve
- POST /api/admin/vendors/{id}/reject
- Endpoint enforces admin role check

#### PHASE 1D: Testing & Verification (Days 4-5)
**Task 1.10: RLS Test Suite**
```typescript
// packages/db/tests/rls.test.ts
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

describe('RLS Isolation', () => {
  const vendorAClient = createClient(URL, vendorAKey); // vendor A auth token
  const vendorBClient = createClient(URL, vendorBKey); // vendor B auth token

  it('Vendor A cannot see Vendor B restaurants', async () => {
    const { data: vendorBRestaurants } = await vendorBClient
      .from('restaurants')
      .select('*');
    
    const { data: vendorAQuery } = await vendorAClient
      .from('restaurants')
      .select('*');
    
    // vendorAQuery should NOT include vendorBRestaurants
    expect(vendorAQuery).not.toContain(vendorBRestaurants[0]);
  });

  it('Vendor A cannot update Vendor B restaurant', async () => {
    const { error } = await vendorAClient
      .from('restaurants')
      .update({ business_name: 'Hacked!' })
      .eq('id', vendorBRestaurantId);
    
    expect(error).toBeDefined();
  });

  it('Admin can see all restaurants', async () => {
    const { data: allRestaurants } = await adminClient
      .from('restaurants')
      .select('*');
    
    expect(allRestaurants.length).toBeGreaterThan(1);
  });
});
```

**Task 1.11: Schema Validation**
- Verify all foreign keys exist
- Verify all check constraints work
- Test migrations can rollback
- Generate TypeScript types from schema

### Deliverables at End of Week 1
- ✅ Supabase project created (staging + prod)
- ✅ Repository structure initialized (Turborepo)
- ✅ Full schema deployed with migrations
- ✅ RLS policies implemented and tested
- ✅ Auth flows working (signup, login, logout)
- ✅ Vendor onboarding MVP (KYC upload, admin approval)
- ✅ Actor context resolver utility ready
- ✅ RLS test suite passing (no data leakage)

### Exit Criteria
```
[✓] RLS isolation test passes for 3 vendors
[✓] New vendor can onboard → receive vendor_id → see only own data
[✓] Admin can view all vendors and approve/reject
[✓] Auth session persists across requests
[✓] TypeScript types generated from Supabase schema
[✓] All schema migrations idempotent (can run 2x)
```

---

## WEEK 2: MARKETPLACE CORE

### Goal
Enable vendors to create listings and customers to discover them across 3 categories (restaurants, clubs, party halls).

### Tasks (Priority Order)

#### PHASE 2A: Listing CRUD Backend (Days 1-2)
**Task 2.1: Restaurant CRUD Endpoints**
```
POST /api/restaurants
  - Create restaurant (vendor only, must belong to vendor)
  - Input: name, cuisine, location, hours, images
  - Output: restaurant ID

GET /api/restaurants?vendor_id={id}
  - List vendor's restaurants (RLS enforced)

GET /api/restaurants/{id}
  - Get restaurant details (published or owner)

PUT /api/restaurants/{id}
  - Update restaurant (owner only)

DELETE /api/restaurants/{id}
  - Delete restaurant (owner only)

GET /api/restaurants/public?city={city}&cuisine={type}&rating_min={n}
  - Public search (customers only)
  - Returns only published restaurants
  - Indexed by city, rating
```

**Task 2.2: Club CRUD Endpoints**
- Similar structure to restaurants
- Additional fields: capacity, event listing

**Task 2.3: Party Hall CRUD Endpoints**
- Similar structure
- Additional fields: capacity_min/max, price_per_plate

**Task 2.4: Media Upload Service**
```
POST /api/media/upload
  - Upload image to Supabase Storage
  - Input: file, owner_type (restaurant|club|party_hall), owner_id
  - Output: public URL, media record ID

GET /api/media/{owner_type}/{owner_id}
  - Get all media for a listing
```

#### PHASE 2B: Search & Filtering Backend (Days 2-3)
**Task 2.5: Search Optimization**
```
-- Add indexes for fast queries
CREATE INDEX idx_restaurants_city_published ON restaurants(location_city, is_published);
CREATE INDEX idx_restaurants_rating ON restaurants(avg_rating DESC, review_count DESC);
CREATE INDEX idx_clubs_city_published ON clubs(location_city, is_published);
CREATE INDEX idx_party_halls_city_capacity ON party_halls(location_city, capacity_max);

-- Create materialized view for denormalized search results
CREATE MATERIALIZED VIEW public_restaurants_search AS
  SELECT id, business_name, cuisine_type, location_city, avg_rating, 
         review_count, (SELECT COUNT(*) FROM reviews WHERE restaurant_id = id) as review_count
  FROM restaurants
  WHERE is_published = true;
```

**Task 2.6: Search Endpoints**
```
GET /api/search/restaurants?city={city}&cuisine={type}&min_rating={n}&limit=20&offset=0
  - Full-text search (or SQL LIKE with indexes)
  - Returns paginated results
  - Caching: 1 hour (Redis optional, start with HTTP cache headers)

GET /api/search/clubs?city={city}&date={YYYY-MM-DD}&limit=20
  - Club search with event date filter

GET /api/search/party_halls?city={city}&capacity_min={n}&capacity_max={m}&limit=20
  - Party hall search with capacity filter
```

#### PHASE 2C: Admin Moderation (Days 3-4)
**Task 2.7: Listing Moderation**
```
GET /api/admin/listings/pending
  - List all listings awaiting moderation (draft or auto-flagged)

POST /api/admin/listings/{id}/publish
  - Admin approves listing → is_published = true
  - Send notification to vendor

POST /api/admin/listings/{id}/reject
  - Admin rejects listing
  - Send notification with reason

POST /api/admin/listings/{id}/flag
  - Admin flags for abuse/inappropriate content
  - List status → "flagged"

GET /api/admin/listings?status={published|draft|flagged}&category={restaurant|club|party_hall}
```

**Task 2.8: Auto-Flagging Rules**
- Flag if business_name contains forbidden words
- Flag if no images uploaded
- Flag if price seems unreasonable (future refinement)
- Store flagging reason in audit_logs

#### PHASE 2D: Frontend - Vendor Dashboard (Days 2-4)
**Task 2.9: Vendor Dashboard UI (Next.js)**
```
Vendor Portal Structure:
/vendor/dashboard
  - Overview (active listings, recent bookings, revenue snapshot)
  
/vendor/restaurants
  - List restaurants (with edit/delete/publish buttons)
  - Create restaurant form
  
/vendor/clubs
  - List clubs + events
  - Create club form
  
/vendor/party-halls
  - List party halls
  - Create party hall form
  
/vendor/media
  - Media library (view, upload, delete)
```

**Task 2.10: Listing Creation Form**
- React form with validation (Zod)
- Image upload input (drag & drop)
- Location autocomplete (Google Maps API, optional for MVP)
- Success/error notifications
- Auto-save drafts (optional)

#### PHASE 2E: Frontend - Public Marketplace (Days 3-4)
**Task 2.11: Public Browse & Search UI**
```
Customer App:
/marketplace/restaurants
  - Search bar + filters (city, cuisine, rating)
  - Results grid (card per restaurant)
  - Restaurant detail page
  
/marketplace/clubs
  - Similar structure
  - Event calendar view (nice-to-have)
  
/marketplace/party-halls
  - Similar structure
  - Capacity/price filters
```

**Task 2.12: Detail Pages**
```
Restaurant Detail:
  - Name, cuisine, address, phone, images carousel
  - Available time slots (for booking flow, not booking yet)
  - Reviews section
  - CTA: "Book Table"

Club Detail:
  - Name, location, images, capacity
  - Upcoming events list
  - CTA: "Browse Events"

Party Hall Detail:
  - Name, capacity range, price, images
  - Requirements form
  - CTA: "Submit Lead"
```

#### PHASE 2F: Reviews & Ratings (Days 4-5)
**Task 2.13: Reviews Schema & Endpoints**
```
POST /api/reviews
  - Create review (customer who had booking/ticket)
  - Input: rating (1-5), comment, entity_type, entity_id
  - Output: review ID

GET /api/reviews?entity_type={restaurant}&entity_id={id}
  - Get reviews for listing
  - Ordered by created_at DESC

-- Update restaurant avg_rating on review creation
TRIGGER avg_rating_update ON reviews AFTER INSERT/UPDATE/DELETE
  UPDATE restaurants SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE restaurant_id = id)
```

### Deliverables at End of Week 2
- ✅ Restaurant/Club/Party Hall CRUD endpoints
- ✅ Public search APIs (all 3 categories)
- ✅ Media upload service
- ✅ Admin moderation endpoints
- ✅ Vendor dashboard UI (list, create, edit listings)
- ✅ Public marketplace UI (search, filter, detail pages)
- ✅ Reviews system
- ✅ Database indexes for fast queries

### Exit Criteria
```
[✓] Vendor creates restaurant → appears in personal dashboard
[✓] Vendor publishes restaurant → appears on public marketplace (filtered)
[✓] Admin can see pending restaurants and approve/reject
[✓] Customer searches "Italian restaurants in Delhi" → gets filtered results
[✓] Restaurant detail page loads in < 500ms
[✓] Images display correctly in all views
[✓] Reviews appear on restaurant detail page
```

---

## WEEK 3: TRANSACTION ENGINE (MONEY + INVENTORY)

### Goal
Implement secure booking flow, event ticketing, and payment processing with idempotency and inventory protection.

### Tasks (Priority Order)

#### PHASE 3A: Restaurant Booking Transaction (Days 1-2)
**Task 3.1: Booking Slot Management**
```
POST /api/restaurants/{id}/time-slots
  - Vendor creates time slot
  - Input: day_of_week, start_time, end_time, capacity
  - Returns: slot ID

GET /api/restaurants/{id}/time-slots
  - Get available slots for restaurant

GET /api/restaurants/{id}/availability?date={YYYY-MM-DD}
  - Get availability for specific date
  - Returns slots with remaining capacity
  - Caching: 5 minutes
```

**Task 3.2: Booking Create (Transaction)**
```typescript
// Transaction-safe booking creation
POST /api/bookings
  - Input: restaurant_id, time_slot_id, booking_date, party_size
  - Logic:
    1. BEGIN TRANSACTION
    2. SELECT ... FROM time_slots FOR UPDATE (lock row)
    3. Check: current_bookings + party_size <= capacity
    4. If exceeded: ROLLBACK + return 400 "Slot full"
    5. INSERT booking (status = pending)
    6. Increment slot.current_bookings
    7. Create order (status = pending)
    8. COMMIT
    9. Return booking_id, order_id
    
  - Must handle concurrent requests (load test with 100 simultaneous bookings)
```

**Task 3.3: Booking Confirmation (After Payment)**
```
After Razorpay webhook success:
  - Update booking.status = "confirmed"
  - Send confirmation SMS/email with booking details
  - Send FCM notification to customer
  
GET /api/bookings/{id}
  - Get booking details (for confirmation view)
  
PUT /api/bookings/{id}/cancel
  - Cancel booking (vendor or customer)
  - Refund booking.current_bookings--
  - Create refund payment
```

#### PHASE 3B: Event Ticketing (Days 2-3)
**Task 3.4: Event Management**
```
POST /api/events
  - Vendor creates event
  - Input: club_id, date, time, description
  - Returns: event_id

POST /api/events/{id}/ticket-types
  - Define ticket types with pricing and capacity
  - Input: type_name (VIP/Standard), price, capacity
  
PUT /api/events/{id}
  - Update event details (only draft status)
  
POST /api/events/{id}/publish
  - Publish event (status = published)
  - Makes event visible to customers
```

**Task 3.5: QR Token Generation**
```typescript
// Generate unique QR token for each ticket
function generateQRToken(): string {
  return crypto.randomUUID(); // or hash-based unique token
}

// Hash stored in DB (not plain token)
const qrTokenHash = crypto.createHash('sha256')
  .update(qrToken)
  .digest('hex');
```

**Task 3.6: Ticket Purchase & QR Issuance**
```
POST /api/tickets/purchase
  - Input: event_id, ticket_type_id, quantity, customer_id
  - Logic:
    1. BEGIN TRANSACTION
    2. SELECT ... FROM ticket_types FOR UPDATE (lock)
    3. Check: sold_count + quantity <= capacity
    4. If exceeded: ROLLBACK + return 400
    5. INSERT tickets (quantity rows, each with qr_token_hash)
    6. Update ticket_types.sold_count += quantity
    7. CREATE order (total_amount = price * quantity)
    8. COMMIT
    9. Generate QR images/URLs
    10. Return ticket IDs, QR images

GET /api/tickets?order_id={id}
  - Customer views their tickets
  - Returns QR images (can be SMS'd or displayed in-app)
```

**Task 3.7: QR Validation at Gate (One-Time Consume)**
```
POST /api/checkins
  - Input: qr_token_hash, gate_id
  - Logic:
    1. SELECT * FROM tickets WHERE qr_token_hash = ? (indexed lookup)
    2. If not found: return 404 "Invalid QR"
    3. If is_scanned = true: return 400 "Already scanned" (NO state change)
    4. If is_scanned = false:
       a. UPDATE tickets SET is_scanned = true, scanned_at = now()
       b. INSERT checkin (immutable audit record)
       c. Return 200 "Entry granted"
    
  - Response contract:
    {
      "status": "entry_granted" | "duplicate_scan" | "invalid",
      "ticket_id": "...",
      "event_name": "..."
    }
```

#### PHASE 3C: Razorpay Payment Integration (Days 2-4)
**Task 3.8: Payment Intent Creation**
```
POST /api/payments/intent
  - Input: amount, currency, customer_email, payment_for (booking|ticket|lead_unlock)
  - Logic:
    1. Create Razorpay order:
       razorpayOrder = razorpay.orders.create({
         amount: amount * 100, // paise
         currency: 'INR',
         receipt: generateReceiptId(),
         notes: { payment_for, ... }
       })
    2. Store in payments table:
       payment = { provider_payment_id: razorpayOrder.id, status: 'pending', ... }
    3. Return order_id to frontend + key for client-side checkout
  
  - Return: { razorpay_key_id, order_id, amount }
```

**Task 3.9: Payment Webhook Verification**
```typescript
// Razorpay webhook handler
POST /api/webhooks/razorpay
  - Input: webhook payload with signature
  - Logic:
    1. Verify webhook secret + signature:
       hmac = crypto.createHmac('sha256', webhook_secret)
         .update(webhook_body)
         .digest('hex')
       if (hmac !== signature) return 401 "Unauthorized"
    
    2. Check idempotency:
       event = db.query(`
         SELECT * FROM payment_webhook_events 
         WHERE provider_event_id = ? AND provider = 'razorpay'
       `)
       if (event && event.processed_at) return 200 "Already processed"
    
    3. Process webhook:
       - payment.authorized → mark payment.status = 'pending'
       - payment.captured → mark payment.status = 'captured'
         - Update booking.status = 'confirmed'
         - Send confirmation notification
       - payment.failed → mark payment.status = 'failed'
         - Release booking slot (if booked)
         - Send failure notification
    
    4. Store webhook event:
       INSERT payment_webhook_events {
         provider_event_id: razorpay_event_id,
         provider: 'razorpay',
         payload: webhook_payload,
         processed_at: now()
       }
    
    5. Return 200 OK (even if re-processing, no duplicates created)
```

**Task 3.10: Webhook Replay Test**
```typescript
// Test: replay same webhook, verify no duplicates
it('Webhook replay does not create duplicate bookings', async () => {
  const webhookPayload = {
    event: 'payment.captured',
    payload: { payment: { id: 'pay_123', amount: 50000 } }
  };

  // First webhook
  const response1 = await POST('/api/webhooks/razorpay', webhookPayload);
  expect(response1.status).toBe(200);
  
  // Verify booking was created
  const bookings1 = await db.query('SELECT * FROM bookings WHERE order_id = ?');
  expect(bookings1.length).toBe(1);

  // Replay same webhook
  const response2 = await POST('/api/webhooks/razorpay', webhookPayload);
  expect(response2.status).toBe(200);

  // Verify SAME booking (no duplicate created)
  const bookings2 = await db.query('SELECT * FROM bookings WHERE order_id = ?');
  expect(bookings2.length).toBe(1); // NOT 2
});
```

#### PHASE 3D: Lead Unlock Payment (Days 3-4)
**Task 3.11: Lead Unlock Flow**
```
GET /api/leads/available
  - Vendor sees available leads (masked contact)
  - Returns: lead_id, guest_count, budget, city, requirements (no contact)

POST /api/lead-unlocks
  - Input: lead_id
  - Logic:
    1. Check: lead not already unlocked by this vendor
    2. Create payment intent (amount = fixed or tiered by category)
    3. Return payment order ID
  
  - After webhook payment success:
    1. INSERT lead_unlock { lead_id, vendor_id, payment_id }
    2. Full customer contact now visible to vendor
    3. Vendor can call customer directly

GET /api/lead-unlocks/{lead_id}
  - Vendor views lead after unlock (full contact details)
  - GET /api/leads/{lead_id}
    - Vendor sees full contact_phone, customer_name
```

#### PHASE 3E: Concurrency Testing (Days 4-5)
**Task 3.12: Load Test - Concurrent Bookings**
```typescript
// Test: 100 concurrent customers booking same slot (capacity=5)
it('Handles 100 concurrent bookings on capacity-5 slot', async () => {
  const slotId = 'slot_xyz';
  const promises = Array(100).fill(null).map(() =>
    POST('/api/bookings', {
      restaurant_id: 'rest_1',
      time_slot_id: slotId,
      party_size: 1,
      booking_date: '2026-02-20'
    })
  );

  const results = await Promise.allSettled(promises);
  
  // Expect exactly 5 successes, 95 failures
  const successes = results.filter(r => r.status === 'fulfilled' && r.value.status === 201);
  const failures = results.filter(r => r.value?.status === 409);
  
  expect(successes.length).toBe(5);
  expect(failures.length).toBe(95);
  
  // Verify slot reflects correct count
  const slot = await db.query(`SELECT * FROM restaurant_time_slots WHERE id = ?`);
  expect(slot.current_bookings).toBe(5);
});
```

**Task 3.13: Webhook Reconciliation Job**
```typescript
// Background job to reconcile failed webhooks
// Run every 1 hour (or configurable)

async function reconcileWebhooks() {
  // Find payment_webhook_events that were NOT processed
  const unprocessed = await db.query(`
    SELECT * FROM payment_webhook_events
    WHERE processed_at IS NULL
    AND created_at > now() - interval '24 hours'
  `);

  for (const event of unprocessed) {
    try {
      await processWebhookEvent(event);
      await db.query(`
        UPDATE payment_webhook_events 
        SET processed_at = now() 
        WHERE id = ?
      `, event.id);
    } catch (error) {
      await db.query(`
        UPDATE payment_webhook_events 
        SET processing_error = ? 
        WHERE id = ?
      `, error.message, event.id);
      
      // Alert team if reconciliation failing
      await alertTeam(`Webhook reconciliation failed: ${event.id}`);
    }
  }
}
```

### Deliverables at End of Week 3
- ✅ Restaurant booking with inventory locking
- ✅ Event ticketing with QR token generation
- ✅ Razorpay payment integration (test environment)
- ✅ Webhook verification + idempotency
- ✅ QR scan validation (one-time consume)
- ✅ Lead unlock payment flow
- ✅ Concurrency tests (100x simultaneous bookings)
- ✅ Webhook reconciliation job

### Exit Criteria
```
[✓] No double-bookings: 100 concurrent requests to full slot → exactly capacity bookings succeed
[✓] No duplicate payments: webhook replay 3x → exactly 1 booking confirmation
[✓] QR scan duplicate test: scan twice → first success, second returns "already scanned"
[✓] Lead unlock works end-to-end: vendor pays → gets customer contact
[✓] All payment state transitions logged in audit_logs
[✓] Load test: 100 concurrent bookings complete in < 5 seconds
```

---

## WEEK 4: GOVERNANCE & RELIABILITY

### Goal
Implement admin controls, notifications, observability, and E2E testing for production readiness.

### Tasks (Priority Order)

#### PHASE 4A: Admin Panel (Days 1-2)
**Task 4.1: Admin Dashboard**
```
/admin/dashboard
  - Total platform metrics:
    - Total bookings (this month, this week)
    - Total revenue (sum of all payments)
    - Active vendors count
    - New leads submitted
  - Quick action buttons (vendor approvals, flagged listings)
  - Recent payments list
  - Alerts (failed webhooks, suspicious activity)
```

**Task 4.2: Vendor Management**
```
/admin/vendors
  - List all vendors (status: pending, approved, rejected, suspended)
  - Vendor detail view:
    - KYC documents
    - Business info
    - Listings count
    - Bookings this month
    - Revenue this month
    - Subscription status
  - Actions:
    - Approve / Reject / Suspend
    - View audit logs for this vendor
```

**Task 4.3: Finance Dashboard**
```
/admin/finance
  - Total revenue (all time, this month, this week)
  - Revenue by category (restaurants, clubs, party halls)
  - Revenue by vendor (top 10)
  - Payment failures (count, reasons)
  - Lead unlocks (count, revenue)
  - Payouts (if applicable)
```

**Task 4.4: Listings Moderation**
```
/admin/listings
  - All listings with moderation status
  - Flagged listings view
  - Actions: approve, reject, flag, unflag
  - Auto-flagging reason display
```

#### PHASE 4B: FCM Push Notifications (Days 1-3)
**Task 4.5: Notification Templates**
```typescript
// Define notification templates
const templates = {
  booking_confirmed: {
    title: 'Booking Confirmed',
    body: 'Your reservation at {restaurant_name} on {date} {time} is confirmed',
    deepLink: '/bookings/{booking_id}'
  },
  booking_cancelled: {
    title: 'Booking Cancelled',
    body: 'Your booking at {restaurant_name} has been cancelled',
  },
  ticket_issued: {
    title: 'Ticket Ready',
    body: 'Your ticket for {event_name} is ready. Show your QR at gate.',
    deepLink: '/tickets/{ticket_id}'
  },
  lead_unlocked: {
    title: 'Lead Unlocked',
    body: 'You unlocked a party hall lead. Contact info: {phone}',
  },
  payment_failed: {
    title: 'Payment Failed',
    body: 'Your payment for {item_name} failed. Please try again.',
  }
};
```

**Task 4.6: FCM Integration**
```typescript
// Initialize Firebase Admin SDK
import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

async function sendPushNotification(
  userId: string,
  templateKey: string,
  data: Record<string, string>
) {
  // 1. Get user's FCM token from profiles table
  const profile = await db.query(
    `SELECT fcm_token FROM profiles WHERE id = ?`,
    userId
  );

  if (!profile?.fcm_token) {
    // User hasn't enabled notifications or cleared token
    return;
  }

  // 2. Render template with data
  const template = templates[templateKey];
  const message = {
    notification: {
      title: template.title,
      body: renderTemplate(template.body, data),
    },
    data: {
      deepLink: renderTemplate(template.deepLink, data),
      timestamp: Date.now().toString(),
    },
    token: profile.fcm_token,
  };

  // 3. Send via FCM
  try {
    const response = await admin.messaging().send(message);
    
    // 4. Log notification
    await db.query(`
      INSERT INTO notifications (user_id, channel, template_key, status, sent_at)
      VALUES (?, 'fcm', ?, 'sent', now())
    `, userId, templateKey);

    return response;
  } catch (error) {
    // 5. Log failure
    await db.query(`
      INSERT INTO notifications (user_id, channel, template_key, status, failed_reason)
      VALUES (?, 'fcm', ?, 'failed', ?)
    `, userId, templateKey, error.message);
  }
}
```

**Task 4.7: Notification Triggers**
- After booking confirmed: send confirmation notification
- After ticket issued: send "ticket ready" notification
- After lead unlock: send "lead unlocked" notification
- After payment failed: send failure notification
- Vendor gets notification when new lead available

#### PHASE 4C: Observability & Logging (Days 2-3)
**Task 4.8: Structured Logging**
```typescript
// Logger utility with context
const logger = {
  info: (message: string, context?: Record<string, any>) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      trace_id: context?.trace_id,
      actor_id: context?.actor_id,
      ...context,
    }));
  },
  error: (message: string, error: Error, context?: Record<string, any>) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      error: error.message,
      stack: error.stack,
      trace_id: context?.trace_id,
      ...context,
    }));
  },
};

// Usage in API routes
async function POST(request: Request) {
  const traceId = request.headers.get('x-trace-id') || generateTraceId();
  
  try {
    const actor = await resolveActorContext(request);
    logger.info('Booking creation started', { trace_id: traceId, actor_id: actor.userId });
    
    const booking = await createBooking(data);
    
    logger.info('Booking created', { trace_id: traceId, booking_id: booking.id });
    return 200;
  } catch (error) {
    logger.error('Booking creation failed', error, { trace_id: traceId });
    return 500;
  }
}
```

**Task 4.9: Metrics Collection**
```typescript
// Metrics client (using StatsD or similar)
const metrics = {
  recordBookingCreated: (duration: number) => {
    statsd.timing('booking.created', duration);
    statsd.increment('booking.created.count');
  },
  recordPaymentCaptured: (amount: number) => {
    statsd.increment('payment.captured.count');
    statsd.gauge('payment.captured.amount', amount);
  },
  recordWebhookProcessed: (duration: number, success: boolean) => {
    statsd.timing('webhook.processed', duration);
    if (success) statsd.increment('webhook.processed.success');
    else statsd.increment('webhook.processed.failure');
  },
};
```

**Task 4.10: Error Tracking (Sentry)**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% sampling
  beforeSend(event, hint) {
    // Don't send auth errors
    if (event.tags?.error_type === 'AuthError') {
      return null;
    }
    return event;
  },
});

// Usage
try {
  // code
} catch (error) {
  Sentry.captureException(error, {
    tags: { error_type: 'BookingError', booking_id },
    extra: { actor_id, vendor_id },
  });
}
```

#### PHASE 4D: E2E Tests (Days 3-4)
**Task 4.11: Critical Path E2E Tests**
```typescript
// E2E test: Complete booking flow
it('E2E: Restaurant booking from discovery to confirmation', async () => {
  // 1. Customer discovers restaurant
  const restaurants = await client.get('/api/restaurants/public?city=Delhi');
  expect(restaurants.length).toBeGreaterThan(0);
  const restaurant = restaurants[0];

  // 2. Customer checks availability
  const slots = await client.get(`/api/restaurants/${restaurant.id}/availability?date=2026-02-20`);
  expect(slots.length).toBeGreaterThan(0);
  const slot = slots[0];

  // 3. Customer creates booking
  const booking = await client.post('/api/bookings', {
    restaurant_id: restaurant.id,
    time_slot_id: slot.id,
    party_size: 4,
    booking_date: '2026-02-20',
  });
  expect(booking.status).toBe('pending');

  // 4. Customer initiates payment
  const paymentIntent = await client.post('/api/payments/intent', {
    amount: 5000,
    payment_for: 'booking',
  });
  expect(paymentIntent.order_id).toBeDefined();

  // 5. Simulate Razorpay webhook
  const webhook = {
    event: 'payment.captured',
    payload: { payment: { id: paymentIntent.order_id, ... } },
  };
  const webhookResponse = await client.post('/api/webhooks/razorpay', webhook);
  expect(webhookResponse.status).toBe(200);

  // 6. Verify booking confirmed
  const bookingUpdated = await client.get(`/api/bookings/${booking.id}`);
  expect(bookingUpdated.status).toBe('confirmed');
});

// E2E test: Event ticketing
it('E2E: Event ticket purchase and QR validation', async () => {
  // 1. Customer finds event
  const events = await client.get('/api/events?city=Delhi');
  const event = events[0];

  // 2. Purchase ticket (similar payment flow as booking)
  const ticket = await client.post('/api/tickets/purchase', {
    event_id: event.id,
    ticket_type_id: 'vip',
    quantity: 1,
  });
  expect(ticket.qr_token).toBeDefined();

  // 3. Validate QR at gate (first scan)
  const checkin1 = await client.post('/api/checkins', {
    qr_token: ticket.qr_token,
    gate_id: 'gate_main',
  });
  expect(checkin1.status).toBe('entry_granted');

  // 4. Try duplicate scan
  const checkin2 = await client.post('/api/checkins', {
    qr_token: ticket.qr_token,
    gate_id: 'gate_main',
  });
  expect(checkin2.status).toBe('duplicate_scan');
  expect(checkin2.error).toBe('Already scanned');
});

// E2E test: Lead unlock
it('E2E: Party hall lead unlock and contact reveal', async () => {
  // 1. Customer submits lead (free)
  const lead = await client.post('/api/leads', {
    guest_count: 200,
    budget_min: 500000,
    budget_max: 1000000,
    location_city: 'Delhi',
  });
  expect(lead.contact_masked).toBe(true);

  // 2. Vendor sees available lead
  const availableLeads = await vendorClient.get('/api/leads/available');
  expect(availableLeads.some(l => l.id === lead.id)).toBe(true);

  // 3. Vendor unlocks lead (payment)
  const unlock = await vendorClient.post('/api/lead-unlocks', {
    lead_id: lead.id,
  });
  expect(unlock.order_id).toBeDefined();

  // 4. Webhook success
  await client.post('/api/webhooks/razorpay', webhookPayload);

  // 5. Vendor can now see full contact
  const unlockedLead = await vendorClient.get(`/api/leads/${lead.id}`);
  expect(unlockedLead.customer_phone).toBeDefined();
  expect(unlockedLead.customer_phone).toMatch(/\+91\d{10}/);
});
```

**Task 4.12: Regression Tests**
- Run existing tests + new E2E tests before each deploy
- Target: 100% pass rate on critical path tests

#### PHASE 4E: Deployment & CI/CD (Days 4-5)
**Task 4.13: GitHub Actions Setup**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test:unit
      - run: pnpm test:rls # RLS isolation tests
      - run: pnpm test:e2e # E2E critical paths

  deploy-db:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run migrations
        run: |
          export SUPABASE_URL=${{ secrets.SUPABASE_URL }}
          export SUPABASE_SERVICE_ROLE_KEY=${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          pnpm db:migrate

  deploy-web:
    needs: [test, deploy-db]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-functions:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy Edge Functions
        run: |
          pnpm supabase functions deploy webhook_handler --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

**Task 4.14: Staging Environment**
- Staging Supabase project (separate from prod)
- Staging Vercel deployment
- Smoke tests run on staging deploy
- Manual QA sign-off before prod deploy

**Task 4.15: Monitoring & Alerting**
```typescript
// Alerts for critical issues
if (paymentFailureRate > 0.01) { // > 1% failures
  await alertTeam(`Payment failure rate high: ${paymentFailureRate}`);
}

if (webhookReconciliationBacklog > 1000) { // > 1000 unprocessed
  await alertTeam(`Webhook backlog critical: ${webhookReconciliationBacklog}`);
}

if (avgBookingLatency > 5000) { // > 5 seconds
  await alertTeam(`Booking latency high: ${avgBookingLatency}ms`);
}
```

### Deliverables at End of Week 4
- ✅ Admin panel (vendors, finance, listings, approvals)
- ✅ FCM push notifications (all business events)
- ✅ Structured logging + error tracking
- ✅ Comprehensive E2E test suite
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Monitoring & alerting setup
- ✅ Staging + production environments

### Exit Criteria
```
[✓] All critical path E2E tests pass 100x runs
[✓] Admin can approve 10 vendors in < 1 minute
[✓] Notifications deliver within 30 seconds
[✓] Webhook failures reconciled within 24 hours
[✓] E2E test: booking confirmation in < 3 seconds
[✓] Platform handles 10x normal traffic without degradation
[✓] All errors logged with trace IDs
[✓] Deploy to production in < 5 minutes (automated)
```

---

## SUMMARY: WEEK-BY-WEEK CHECKLIST

| Week | Focus | Key Deliverables | Exit Criteria |
|------|-------|------------------|---------------|
| 1 | Foundation | Schema, Auth, RLS, Onboarding | ✅ RLS isolation tested, vendor can onboard |
| 2 | Marketplace | Listings CRUD, Search, UI | ✅ Vendor creates → customer discovers |
| 3 | Transactions | Booking, Ticketing, Payments, Webhooks | ✅ No overbooking, no duplicate payments |
| 4 | Governance | Admin, Notifications, Observability, Tests | ✅ All E2E tests pass, production ready |

---

## CRITICAL SUCCESS FACTORS

### Security (Non-Negotiable)
- [x] RLS policies tested and verified
- [x] No direct vendor_id to auth.uid mapping
- [x] Webhook signature verification mandatory
- [x] Payment webhook idempotency enforced
- [x] All sensitive actions audit-logged

### Performance
- [x] Search queries < 500ms (indexed)
- [x] Booking confirmation < 2s
- [x] Concurrency: 100+ simultaneous bookings handled
- [x] Notifications < 30s delivery

### Reliability
- [x] 99.5% availability target
- [x] Webhook reconciliation within 24h
- [x] Payment state consistent (no phantom bookings)
- [x] QR token single-use enforced

### Scalability
- [x] Database indexes on all filter columns
- [x] Modular code for service extraction
- [x] Stateless API servers (horizontal scaling ready)
- [x] Caching strategy for public searches (1h TTL)

---

## PRE-IMPLEMENTATION FINAL CHECKLIST

Before Day 1, confirm:
- [ ] Supabase account + project created
- [ ] Razorpay test account configured
- [ ] Firebase project created (FCM)
- [ ] Vercel account + GitHub integration
- [ ] Repository initialized (Turborepo structure)
- [ ] Team has access to all services
- [ ] Backups plan defined
- [ ] Observability tools configured (Sentry, metrics)
- [ ] Staging environment ready
- [ ] Deployment checklist documented

---

**Created:** 12 Feb 2026  
**Status:** Ready for implementation  
**Next Step:** Begin Week 1 tasks
