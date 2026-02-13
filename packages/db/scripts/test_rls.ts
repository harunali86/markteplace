import { resolve } from "path";
import postgres from "postgres"; // @ts-ignore
import * as dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../../../marketplace.env") });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
    console.log("🔒 Starting Tenant Data Isolation Test Suite...");

    const userA_email = `test_user_a_${Date.now()}@example.com`;
    const userB_email = `test_user_b_${Date.now()}@example.com`;
    const userA_id = uuidv4();
    const userB_id = uuidv4();

    try {
        // 1. SETUP: Create Users in auth.users (requires service role / postgres admin)
        console.log("1️⃣  Creating Test Users...");
        await sql`
            insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
            values 
                (${userA_id}, ${userA_email}, 'hashed_dummy', now(), '{"full_name": "User A"}'),
                (${userB_id}, ${userB_email}, 'hashed_dummy', now(), '{"full_name": "User B"}')
        `;

        // 2. Setup Vendor for User A (Simulate Onboarding)
        console.log("2️⃣  User A creates Vendor A...");
        const vendorA_name = "Vendor A's Restaurant";

        // Execute as User A
        let vendorA_id: string = "";

        await sql.begin(async tx => {
            // Set Session Context for RLS (Use unsafe for SET LOCAL as params not supported there)
            await tx.unsafe(`set local role authenticated`);
            await tx.unsafe(`set local "request.jwt.claim.sub" = '${userA_id}'`);
            await tx.unsafe(`set local "request.jwt.claim.role" = 'authenticated'`);

            // Call RPC to create vendor
            const result = await tx`select create_vendor(${vendorA_name}, ${'slug-a-' + Date.now()}, 'restaurant') as id`;
            vendorA_id = result[0].id;

            // Create a Restaurant resource
            await tx`
                insert into public.restaurants (vendor_id, name, description, is_published)
                values (${vendorA_id}, 'The Golden Spoon', 'Best soup in town', false)
            `;
        });
        console.log(`   ✅ Created Vendor A: ${vendorA_id}`);


        // 3. User B attacks! (Tries to read/write User A's data)
        console.log("3️⃣  User B attempts to access Vendor A's data (The Attack)...");

        await sql.begin(async tx => {
            await tx.unsafe(`set local role authenticated`);
            await tx.unsafe(`set local "request.jwt.claim.sub" = '${userB_id}'`);
            await tx.unsafe(`set local "request.jwt.claim.role" = 'authenticated'`);

            // Setup User B's own vendor just to be a valid user
            await tx`select create_vendor('Vendor B', ${'slug-b-' + Date.now()}, 'nightclub')`;

            // ATTACK 1: SELECT
            const stolenData = await tx`select * from public.restaurants where vendor_id = ${vendorA_id}`;

            if (stolenData.length > 0) {
                throw new Error("🚨 SECURITY BREACH: User B could read User A's restaurants!");
            } else {
                console.log("   🛡️  Read Access Denied (Success)");
            }

            // ATTACK 2: UPDATE
            const updateResult = await tx`
                update public.restaurants 
                set name = 'HACKED BY B' 
                where vendor_id = ${vendorA_id}
                returning *
            `;

            if (updateResult.length > 0) {
                throw new Error("🚨 SECURITY BREACH: User B could update User A's restaurants!");
            } else {
                console.log("   🛡️  Update Access Denied (Success)");
            }
        });

        // 4. Verification: User A checks integrity
        console.log("4️⃣  User A checks data integrity...");
        await sql.begin(async tx => {
            await tx.unsafe(`set local role authenticated`);
            await tx.unsafe(`set local "request.jwt.claim.sub" = '${userA_id}'`);
            await tx.unsafe(`set local "request.jwt.claim.role" = 'authenticated'`);

            const myData = await tx`select name from public.restaurants where vendor_id = ${vendorA_id}`;
            if (myData[0].name !== 'The Golden Spoon') {
                throw new Error("❌ Data Integrity Failed: Name was changed unexpectedly!");
            } else {
                console.log("   ✅ Data is intact.");
            }
        });

        console.log("✅ TENANT ISOLATION TEST PASSED SUCCESSFULLY.");

    } catch (e) {
        console.error("❌ TEST FAILED:", e);
        process.exit(1);
    } finally {
        // Cleanup
        try {
            await sql`delete from auth.users where id in (${userA_id}, ${userB_id})`;
        } catch (cleanupError) {
            console.log("Cleanup warning:", cleanupError);
        }
        await sql.end();
    }
}

main();
