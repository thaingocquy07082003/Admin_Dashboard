'use client';

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconUser,
  IconClock,
  IconFilter,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

const STYLISTS = [
  { id: "all", name: "Tất cả thợ", color: "#6366f1" },
  { id: "1", name: "Nguyễn Văn An", color: "#0ea5e9" },
  { id: "2", name: "Trần Thị Bình", color: "#10b981" },
  { id: "3", name: "Lê Hoàng Nam", color: "#f59e0b" },
  { id: "4", name: "Phạm Thị Hoa", color: "#ec4899" },
  { id: "5", name: "Đỗ Minh Tuấn", color: "#8b5cf6" },
];

type Shift = "morning" | "afternoon" | "fullday" | "off";

interface ScheduleEntry {
  stylistId: string;
  shift: Shift;
  note?: string;
}

interface DaySchedule {
  [key: string]: ScheduleEntry; // key = stylistId
}

interface MonthSchedule {
  [day: number]: DaySchedule;
}

function generateSchedule(year: number, month: number): MonthSchedule {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const schedule: MonthSchedule = {};
  const shifts: Shift[] = ["morning", "afternoon", "fullday", "off"];
  const seed = year * 100 + month;

  for (let day = 1; day <= daysInMonth; day++) {
    schedule[day] = {};
    STYLISTS.filter((s) => s.id !== "all").forEach((stylist, si) => {
      const hash = (seed * 31 + day * 17 + si * 7) % 10;
      let shift: Shift;
      if (hash < 3) shift = "fullday";
      else if (hash < 5) shift = "morning";
      else if (hash < 7) shift = "afternoon";
      else shift = "off";

      const dow = new Date(year, month, day).getDay();
      if (dow === 0) shift = "off";

      schedule[day][stylist.id] = { stylistId: stylist.id, shift };
    });
  }
  return schedule;
}

const SHIFT_LABELS: Record<Shift, string> = {
  morning: "Sáng",
  afternoon: "Chiều",
  fullday: "Cả ngày",
  off: "Nghỉ",
};

const SHIFT_COLORS: Record<Shift, { bg: string; text: string; border: string }> = {
  morning: { bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-700 dark:text-blue-300", border: "border-blue-200 dark:border-blue-800" },
  afternoon: { bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800" },
  fullday: { bg: "bg-green-50 dark:bg-green-950", text: "text-green-700 dark:text-green-300", border: "border-green-200 dark:border-green-800" },
  off: { bg: "bg-gray-50 dark:bg-gray-900", text: "text-gray-400 dark:text-gray-600", border: "border-gray-100 dark:border-gray-800" },
};

const DAYS_OF_WEEK = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

export function ScheduleView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedStylist, setSelectedStylist] = useState("all");
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");

  const schedule = React.useMemo(
    () => generateSchedule(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
  };

  const filteredStylists = selectedStylist === "all"
    ? STYLISTS.filter(s => s.id !== "all")
    : STYLISTS.filter(s => s.id === selectedStylist);

  const getDayShiftSummary = (day: number) => {
    const dayData = schedule[day] || {};
    if (selectedStylist !== "all") {
      return dayData[selectedStylist] ? [dayData[selectedStylist].shift] : [];
    }
    return Object.values(dayData).map(e => e.shift);
  };

  const hasWorkingStylists = (day: number) => {
    const shifts = getDayShiftSummary(day);
    return shifts.some(s => s !== "off");
  };

  const getWorkingCount = (day: number) => {
    const dayData = schedule[day] || {};
    const relevant = filteredStylists.map(s => dayData[s.id]?.shift);
    return relevant.filter(s => s && s !== "off").length;
  };

  const isToday = (day: number) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear === today.getFullYear();

  const isPast = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lịch làm việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Quản lý ca làm việc của thợ cắt tóc</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={goToToday}>
            <IconCalendar className="size-4" />
            Hôm nay
          </Button>
          <Select value={selectedStylist} onValueChange={setSelectedStylist}>
            <SelectTrigger size="sm" className="w-44">
              <IconFilter className="size-3.5 mr-1" />
              <SelectValue placeholder="Chọn thợ" />
            </SelectTrigger>
            <SelectContent>
              {STYLISTS.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stylist Legend */}
      <div className="flex flex-wrap gap-2">
        {STYLISTS.filter(s => s.id !== "all").map(stylist => (
          <button
            key={stylist.id}
            onClick={() => setSelectedStylist(selectedStylist === stylist.id ? "all" : stylist.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedStylist === stylist.id || selectedStylist === "all"
                ? "opacity-100"
                : "opacity-40"
            }`}
            style={{
              borderColor: stylist.color + "60",
              backgroundColor: stylist.color + "15",
              color: stylist.color,
            }}
          >
            <span className="size-2 rounded-full inline-block" style={{ backgroundColor: stylist.color }} />
            {stylist.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-8" onClick={prevMonth}>
                    <IconChevronLeft className="size-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Select
                      value={currentMonth.toString()}
                      onValueChange={v => { setCurrentMonth(Number(v)); setSelectedDay(null); }}
                    >
                      <SelectTrigger size="sm" className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={currentYear.toString()}
                      onValueChange={v => { setCurrentYear(Number(v)); setSelectedDay(null); }}
                    >
                      <SelectTrigger size="sm" className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map(y => (
                          <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="icon" className="size-8" onClick={nextMonth}>
                    <IconChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div
                    key={d}
                    className={`text-center text-xs font-medium py-2 ${
                      i === 0 ? "text-red-500" : "text-muted-foreground"
                    }`}
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const workCount = getWorkingCount(day);
                  const totalRelevant = filteredStylists.length;
                  const dow = new Date(currentYear, currentMonth, day).getDay();
                  const isSunday = dow === 0;
                  const selected = selectedDay === day;
                  const todayCell = isToday(day);
                  const past = isPast(day);

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(selected ? null : day)}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm font-medium transition-all hover:bg-accent
                        ${selected ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                        ${todayCell && !selected ? "ring-2 ring-primary ring-offset-1" : ""}
                        ${isSunday && !selected ? "text-red-500" : ""}
                        ${past && !selected ? "opacity-50" : ""}
                      `}
                    >
                      <span className="text-sm">{day}</span>
                      {workCount > 0 && (
                        <div className={`flex gap-0.5 mt-0.5 ${selected ? "opacity-80" : ""}`}>
                          {workCount >= 3 ? (
                            <span className={`text-[9px] font-medium ${selected ? "text-primary-foreground/80" : "text-primary"}`}>
                              {workCount}/{totalRelevant}
                            </span>
                          ) : (
                            Array.from({ length: Math.min(workCount, 3) }).map((_, i) => (
                              <span
                                key={i}
                                className={`size-1 rounded-full ${selected ? "bg-primary-foreground/70" : "bg-primary"}`}
                              />
                            ))
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t flex flex-wrap gap-3 text-xs text-muted-foreground">
                {Object.entries(SHIFT_LABELS).map(([shift, label]) => (
                  <span key={shift} className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${SHIFT_COLORS[shift as Shift].bg} ${SHIFT_COLORS[shift as Shift].text} ${SHIFT_COLORS[shift as Shift].border}`}>
                    {label}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedDay ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconCalendar className="size-4 text-muted-foreground" />
                  {`${selectedDay} ${MONTHS[currentMonth]}, ${currentYear}`}
                  {isToday(selectedDay) && (
                    <Badge variant="secondary" className="text-xs">Hôm nay</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {filteredStylists.map(stylist => {
                  const entry = schedule[selectedDay]?.[stylist.id];
                  const shift = entry?.shift || "off";
                  const colors = SHIFT_COLORS[shift];

                  return (
                    <div
                      key={stylist.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${colors.bg} ${colors.border}`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="size-7 rounded-full flex items-center justify-center text-xs font-medium text-white"
                          style={{ backgroundColor: stylist.color }}
                        >
                          {stylist.name.split(" ").pop()?.charAt(0)}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${colors.text}`}>{stylist.name}</p>
                          {shift !== "off" && (
                            <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                              <IconClock className="size-3" />
                              {shift === "morning" ? "7:00 - 13:00" : shift === "afternoon" ? "13:00 - 19:00" : "7:00 - 19:00"}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md ${colors.bg} ${colors.text}`}>
                        {SHIFT_LABELS[shift]}
                      </span>
                    </div>
                  );
                })}

                {/* Summary */}
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Đi làm</span>
                    <span className="font-medium text-green-600">
                      {filteredStylists.filter(s => schedule[selectedDay]?.[s.id]?.shift !== "off").length} người
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-muted-foreground">Nghỉ</span>
                    <span className="font-medium text-gray-400">
                      {filteredStylists.filter(s => schedule[selectedDay]?.[s.id]?.shift === "off").length} người
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full min-h-64 text-center gap-3">
                <IconCalendar className="size-10 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Chọn một ngày để xem lịch làm việc chi tiết</p>
              </CardContent>
            </Card>
          )}

          {/* Monthly stats */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Thống kê tháng</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {filteredStylists.slice(0, 4).map(stylist => {
                const workDays = Object.values(schedule).filter(
                  day => day[stylist.id]?.shift !== "off"
                ).length;
                const totalDays = daysInMonth;
                const pct = Math.round((workDays / totalDays) * 100);

                return (
                  <div key={stylist.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium truncate max-w-28">{stylist.name.split(" ").pop()}</span>
                      <span className="text-muted-foreground">{workDays} ngày</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: stylist.color }}
                      />
                    </div>
                  </div>
                );
              })}
              {filteredStylists.length > 4 && (
                <p className="text-xs text-muted-foreground text-center">+{filteredStylists.length - 4} thợ khác</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}