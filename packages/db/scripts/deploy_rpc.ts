import { resolve } from "path";
import { readFileSync } from "fs";
import postgres from "postgres"; // @ts-ignore
import * as dotenv from "dotenv";

// Load environment variables from root marketplace.env
dotenv.config({ path: resolve(__dirname, "../../../marketplace.env") });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ DATABASE_URL is missing in marketplace.env");
    process.exit(1);
}

const sql = postgres(connectionString);

async function main() {
    try {
        console.log("🚀 Connecting to Supabase...");

        const schemaPath = resolve(__dirname, "../SUPABASE_RPC.sql");
        const schemaSql = readFileSync(schemaPath, "utf-8");

        console.log("📜 Applying RPCs...");

        // Execute raw SQL
        await sql.unsafe(schemaSql);

        console.log("✅ RPCs applied successfully!");
    } catch (error) {
        console.error("❌ RPC Deployment failed:", error);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

main();
