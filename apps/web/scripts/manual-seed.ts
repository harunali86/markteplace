import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../marketplace.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Seeding Vendors...');
    const { error: vError } = await supabase.from('vendors').upsert([
        { id: '11111111-1111-1111-1111-111111111111', name: 'Signature Dining Group', slug: 'signature-dining', category: 'restaurant', is_verified: true, status: 'active' },
        { id: '21111111-1111-1111-1111-111111111111', name: 'Elite Nightlife Corp', slug: 'elite-nightlife', category: 'nightclub', is_verified: true, status: 'active' },
        { id: '31111111-1111-1111-1111-111111111111', name: 'Grand Events Venues', slug: 'grand-events', category: 'party_hall', is_verified: true, status: 'active' }
    ]);
    if (vError) console.error('Vendor Error:', vError);

    console.log('Seeding Clubs...');
    const { error: cError } = await supabase.from('clubs').upsert([
        {
            id: '33333333-3333-3333-3333-333333333331',
            vendor_id: '21111111-1111-1111-1111-111111111111',
            name: 'Neon Pulse Nightclub',
            address: 'HSR Layout, Bangalore',
            description: 'The ultimate party destination with state-of-the-art sound and lighting systems.',
            is_published: true,
            music_genre: 'Electronic'
        },
        {
            id: '33333333-3333-3333-3333-333333333332',
            vendor_id: '21111111-1111-1111-1111-111111111111',
            name: 'Skyline Lounge',
            address: 'Baner, Pune',
            description: 'Breathtaking rooftop views with premium mixology and live electronic music.',
            is_published: true,
            music_genre: 'Various'
        }
    ]);
    if (cError) console.error('Club Error:', cError);

    console.log('Seeding Party Halls...');
    const { error: hError } = await supabase.from('party_halls').upsert([
        {
            id: '44444444-4444-4444-4444-444444444441',
            vendor_id: '31111111-1111-1111-1111-111111111111',
            name: 'Emerald Ballroom',
            address: 'Gachibowli, Hyderabad',
            capacity: 500,
            description: 'A majestic ballroom perfect for grand weddings and corporate galas.',
            is_published: true
        },
        {
            id: '44444444-4444-4444-4444-444444444442',
            vendor_id: '31111111-1111-1111-1111-111111111111',
            name: 'Royal Celebration Hall',
            address: 'Salt Lake, Kolkata',
            capacity: 300,
            description: 'Elegant venue with customizable decor and premium catering.',
            is_published: true
        }
    ]);
    if (hError) console.error('Hall Error:', hError);

    console.log('Seeding Events...');
    const { error: eError } = await supabase.from('events').upsert([
        {
            id: '55555555-5555-5555-5555-555555555551',
            vendor_id: '21111111-1111-1111-1111-111111111111',
            title: 'Friday Night Fever',
            description: 'The biggest EDM night of the week.',
            start_date: new Date(Date.now() + 86400000 * 2).toISOString(),
            end_date: new Date(Date.now() + 86400000 * 2.2).toISOString(),
            is_published: true
        },
        {
            id: '55555555-5555-5555-5555-555555555552',
            vendor_id: '21111111-1111-1111-1111-111111111111',
            title: 'Techno Takeover',
            description: 'Deep house and techno beats till dawn.',
            start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
            end_date: new Date(Date.now() + 86400000 * 5.2).toISOString(),
            is_published: true
        }
    ]);
    if (eError) console.error('Event Error:', eError);

    console.log('Seeding Completed!');
}

seed();
