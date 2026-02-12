# Doossh Final Improvement Plan

## 1. Objective
Create one execution-ready architecture and delivery plan that is:
- fast enough for a 1-month MVP
- safe for multi-tenant data isolation
- reliable for booking and payments
- maintainable for long-term scaling

This plan is the final baseline for implementation kickoff.

---

## 2. Final Architecture Decision (Locked)

### 2.1 Chosen model
- Tenancy model: **Pooled multi-tenant with strict RLS**
- Application model: **Modular monolith** with clear domain boundaries
- Evolution path: **Bridge isolation** for premium tenants in future

### 2.2 Why this model is final
- Marketplace requires cross-vendor discovery and search from day one.
- Supabase stack aligns naturally with pooled tenancy + RLS.
- Booking and billing need transactional integrity that is easier in one backend surface.
- Delivers fastest MVP without blocking long-term scalability.

---

## 3. Improvements Applied Over Previous Drafts

### 3.1 Consistency fixes
- Standardized tenant membership entity name to: `vendor_memberships`
- Standardized tenant entity name to: `vendors`
- Removed mixed naming (`tenant_members` vs `vendor_memberships`) from baseline

### 3.2 Security hardening decisions
- Explicit rule: never map `vendor_id` directly to `auth.uid()`
- Tenant access is resolved through `vendor_memberships`
- Service role usage is backend-only and never exposed to clients

### 3.3 Billing correctness upgrades
- Added webhook idempotency store (`payment_webhook_events`)
- Added unique provider event keys and replay-safe processing
- Added reconciliation job requirement for missed/failed webhooks

### 3.4 Booking and ticket safety upgrades
- Added row-locking requirement for booking/ticket inventory
- Added one-time QR consume flow with duplicate-scan response contract

### 3.5 Delivery discipline upgrades
- Added phase-wise exit criteria
- Added critical-path test gates for money and inventory flows
- Added CI/CD and branch governance setup in bootstrap

---

## 4. Canonical Service Boundaries

## 4.1 Authentication Service
Responsibilities:
- session handling
- role resolution
- tenant membership resolution

Owns:
- `profiles`, `vendor_memberships`

Contract:
- returns `user_id`, `role`, `allowed_vendor_ids`

## 4.2 Marketplace Service
Responsibilities:
- listing CRUD (restaurants, clubs, party halls)
- publish/unpublish moderation states
- public browse/search APIs

Owns:
- listing and media entities

Contract:
- public APIs only return publishable data

## 4.3 Booking and Ticketing Service
Responsibilities:
- restaurant reservations
- event order and ticket issuance
- QR validation and check-in

Owns:
- `bookings`, `orders`, `tickets`, `checkins`

Contract:
- inventory updates must be transactional and lock-protected

## 4.4 Billing Service
Responsibilities:
- payment intents and status transitions
- webhook verification and idempotent processing
- subscriptions and lead unlock billing

Owns:
- `payments`, `payment_webhook_events`, `subscriptions`, `lead_unlocks`

Contract:
- billing state is source of truth for entitlements/unlocks

## 4.5 Notification Service
Responsibilities:
- FCM push orchestration
- retry/delivery status tracking
- template-based event notifications

Owns:
- notification and delivery logs

Contract:
- notification failures never rollback successful transactions

---

## 5. Canonical Data Model (MVP)

Identity and tenancy:
- `profiles`
- `vendors`
- `vendor_memberships`

Marketplace:
- `restaurants`, `clubs`, `party_halls`
- `media_assets`, `reviews`

Booking and ticketing:
- `events`, `ticket_types`
- `bookings`, `orders`, `tickets`, `checkins`

Leads and monetization:
- `leads`, `lead_unlocks`

Billing:
- `payments`, `payment_webhook_events`
- `plans`, `subscriptions`

Operations:
- `notifications`, `audit_logs`

Mandatory constraints:
- foreign keys on ownership and relationship edges
- unique keys for external payment ids and webhook event ids
- enum/check constraints for state fields
- indexes for `vendor_id`, `customer_id`, `event_id`, `created_at`

---

## 6. RLS Policy Baseline

Customer:
- can read public listings
- can read/write own bookings/orders/leads

Vendor member:
- can read/write rows only for authorized vendors via `vendor_memberships`

Admin:
- privileged operations via backend-only trusted path

Sensitive data policy:
- lead contact details are masked until paid unlock exists

Mandatory verification:
- RLS unit tests must validate cross-tenant denial cases

---

## 7. 1-Month MVP Execution Plan

### Phase 0 (Days 1-3): Bootstrap and Governance
Deliverables:
- Turborepo scaffold
- shared lint/type/test config
- CI pipeline (PR checks)
- branch policy and pre-commit hooks

Exit criteria:
- monorepo builds successfully
- CI passes lint, typecheck, and tests

### Phase 1 (Week 1): Identity and Tenancy Foundation
Deliverables:
- auth flows for customer/vendor/admin
- `vendors` + `vendor_memberships` model
- baseline schema + RLS policies
- vendor onboarding and approval

Exit criteria:
- tenant isolation test suite passes

### Phase 2 (Week 2): Marketplace Core
Deliverables:
- vendor listing CRUD
- public listing and search APIs
- media upload and moderation state

Exit criteria:
- listing publish to public discoverability flow passes end-to-end

### Phase 3 (Week 3): Transaction Engine
Deliverables:
- restaurant booking with lock-safe inventory
- event ticket orders and QR issuance
- lead creation and paid unlock flow
- Razorpay integration with webhook idempotency

Exit criteria:
- concurrency test prevents double booking
- webhook replay test produces no duplicate side effects

### Phase 4 (Week 4): Governance and Reliability
Deliverables:
- admin moderation panel
- FCM notifications for critical events
- reconciliation jobs and alerting
- critical-path e2e tests

Exit criteria:
- booking, ticketing, lead unlock, and payment flows pass e2e

---

## 8. Perfect First vs Simplify First

Must be perfect from day one:
1. RLS and tenant isolation correctness
2. webhook signature verification and idempotency
3. booking/ticket inventory locking
4. lead unlock entitlement checks
5. audit logging for financial/admin actions

Can be simplified in MVP:
1. advanced analytics (start with operational dashboards)
2. deep search relevance (start with indexed SQL search)
3. rich chat capabilities (defer or basic realtime)
4. secondary payment provider failover
5. complex promotions engine

---

## 9. Risk Register and Controls

Risk: cross-tenant data leak
- Control: policy-as-code + automated RLS denial tests

Risk: duplicate payment processing
- Control: unique `provider_event_id` + idempotent webhook handler

Risk: double booking/check-in
- Control: transaction + row locks + conflict test suite

Risk: delayed webhook delivery
- Control: scheduled reconciliation and retry handling

Risk: scope creep during MVP
- Control: strict in-scope/out-of-scope gate at sprint planning

---

## 10. Final Go-Live Gates (No Exceptions)

Gate A: Security
- RLS tests passing for all tenant-owned tables

Gate B: Billing integrity
- webhook replay, refund, and failure-path tests passing

Gate C: Inventory integrity
- concurrent booking/check-in tests passing

Gate D: Observability
- traceable logs for all critical money and inventory actions

Gate E: UAT
- full critical user journeys signed off

If all gates pass, proceed to production MVP release.

---

## 11. Immediate Next Action
1. Freeze this document as implementation baseline.
2. Run `create-turbo` bootstrap and start Phase 0.
3. Do not start feature coding before Gate A baseline tests are written.
