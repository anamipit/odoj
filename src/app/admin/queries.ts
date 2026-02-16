import { createClient } from "@/lib/supabase/server";


export async function getAllReadingsAggregated() {
    const supabase = await createClient();

    // Get all readings, aggregated by date
    const { data, error } = await supabase
        .from("readings")
        .select("date, total_pages")
        .order("date", { ascending: true });

    if (error) {
        console.error("Error fetching aggregated readings:", error);
        return [];
    }

    // Group by date and sum pages
    const dailyMap = new Map<string, number>();
    (data || []).forEach((r) => {
        const current = dailyMap.get(r.date) || 0;
        dailyMap.set(r.date, current + r.total_pages);
    });

    return Array.from(dailyMap.entries()).map(([date, totalPages]) => ({
        date,
        totalPages,
    }));
}
