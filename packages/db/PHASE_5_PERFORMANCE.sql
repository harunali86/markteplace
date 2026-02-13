-- Phase 5: Performance & Indexing Optimization
-- Adhering to Rule 3.1: Index Foreign Keys & Filter Columns

-- 1. Schema Corrections
-- Add missing status column to vendors
ALTER TABLE public.vendors 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- 2. Performance Indexing
-- Payments: Optimize by status and date for Sales Analytics
CREATE INDEX IF NOT EXISTS idx_payments_status_created ON public.payments (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments (user_id);

-- Vendors: Optimize for dashboard listings and verification queue
CREATE INDEX IF NOT EXISTS idx_vendors_verified_status ON public.vendors (is_verified, status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON public.vendors (category);

-- Bookings: Optimize for vendor-specific views
CREATE INDEX IF NOT EXISTS idx_bookings_restaurant_id_date ON public.bookings (restaurant_id, booking_date DESC);

-- 3. Server-Side Aggregation (RPC)
-- Rule 2.1: Data aggregation handled on high-performance DB level
CREATE OR REPLACE FUNCTION get_admin_dashboard_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
    breakdown JSON;
BEGIN
    -- 1. Real breakdown by marketplace (aggregating from vendors joined with payments via orders)
    -- Since payments are currently simple, we use a mapping or category field if exists in payments,
    -- but usually, we join: Payments -> Orders -> Restaurants/Clubs/Halls
    -- For now, we simulate the breakdown logic based on vendor categories linked to payments
    
    SELECT json_agg(r) INTO breakdown
    FROM (
        SELECT v.category as name, SUM(p.amount) as value
        FROM payments p
        JOIN orders o ON p.id = o.payment_intent_id -- Assuming payment_intent_id links them
        JOIN vendors v ON o.vendor_id = v.id
        WHERE p.status = 'captured'
        GROUP BY v.category
    ) r;

    -- 2. Global Stats
    SELECT json_build_object(
        'totalRevenue', COALESCE(SUM(amount), 0),
        'totalTransactions', COUNT(*),
        'activeVendors', (SELECT COUNT(*) FROM vendors WHERE status = 'active'),
        'revenueBreakdown', COALESCE(breakdown, '[]'::json)
    )
    INTO result
    FROM payments
    WHERE status = 'captured';
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
