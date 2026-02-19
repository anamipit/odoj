"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getStudentReadings } from "../actions";
import { AdminBottomNav } from "@/components/bottom-nav";
import dynamic from "next/dynamic";

const StudentDetailDialog = dynamic(() => import("../student-detail-dialog").then((mod) => mod.StudentDetailDialog), { ssr: false });
import { Users, Search, Calendar, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GRADE_OPTIONS } from "@/lib/constants";

interface Student {
    id: string;
    fullName: string;
    className: string;
    totalPages: number;
    totalJuz: number;
}

interface Props {
    students: Student[];
}

export function StudentsListClient({ students }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // Filters
    const [classFilter, setClassFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<string>("");
    
    // Student data with date filtering
    const [studentData, setStudentData] = useState<Student[]>(students);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Apply date filter
    const applyDateFilter = async (date: string) => {
        if (!date) {
            setStudentData(students);
            return;
        }

        startTransition(async () => {
            // Fetch readings for all students on specific date
            const updatedStudents = await Promise.all(
                students.map(async (student) => {
                    const readings = await getStudentReadings(student.id);
                    const dayReadings = readings.filter((r: { date: string }) => r.date === date);
                    
                    const totalPages = dayReadings.reduce((sum: number, r: { total_pages: number }) => sum + r.total_pages, 0);
                    const totalJuz = dayReadings.reduce((sum: number, r: { juz_obtained: number }) => sum + r.juz_obtained, 0);
                    
                    return {
                        ...student,
                        totalPages,
                        totalJuz: Math.round(totalJuz * 100) / 100,
                    };
                })
            );
            
            // Filter out students with 0 readings on that date
            const activeStudents = updatedStudents.filter((s) => s.totalPages > 0);
            setStudentData(activeStudents);
        });
    };

    const clearDateFilter = () => {
        setDateFilter("");
        setStudentData(students);
    };

    // Client-side filtering
    const filtered = studentData.filter((s) => {
        // Class filter
        if (classFilter !== "all" && !s.className.startsWith(classFilter + "-")) {
            return false;
        }
        
        // Search filter (nama atau kelas)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchName = s.fullName.toLowerCase().includes(query);
            const matchClass = s.className.toLowerCase().includes(query);
            if (!matchName && !matchClass) return false;
        }
        
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent flex items-center gap-1.5">
                        <Users className="w-5 h-5 text-emerald-600" />
                        Daftar Siswa
                    </h1>
                    <p className="text-xs text-muted-foreground">
                        {dateFilter ? `Data per tanggal: ${new Date(dateFilter).toLocaleDateString("id-ID")}` : `${students.length} siswa terdaftar`}
                    </p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {/* Filters Card */}
                <Card className="border-emerald-100 shadow-md">
                    <CardContent className="p-4 space-y-4">
                        {/* Search & Class Filter */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari nama atau kelas..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-10"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2"
                                    >
                                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                    </button>
                                )}
                            </div>
                            
                            {/* Class Filter */}
                            <Select value={classFilter} onValueChange={setClassFilter}>
                                <SelectTrigger className="w-full sm:w-44 h-10">
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

                        {/* Date Filter */}
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                            <div className="flex items-center gap-2 flex-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-muted-nowrap">Filter Tanggal:</span>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={(e) => {
                                        setDateFilter(e.target.value);
                                        applyDateFilter(e.target.value);
                                    }}
                                    className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                                />
                            </div>
                            
                            {dateFilter && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearDateFilter}
                                    disabled={isPending}
                                    className="w-full sm:w-auto"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Reset Tanggal
                                </Button>
                            )}
                        </div>

                        {isPending && (
                            <p className="text-xs text-muted-foreground">Memuat data...</p>
                        )}
                    </CardContent>
                </Card>

                {/* Results Count */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {filtered.length} siswa
                    </p>
                </div>

                {/* Students Table */}
                <Card className="border-emerald-100 shadow-lg">
                    <CardContent className="px-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10 text-center pl-3">#</TableHead>
                                        <TableHead>Nama</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead className="text-right">Juz</TableHead>
                                        <TableHead className="text-right pr-3">Halaman</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                                {dateFilter 
                                                    ? "Tidak ada siswa yang membaca pada tanggal ini."
                                                    : "Tidak ada siswa ditemukan."
                                                }
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map((student, i) => (
                                            <TableRow
                                                key={student.id}
                                                className="cursor-pointer hover:bg-emerald-50/50 transition-colors"
                                                onClick={() => {
                                                    setSelectedStudent(student);
                                                    setDialogOpen(true);
                                                }}
                                            >
                                                <TableCell className="text-center text-muted-foreground pl-3">{i + 1}</TableCell>
                                                <TableCell className="font-medium">{student.fullName}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="text-xs">{student.className}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-semibold text-emerald-700">{student.totalJuz}</TableCell>
                                                <TableCell className="text-right pr-3">{student.totalPages}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>

            <StudentDetailDialog
                student={selectedStudent}
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
            />

            <AdminBottomNav />
        </div>
    );
}