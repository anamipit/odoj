
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load env
const envPath = path.resolve(process.cwd(), ".env.local");
const envConfig = fs.existsSync(envPath)
    ? Object.fromEntries(
        fs.readFileSync(envPath, "utf-8")
            .split("\n")
            .filter(line => line && !line.startsWith("#"))
            .map(line => {
                const [key, ...val] = line.split("=");
                return [key.trim(), val.join("=").trim()];
            })
    )
    : {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || envConfig["NEXT_PUBLIC_SUPABASE_URL"];
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || envConfig["SUPABASE_SERVICE_ROLE_KEY"];

async function main() {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
        console.error("Please add SUPABASE_SERVICE_ROLE_KEY to .env.local to run this migration.");
        process.exit(1);
    }

    console.log("Initializing Supabase client...");
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    console.log("Fetching readings...");
    // Fetch all readings - handling pagination if needed, but for now assuming < 1000 or using simple range
    const { data: readings, error } = await supabase
        .from("readings")
        .select("id, date, created_at");

    if (error) {
        console.error("Error fetching readings:", error.message);
        process.exit(1);
    }

    console.log(`Found ${readings.length} readings. checking for updates...`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const reading of readings) {
        if (!reading.created_at) {
            skippedCount++;
            continue;
        }

        // Current stored date
        const currentDate = reading.date;

        // Calculate expected date (UTC+7) from created_at
        const createdAt = new Date(reading.created_at);

        // Add 7 hours to get WIB time
        // We want the date part of (UTC time + 7 hours)
        // One way: create a date object, add 7 hours, then take ISO date part
        const wibTime = new Date(createdAt.getTime() + (7 * 60 * 60 * 1000));
        const expectedDate = wibTime.toISOString().split("T")[0];

        if (currentDate !== expectedDate) {
            console.log(`Updating ID ${reading.id}: ${currentDate} -> ${expectedDate} (created_at: ${reading.created_at})`);

            const { error: updateError } = await supabase
                .from("readings")
                .update({ date: expectedDate })
                .eq("id", reading.id);

            if (updateError) {
                console.error(`Failed to update ${reading.id}:`, updateError.message);
                errorCount++;
            } else {
                updatedCount++;
            }
        } else {
            skippedCount++;
        }
    }

    console.log("Migration complete.");
    console.log(`Updated: ${updatedCount}`);
    console.log(`Skipped: ${skippedCount}`);
    console.log(`Errors: ${errorCount}`);
}

main().catch(console.error);
