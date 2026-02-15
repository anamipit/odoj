// src/app/admin/logout/page.tsx
// This page handles admin logout by rendering the logout action
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
    title: "Logout - ODOJ",
};

export default async function AdminLogoutPage() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
