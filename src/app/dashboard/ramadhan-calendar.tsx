import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Reading {
    date: string;
    total_pages: number;
    juz_obtained: number;
}

interface RamadhanCalendarProps {
    readings: Reading[];
}

// 1 Ramadhan 1447 H = 19 Februari 2026
const START_DATE_STR = "2026-02-19";

export function RamadhanCalendar({ readings }: RamadhanCalendarProps) {
    const calendarDays = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(START_DATE_STR);
        date.setDate(date.getDate() + i);

        // Format to YYYY-MM-DD for comparison
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        // Filter readings for this specific date
        // Since readings.date is now standardized to WIB (UTC+7) in backend and migration,
        // we can directly compare it with the calendar date string.
        const dayReadings = readings.filter((r) => r.date === dateString);

        // Sum juz_obtained
        const totalJuz = dayReadings.reduce((sum, r) => sum + (r.juz_obtained || 0), 0);

        return {
            ramadhanDay: i + 1,
            dateString,
            displayDate: date.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
            totalJuz: parseFloat(totalJuz.toFixed(2)), // Round to 2 decimals
            hasReading: dayReadings.length > 0
        };
    });

    return (
        <Card className="border-emerald-100 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                    📅 Kalender Ramadan 1447 H
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-5 gap-1">
                    {calendarDays.map((day) => (
                        <div
                            key={day.ramadhanDay}
                            className={cn(
                                "flex flex-col items-center justify-center p-2 rounded-lg border text-center transition-colors",
                                day.hasReading
                                    ? "bg-emerald-50 border-emerald-200"
                                    : "bg-white border-gray-100 opacity-80"
                            )}
                        >
                            <span className="text-[10px] uppercase text-muted-foreground font-medium">
                                {day.ramadhanDay}
                            </span>
                            <span className="text-[10px] text-gray-400">
                                {day.displayDate}
                            </span>
                            <div className="flex items-baseline gap-0.5">
                                <span className={cn(
                                    "text-lg font-bold",
                                    day.totalJuz > 0 ? "text-emerald-600" : "text-gray-300"
                                )}>
                                    {day.totalJuz > 0 ? day.totalJuz : "-"}
                                </span>
                                {day.totalJuz > 0 && (
                                    <span className="text-[10px] text-emerald-500 font-medium">juz</span>
                                )}
                            </div>

                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
