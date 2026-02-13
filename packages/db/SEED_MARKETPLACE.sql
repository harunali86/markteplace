-- Doossh Marketplace Seed Script (Fixed UUIDs)
-- Industry-Standard Demo Data for Restaurants, Clubs, and Halls

-- 1. Ensure Vendors exist for each category
INSERT INTO public.vendors (id, name, slug, category, is_verified, status)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Signature Dining Group', 'signature-dining', 'restaurant', true, 'active'),
    ('21111111-1111-1111-1111-111111111111', 'Elite Nightlife Corp', 'elite-nightlife', 'nightclub', true, 'active'),
    ('31111111-1111-1111-1111-111111111111', 'Grand Events Venues', 'grand-events', 'party_hall', true, 'active')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Restaurants
INSERT INTO public.restaurants (id, vendor_id, name, cuisine_type, address, price_range, description, cover_image, is_published)
VALUES
    ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'The Grand Curry', 'Indian Fine Dine', 'Connaught Place, Delhi', '$$$', 'Authentic North Indian flavors served in a royal setting. Specializing in Dum Pukht cuisine.', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800', true),
    ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Sushi Haven', 'Japanese', 'Lower Parel, Mumbai', '$$$$', 'Modern Japanese restaurant offering fresh sushi, sashimi, and premium sake cocktails.', 'https://images.unsplash.com/photo-1579027989536-b7b1f875659b?auto=format&fit=crop&q=80&w=800', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    cuisine_type = EXCLUDED.cuisine_type,
    address = EXCLUDED.address,
    price_range = EXCLUDED.price_range,
    description = EXCLUDED.description,
    cover_image = EXCLUDED.cover_image,
    is_published = EXCLUDED.is_published;

-- 3. Seed Clubs
INSERT INTO public.clubs (id, vendor_id, name, address, description, is_published)
VALUES
    ('33333333-3333-3333-3333-333333333331', '21111111-1111-1111-1111-111111111111', 'Neon Pulse Nightclub', 'HSR Layout, Bangalore', 'The ultimate party destination with state-of-the-art sound and lighting systems.', true),
    ('33333333-3333-3333-3333-333333333332', '21111111-1111-1111-1111-111111111111', 'Skyline Lounge', 'Baner, Pune', 'Breathtaking rooftop views with premium mixology and live electronic music.', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;

-- 4. Seed Party Halls
INSERT INTO public.party_halls (id, vendor_id, name, address, capacity, description, is_published)
VALUES
    ('44444444-4444-4444-4444-444444444441', '31111111-1111-1111-1111-111111111111', 'Emerald Ballroom', 'Gachibowli, Hyderabad', 500, 'A majestic ballroom perfect for grand weddings and corporate galas. Fully air-conditioned.', true),
    ('44444444-4444-4444-4444-444444444442', '31111111-1111-1111-1111-111111111111', 'Royal Celebration Hall', 'Salt Lake, Kolkata', 300, 'Elegant venue with customizable decor and premium catering options for intimate gatherings.', true)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    address = EXCLUDED.address,
    capacity = EXCLUDED.capacity,
    description = EXCLUDED.description,
    is_published = EXCLUDED.is_published;
