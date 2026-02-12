# DOOSSH PROJECT UNDERSTANDING & IMPLEMENTATION PLAN

**Date:** 12 February 2026  
**Status:** Pre-Implementation Analysis  
**Timeline:** 1 Month MVP

---

## 1. PROJECT OVERVIEW

### What is Doossh?
Multi-vendor SaaS marketplace with 3 parallel business lines:
1. **Restaurant Marketplace** - Table reservations + customer discovery
2. **Event Ticketing** - Club events with secure QR tickets
3. **Party Hall Leads** - Venue discovery + paid lead unlock

### Core Positioning
- **For Customers:** One app to discover & book restaurants, buy event tickets, find party halls
- **For Vendors:** Dashboard to manage listings, inventory, bookings, leads, payments
- **For Admin:** Control panel for platform governance, approvals, finance tracking

### Success Metrics (MVP)
- ✅ Multi-tenant data isolation (RLS tested)
- ✅ Zero double-bookings (inventory locking)
- ✅ Zero webhook duplicates (idempotency)
- ✅ 1-month delivery

---

## 2. BUSINESS REQUIREMENTS BY DOMAIN

### 2.1 RESTAURANTS
**Customer Journey:**
1. Search restaurants by cuisine, location, rating
2. View available time slots (30min/1hr bookings)
3. Select party size
4. Add special requests
5. Pay via Razorpay
6. Get confirmation with booking details

**Vendor Features:**
- Manage restaurant details (name, cuisine, location, images)
- Set availability (hours, holidays)
- Create/edit time slots with capacity
- View bookings calendar
- Cancel bookings with customer notification
- Access booking reports

**Inventory Challenge:** Prevent overbooking at same time slot (concurrency issue)

### 2.2 EVENT TICKETING
**Customer Journey:**
1. Browse club events by location, date, genre
2. View event details (lineup, venue, images)
3. Select ticket type (VIP, standard, etc.)
4. Checkout and pay
5. Receive QR token (unique ticket)
6. Gate entry via QR scan (one-time consume)

**Vendor Features:**
- Create events with dates, lineup, images
- Define ticket types with pricing and capacity
- View ticket sales in real-time
- Download attendee lists
- Monitor check-ins at gate (if admin handles)

**Ticket Challenge:** QR tokens must be consumable only once (fraud prevention)

### 2.3 PARTY HALL LEADS
**Customer Journey:**
1. Fill requirement form (guest count, budget, date, location, etc.)
2. Submit as lead (free)
3. Platform shows vendors who have unlocked this lead
4. Customer receives vendor contact info for unlocked leads

**Vendor Features:**
- View available leads (anonymized contact details)
- Pay to unlock a lead and get customer contact info
- Track spend on lead unlocks
- Conversion tracking

**Monetization:** Leads are the revenue model for party hall category
- Platform charges vendors to unlock customer leads
- Lead unlock payment goes through Razorpay
- Payment must be idempotent (no duplicate charges)

---

## 3. TECHNICAL ARCHITECTURE (FINALIZED)

### Stack Decision
```
Frontend:
  - Next.js 15 (web apps) → Vercel
  - Expo React Native (mobile) → EAS Build
  
Backend:
  - Supabase (Auth + Postgres + Storage + Realtime + Edge Functions)
  
Payments:
  - Razorpay (booking, tickets, lead unlocks + webhooks)
  
Notifications:
  - Firebase FCM (push notifications to mobile)
  
Hosting:
  - Vercel (web apps)
  - Supabase Cloud (database + auth)
  - Cloudflare (CDN + WAF)
```

### Data Model Principles
- **Tenancy:** Pooled (all vendors in shared tables) + RLS
- **Isolation:** Membership-based (vendor_memberships join table)
- **Safety:** RLS policies + foreign keys + unique constraints
- **Scalability:** Indexed by vendor_id, customer_id, created_at

### Service Architecture (Modular Monolith)
```
Next.js Backend (Edge Functions + API Routes)
├── Auth Service (login, sessions, roles)
├── Marketplace Service (listings CRUD, search, discovery)
├── Booking Service (reservations, inventory, transactions)
├── Ticketing Service (events, tickets, QR validation)
├── Billing Service (payments, webhooks, subscriptions, lead unlocks)
├── Lead Service (lead creation, unlocking, vault)
└── Notification Service (FCM, templates, preferences)
```

### Critical Safety Guardrails
1. **Never map vendor_id directly to auth.uid()**
   - Use vendor_memberships join table for access checks
   
2. **Payment webhook verification**
   - Verify Razorpay signature on every webhook
   - Idempotency: check webhook_event_id uniqueness before processing
   - Use payment_webhook_events table as audit trail
   
3. **Booking inventory protection**
   - Use PostgreSQL row-level locking (SELECT ... FOR UPDATE)
   - Transactional updates to slot capacity
   
4. **QR ticket one-time consume**
   - Mark ticket scanned after first gate entry
   - Return duplicate-scan error on retry (no state change)
   
5. **Audit logging**
   - Log all payment events, booking state changes, lead unlocks
   - Enable financial auditing and fraud investigation

---

## 4. DATABASE ENTITIES (CORE TABLES)

### Identity & Tenancy
```sql
profiles(id, role: admin|vendor|customer, phone, email, created_at)
vendors(id, business_name, status: pending|approved|rejected, 
        plan_id, kyc_verified, created_at)
vendor_memberships(user_id, vendor_id, role: owner|manager|staff, 
                   created_at)
```

### Marketplace
```sql
restaurants(id, vendor_id, name, cuisine, location, images, 
            hours, is_published, created_at)
clubs(id, vendor_id, name, location, images, is_published, created_at)
party_halls(id, vendor_id, name, location, capacity, images, 
            is_published, created_at)

-- Slots / Inventory
restaurant_time_slots(id, restaurant_id, day_of_week, start_time, 
                      end_time, capacity, current_bookings)
ticket_types(id, event_id, name: VIP|Standard, price, capacity, 
             sold_count, created_at)
```

### Booking & Transactions
```sql
bookings(id, customer_id, restaurant_id, slot_id, party_size, status,
         booking_date, special_requests, created_at)
orders(id, customer_id, vendor_id, total_amount, status: pending|paid|failed,
       payment_id, created_at)
tickets(id, order_id, event_id, customer_id, qr_token_hash, 
        is_scanned, scanned_at, created_at)
checkins(id, ticket_id, scanned_at, gate_id, created_at) -- immutable
```

### Lead Marketplace
```sql
leads(id, customer_id, party_hall_id, guest_count, budget, 
      requirement_desc, contact_masked, status, created_at)
lead_unlocks(id, lead_id, vendor_id, payment_id, unlocked_at, 
             is_paid, amount, created_at) -- immutable
```

### Billing & Payments
```sql
payments(id, provider: razorpay, provider_payment_id UNIQUE, 
         status: pending|captured|failed, amount, currency, 
         metadata JSON, created_at)
payment_webhook_events(id, provider_event_id UNIQUE, provider, 
                       payload_hash, processed_at, created_at) -- idempotency
subscriptions(id, vendor_id, plan_id, status, current_period_end, created_at)
plans(id, code UNIQUE: starter|professional|enterprise, price, 
      interval: monthly|yearly, created_at)
```

### Operations
```sql
notifications(id, user_id, channel: fcm|sms, template_key, status,
              created_at)
audit_logs(id, actor_user_id, action, entity_type, entity_id,
           changes JSON, trace_id, created_at)
```

---

## 5. RLS POLICY STRATEGY

### Principle
- Every query is scoped to the authenticated user's allowed vendors
- Vendor members can only see data for vendors they belong to
- Customers see public marketplace data only
- Admins see everything

### Example Policies (Pseudo-code)
```sql
-- Restaurant table RLS
CREATE POLICY "vendors_can_read_own_restaurants"
  ON restaurants FOR SELECT
  USING (vendor_id IN (
    SELECT vendor_id FROM vendor_memberships 
    WHERE user_id = auth.uid() 
      AND membership_role IN ('owner', 'manager', 'staff')
  ));

-- Customer can see published restaurants
CREATE POLICY "customers_can_see_published_restaurants"
  ON restaurants FOR SELECT
  USING (is_published = true 
    AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'customer');

-- Payment table RLS
CREATE POLICY "users_can_read_own_payments"
  ON payments FOR SELECT
  USING (customer_id = auth.uid() 
    OR vendor_id IN (
      SELECT vendor_id FROM vendor_memberships 
      WHERE user_id = auth.uid()
    ));
```

### Testing
- Create automated RLS tests that verify isolation
- Test data leakage scenarios (query as user A, should not see user B's data)
- Run tests in CI/CD before deployment

---

## 6. WEEK-BY-WEEK MVP BREAKDOWN

### WEEK 1: Foundation & Tenant Security
**Deliverables:**
- [ ] Turborepo setup (apps/web, apps/mobile, packages/*)
- [ ] Supabase project creation and schema bootstrap
- [ ] SQL migrations for all core tables
- [ ] Auth flows (signup, login, session)
- [ ] Tenant membership model and RLS baseline
- [ ] Vendor onboarding flow (KYC upload, admin approval)
- [ ] Shared TypeScript types (contracts package)

**Exit Criteria:**
- ✅ RLS test suite passes (no data leakage)
- ✅ New vendor can onboard and get isolated access
- ✅ Auth context resolver works for all roles (customer/vendor/admin)

**Team Tasks:**
- Schema + migrations (Backend)
- Auth UI flows (Frontend)
- RLS policy tests (Backend)

---

### WEEK 2: Marketplace Core
**Deliverables:**
- [ ] Restaurant CRUD (vendor dashboard)
- [ ] Club CRUD (vendor dashboard)
- [ ] Party hall CRUD (vendor dashboard)
- [ ] Media upload (images to Supabase storage)
- [ ] Public browse/search APIs
- [ ] Customer-facing marketplace UI (all 3 categories)
- [ ] Listing moderation (publish/unpublish)
- [ ] Basic indexing and query optimization

**Exit Criteria:**
- ✅ Vendor can create restaurant → visible on public marketplace
- ✅ Customer search returns relevant listings
- ✅ Image upload and display works end-to-end

**Team Tasks:**
- Listing CRUD endpoints (Backend)
- Search optimization (Backend)
- Vendor dashboard UIs (Frontend)
- Public browse pages (Frontend)

---

### WEEK 3: Transaction Engine (Money + Inventory)
**Deliverables:**
- [ ] Restaurant booking flow (slot inventory locking)
- [ ] Event creation and ticket type management
- [ ] Event ticket purchase flow
- [ ] QR token generation and validation
- [ ] Razorpay integration (payment intent creation)
- [ ] Webhook idempotency (payment_webhook_events table)
- [ ] Order status state machine
- [ ] Lead creation + paid lead unlock flow

**Exit Criteria:**
- ✅ No double-booking under concurrent slot requests (load test)
- ✅ QR tokens work and cannot be scanned twice
- ✅ Webhook replay does not create duplicate charges or bookings
- ✅ Lead unlock is fully paid and idempotent

**Team Tasks:**
- Booking + ticket transaction logic (Backend)
- Razorpay integration + webhook handler (Backend)
- Lead unlock payment flow (Backend)
- Concurrency testing (QA)
- Webhook replay testing (QA)

---

### WEEK 4: Governance & Reliability
**Deliverables:**
- [ ] Admin panel (vendor approvals, finance snapshots, flags)
- [ ] FCM push notifications (booking confirmations, lead messages)
- [ ] Reconciliation job (webhook failures, retries)
- [ ] Structured logging (trace IDs, error contexts)
- [ ] Metrics and alerts setup
- [ ] E2E test suite for critical paths
- [ ] Deployment pipeline (CI/CD)

**Exit Criteria:**
- ✅ All critical path tests pass (booking → payment → confirmation)
- ✅ Webhook failures are reconciled within 24h
- ✅ Notifications deliver within 30s
- ✅ Platform can handle 10x normal traffic without degradation

**Team Tasks:**
- Admin panel implementation (Frontend)
- FCM integration (Backend)
- Reconciliation job (Backend)
- E2E test automation (QA)
- Observability setup (DevOps)

---

## 7. CRITICAL IMPLEMENTATION DETAILS

### 7.1 Restaurant Booking Flow (Must Get Right)
```
Customer selects slot:
  1. Query available slots for restaurant on date X
  2. SELECT FROM restaurant_slots FOR UPDATE WHERE ... (lock)
  3. Check current_bookings < capacity
  4. Create booking record (status = pending)
  5. Create order (status = pending)

Customer pays:
  6. Razorpay payment intent created
  7. Customer completes payment
  8. Razorpay webhook received + verified

Webhook handler:
  9. Look up payment_webhook_events to check idempotency
  10. If seen before → return 200 (already processed)
  11. If new → mark booking as confirmed, update slot bookings++
  12. Send confirmation notification

Concurrency test:
  - 10 customers simultaneously book same slot (capacity = 5)
  - Should have exactly 5 bookings, others fail gracefully
```

### 7.2 Event Ticket QR Flow (Must Get Right)
```
Customer buys ticket:
  1. Create order (status = pending)
  2. Razorpay payment
  3. Webhook success → create ticket record with qr_token_hash
  4. Send QR as SMS/email/in-app
  
Gate entry:
  5. Scan QR → query ticket
  6. Check ticket.is_scanned = false
  7. If true → mark as scanned, return "Entry granted"
  8. If false → return "Already scanned / duplicate attempt"
  
Duplicate scan test:
  - Try scanning same QR twice
  - First scan: success
  - Second scan: clear error (not a state change, not a double-entry)
```

### 7.3 Lead Unlock Payment (Must Get Right)
```
Vendor sees available lead:
  1. Lead record exists (customer requirement submitted)
  2. Lead contact is masked (e.g., "Customer in Delhi, budget 5-10L")
  3. Vendor clicks "Unlock Lead" button

Payment flow:
  4. Create payment intent for lead unlock amount
  5. Razorpay popup
  6. Customer pays

Webhook success:
  7. Create lead_unlock record (immutable) with payment_id
  8. Vendor dashboard now shows full customer contact
  9. Lead status → "unlocked"
  
Duplicate webhook:
  - If webhook received twice with same event_id
  - Check payment_webhook_events table
  - Already processed → return 200 (no duplicate lead_unlock created)
```

### 7.4 Tenant Isolation Verification
```
Test scenario:
  Vendor A and Vendor B both have restaurants

Vendor A login:
  - Query /api/restaurants → only their restaurants returned
  - Query /api/bookings → only bookings for their restaurants
  - RLS policy enforces vendor_id match

Vendor B login:
  - Query same endpoints → only their data
  
Admin login:
  - Query /api/restaurants (admin endpoint) → all restaurants

Customer login:
  - Query /api/restaurants (public) → all published restaurants only
  - Cannot access vendor_id, booking details, payment info
```

---

## 8. WEEK-BY-WEEK TEAM ALLOCATION

### If 1 Full-Stack Engineer (You)
**Week 1:**
- Schema design and SQL migrations
- Auth setup
- RLS policy skeleton
- Basic TypeScript types

**Week 2:**
- CRUD endpoints for listings
- Search optimization
- Basic listing UI

**Week 3:**
- Booking transaction logic
- Razorpay integration
- Payment webhook handler

**Week 4:**
- Admin panel basics
- Notifications
- E2E testing and fixes

### If Team (Recommended)
**Backend (1 engineer):**
- All database logic
- All APIs and transactions
- Payment integration
- Webhooks and reconciliation

**Frontend (1 engineer):**
- All UIs (vendor dashboard, customer app, admin panel)
- Public marketplace pages
- Notifications UI integration

**QA/DevOps (0.5 engineer):**
- Concurrency testing
- Webhook replay testing
- Deployment setup
- Load testing

---

## 9. PRE-IMPLEMENTATION CHECKLIST

**Before coding starts:**
- [ ] Supabase project created and URL/keys configured
- [ ] Razorpay account ready (test keys)
- [ ] Firebase project created (FCM setup)
- [ ] Vercel and Cloudflare DNS configured
- [ ] Repository structure initialized (Turborepo)
- [ ] TypeScript, ESLint, Prettier configured consistently
- [ ] Database schema finalized (review with team)
- [ ] RLS policies reviewed (security audit)
- [ ] Payment webhook signature verification method confirmed
- [ ] Monitoring/alerting platform selected (Sentry, DataDog)
- [ ] Test environment separate from production

---

## 10. SUCCESS CRITERIA FOR MVP LAUNCH

### Data & Security
- ✅ Zero unauthorized data access in RLS tests
- ✅ All vendor-owned tables require RLS
- ✅ All customer PII encrypted in leads

### Transactions
- ✅ Zero double-bookings (1000 concurrent slot attempts test)
- ✅ Zero duplicate payments (webhook replay test)
- ✅ Lead unlock is atomic (payment success = unlock record)

### Reliability
- ✅ 99.5% availability (monitored)
- ✅ Payment webhook reconciliation within 24h
- ✅ E2E critical path tests pass 100x runs

### Performance
- ✅ Restaurant search under 500ms
- ✅ Booking confirmation under 2s
- ✅ QR scan validation under 1s

### Operations
- ✅ Admin can approve vendors
- ✅ Admin can monitor finance (total payments, subscriptions)
- ✅ Notifications send within 30s
- ✅ All errors logged with trace IDs

---

## NEXT STEPS

1. **Confirm stack and approach** with team ✅
2. **Set up Supabase project** (prod + staging)
3. **Create repository** and Turborepo structure
4. **Begin Week 1 tasks** (schema + auth)
5. **Schedule daily standups** (15 min sync)
6. **Set up monitoring** (error tracking, performance)

---

**Status:** Ready for implementation kickoff  
**Last Updated:** 12 Feb 2026
