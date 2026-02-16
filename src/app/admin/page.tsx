// src/app/admin/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminProfile, getStudentList, getReadingsEnabled } from "./actions";
import { getAllReadingsAggregated } from "./queries";
import { AdminDashboardClient } from "./admin-client";

export const metadata = {
    title: "Admin Dashboard - ODOJ Ramadan Tracker",
};

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await getAdminProfile();

    if (!profile || profile.role !== "admin") {
        redirect("/dashboard");
    }

    const aggregatedData = await getAllReadingsAggregated();
    const students = await getStudentList();
    const readingsEnabled = await getReadingsEnabled();

    return (
        <AdminDashboardClient
            profile={profile}
            aggregatedData={aggregatedData}
            initialStudents={students}
            readingsEnabled={readingsEnabled}
        />
    );
}
