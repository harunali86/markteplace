# Engineering Master Plan (Codex): Doossh Multi-Vendor Marketplace

## 0. Scope and Constraints

Platform domains:
- Restaurant booking marketplace
- Event and club ticketing marketplace
- Party hall and venue lead marketplace

Required channels:
- Customer mobile app (Expo React Native)
- Vendor web portal (Next.js)
- Admin web panel (Next.js)
- Marketing website (Next.js)

Fixed stack:
- Frontend: Next.js, Expo React Native, Tailwind CSS
- Backend: Supabase (Auth, Postgres, Storage, Realtime, Edge Functions)
- Payments: Razorpay
- Notifications: Firebase Cloud Messaging (FCM)
- Hosting: Vercel + Supabase Cloud

Hard rules:
- Vendor is tenant
- Multi-tenant SaaS architecture is mandatory
- RLS isolation is mandatory
- Subscription billing + lead unlock monetization + booking transactions are mandatory

---

## 1) All Possible Architecture Approaches

### Approach A: Pooled Multi-Tenant (Shared DB, Shared Tables, `vendor_id` + RLS)
Definition:
- One Supabase project.
- Common tables for all tenants.
- Every tenant-owned row has `vendor_id`.
- Access isolation via RLS and tenant membership mapping.

Strengths:
- Fastest MVP delivery.
- Best fit with Supabase RLS design.
- Efficient customer marketplace queries across all vendors.
- Lower infra and operations cost.

Weaknesses:
- RLS policy mistakes can cause data leakage.
- Noisy neighbor risk if hot tenants dominate workloads.

Complexity:
- Medium.

Risk level:
- Medium without guardrails, low with strong RLS tests.

### Approach B: Schema per Tenant (Single DB, Multiple Schemas)
Definition:
- Each vendor gets dedicated schema in same Postgres instance.

Strengths:
- Better logical isolation than pooled tables.
- Easier tenant-level backup/restore than pooled tables.

Weaknesses:
- Hard migration management at scale.
- Cross-tenant analytics and marketplace queries become costly.
- Adds lifecycle complexity for onboarding/offboarding.

Complexity:
- High.

Risk level:
- Medium to high.

### Approach C: Database per Tenant (or Supabase project per tenant)
Definition:
- Each vendor gets dedicated database or project.

Strengths:
- Strongest data isolation.
- Clean tenant-level compliance boundaries.

Weaknesses:
- Expensive and operationally heavy.
- Central marketplace search across tenants becomes complex.
- Slower product iteration.

Complexity:
- Very high.

Risk level:
- High for current timeline.

### Approach D: Microservices First (from day one)
Definition:
- Separate services for auth, marketplace, booking, billing, notification from start.

Strengths:
- Strong service autonomy and scaling per domain.
- Clear long-term separation.

Weaknesses:
- Distributed complexity too early.
- Slows 1-month MVP.
- Higher failure modes (network, retries, consistency).

Complexity:
- Very high.

Risk level:
- High for small/early team.

### Approach E: Modular Monolith (Domain modules in one deployment)
Definition:
- Single deployable backend surface, but strict domain boundaries in code.
- Event style integration through outbox/background jobs where needed.

Strengths:
- Fast delivery plus maintainable boundaries.
- Easier transactions for booking and billing integrity.
- Smooth path to future service extraction.

Weaknesses:
- Requires discipline to avoid layer violations.
- Can become monolith-spaghetti if boundaries are not enforced.

Complexity:
- Medium.

Risk level:
- Low to medium.

### Approach F: Bridge Isolation Model (Hybrid)
Definition:
- Default tenants in pooled model.
- Premium or regulated tenants can move to dedicated isolation later.

Strengths:
- Balances cost and compliance.
- Strong long-term commercial flexibility.

Weaknesses:
- Needs a control plane and data portability strategy.
- Not ideal to build fully in MVP month.

Complexity:
- High long-term.

Risk level:
- Medium.

---

## 2) Approach Comparison (Pros, Cons, Compatibility, Scalability, Risk)

| Approach | Stack Compatibility | 1-Month MVP Speed | Long-Term Scalability | Ops Complexity | Main Risk |
|---|---|---:|---:|---:|---|
| A Pooled + RLS | Very High | Very High | High | Low-Medium | RLS policy bugs |
| B Schema per Tenant | Medium | Low | Medium | High | Schema drift |
| C DB per Tenant | Medium | Very Low | High (compliance) | Very High | Cost and orchestration |
| D Microservices First | Medium | Very Low | Very High | Very High | Over-engineering early |
| E Modular Monolith | Very High | High | High | Medium | Boundary erosion |
| F Bridge Model | High | Medium | Very High | High | Control plane complexity |

Practical interpretation:
- For this stack and timeline, A + E combined is the strongest near-term choice.
- F should be planned, not fully implemented in MVP.

---

## 3) Recommended Best Architecture

Recommendation:
- Adopt **Pooled Multi-Tenant + RLS** data model (Approach A)
- Implement application as **Modular Monolith** (Approach E)
- Design migration hooks for future **Bridge Model** (Approach F)

Why this is best:
1. Marketplace queries need cross-vendor aggregation from day one.
2. Supabase gives native strengths in auth, RLS, storage, realtime, and edge runtime.
3. Booking and billing require strong ACID transactions, easier in one logical backend.
4. 1-month MVP requires simplicity without sacrificing tenant isolation.

Non-negotiable guardrails:
- Do not map `vendor_id` directly to `auth.uid()`.
- Use membership join table for tenant access checks.
- Enforce RLS with automated policy tests.
- All payment webhook flows must be idempotent.

---

## 4) High-Level System Architecture (Text Diagram)

```text
Clients
  - Customer App (Expo)
  - Vendor Portal (Next.js)
  - Admin Panel (Next.js)
  - Marketing Site (Next.js)

Edge
  - Cloudflare (WAF, CDN, bot mitigation)

Application Layer
  - Next.js BFF/API Layer
    - Auth Context Resolver
    - Tenant Resolver
    - Input Validation (Zod)
    - Domain Modules:
      - Marketplace Module
      - Booking and Ticketing Module
      - Billing and Subscription Module
      - Notification Orchestration Module

Platform Layer (Supabase)
  - Auth
  - PostgreSQL with RLS
  - Storage (media)
  - Realtime
  - Edge Functions (webhooks, reconciliation, async jobs)

External Integrations
  - Razorpay (payments and webhooks)
  - Firebase FCM (push notifications)
```

Data flow principles:
- Money and inventory writes are synchronous and transactional.
- Notification and non-critical side effects are asynchronous.
- Reconciliation jobs backstop webhook failures.

---

## 5) Core Database Entity Model and Relationships

### Identity and tenancy
- `profiles(user_id PK, role, phone, email, status)`
- `vendors(id PK, business_name, verification_status, plan_id)`
- `vendor_memberships(user_id FK -> profiles.user_id, vendor_id FK -> vendors.id, membership_role)`

Relationship:
- One user can belong to many vendors.
- One vendor can have many members.

### Marketplace catalog
- `restaurants(id PK, vendor_id FK, ... )`
- `clubs(id PK, vendor_id FK, ... )`
- `party_halls(id PK, vendor_id FK, ... )`
- `media_assets(id PK, owner_type, owner_id, url)`
- `reviews(id PK, customer_id FK, target_type, target_id, rating)`

### Booking and event ticketing
- `events(id PK, club_id FK, vendor_id FK, start_at, end_at, status)`
- `ticket_types(id PK, event_id FK, price, capacity)`
- `bookings(id PK, customer_id FK, restaurant_id FK, slot_at, party_size, status)`
- `orders(id PK, customer_id FK, vendor_id FK, total_amount, status)`
- `tickets(id PK, order_id FK, event_id FK, qr_token_hash, status)`
- `checkins(id PK, ticket_id FK UNIQUE, scanned_at, gate_id)`

### Leads and monetization
- `leads(id PK, customer_id FK, hall_id FK, requirement_payload, contact_masked, status)`
- `lead_unlocks(id PK, lead_id FK, vendor_id FK, payment_id FK, unlocked_at)`

### Billing and subscriptions
- `payments(id PK, provider, provider_payment_id UNIQUE, status, amount, currency, metadata)`
- `payment_webhook_events(id PK, provider_event_id UNIQUE, payload_hash, processed_at)`
- `plans(id PK, code UNIQUE, price, interval)`
- `subscriptions(id PK, vendor_id FK, plan_id FK, status, current_period_end)`

### Operations
- `notifications(id PK, user_id FK, channel, template_key, status)`
- `audit_logs(id PK, actor_user_id FK, action, entity_type, entity_id, trace_id, created_at)`

Key integrity rules:
- Foreign keys on every ownership relationship.
- Unique keys for payment and webhook idempotency.
- Enum/check constraints for status columns.
- Index on all `vendor_id`, `customer_id`, `event_id`, `created_at` filters.

---

## 6) Service Boundaries

### 6.1 Authentication Service
Responsibilities:
- Login/session/token validation
- Role and tenant membership resolution
- Auth guard primitives for all routes

Owns:
- `profiles`, `vendor_memberships`

Critical contract:
- Returns actor context: `user_id`, `role`, `allowed_vendor_ids`

### 6.2 Marketplace Service
Responsibilities:
- Listing CRUD for restaurants, clubs, halls
- Discovery, filters, and public search
- Moderation status transitions

Owns:
- Listing and media tables

Critical contract:
- Public reads are cache-friendly and never expose private vendor data.

### 6.3 Booking Service
Responsibilities:
- Restaurant booking lifecycle
- Event ticket reservation and issuance
- QR check-in validation and one-time consume

Owns:
- `bookings`, `orders`, `tickets`, `checkins`, inventory-related records

Critical contract:
- Uses transactions and row locking for inventory consistency.

### 6.4 Billing Service
Responsibilities:
- Payment intents and captures
- Subscription lifecycle
- Lead unlock payment flow
- Webhook verification and idempotent processing

Owns:
- `payments`, `payment_webhook_events`, `subscriptions`, `lead_unlocks`

Critical contract:
- No duplicate webhook processing.
- Billing state is source of truth for unlock and entitlement actions.

### 6.5 Notification Service
Responsibilities:
- Push notification fanout via FCM
- Notification templates and preference checks
- Retry and dead-letter handling for failed sends

Owns:
- `notifications` and delivery logs

Critical contract:
- Notification failures do not rollback successful business transactions.

---

## 7) Phased Development Strategy

## 7.1 One-Month MVP Plan

### Week 1: Foundation and Tenant Security
- Turborepo setup and shared package contracts
- Supabase schema baseline and migration pipeline
- Auth flows and actor context resolver
- Tenant membership model and RLS baseline
- Vendor onboarding and admin approval

Exit criteria:
- Tenant data isolation test suite passes.

### Week 2: Marketplace Core
- Vendor dashboard for listings CRUD
- Public browsing pages and APIs
- Media upload and basic moderation
- Search and filter with indexed queries

Exit criteria:
- End-to-end listing publish to public visibility flow works.

### Week 3: Transaction Engine
- Restaurant booking with slot/inventory lock
- Event ticket purchase and QR issuance
- Lead creation and paid unlock flow
- Razorpay integration and webhook idempotency

Exit criteria:
- No double-booking in concurrency tests.
- Webhook replay does not duplicate financial side effects.

### Week 4: Governance and Reliability
- Admin panel essentials (approvals, flags, finance snapshots)
- Notification orchestration via FCM
- Reconciliation jobs and retry flows
- Observability: structured logs, metrics, alerts

Exit criteria:
- Critical path E2E tests for booking, ticketing, lead unlock, payments pass.

## 7.2 Long-Term Scalability Plan

After MVP:
- Introduce queue worker for heavy asynchronous tasks.
- Add read replicas and query tuning for hot endpoints.
- Partition high-growth tables (`tickets`, `payments`, `audit_logs`).
- Build bridge isolation support for enterprise tenants.
- Consider service extraction only when team or traffic justifies it.

---

## 8) Perfect First vs Simplify First

### Must be perfect from day one
1. RLS and tenant isolation enforcement
2. Payment webhook verification and idempotency
3. Inventory locking and transactional consistency
4. Lead unlock entitlement checks
5. Audit logs for admin and financial actions

### Can be simplified in MVP
1. Advanced analytics and BI (start with operational dashboards)
2. Search sophistication (start with SQL indexes and basic ranking)
3. Chat depth (basic realtime or defer)
4. Promotion engine complexity
5. Secondary payment provider failover

---

## Decision Summary

Final architecture choice:
- **Pooled multi-tenant data + strict RLS + modular monolith service boundaries**
- **Supabase-first backend with transactional core for booking and billing**
- **Future bridge model readiness without early over-engineering**

This plan is optimized for both:
- fast 1-month MVP delivery
- safe long-term scale and maintainability
