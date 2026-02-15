// src/app/profile/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyProfile, getMyReadings } from "@/app/dashboard/actions";
import { ProfileClient } from "./profile-client";

export const metadata = {
    title: "Profil - ODOJ Ramadan Tracker",
};

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await getMyProfile();
    if (profile?.role === "admin") redirect("/admin");

    const readings = await getMyReadings();
    const totalJuz = readings.reduce((sum, r) => sum + (r.juz_obtained || 0), 0);
    const totalPages = readings.reduce((sum, r) => sum + (r.total_pages || 0), 0);

    return (
        <ProfileClient
            profile={profile}
            readings={readings}
            totalJuz={Math.round(totalJuz * 100) / 100}
            totalPages={totalPages}
        />
    );
}
