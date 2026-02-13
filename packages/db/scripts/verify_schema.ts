import { resolve } from "path";
import postgres from "postgres"; // @ts-ignore
import * as dotenv from "dotenv";

dotenv.config({ path: resolve(__dirname, "../../../marketplace.env") });

const sql = postgres(process.env.DATABASE_URL!);

async function main() {
    try {
        const result = await sql`SELECT to_regclass('public.restaurants') as table_exists`;
        console.log("Table check:", result[0]);
        if (!result[0].table_exists) throw new Error("Restaurants table missing");
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await sql.end();
    }
}
main();
