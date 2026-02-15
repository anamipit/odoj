// src/app/admin/admin-client.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleReadingsEnabled } from "./actions";
import { AdminChart } from "./admin-chart";
import { StudentDetailDialog } from "./student-detail-dialog";
import { AdminBottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { GRADE_OPTIONS } from "@/lib/constants";

interface Student {
    id: string;
    fullName: string;
    className: string;
    totalPages: number;
    totalJuz: number;
}

interface AggregatedData {
    date: string;
    totalPages: number;
}

interface Props {
    profile: { full_name: string; class_name: string; role: string };
    aggregatedData: AggregatedData[];
    initialStudents: Student[];
    readingsEnabled: boolean;
}

export function AdminDashboardClient({ profile, aggregatedData, initialStudents, readingsEnabled }: Props) {
    const router = useRouter();
    const [classFilter, setClassFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [inputEnabled, setInputEnabled] = useState(readingsEnabled);
    const [toggling, setToggling] = useState(false);

    // Client-side filter
    const filteredStudents = classFilter === "all"
        ? initialStudents
        : initialStudents.filter((s) => s.className.startsWith(classFilter + "-"));

    // Stats
    const totalStudents = initialStudents.length;
    const totalPagesAll = initialStudents.reduce((sum, s) => sum + s.totalPages, 0);
    const totalJuzAll = Math.round(initialStudents.reduce((sum, s) => sum + s.totalJuz, 0) * 100) / 100;

    function handleStudentClick(student: Student) {
        setSelectedStudent(student);
        setDialogOpen(true);
    }

    async function handleToggle() {
        setToggling(true);
        const result = await toggleReadingsEnabled();
        setToggling(false);
        if (result.error) {
            toast.error(result.error);
            return;
        }
        setInputEnabled(result.enabled);
        toast.success(result.enabled ? "Input bacaan diaktifkan" : "Input bacaan dinonaktifkan");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            <Toaster richColors position="top-center" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        📖 ODOJ Admin
                    </h1>
                    <p className="text-xs text-muted-foreground">{profile.full_name}</p>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <Card className="border-emerald-100 shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                        <CardHeader className="pb-1 pt-3 px-3">
                            <CardTitle className="text-[10px] sm:text-xs font-medium text-emerald-100">Total Siswa</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <p className="text-2xl sm:text-3xl font-bold">{totalStudents}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-amber-100 shadow-md bg-gradient-to-br from-amber-500 to-amber-700 text-white">
                        <CardHeader className="pb-1 pt-3 px-3">
                            <CardTitle className="text-[10px] sm:text-xs font-medium text-amber-100">Total Halaman</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <p className="text-2xl sm:text-3xl font-bold">{totalPagesAll.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-100 shadow-md bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                        <CardHeader className="pb-1 pt-3 px-3">
                            <CardTitle className="text-[10px] sm:text-xs font-medium text-blue-100">Total Juz</CardTitle>
                        </CardHeader>
                        <CardContent className="px-3 pb-3">
                            <p className="text-2xl sm:text-3xl font-bold">{totalJuzAll}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reading Toggle */}
                <Card className={`border shadow-md transition-colors ${inputEnabled ? 'border-emerald-200 bg-emerald-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <CardContent className="flex items-center justify-between py-4 px-4">
                        <div className="flex items-center gap-3">
                            <span className={`w-3 h-3 rounded-full ${inputEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`} />
                            <div>
                                <p className="text-sm font-semibold">
                                    Input Bacaan: {inputEnabled ? 'Aktif' : 'Nonaktif'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {inputEnabled ? 'Siswa dapat mencatat bacaan' : 'Form input bacaan dinonaktifkan'}
                                </p>
                            </div>
                        </div>
                        <Button
                            size="sm"
                            variant={inputEnabled ? "destructive" : "default"}
                            onClick={handleToggle}
                            disabled={toggling}
                            className={!inputEnabled ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                        >
                            {toggling ? '...' : inputEnabled ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                    </CardContent>
                </Card>

                {/* Aggregated Chart */}
                <AdminChart data={aggregatedData} />

                {/* Student Table */}
                <Card className="border-emerald-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-sm">👥</span>
                                Daftar Siswa
                            </CardTitle>
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger className="w-full sm:w-44 h-9">
                                    <SelectValue placeholder="Filter kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {GRADE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="px-0 sm:px-6">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-4 sm:pl-0">Nama</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead className="text-right">Juz</TableHead>
                                        <TableHead className="text-right pr-4 sm:pr-0">Halaman</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                                                Tidak ada siswa ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <TableRow
                                                key={student.id}
                                                className="cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                <TableCell className="pl-4 sm:pl-0 font-medium">{student.fullName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {student.className}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-700">
                                                    {student.totalJuz}
                                                </TableCell>
                                                <TableCell className="text-right pr-4 sm:pr-0">{student.totalPages}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            {/* Student Detail Dialog */}
            <StudentDetailDialog
                student={selectedStudent}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />

            <AdminBottomNav />
        </div>
    );
}
