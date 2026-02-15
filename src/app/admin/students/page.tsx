// src/app/admin/students/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminProfile, getStudentList } from "../actions";
import { StudentsListClient } from "./students-client";

export const metadata = {
    title: "Daftar Siswa - ODOJ Admin",
};

export default async function StudentsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const profile = await getAdminProfile();
    if (!profile || profile.role !== "admin") redirect("/dashboard");

    const students = await getStudentList();

    return <StudentsListClient students={students} />;
}
