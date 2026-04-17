'use client';

import * as React from "react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCalendar,
  IconClock,
  IconFilter,
  IconRefresh,
  IconPlus,
  IconTrash,
  IconAlertTriangle,
  IconLoader2,
  IconX,
  IconBan,
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
import { useState, useEffect, useMemo } from "react";
import { AddScheduleDialog } from "@/components/add-schedule-dialog";

// ===== API types =====
interface ApiSchedule {
  id: string;
  stylistId: string;
  stylistName: string;
  workDate: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isDayOff: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  statusCode: number;
  message: string;
  data: ApiSchedule[];
}

interface BlackoutDate {
  id: string;
  date: string; // "YYYY-MM-DD"
  reason?: string | null;
  createdAt?: string;
}

interface BlackoutApiResponse {
  statusCode: number;
  message: string;
  data: BlackoutDate[] | string[];
}

const API_URL = "http://localhost:3003/api/v1/schedules";
const BLACKOUT_API_URL = "http://localhost:3003/api/v1/schedules/blackout-dates";

const STYLIST_COLORS = [
  "#0ea5e9", "#10b981", "#f59e0b", "#ec4899",
  "#8b5cf6", "#ef4444", "#06b6d4", "#84cc16",
  "#f97316", "#6366f1",
];

type Shift = "morning" | "afternoon" | "fullday" | "off";

interface ScheduleEntry {
  id: string;
  stylistId: string;
  shift: Shift;
  startTime?: string;
  endTime?: string;
  notes?: string | null;
}

interface DaySchedule {
  [stylistId: string]: ScheduleEntry;
}

interface MonthSchedule {
  [day: number]: DaySchedule;
}

// ===== Helpers =====
function parseHour(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) + (m || 0) / 60;
}

function deriveShift(item: ApiSchedule): Shift {
  if (item.isDayOff || !item.isAvailable) return "off";
  const start = parseHour(item.startTime);
  const end = parseHour(item.endTime);
  const duration = end - start;
  if (duration >= 8 || (start <= 10 && end >= 17)) return "fullday";
  if (end <= 13.5) return "morning";
  if (start >= 12) return "afternoon";
  return "fullday";
}

function formatTimeRange(start?: string, end?: string, shift?: Shift) {
  if (start && end) return `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
  if (shift === "morning") return "7:00 - 13:00";
  if (shift === "afternoon") return "13:00 - 19:00";
  return "7:00 - 19:00";
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

// ===== Delete Confirm Dialog =====
function DeleteConfirmDialog({
  open,
  stylistName,
  date,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  stylistName: string;
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-background border rounded-xl shadow-lg w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
            <IconAlertTriangle className="size-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-base">Xóa lịch làm việc</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Xác nhận xóa lịch làm việc của <span className="font-medium text-foreground">{stylistName}</span> vào ngày <span className="font-medium text-foreground">{date}</span>?
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>Hủy</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading ? <IconLoader2 className="size-4 animate-spin" /> : <IconTrash className="size-4" />}
            Xóa lịch
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== Add Blackout Date Dialog =====
function AddBlackoutDateDialog({
  open,
  onClose,
  onSuccess,
  stylists = [],
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  stylists?: Array<{ id: string; name: string; color: string }>;
}) {
  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stylistId, setStylistId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setDate("");
      setTitle("");
      setDescription("");
      setStylistId("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!date) { setError("Vui lòng chọn ngày"); return; }
    if (!title.trim()) { setError("Vui lòng nhập tiêu đề"); return; }
    
    setError(null);
    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) throw new Error("Không có token — vui lòng đăng nhập lại");
      
      const payload: Record<string, any> = {
        blackoutDate: date,
        title: title.trim(),
      };
      
      if (description.trim()) {
        payload.description = description.trim();
      }
      
      if (stylistId) {
        payload.stylistId = stylistId;
      } else {
        payload.appliesToAll = true;
      }
      
      const res = await fetch(BLACKOUT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json.statusCode && json.statusCode >= 400)) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi thêm ngày nghỉ");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background border rounded-xl shadow-lg w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2">
              <IconBan className="size-4 text-red-500" />
              Thêm ngày nghỉ lễ
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {stylistId ? `Thợ được chọn sẽ nghỉ vào ngày này` : "Toàn bộ thợ sẽ nghỉ vào ngày này"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="size-7 shrink-0" onClick={onClose}>
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Chọn ngày nghỉ *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>

        {/* Title */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Tiêu đề *</label>
          <input
            type="text"
            placeholder="vd: Tết Nguyên Đán, Lễ Quốc Khánh..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mô tả (tùy chọn)</label>
          <textarea
            placeholder="Thêm ghi chú hoặc mô tả chi tiết..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30 resize-none"
            rows={3}
          />
        </div>

        {/* Stylist Selection */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Chọn thợ (tùy chọn)
            {stylistId && (
              <span className="text-xs text-muted-foreground ml-1">
                — sẽ dành cho thợ này
              </span>
            )}
          </label>
          <select
            value={stylistId}
            onChange={(e) => setStylistId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-muted dark:border-muted dark:text-foreground"
          >
            <option value="">-- Không chọn (áp dụng cho tất cả) --</option>
            {stylists
              .filter(s => s.id !== "all")
              .map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
          </select>
        </div>

        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 px-2 py-1 rounded bg-red-50 dark:bg-red-950/30">{error}</p>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>Hủy</Button>
          <Button onClick={handleSubmit} disabled={submitting || !date || !title.trim()} className="bg-red-600 hover:bg-red-700 text-white">
            {submitting ? <IconLoader2 className="size-4 animate-spin" /> : <IconBan className="size-4" />}
            Thêm ngày nghỉ
          </Button>
        </div>
      </div>
    </div>
  );
}

// ===== Main Component =====
export function ScheduleView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedStylist, setSelectedStylist] = useState("all");
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate());

  const [rawData, setRawData] = useState<ApiSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Blackout dates
  const [blackoutDates, setBlackoutDates] = useState<string[]>([]); // ["YYYY-MM-DD", ...]
  const [blackoutLoading, setBlackoutLoading] = useState(false);

  // Dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addBlackoutOpen, setAddBlackoutOpen] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; stylistName: string; dateLabel: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Fetch schedules
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (json.statusCode !== 200) throw new Error(json.message || "Lỗi dữ liệu");
      setRawData(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải lịch");
      setRawData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch blackout dates
  const fetchBlackoutDates = async () => {
    setBlackoutLoading(true);
    try {
      const res = await fetch(BLACKOUT_API_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: BlackoutApiResponse = await res.json();
      const raw = json.data || [];
      // Normalize: API có thể trả string[] hoặc object[]
      const dates = raw.map((item) => {
        if (typeof item === "string") return item.slice(0, 10);
        return (item as BlackoutDate).date?.slice(0, 10) ?? "";
      }).filter(Boolean);
      setBlackoutDates(dates);
    } catch (err) {
      console.error("Fetch blackout dates error:", err);
      setBlackoutDates([]);
    } finally {
      setBlackoutLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchBlackoutDates();
  }, []);

  const handleRefresh = () => {
    fetchData();
    fetchBlackoutDates();
  };

  // Delete schedule
  const handleDeleteSchedule = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) throw new Error("Không có token — vui lòng đăng nhập lại");
      const res = await fetch(`${API_URL}/${deleteTarget.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.message || `HTTP ${res.status}`);
      }
      setDeleteTarget(null);
      await fetchData();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Lỗi khi xóa lịch");
    } finally {
      setDeleting(false);
    }
  };

  // Derived data
  const stylistsAll = useMemo(() => {
    const map = new Map<string, string>();
    rawData.forEach(item => {
      if (!map.has(item.stylistId)) map.set(item.stylistId, item.stylistName);
    });
    const list = Array.from(map.entries())
      .sort((a, b) => a[1].localeCompare(b[1], "vi"))
      .map(([id, name], idx) => ({
        id, name, color: STYLIST_COLORS[idx % STYLIST_COLORS.length],
      }));
    return [{ id: "all", name: "Tất cả thợ", color: "#6366f1" }, ...list];
  }, [rawData]);

  const schedule: MonthSchedule = useMemo(() => {
    const res: MonthSchedule = {};
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) res[d] = {};

    rawData.forEach(item => {
      const dateStr = item.workDate.slice(0, 10);
      const [y, m, d] = dateStr.split("-").map(Number);
      if (y !== currentYear || m - 1 !== currentMonth) return;
      if (!res[d]) res[d] = {};
      res[d][item.stylistId] = {
        id: item.id,
        stylistId: item.stylistId,
        shift: deriveShift(item),
        startTime: item.startTime,
        endTime: item.endTime,
        notes: item.notes,
      };
    });
    return res;
  }, [rawData, currentYear, currentMonth]);

  // Check if a date is a blackout date
  const isBlackoutDate = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return blackoutDates.includes(dateStr);
  };

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
    ? stylistsAll.filter(s => s.id !== "all")
    : stylistsAll.filter(s => s.id === selectedStylist);

  const getWorkingCount = (day: number) => {
    if (isBlackoutDate(day)) return 0;
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

  // Blackout dates in current month (for display)
  const blackoutsThisMonth = useMemo(() => {
    const prefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-`;
    return blackoutDates
      .filter(d => d.startsWith(prefix))
      .map(d => parseInt(d.split("-")[2], 10))
      .sort((a, b) => a - b);
  }, [blackoutDates, currentYear, currentMonth]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lịch làm việc</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Quản lý ca làm việc của thợ cắt tóc</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <IconPlus className="size-4" />
            Thêm lịch
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setAddBlackoutOpen(true)}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            <IconBan className="size-4" />
            Ngày nghỉ lễ
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading || blackoutLoading}>
            <IconRefresh className={`size-4 ${(loading || blackoutLoading) ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
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
              {stylistsAll.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Error banners */}
      {error && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900 text-sm">
          <span className="text-red-700 dark:text-red-300">Không tải được lịch: {error}</span>
          <Button variant="outline" size="sm" onClick={fetchData}>Thử lại</Button>
        </div>
      )}
      {deleteError && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900 text-sm">
          <span className="text-red-700 dark:text-red-300">Lỗi xóa lịch: {deleteError}</span>
          <Button variant="ghost" size="sm" onClick={() => setDeleteError(null)}>
            <IconX className="size-4" />
          </Button>
        </div>
      )}

      {/* Blackout dates this month notice */}
      {blackoutsThisMonth.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-900 text-sm">
          <IconBan className="size-4 text-orange-600 dark:text-orange-400 shrink-0" />
          <span className="text-orange-700 dark:text-orange-300">
            Ngày nghỉ lễ tháng này:{" "}
            {blackoutsThisMonth.map(d => (
              <span key={d} className="font-medium">{d}/{currentMonth + 1}</span>
            )).reduce((acc: React.ReactNode[], el, i) => i === 0 ? [el] : [...acc, ", ", el], [])}
          </span>
        </div>
      )}

      {/* Stylist Legend */}
      <div className="flex flex-wrap gap-2">
        {stylistsAll.filter(s => s.id !== "all").map(stylist => (
          <button
            key={stylist.id}
            onClick={() => setSelectedStylist(selectedStylist === stylist.id ? "all" : stylist.id)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              selectedStylist === stylist.id || selectedStylist === "all" ? "opacity-100" : "opacity-40"
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
                      <SelectTrigger size="sm" className="w-32"><SelectValue /></SelectTrigger>
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
                      <SelectTrigger size="sm" className="w-24"><SelectValue /></SelectTrigger>
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
                {loading && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <IconRefresh className="size-3 animate-spin" />
                    Đang tải...
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Day headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS_OF_WEEK.map((d, i) => (
                  <div key={d} className={`text-center text-xs font-medium py-2 ${i === 0 ? "text-red-500" : "text-muted-foreground"}`}>
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const blackout = isBlackoutDate(day);
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
                        ${blackout && !selected ? "bg-red-50 dark:bg-red-950/40 text-red-400 dark:text-red-600" : ""}
                        ${todayCell && !selected ? "ring-2 ring-primary ring-offset-1" : ""}
                        ${isSunday && !selected && !blackout ? "text-red-500" : ""}
                        ${past && !selected ? "opacity-50" : ""}
                      `}
                    >
                      <span className="text-sm">{day}</span>
                      {blackout && !selected && (
                        <IconBan className="size-2.5 mt-0.5 text-red-400" />
                      )}
                      {!blackout && workCount > 0 && (
                        <div className={`flex gap-0.5 mt-0.5 ${selected ? "opacity-80" : ""}`}>
                          {workCount >= 3 ? (
                            <span className={`text-[9px] font-medium ${selected ? "text-primary-foreground/80" : "text-primary"}`}>
                              {workCount}/{totalRelevant}
                            </span>
                          ) : (
                            Array.from({ length: Math.min(workCount, 3) }).map((_, i) => (
                              <span key={i} className={`size-1 rounded-full ${selected ? "bg-primary-foreground/70" : "bg-primary"}`} />
                            ))
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-3 border-t flex flex-wrap gap-2 text-xs text-muted-foreground">
                {Object.entries(SHIFT_LABELS).map(([shift, label]) => (
                  <span key={shift} className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${SHIFT_COLORS[shift as Shift].bg} ${SHIFT_COLORS[shift as Shift].text} ${SHIFT_COLORS[shift as Shift].border}`}>
                    {label}
                  </span>
                ))}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-red-50 dark:bg-red-950/40 text-red-500 border-red-200 dark:border-red-900">
                  <IconBan className="size-3" />
                  Nghỉ lễ
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedDay ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                  <IconCalendar className="size-4 text-muted-foreground" />
                  {`${selectedDay} ${MONTHS[currentMonth]}, ${currentYear}`}
                  {isToday(selectedDay) && (
                    <Badge variant="secondary" className="text-xs">Hôm nay</Badge>
                  )}
                  {isBlackoutDate(selectedDay) && (
                    <Badge className="text-xs bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800">
                      <IconBan className="size-3 mr-1" />
                      Nghỉ lễ
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {/* Blackout notice */}
                {isBlackoutDate(selectedDay) && (
                  <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <IconBan className="size-4 shrink-0" />
                      Ngày nghỉ lễ — toàn bộ thợ nghỉ hôm nay
                    </p>
                  </div>
                )}

                {!isBlackoutDate(selectedDay) && (
                  <>
                    {filteredStylists.length === 0 && !loading && (
                      <p className="text-sm text-muted-foreground text-center py-4">Chưa có dữ liệu thợ</p>
                    )}
                    {filteredStylists.map(stylist => {
                      const entry = schedule[selectedDay]?.[stylist.id];
                      const shift: Shift = entry?.shift || "off";
                      const colors = SHIFT_COLORS[shift];

                      return (
                        <div
                          key={stylist.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${colors.bg} ${colors.border} group`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div
                              className="size-7 rounded-full flex items-center justify-center text-xs font-medium text-white shrink-0"
                              style={{ backgroundColor: stylist.color }}
                            >
                              {stylist.name.trim().split(/\s+/).pop()?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-sm font-medium truncate ${colors.text}`}>{stylist.name}</p>
                              {shift !== "off" && (
                                <p className="text-xs text-muted-foreground flex items-center gap-0.5">
                                  <IconClock className="size-3" />
                                  {formatTimeRange(entry?.startTime, entry?.endTime, shift)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-xs font-medium px-2 py-1 rounded-md ${colors.bg} ${colors.text}`}>
                              {SHIFT_LABELS[shift]}
                            </span>
                            {/* Delete button — chỉ hiện nếu có lịch thật (không phải "off" mặc định) */}
                            {entry?.id && (
                              <button
                                onClick={() => setDeleteTarget({
                                  id: entry.id,
                                  stylistName: stylist.name,
                                  dateLabel: `${selectedDay}/${currentMonth + 1}/${currentYear}`,
                                })}
                                className="size-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 opacity-0 group-hover:opacity-100 transition-all"
                                title="Xóa lịch"
                              >
                                <IconTrash className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Summary */}
                    {filteredStylists.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Đi làm</span>
                          <span className="font-medium text-green-600">
                            {filteredStylists.filter(s => schedule[selectedDay]?.[s.id]?.shift && schedule[selectedDay]?.[s.id]?.shift !== "off").length} người
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Nghỉ</span>
                          <span className="font-medium text-gray-400">
                            {filteredStylists.filter(s => {
                              const sh = schedule[selectedDay]?.[s.id]?.shift;
                              return !sh || sh === "off";
                            }).length} người
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
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
              <CardTitle className="text-sm text-muted-foreground flex items-center justify-between">
                <span>Thống kê tháng</span>
                {blackoutsThisMonth.length > 0 && (
                  <span className="text-xs text-red-500 flex items-center gap-1">
                    <IconBan className="size-3" />
                    {blackoutsThisMonth.length} ngày nghỉ lễ
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {filteredStylists.slice(0, 4).map(stylist => {
                const workDays = Object.entries(schedule).filter(([dayStr, day]) => {
                  const d = parseInt(dayStr, 10);
                  if (isBlackoutDate(d)) return false;
                  return day[stylist.id]?.shift && day[stylist.id].shift !== "off";
                }).length;
                const totalDays = daysInMonth - blackoutsThisMonth.length;
                const pct = totalDays > 0 ? Math.round((workDays / totalDays) * 100) : 0;

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
              {filteredStylists.length === 0 && !loading && (
                <p className="text-xs text-muted-foreground text-center py-2">Chưa có dữ liệu</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddScheduleDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={fetchData}
      />

      <AddBlackoutDateDialog
        open={addBlackoutOpen}
        onClose={() => setAddBlackoutOpen(false)}
        onSuccess={() => { fetchBlackoutDates(); }}
        stylists={stylistsAll}
      />

      <DeleteConfirmDialog
        open={!!deleteTarget}
        stylistName={deleteTarget?.stylistName ?? ""}
        date={deleteTarget?.dateLabel ?? ""}
        onConfirm={handleDeleteSchedule}
        onCancel={() => { setDeleteTarget(null); setDeleteError(null); }}
        loading={deleting}
      />
    </div>
  );
}