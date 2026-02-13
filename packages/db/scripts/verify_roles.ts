import { resolve } from "path";
import postgres from "postgres"; // @ts-ignore
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(__dirname, "../../../marketplace.env") });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
    try {
        console.log("🔍 Verifying Auth Roles policies...");

        // 1. Check if Function exists and has correct definition
        const rpcDef = await sql`
            select prosrc from pg_proc where proname = 'create_vendor';
        `;

        if (rpcDef.length === 0) {
            throw new Error("❌ create_vendor RPC not found!");
        }

        const source = rpcDef[0].prosrc;
        if (!source.includes("update public.profiles")) {
            throw new Error("❌ RPC does not contain profile role update logic!");
        }

        if (!source.includes("role = 'vendor_admin'")) {
            throw new Error("❌ RPC does not set role to 'vendor_admin'!");
        }

        console.log("✅ RPC Definition verified: Promotes user to 'vendor_admin'.");

    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await sql.end();
    }
}
main();
