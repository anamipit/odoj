// src/app/profile/profile-client.tsx
"use client";

import { logout } from "@/app/auth/actions";
import { StudentBottomNav } from "@/components/bottom-nav";
import { SURAHS } from "@/lib/quran-metadata";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Reading {
    id: string;
    date: string;
    start_surah: number;
    start_ayah: number;
    end_surah: number;
    end_ayah: number;
    total_pages: number;
    juz_obtained: number;
}

interface Props {
    profile: { full_name: string; class_name: string; role: string } | null;
    readings: Reading[];
    totalJuz: number;
    totalPages: number;
}

function getSurahName(num: number) {
    return SURAHS.find((s) => s.number === num)?.englishName || `Surah ${num}`;
}

export function ProfileClient({ profile, readings, totalJuz, totalPages }: Props) {
    // Sort readings newest first for display
    const sortedReadings = [...readings].sort((a, b) => b.date.localeCompare(a.date));

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        👤 Profil
                    </h1>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Profile Card */}
                <Card className="border-emerald-100 shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3 ring-2 ring-white/40">
                            {profile?.full_name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <h2 className="text-xl font-bold">{profile?.full_name || "-"}</h2>
                        <p className="text-emerald-100 text-sm mt-1">{profile?.class_name || "-"}</p>
                    </div>
                    <CardContent className="p-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="bg-emerald-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-emerald-700">{totalJuz}</p>
                                <p className="text-xs text-emerald-600">Total Juz</p>
                            </div>
                            <div className="bg-amber-50 rounded-lg p-3">
                                <p className="text-2xl font-bold text-amber-700">{totalPages}</p>
                                <p className="text-xs text-amber-600">Total Halaman</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reading History */}
                <Card className="border-emerald-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">📋</span>
                            Riwayat Bacaan
                            <Badge variant="secondary" className="ml-auto text-xs">
                                {readings.length} entri
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0">
                        {sortedReadings.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground px-4">
                                Belum ada riwayat bacaan.
                            </div>
                        ) : (
                            <div className="divide-y">
                                {sortedReadings.map((r, i) => (
                                    <div key={r.id} className="px-4 py-3 hover:bg-emerald-50/30 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(r.date).toLocaleDateString("id-ID", {
                                                    weekday: "short",
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </span>
                                            <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200">
                                                {r.total_pages} hal · {r.juz_obtained} juz
                                            </Badge>
                                        </div>
                                        <p className="text-sm font-medium">
                                            {getSurahName(r.start_surah)}:{r.start_ayah}{" "}
                                            <span className="text-muted-foreground">→</span>{" "}
                                            {getSurahName(r.end_surah)}:{r.end_ayah}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Logout */}
                <form action={logout}>
                    <Button
                        variant="outline"
                        className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 font-semibold"
                    >
                        Keluar dari Akun
                    </Button>
                </form>
            </main>

            <StudentBottomNav />
        </div>
    );
}
