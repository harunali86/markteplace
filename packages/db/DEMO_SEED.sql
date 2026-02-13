-- Doossh Demo Seeding (Indian Context)
-- Verifying Vendors first
UPDATE public.vendors SET is_verified = true, status = 'active';

-- 1. SEED RESTAURANTS
INSERT INTO public.restaurants (vendor_id, name, description, address, cuisine_type, price_range, is_published, cover_image)
VALUES 
('66a643cb-fce8-46fa-a301-89d0ceeb71e6', 'The Spice Route', 'An architectural masterpiece serving authentic Pan-Asian cuisine with a modern twist.', 'Imperial Hotel, Janpath, New Delhi', 'Pan-Asian', '$$$$', true, 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4'),
('4c5bc57b-9b33-4b87-b726-9c6d7e30f0ee', 'Peshawri Dine', 'Experience the rustic charm of the North-West Frontier with succulent kebabs and dal bukhara.', 'ITC Maratha, Sahar Road, Mumbai', 'North Indian', '$$$', true, 'https://images.unsplash.com/photo-1552566626-52f8b828add9'),
('14329f97-0314-4462-8980-ea99308d1f79', 'Coastal Curry', 'Fresh seafood and traditional recipes from the Konkan coast in a breezy, tropical setting.', 'Indiranagar 100ft Road, Bangalore', 'Coastal Indian', '$$', true, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0');

-- 2. SEED CLUBS
INSERT INTO public.clubs (vendor_id, name, description, address, music_genre, entry_fee, is_published)
VALUES 
('ab27faf3-faed-4814-9963-02f8120dd8dd', 'Mirage Nightlife', 'The ultimate high-energy destination with world-class light shows and international DJs.', 'Koramangala 5th Block, Bangalore', 'EDM & Techno', 2500, true),
('52d3eb13-2e1f-4eea-9183-d1b8bf2fd5e3', 'Prism Club & Kitchen', 'Hyderabad''s largest nightclub featuring massive LED walls and a state-of-the-art sound system.', 'Financial District, Gachibowli, Hyderabad', 'Multi-Genre', 3000, true);

-- 3. SEED PARTY HALLS
INSERT INTO public.party_halls (vendor_id, name, description, address, capacity, price_per_hour, is_published)
VALUES 
('66a643cb-fce8-46fa-a301-89d0ceeb71e6', 'Royal Orchid Banquet', 'A grand pillar-less hall perfect for luxury weddings and corporate galas.', 'Old Airport Road, Bangalore', 500, 15000, true),
('ab27faf3-faed-4814-9963-02f8120dd8dd', 'Signature Grand Hall', 'Modern elegance meets tradition. Fully customizable lighting and gourmet catering.', 'Janakpuri, West Delhi', 800, 25000, true);

-- 4. SEED SOME OPEN LEADS
INSERT INTO public.leads (customer_name, customer_phone, customer_email, requirement_details, event_date, budget_range, is_verified, status)
VALUES 
('Rahul Sharma', '+91 98765 43210', 'rahul.s@gmail.com', 'Looking for a wedding venue for 400 guests with indoor and outdoor options.', '2026-11-15', '5L - 8L', true, 'open'),
('Priya Verma', '+91 88776 65544', 'priya.v@outlook.com', 'Corporate annual meet. Need AV setup and dining area for 150 pax.', '2026-03-20', '1L - 2L', true, 'open');
