// src/app/dashboard/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { calculateReadingProgress } from "@/lib/calculate-reading";
import { SURAHS } from "@/lib/quran-metadata";
import { getReadingsEnabled } from "@/app/admin/actions";

export async function submitReading(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Anda harus login terlebih dahulu." };

    // Server-side check: is reading input currently enabled?
    const enabled = await getReadingsEnabled();
    if (!enabled) return { error: "Input bacaan sedang dinonaktifkan oleh admin." };

    const startSurah = parseInt(formData.get("start_surah") as string);
    const startAyah = parseInt(formData.get("start_ayah") as string);
    const endSurah = parseInt(formData.get("end_surah") as string);
    const endAyah = parseInt(formData.get("end_ayah") as string);

    // Validate inputs
    if ([startSurah, startAyah, endSurah, endAyah].some(isNaN)) {
        return { error: "Input tidak valid. Pastikan semua field terisi." };
    }

    // Validate surah range
    const startSurahData = SURAHS.find((s) => s.number === startSurah);
    const endSurahData = SURAHS.find((s) => s.number === endSurah);
    if (!startSurahData || !endSurahData) {
        return { error: "Surah tidak ditemukan." };
    }

    // Validate ayah range
    if (startAyah < 1 || startAyah > startSurahData.numberOfAyahs) {
        return { error: `Ayat awal harus antara 1 dan ${startSurahData.numberOfAyahs}.` };
    }
    if (endAyah < 1 || endAyah > endSurahData.numberOfAyahs) {
        return { error: `Ayat akhir harus antara 1 dan ${endSurahData.numberOfAyahs}.` };
    }

    // Validate logical order: end must be >= start
    if (endSurah < startSurah || (endSurah === startSurah && endAyah < startAyah)) {
        return { error: "Posisi akhir harus setelah posisi awal." };
    }

    try {
        const { totalPages, juzObtained } = calculateReadingProgress(
            startSurah, startAyah, endSurah, endAyah
        );

        // Calculate date in WIB (UTC+7)
        // We add 7 hours to current UTC time to get the date in Indonesia
        const wibDate = new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().split("T")[0];

        const { error } = await supabase.from("readings").insert({
            user_id: user.id,
            date: wibDate,
            start_surah: startSurah,
            start_ayah: startAyah,
            end_surah: endSurah,
            end_ayah: endAyah,
            total_pages: totalPages,
            juz_obtained: juzObtained,
        });

        if (error) return { error: error.message };
        return { success: true, totalPages, juzObtained };
    } catch (e) {
        return { error: (e as Error).message };
    }
}

export async function getMyReadings() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from("readings")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

    if (error) {
        console.error("Error fetching readings:", error);
        return [];
    }
    return data || [];
}

export async function getMyProfile() {
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

export async function updateReading(readingId: string, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Anda harus login terlebih dahulu." };

    // Verify ownership
    const { data: reading } = await supabase
        .from("readings")
        .select("user_id")
        .eq("id", readingId)
        .single();

    if (!reading || reading.user_id !== user.id) {
        return { error: "Anda tidak memiliki akses untuk mengedit bacaan ini." };
    }

    const startSurah = parseInt(formData.get("start_surah") as string);
    const startAyah = parseInt(formData.get("start_ayah") as string);
    const endSurah = parseInt(formData.get("end_surah") as string);
    const endAyah = parseInt(formData.get("end_ayah") as string);

    // Validate inputs
    if ([startSurah, startAyah, endSurah, endAyah].some(isNaN)) {
        return { error: "Input tidak valid. Pastikan semua field terisi." };
    }

    // Validate surah range
    const startSurahData = SURAHS.find((s) => s.number === startSurah);
    const endSurahData = SURAHS.find((s) => s.number === endSurah);
    if (!startSurahData || !endSurahData) {
        return { error: "Surah tidak ditemukan." };
    }

    // Validate ayah range
    if (startAyah < 1 || startAyah > startSurahData.numberOfAyahs) {
        return { error: `Ayat awal harus antara 1 dan ${startSurahData.numberOfAyahs}.` };
    }
    if (endAyah < 1 || endAyah > endSurahData.numberOfAyahs) {
        return { error: `Ayat akhir harus antara 1 dan ${endSurahData.numberOfAyahs}.` };
    }

    // Validate logical order
    if (endSurah < startSurah || (endSurah === startSurah && endAyah < startAyah)) {
        return { error: "Posisi akhir harus setelah posisi awal." };
    }

    try {
        const { totalPages, juzObtained } = calculateReadingProgress(
            startSurah, startAyah, endSurah, endAyah
        );

        const { error } = await supabase
            .from("readings")
            .update({
                start_surah: startSurah,
                start_ayah: startAyah,
                end_surah: endSurah,
                end_ayah: endAyah,
                total_pages: totalPages,
                juz_obtained: juzObtained,
            })
            .eq("id", readingId);

        if (error) return { error: error.message };
        return { success: true, totalPages, juzObtained };
    } catch (e) {
        return { error: (e as Error).message };
    }
}

export async function deleteReading(readingId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Anda harus login terlebih dahulu." };

    // Verify ownership
    const { data: reading } = await supabase
        .from("readings")
        .select("user_id")
        .eq("id", readingId)
        .single();

    if (!reading || reading.user_id !== user.id) {
        return { error: "Anda tidak memiliki akses untuk menghapus bacaan ini." };
    }

    const { error } = await supabase
        .from("readings")
        .delete()
        .eq("id", readingId);

    if (error) return { error: error.message };
    return { success: true };
}
