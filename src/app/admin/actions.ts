// src/app/admin/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";



export async function getStudentList(classFilter?: string) {
    const supabase = await createClient();

    // Get all profiles with role='student'
    let profileQuery = supabase
        .from("profiles")
        .select("id, full_name, class_name, role")
        .eq("role", "student")
        .order("class_name", { ascending: true });

    if (classFilter && classFilter !== "all") {
        profileQuery = profileQuery.like("class_name", `${classFilter}-%`);
    }

    const { data: profiles, error: profileError } = await profileQuery;

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return [];
    }

    // Get all readings
    const { data: readings, error: readingError } = await supabase
        .from("readings")
        .select("user_id, total_pages, juz_obtained");

    if (readingError) {
        console.error("Error fetching readings:", readingError);
        return [];
    }

    // Aggregate readings per user
    const userTotals = new Map<string, { pages: number; juz: number }>();
    (readings || []).forEach((r) => {
        const current = userTotals.get(r.user_id) || { pages: 0, juz: 0 };
        current.pages += r.total_pages;
        current.juz += r.juz_obtained;
        userTotals.set(r.user_id, current);
    });

    return (profiles || []).map((p) => {
        const totals = userTotals.get(p.id) || { pages: 0, juz: 0 };
        return {
            id: p.id,
            fullName: p.full_name,
            className: p.class_name,
            totalPages: totals.pages,
            totalJuz: Math.round(totals.juz * 100) / 100,
        };
    });
}

export async function getStudentReadings(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: true });

    if (error) {
        console.error("Error fetching student readings:", error);
        return [];
    }

    return data || [];
}

export async function getAdminProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return data;
}

/**
 * Check if reading input is currently enabled.
 * Used by both admin dashboard (to show toggle state) and reading form (to gate submissions).
 */
export async function getReadingsEnabled(): Promise<boolean> {
    const supabase = await createClient();
    const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "readings_enabled")
        .single();

    // Default to true if setting doesn't exist yet
    return data?.value !== "false";
}

/**
 * Toggle reading input on/off. Admin-only (enforced by RLS).
 */
export async function toggleReadingsEnabled(): Promise<{ enabled: boolean; error?: string }> {
    const supabase = await createClient();

    // Verify admin role server-side
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { enabled: false, error: "Unauthorized" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (profile?.role !== "admin") return { enabled: false, error: "Forbidden" };

    // Get current value
    const current = await getReadingsEnabled();
    const newValue = !current;

    const { error } = await supabase
        .from("app_settings")
        .update({ value: String(newValue), updated_at: new Date().toISOString() })
        .eq("key", "readings_enabled");

    if (error) {
        console.error("Error toggling readings:", error);
        return { enabled: current, error: error.message };
    }

    return { enabled: newValue };
}
