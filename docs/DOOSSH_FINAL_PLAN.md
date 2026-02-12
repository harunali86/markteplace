# Doossh Final Architecture and Execution Plan

## 0. Document Intent
This is the final implementation baseline for Doossh.
It replaces conflicting drafts and locks architecture, data model, delivery phases, and quality gates.

Date: 2026-02-13
Owner: Architecture Baseline
Status: Approved for implementation kickoff (after Phase 0 checklist)

---

## 1. Problem and Scope
Doossh is a multi-vendor marketplace SaaS with three domains:
- Restaurant booking marketplace
- Event and club ticketing marketplace
- Party hall and venue lead marketplace

Delivery channels:
- Customer mobile app: Expo React Native
- Vendor portal: Next.js web only
- Admin panel: Next.js web
- Marketing site: Next.js web

Fixed stack:
- Frontend: Next.js, Expo, Tailwind CSS
- Backend: Supabase (Auth, Postgres, Storage, Realtime, Edge Functions)
- Payments: Razorpay
- Notifications: Firebase Cloud Messaging
- Hosting: Vercel + Supabase Cloud

Hard rules:
- Vendor equals tenant
- Multi-tenant architecture mandatory
- RLS mandatory
- Subscription billing mandatory
- Lead unlock monetization mandatory
- Booking/ticket transactions must be concurrency-safe
- UI must be implemented from provided Figma designs (no custom redesign in MVP)

---

## 2. Final Architecture Decision (Locked)
Chosen model:
- Data tenancy: pooled multi-tenant schema with `vendor_id` and strict RLS
- App model: modular monolith with domain boundaries
- Evolution path: bridge model later for premium dedicated isolation

Reasoning:
- Fastest valid MVP for one-month timeline
- Best fit for Supabase operational model
- Strong transactional correctness for booking and billing
- Keeps migration path open for future service extraction

Explicit non-goals for MVP:
- Microservices from day one
- Database-per-tenant architecture
- Advanced chat platform
- Complex recommendation and dynamic pricing engines

---

## 3. Core Design Principles
- Never map `vendor_id` directly to `auth.uid()`.
- Tenant access is resolved via `vendor_memberships`.
- Money and inventory changes must run in ACID transactions.
- Webhook processing must be idempotent and replay-safe.
- Sensitive lead contact is never exposed without paid unlock evidence.
- RLS is the primary isolation boundary, not app-layer checks alone.

### 3.1 UI Delivery Constraint (Figma-First)
- UI and UX implementation must follow provided Figma screens and flows.
- No new visual direction or redesign work in MVP.
- Use shared components and tokens to reproduce Figma quickly and consistently.
- Only usability-critical deviations are allowed, and must be approved first.
- Engineering priority is backend correctness and transaction reliability over UI polish.

---

## 4. Canonical Domain Model

Identity and tenancy:
- `profiles`
- `vendors`
- `vendor_memberships`

Marketplace:
- `restaurants`
- `clubs`
- `party_halls`
- `media_assets`
- `reviews`

Restaurant booking:
- `restaurant_time_slots`
- `bookings`

Event ticketing:
- `events`
- `ticket_types`
- `orders`
- `tickets`
- `checkins`

Lead marketplace:
- `leads`
- `lead_unlocks`

Billing:
- `payments`
- `payment_webhook_events`
- `plans`
- `subscriptions`

Operations:
- `notifications`
- `audit_logs`

Mandatory constraints:
- Foreign keys on ownership and reference edges
- Unique keys on provider payment ids and webhook event ids
- Status check constraints for all lifecycle fields
- Indexes on `vendor_id`, `customer_id`, `created_at`, and common filters

---

## 5. RLS Strategy (Baseline)
Roles:
- Customer
- Vendor member
- Admin (trusted backend path)

Rules:
- Customer:
  - Read published marketplace listings
  - Read and write only own bookings/orders/leads
- Vendor member:
  - Read/write rows where row `vendor_id` belongs to actor via `vendor_memberships`
- Admin:
  - Uses trusted server path with service role key only

Sensitive data:
- Lead contact full details shown only when a valid `lead_unlocks` row exists for that vendor

Security test requirement:
- Automated RLS test suite must include cross-tenant read and write denial tests

---

## 6. Critical Transaction Designs

### 6.1 Restaurant booking transaction
Flow:
1. Lock slot row with `FOR UPDATE`
2. Validate remaining capacity
3. Create booking and order records in one transaction
4. Commit only if integrity checks pass

Failure behavior:
- Capacity breach returns conflict response
- No partial writes

### 6.2 Event ticket purchase transaction
Flow:
1. Lock ticket type inventory row
2. Validate available quantity
3. Create order and ticket rows with QR token hash
4. Commit atomically

### 6.3 QR check-in one-time consume
Flow:
1. Resolve ticket by QR hash
2. Atomically update from unscanned to scanned state
3. Insert checkin audit row

Guarantee:
- First valid scan succeeds
- Duplicate scan returns deterministic duplicate response with no second state mutation

### 6.4 Payment webhook idempotency
Flow:
1. Verify Razorpay signature
2. Upsert webhook event key (`provider_event_id`) before side-effects
3. If duplicate, return success without re-processing business state
4. If first-seen, process payment state transition and dependent updates

### 6.5 Lead unlock entitlement
Flow:
1. Create payment intent for unlock
2. On captured payment, insert `lead_unlocks` and grant visibility
3. Enforce unique `(lead_id, vendor_id)` to prevent duplicate unlock billing

---

## 7. Service Boundaries

Authentication service:
- Auth session and actor resolution
- Role and vendor membership resolution
- Owns identity context for downstream services

Marketplace service:
- Listing CRUD
- Publish/unpublish moderation state
- Public discovery/search

Booking and ticketing service:
- Slot and inventory logic
- Booking lifecycle
- Ticket issuance and checkin

Billing service:
- Payment intents and state machine
- Webhook verification and idempotency
- Subscription lifecycle and lead unlock billing

Notification service:
- FCM dispatch and retries
- Template rendering
- Notification delivery logs

Boundary rule:
- Billing state is source of truth for monetary entitlement transitions

---

## 8. API and Contract Standards
- All external routes under `/api/v1/*`
- Unified response envelope with success/data/error contract
- Stable error codes for auth, validation, conflict, payment, and system failure
- No raw exception traces returned to clients
- Trace id must be carried through logs and error responses

---

## 9. One-Month MVP Execution Plan

### Phase 0 (Days 1-3): Bootstrap and governance
Deliver:
- Turborepo skeleton
- Shared config packages
- CI checks (lint, types, tests)
- Environment and secret management setup

Exit gate:
- Clean build and CI green

### Phase 1 (Week 1): Foundation and tenant security
Deliver:
- Auth flows and actor resolver
- Core schema and migrations
- Vendor onboarding and approval flow
- RLS baseline and isolation tests

Exit gate:
- Verified tenant isolation across at least three vendors

### Phase 2 (Week 2): Marketplace core
Deliver:
- Vendor CRUD for restaurants/clubs/party halls
- Public browse/search APIs
- Media upload and moderation
- Figma-aligned vendor and marketplace screens (no custom redesign)

Exit gate:
- Listing publish-to-discovery flow passes end-to-end

### Phase 3 (Week 3): Transaction engine
Deliver:
- Restaurant booking flow with lock-safe inventory
- Event ticket purchase and secure QR issuance
- Lead unlock payment flow
- Razorpay webhook verification and idempotency

Exit gate:
- Concurrency and webhook replay tests pass

### Phase 4 (Week 4): Governance and reliability
Deliver:
- Figma-aligned admin panel essentials
- FCM event notifications
- Reconciliation jobs and retry handlers
- Critical-path E2E suite and observability baseline

Exit gate:
- End-to-end booking, ticketing, and lead unlock paths are stable in staging

---

## 10. Perfect-First vs Simplify-First

Must be perfect from day one:
1. RLS isolation and tenant boundary enforcement
2. Webhook signature verification and idempotency
3. Booking/ticket inventory locking correctness
4. Lead unlock entitlement visibility controls
5. Financial and admin audit trails

Can be simplified for MVP:
1. Advanced analytics and BI
2. Rich chat capabilities
3. Secondary payment provider failover
4. Complex personalization and recommendation
5. Promotional pricing engine depth
6. Non-essential visual polish, animations, and custom UI experiments

---

## 11. Risk Register and Controls

Risk: cross-tenant data leak
- Control: policy-as-code and automated RLS denial test suite

Risk: duplicate payment effects
- Control: unique webhook event ids and idempotent event processor

Risk: double booking or checkin
- Control: transactional locking and concurrency testing

Risk: webhook delay or outage
- Control: reconciliation job and alerting thresholds

Risk: scope creep in MVP
- Control: strict in-scope lock and weekly gate review

---

## 12. Observability and Ops Baseline
- Structured JSON logging with trace id
- Business metrics: booking success, payment capture rate, webhook failures
- Alerts on payment failure spike and webhook backlog
- Staging environment mandatory before production rollout

---

## 13. Go-Live Gates (No Exceptions)
Gate A: Security
- RLS tests green on all tenant-owned tables

Gate B: Billing integrity
- Webhook replay, failure, and refund scenarios validated

Gate C: Inventory integrity
- Concurrency test confirms no double booking/checkin

Gate D: Reliability
- Reconciliation and alert pipelines active

Gate E: Product readiness
- Critical path E2E test suite passing in staging

Release is blocked if any gate fails.

---

## 14. Immediate Next Actions (72-Hour Plan)
1. Freeze this document as the single source of truth.
2. Initialize monorepo and CI baseline (Phase 0).
3. Implement core schema skeleton and migration workflow.
4. Draft RLS policy matrix table-by-table before feature coding.
5. Write isolation and idempotency tests before transaction endpoints.
6. Break Figma into screen checklist and map each screen to route/component ownership.
