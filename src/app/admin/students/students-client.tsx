// src/app/admin/students/students-client.tsx
"use client";

import { useState } from "react";
import { getStudentReadings } from "../actions";
import { AdminBottomNav } from "@/components/bottom-nav";
import { StudentDetailDialog } from "../student-detail-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
    const [classFilter, setClassFilter] = useState("all");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const filtered = classFilter === "all"
        ? students
        : students.filter((s) => s.className.startsWith(classFilter + "-"));

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 pb-20">
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-emerald-100">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                        👥 Daftar Siswa
                    </h1>
                    <p className="text-xs text-muted-foreground">{students.length} siswa terdaftar</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                <Card className="border-emerald-100 shadow-lg">
                    <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <CardTitle className="text-base">Semua Siswa</CardTitle>
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
                                                Tidak ada siswa ditemukan.
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
