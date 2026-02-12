# Doossh System Design and Implementation Plan (v2)

## 1. Goal and Product Scope
Build a multi-vendor marketplace platform connecting customers with restaurants, clubs, and party halls.

Primary business lines:
- Restaurant discovery and table booking
- Club event publishing and ticket sales
- Party hall lead marketplace with paid lead unlock

Personas:
- Customer: discover, book, buy tickets, submit hall requirements
- Vendor: manage listings, inventory, bookings, tickets, leads
- Super Admin: approve vendors, govern platform, monitor finance and abuse

## 2. MVP Boundary (What ships first)
In scope for MVP:
- Auth and onboarding for customer/vendor/admin
- Vendor onboarding with KYC doc upload and approval workflow
- Listing CRUD for restaurants, clubs, party halls
- Restaurant booking flow
- Club event ticketing with secure QR validation
- Party hall lead creation and paid lead unlock
- Razorpay payment integration with webhook reconciliation
- Admin panel for moderation, approvals, and core reports

Out of scope for MVP (post-MVP):
- Full chat system
- Dynamic pricing engine
- Advanced BI dashboards
- Multi-country tax engine

## 3. Final Architecture Decisions

### 3.1 Monorepo
Use Turborepo with clear app and package boundaries.

```text
apps/
  web/            # Next.js 15 (Vendor Dashboard, Admin, Marketing)
  mobile/         # Expo React Native (Customer app)
packages/
  ui/             # Shared UI components and theme tokens
  contracts/      # Zod schemas, API DTOs, shared types
  db/             # SQL migrations, generated types, seeds
  config/         # ESLint, TypeScript, Prettier shared configs
```

### 3.2 Backend Platform
Use Supabase as primary backend:
- Postgres database with Row Level Security (RLS)
- Supabase Auth for identity
- Supabase Storage for media
- Supabase Edge Functions for privileged logic and webhooks

No Prisma in MVP. Use SQL migrations plus generated database types to avoid dual schema drift.

### 3.3 Hosting and Infra
- Web: Vercel
- Database/Auth/Storage: Supabase Cloud
- CDN and WAF: Cloudflare
- Notifications: FCM for mobile push

## 4. Multi-Tenant Identity Model (Critical)
Do not map `tenant_id` directly to `auth.uid()`.

Canonical identity mapping:
- `auth.users.id` -> authenticated user id
- `profiles.id` references `auth.users.id`
- `vendors.id` is tenant id
- `vendor_memberships(user_id, vendor_id, role)` defines which vendor(s) a user can operate

All vendor-owned rows must carry `vendor_id`.
RLS checks membership via `EXISTS` on `vendor_memberships`.

## 5. Core Data Model

Core tables:
- `profiles` (id, role, phone, email, is_active)
- `vendors` (id, business_name, status, subscription_tier, is_verified)
- `vendor_memberships` (user_id, vendor_id, membership_role)
- `restaurants`, `clubs`, `party_halls` (all include `vendor_id`)
- `menus`, `events`
- `bookings` (restaurant bookings)
- `tickets` (event ticket units)
- `leads` (party hall requirements)
- `lead_unlocks` (immutable unlock audit)
- `payments` (gateway transactions and state)
- `subscriptions`
- `reviews`, `notifications`
- `audit_logs` (security and finance sensitive actions)

Mandatory constraints:
- Foreign keys on all relationships
- Unique indexes for external ids (`gateway_payment_id`, `webhook_event_id`)
- Check constraints for status enums
- Created/updated timestamps on all mutable tables

## 6. RLS Policy Matrix

Policy intent by role:
- Customer:
  - Read public listings and own orders/tickets/leads
  - Create own bookings, tickets purchase intents, and leads
- Vendor member:
  - Read/write only rows where row `vendor_id` belongs to a vendor in `vendor_memberships` for `auth.uid()`
- Admin:
  - Use server-side service role only in trusted backend code
  - Never expose service role key to client apps

Sensitive field control:
- Lead contact fields stay masked for vendors until paid unlock exists in `lead_unlocks`

## 7. API and Error Standards

Route and versioning:
- All external APIs under `/api/v1/*`

Response envelope:

```ts
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};
```

Error rules:
- No raw exceptions returned to client
- Standard error codes (`AUTH_REQUIRED`, `FORBIDDEN`, `VALIDATION_ERROR`, `CONFLICT`, `PAYMENT_FAILED`)
- Include `traceId` in error responses and logs

## 8. Payments and Monetization Flows

### 8.1 Payment methods
MVP gateway: Razorpay.
Future optional: Stripe as secondary provider.

### 8.2 Mandatory payment flow controls
- Create internal payment intent row before gateway call
- Verify webhook signatures
- Idempotent webhook handling using unique `webhook_event_id`
- State machine: `pending -> authorized -> captured` or `failed` or `refunded`
- Reconciliation job to catch missed webhook events

### 8.3 Lead unlock business flow
- Vendor initiates unlock for a lead
- System charges unlock fee
- On confirmed capture, insert `lead_unlocks` row in transaction
- Contact fields become visible only if unlock record exists
- Unlock event logged in `audit_logs`

## 9. QR Ticket Security Design

Ticket QR requirements:
- QR payload includes signed token (jti, ticket_id, event_id, exp)
- Store token hash server-side; never trust client payload alone
- Gate scan endpoint performs atomic validation and consume
- One-time consumption enforced via transaction and row lock
- Duplicate scan returns explicit `ALREADY_USED`

## 10. Security, Privacy, and Compliance

API security baseline:
- Input validation with Zod on all writes
- Rate limits by route class (public, auth, vendor)
- Strict CORS allowlist
- Security headers (HSTS, no-sniff, frame protection)

Data privacy baseline:
- Do not log phone/email/password/OTP
- Mask sensitive fields in operational logs
- Keep audit trail for admin actions and financial actions

Retention baseline:
- Define retention for logs, leads, and payment artifacts before launch
- Add scheduled cleanup jobs with legal-safe windows

## 11. Performance and Reliability

Database:
- Index all foreign keys and common filter columns
- Use transactions for all multi-step money/inventory operations
- Use `SELECT ... FOR UPDATE` for ticket inventory decrement

Caching:
- Cache heavy public reads (listing/search) with bounded TTL
- Purge cache on listing updates

Async jobs:
- Use Edge Functions for webhook and background reconciliation jobs in MVP
- Move to dedicated queue worker only when load requires

## 12. Observability and Operations

Logging and tracing:
- Structured JSON logs (pino)
- Required fields: timestamp, level, traceId, userId, route, outcome

Monitoring:
- API latency p95 and error rates
- Payment success ratio and webhook failure alerts
- Ticket scan conflict rates

Incident readiness:
- Runbook for payment webhook outage
- Runbook for QR validation degradation

## 13. Delivery Plan (Realistic)

Phase 0 (2-3 days): Project bootstrap
- Turborepo init, shared configs, env strategy, CI skeleton

Phase 1 (Week 1): Foundation
- Auth, roles, vendor memberships, base schema, RLS baseline

Phase 2 (Week 2): Listings and discovery
- Vendor listing CRUD, public browse APIs, media upload

Phase 3 (Week 3): Transactions
- Restaurant booking, club ticketing, party-hall lead capture
- Razorpay integration with webhook idempotency

Phase 4 (Week 4): Governance and hardening
- Admin moderation panel
- Audit logs, rate limits, observability dashboards
- E2E tests for critical paths

Optional Phase 5 (Week 5-6): Mobile parity and polish
- Deep mobile UX polish, push campaigns, advanced reports

## 14. Create-Turbo Green-Light Checklist
Initialization can proceed when these are accepted:
- Final stack locked (Supabase-first, no Prisma in MVP)
- RLS identity model approved (`vendor_memberships` based)
- Payment and webhook idempotency design approved
- QR one-time validation design approved
- MVP scope accepted without post-MVP leakage

If all checklist items are accepted, proceed with `create-turbo` and start Phase 0.
