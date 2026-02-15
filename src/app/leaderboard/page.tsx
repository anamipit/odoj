// src/app/leaderboard/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getDailyLeaderboard, getTotalLeaderboard } from "./actions";
import { LeaderboardClient } from "./leaderboard-client";

export const metadata = {
    title: "Leaderboard - ODOJ Ramadan Tracker",
};

export default async function LeaderboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Get user role for bottom nav
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    const [daily, total] = await Promise.all([
        getDailyLeaderboard(),
        getTotalLeaderboard(),
    ]);

    return <LeaderboardClient dailyData={daily} totalData={total} userRole={profile?.role || "student"} />;
}
