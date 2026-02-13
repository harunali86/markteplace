import { resolve } from "path";
import postgres from "postgres"; // @ts-ignore
import * as dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config({ path: resolve(__dirname, "../../../marketplace.env") });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
    console.log("📦 Applying Storage & Schema Migration...");

    try {
        // 1. Add cover_image to restaurants
        console.log("   - Adding cover_image column to restaurants...");
        await sql`
            alter table public.restaurants 
            add column if not exists cover_image text;
        `;

        // 2. Read and execute SUPABASE_STORAGE.sql
        const storageSqlPath = resolve(__dirname, "../SUPABASE_STORAGE.sql");
        const storageSqlContent = fs.readFileSync(storageSqlPath, "utf-8");

        // Split by statement (basic) or just run if simple
        // Postgres.js can run multiple statements in one `file` call or we can just pass the string
        // But the simple template string might not handle multiple statements well if they have semi-colons and logic
        // Let's use `sql.file` if available or just raw string.
        console.log("   - Setting up Storage Buckets...");
        await sql.unsafe(storageSqlContent);

        console.log("✅ Migration Complete.");
    } catch (e) {
        console.error("❌ Migration Failed:", e);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

main();
