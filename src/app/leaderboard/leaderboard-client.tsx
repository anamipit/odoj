// src/app/leaderboard/leaderboard-client.tsx
"use client";

import { useState } from "react";
import { Podium } from "./podium";
import type { LeaderboardEntry } from "./actions";
import { StudentBottomNav, AdminBottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Props {
    dailyData: LeaderboardEntry[];
    totalData: LeaderboardEntry[];
    userRole: string;
}

function LeaderboardTable({ entries, metric }: { entries: LeaderboardEntry[]; metric: "pages" | "juz" }) {
    // Only show rank 4+
    const rest = entries.filter((e) => e.rank > 3);

    if (rest.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-muted-foreground">
                Belum ada data untuk ditampilkan di luar podium.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center pl-3">#</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead>Kelas</TableHead>
                        <TableHead className="text-right pr-3">
                            {metric === "pages" ? "Halaman" : "Juz"}
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rest.map((entry) => (
                        <TableRow key={entry.userId} className="hover:bg-emerald-50/30 transition-colors">
                            <TableCell className="text-center font-semibold text-muted-foreground pl-3">
                                {entry.rank}
                            </TableCell>
                            <TableCell className="font-medium">{entry.fullName}</TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                    {entry.className}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-emerald-700 pr-3">
                                {metric === "pages" ? entry.totalPages : entry.totalJuz}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export function LeaderboardClient({ dailyData, totalData, userRole }: Props) {
    const [tab, setTab] = useState("daily");
    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-2xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        🏆 Leaderboard
                    </h1>
                    <p className="text-xs text-muted-foreground">{today}</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-emerald-100/50">
                        <TabsTrigger
                            value="daily"
                            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold"
                        >
                            📅 Hari Ini
                        </TabsTrigger>
                        <TabsTrigger
                            value="total"
                            className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white font-semibold"
                        >
                            🌙 Total Ramadan
                        </TabsTrigger>
                    </TabsList>

                    {/* Daily Leaderboard */}
                    <TabsContent value="daily" className="space-y-4 mt-4">
                        <Card className="border-emerald-100 shadow-lg overflow-hidden">
                            <CardHeader className="pb-0 bg-gradient-to-r from-emerald-50 to-amber-50">
                                <CardTitle className="text-base text-center text-emerald-800">
                                    🏅 Top Pembaca Hari Ini
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 pb-2">
                                {dailyData.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground text-sm">
                                        Belum ada yang membaca hari ini. Jadilah yang pertama! 🌟
                                    </div>
                                ) : (
                                    <Podium top3={dailyData.slice(0, 3)} metric="pages" />
                                )}
                            </CardContent>
                        </Card>

                        {dailyData.length > 3 && (
                            <Card className="border-emerald-100 shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Peringkat Lainnya</CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <LeaderboardTable entries={dailyData} metric="pages" />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Total Leaderboard */}
                    <TabsContent value="total" className="space-y-4 mt-4">
                        <Card className="border-emerald-100 shadow-lg overflow-hidden">
                            <CardHeader className="pb-0 bg-gradient-to-r from-emerald-50 to-amber-50">
                                <CardTitle className="text-base text-center text-emerald-800">
                                    🏅 Top Pembaca Ramadan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0 pb-2">
                                {totalData.length === 0 ? (
                                    <div className="py-12 text-center text-muted-foreground text-sm">
                                        Belum ada data bacaan.
                                    </div>
                                ) : (
                                    <Podium top3={totalData.slice(0, 3)} metric="juz" />
                                )}
                            </CardContent>
                        </Card>

                        {totalData.length > 3 && (
                            <Card className="border-emerald-100 shadow-lg">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Peringkat Lainnya</CardTitle>
                                </CardHeader>
                                <CardContent className="px-0">
                                    <LeaderboardTable entries={totalData} metric="juz" />
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </main>

            {userRole === "admin" ? <AdminBottomNav /> : <StudentBottomNav />}
        </div>
    );
}
