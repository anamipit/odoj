// src/app/dashboard/dashboard-client.tsx
"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReadingForm } from "./reading-form";
import { ReadingChart } from "./reading-chart";
import { StudentBottomNav } from "@/components/bottom-nav";
import { HadithCard } from "@/components/hadith-card";
import { PwaInstallPrompt } from "@/components/pwa-install-prompt";
import { BookOpen, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { RamadhanCalendar } from "./ramadhan-calendar";

interface Props {
    profile: { full_name: string; class_name: string; role: string } | null;
    initialReadings: { date: string; total_pages: number; juz_obtained: number }[];
    totalJuz: number;
    totalPages: number;
    readingsEnabled: boolean;
}

export function DashboardClient({ profile, initialReadings, totalJuz, totalPages, readingsEnabled }: Props) {
    const router = useRouter();
    const [key, setKey] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Defer rendering of Radix Select + ChartContainer to avoid SSR/CSR ID mismatch
    useEffect(() => setMounted(true), []);

    const handleSuccess = useCallback(() => {
        setKey((k) => k + 1);
        router.refresh();
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            <Toaster richColors position="top-center" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent flex items-center gap-1.5">
                        <BookOpen className="w-5 h-5 text-emerald-600" />
                        ODOJ Tracker
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {profile?.full_name} · {profile?.class_name}
                    </p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <Card className="border-emerald-100 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-emerald-100">Total Juz</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <p className="text-3xl font-bold">{totalJuz}</p>
                            <p className="text-xs text-emerald-200 mt-1">dari 30 juz</p>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-100 shadow-md bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                        <CardHeader className="pb-1 pt-4 px-4">
                            <CardTitle className="text-xs font-medium text-amber-100">Total Halaman</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <p className="text-3xl font-bold">{totalPages}</p>
                            <p className="text-xs text-amber-200 mt-1">dari 604 halaman</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress Khatam</span>
                        <span>{Math.min(100, Math.round((totalPages / 604) * 100))}%</span>
                    </div>
                    <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
                            style={{ width: `${Math.min(100, (totalPages / 604) * 100)}%` }}
                        />
                    </div>
                </div>

                {/* Ramadhan Calendar */}
                <RamadhanCalendar readings={initialReadings} />

                {/* Reading Form — client-only to prevent Radix ID hydration mismatch */}
                {!mounted ? (
                    <div className="rounded-xl border border-emerald-100 bg-white p-6 animate-pulse space-y-4">
                        <div className="h-5 w-48 bg-emerald-100 rounded" />
                        <div className="h-10 w-full bg-gray-100 rounded" />
                        <div className="h-10 w-full bg-gray-100 rounded" />
                    </div>
                ) : readingsEnabled ? (
                    <ReadingForm key={key} onSuccess={handleSuccess} />
                ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 text-center">
                        <Pause className="w-8 h-8 text-amber-500 mx-auto" />
                        <p className="text-sm font-semibold text-amber-800 mt-2">Input Bacaan Ditutup</p>
                        <p className="text-xs text-amber-600 mt-1">Admin belum mengaktifkan input bacaan. Silakan tunggu.</p>
                    </div>
                )}

                {/* Chart — client-only to prevent ChartContainer ID hydration mismatch */}
                {mounted ? (
                    <ReadingChart readings={initialReadings} />
                ) : (
                    <div className="rounded-xl border border-emerald-100 bg-white p-6 animate-pulse space-y-4">
                        <div className="h-5 w-40 bg-emerald-100 rounded" />
                        <div className="h-48 w-full bg-gray-50 rounded" />
                    </div>
                )}

                {/* Hadith of the Day */}
                <HadithCard />
            </main>

            <PwaInstallPrompt />
            <StudentBottomNav />
        </div>
    );
}
