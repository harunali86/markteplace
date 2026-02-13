import { z } from "zod";

// 1. Enums
export const UserRoleEnum = z.enum(["customer", "vendor_admin", "super_admin"]);
export const VendorCategoryEnum = z.enum(["restaurant", "nightclub", "party_hall", "activity"]);
export const VendorRoleEnum = z.enum(["owner", "manager", "staff"]);

// 2. Profile Schema
export const profileSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email().optional(),
    full_name: z.string().optional(),
    avatar_url: z.string().url().optional(),
    role: UserRoleEnum.default("customer"),
    phone: z.string().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type Profile = z.infer<typeof profileSchema>;

// 3. Vendor Schema
export const vendorSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
    logo_url: z.string().url().optional(),
    category: VendorCategoryEnum,
    is_verified: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type Vendor = z.infer<typeof vendorSchema>;

// 4. Vendor Membership Schema
export const vendorMembershipSchema = z.object({
    id: z.string().uuid(),
    vendor_id: z.string().uuid(),
    user_id: z.string().uuid(),
    role: VendorRoleEnum.default("staff"),
    created_at: z.string().datetime().optional(),
});
export type VendorMembership = z.infer<typeof vendorMembershipSchema>;

// 5. Restaurant Schema
export const restaurantSchema = z.object({
    id: z.string().uuid(),
    vendor_id: z.string().uuid(),
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    address: z.string().optional(),
    cover_image: z.string().url().optional().or(z.literal("")),
    cuisine_type: z.string().optional(),
    price_range: z.enum(["$", "$$", "$$$", "$$$$"]).optional(),
    is_published: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type Restaurant = z.infer<typeof restaurantSchema>;

export const createRestaurantSchema = restaurantSchema.omit({ id: true, created_at: true, updated_at: true });
export const updateRestaurantSchema = restaurantSchema.omit({ created_at: true, updated_at: true });

// 6. Restaurant Time Slots
export const restaurantTimeSlotSchema = z.object({
    id: z.string().uuid(),
    restaurant_id: z.string().uuid(),
    day_of_week: z.number().min(0).max(6), // 0=Sunday
    start_time: z.string(), // "HH:MM"
    end_time: z.string(),
    capacity: z.number().int().positive(),
    created_at: z.string().datetime().optional(),
});
export type RestaurantTimeSlot = z.infer<typeof restaurantTimeSlotSchema>;

// 7. Bookings
export const bookingStatusEnum = z.enum(["pending", "confirmed", "cancelled", "completed"]);
export const bookingSchema = z.object({
    id: z.string().uuid(),
    vendor_id: z.string().uuid(),
    restaurant_id: z.string().uuid(),
    user_id: z.string().uuid(),
    slot_id: z.string().uuid(),
    guest_count: z.number().int().positive(),
    status: bookingStatusEnum.default("pending"),
    payment_id: z.string().uuid().optional(),
    booking_date: z.string(), // ISO Date
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type Booking = z.infer<typeof bookingSchema>;

// 8. Events (Clubs)
export const eventSchema = z.object({
    id: z.string().uuid(),
    vendor_id: z.string().uuid(),
    name: z.string().min(2),
    description: z.string().optional(),
    cover_image: z.string().url().optional(),
    event_date: z.string().datetime(),
    location: z.string().optional(),
    is_published: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type ClubEvent = z.infer<typeof eventSchema>;

// 9. Ticket Types
export const ticketTypeSchema = z.object({
    id: z.string().uuid(),
    event_id: z.string().uuid(),
    name: z.string(),
    price: z.number().nonnegative(),
    capacity: z.number().int().positive(),
    sold_count: z.number().int().default(0),
    created_at: z.string().datetime().optional(),
});
export type TicketType = z.infer<typeof ticketTypeSchema>;

// 10. Orders & Tickets
export const orderStatusEnum = z.enum(["pending", "paid", "failed", "refunded"]);
export const orderSchema = z.object({
    id: z.string().uuid(),
    user_id: z.string().uuid(),
    total_amount: z.number().nonnegative(),
    status: orderStatusEnum.default("pending"),
    payment_id: z.string().uuid().optional(),
    created_at: z.string().datetime().optional(),
});
export type Order = z.infer<typeof orderSchema>;

export const ticketSchema = z.object({
    id: z.string().uuid(),
    order_id: z.string().uuid(),
    ticket_type_id: z.string().uuid(),
    qr_hash: z.string(),
    is_scanned: z.boolean().default(false),
    scanned_at: z.string().datetime().optional(),
    created_at: z.string().datetime().optional(),
});
export type Ticket = z.infer<typeof ticketSchema>;

// 11. Leads (Party Halls)
export const leadStatusEnum = z.enum(["new", "contacted", "closed", "lost"]);
export const leadSchema = z.object({
    id: z.string().uuid(),
    vendor_id: z.string().uuid().optional(),
    customer_name: z.string().min(2),
    customer_email: z.string().email(),
    customer_phone: z.string(),
    event_type: z.string().optional(),
    guest_count: z.number().int().optional(),
    requirement_details: z.string().optional(),
    budget_range: z.string().optional(),
    event_date: z.string().optional(),
    status: leadStatusEnum.default("new"),
    is_verified: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type Lead = z.infer<typeof leadSchema>;

export const createLeadSchema = leadSchema.omit({ id: true, created_at: true, updated_at: true, is_verified: true, status: true });

export const leadUnlockSchema = z.object({
    id: z.string().uuid(),
    lead_id: z.string().uuid(),
    vendor_id: z.string().uuid(),
    payment_id: z.string().uuid().optional(),
    created_at: z.string().datetime().optional(),
});
export type LeadUnlock = z.infer<typeof leadUnlockSchema>;

// 12. Payments
export const paymentProviderEnum = z.enum(["razorpay", "stripe"]);
export const paymentStatusEnum = z.enum(["pending", "captured", "failed", "refunded"]);
export const paymentSchema = z.object({
    id: z.string().uuid(),
    amount: z.number().positive(),
    currency: z.string().default("INR"),
    provider: paymentProviderEnum.default("razorpay"),
    provider_payment_id: z.string().optional(),
    provider_order_id: z.string().optional(),
    status: paymentStatusEnum.default("pending"),
    user_id: z.string().uuid(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});
export type Payment = z.infer<typeof paymentSchema>;

export const paymentWebhookEventSchema = z.object({
    id: z.string().uuid(),
    provider: paymentProviderEnum,
    event_id: z.string(), // provider's unique event id
    payload: z.any(),
    processed: z.boolean().default(false),
    created_at: z.string().datetime().optional(),
});
export type PaymentWebhookEvent = z.infer<typeof paymentWebhookEventSchema>;


// Database Type Definition
export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: Profile;
                Insert: z.input<typeof profileSchema>;
                Update: Partial<z.input<typeof profileSchema>>;
            };
            vendors: {
                Row: Vendor;
                Insert: z.input<typeof vendorSchema>;
                Update: Partial<z.input<typeof vendorSchema>>;
            };
            vendor_memberships: {
                Row: VendorMembership;
                Insert: z.input<typeof vendorMembershipSchema>;
                Update: Partial<z.input<typeof vendorMembershipSchema>>;
            };
            restaurants: {
                Row: Restaurant;
                Insert: z.input<typeof restaurantSchema>;
                Update: Partial<z.input<typeof restaurantSchema>>;
            };
            restaurant_time_slots: {
                Row: RestaurantTimeSlot;
                Insert: z.input<typeof restaurantTimeSlotSchema>;
                Update: Partial<z.input<typeof restaurantTimeSlotSchema>>;
            };
            bookings: {
                Row: Booking;
                Insert: z.input<typeof bookingSchema>;
                Update: Partial<z.input<typeof bookingSchema>>;
            };
            events: {
                Row: ClubEvent;
                Insert: z.input<typeof eventSchema>;
                Update: Partial<z.input<typeof eventSchema>>;
            };
            ticket_types: {
                Row: TicketType;
                Insert: z.input<typeof ticketTypeSchema>;
                Update: Partial<z.input<typeof ticketTypeSchema>>;
            };
            orders: {
                Row: Order;
                Insert: z.input<typeof orderSchema>;
                Update: Partial<z.input<typeof orderSchema>>;
            };
            tickets: {
                Row: Ticket;
                Insert: z.input<typeof ticketSchema>;
                Update: Partial<z.input<typeof ticketSchema>>;
            };
            leads: {
                Row: Lead;
                Insert: z.input<typeof leadSchema>;
                Update: Partial<z.input<typeof leadSchema>>;
            };
            lead_unlocks: {
                Row: LeadUnlock;
                Insert: z.input<typeof leadUnlockSchema>;
                Update: Partial<z.input<typeof leadUnlockSchema>>;
            };
            payments: {
                Row: Payment;
                Insert: z.input<typeof paymentSchema>;
                Update: Partial<z.input<typeof paymentSchema>>;
            };
            payment_webhook_events: {
                Row: PaymentWebhookEvent;
                Insert: z.input<typeof paymentWebhookEventSchema>;
                Update: Partial<z.input<typeof paymentWebhookEventSchema>>;
            };
            audit_logs: {
                Row: any; // Simplified for now
                Insert: any;
                Update: any;
            };
            notifications: {
                Row: any;
                Insert: any;
                Update: any;
            };
        };
    };
}
