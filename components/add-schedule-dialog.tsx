'use client';

import * as React from "react";
import { useState, useEffect } from "react";
import {
  IconX,
  IconPlus,
  IconLoader2,
  IconCheck,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// API endpoints — đổi nếu backend dùng path khác
const STYLISTS_API_URL = "http://localhost:3002/api/v1/hairstyles/stylists/all";
const BULK_API_URL = "http://localhost:3003/api/v1/schedules/bulk";

interface Stylist {
  id: string;
  fullName?: string;
  name?: string;
  email?: string;
}

interface BreakTime {
  breakStart: string;
  breakEnd: string;
  reason: string;
}

interface AddScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WEEK_DAYS = [
  { value: 1, label: "T2" },
  { value: 2, label: "T3" },
  { value: 3, label: "T4" },
  { value: 4, label: "T5" },
  { value: 5, label: "T6" },
  { value: 6, label: "T7" },
  { value: 7, label: "CN" },
];

export function AddScheduleDialog({ open, onClose, onSuccess }: AddScheduleDialogProps) {
  // Stylists list
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [loadingStylists, setLoadingStylists] = useState(false);
  const [stylistError, setStylistError] = useState<string | null>(null);

  // Form state
  const [selectedStylistIds, setSelectedStylistIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [workDays, setWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>([
    { breakStart: "12:00", breakEnd: "13:00", reason: "Ăn trưa" },
  ]);
  const [excludeDates, setExcludeDates] = useState<string[]>([]);
  const [newExcludeDate, setNewExcludeDate] = useState("");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // Reset form khi đóng
  useEffect(() => {
    if (!open) {
      setSubmitError(null);
      setSubmitSuccess(null);
    }
  }, [open]);

  // Fetch stylists khi mở dialog
  useEffect(() => {
    if (!open) return;
    const fetchStylists = async () => {
      setLoadingStylists(true);
      setStylistError(null);
      try {
        const res = await fetch(STYLISTS_API_URL, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // API trả { data: [...] }
        const list: Stylist[] = json.data || [];
        setStylists(list);
      } catch (err) {
        console.error("Fetch stylists error:", err);
        setStylistError(err instanceof Error ? err.message : "Không tải được danh sách thợ");
      } finally {
        setLoadingStylists(false);
      }
    };
    fetchStylists();
  }, [open]);

  const toggleStylist = (id: string) => {
    setSelectedStylistIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleAllStylists = () => {
    if (selectedStylistIds.length === stylists.length) setSelectedStylistIds([]);
    else setSelectedStylistIds(stylists.map(s => s.id));
  };

  const toggleWorkDay = (day: number) => {
    setWorkDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const addBreakTime = () => {
    setBreakTimes(prev => [...prev, { breakStart: "", breakEnd: "", reason: "" }]);
  };

  const updateBreakTime = (idx: number, field: keyof BreakTime, value: string) => {
    setBreakTimes(prev => prev.map((b, i) => i === idx ? { ...b, [field]: value } : b));
  };

  const removeBreakTime = (idx: number) => {
    setBreakTimes(prev => prev.filter((_, i) => i !== idx));
  };

  const addExcludeDate = () => {
    if (newExcludeDate && !excludeDates.includes(newExcludeDate)) {
      setExcludeDates(prev => [...prev, newExcludeDate].sort());
      setNewExcludeDate("");
    }
  };

  const removeExcludeDate = (date: string) => {
    setExcludeDates(prev => prev.filter(d => d !== date));
  };

  const getStylistName = (s: Stylist) =>
    s.fullName || s.name || s.email || s.id.slice(0, 8);

  const handleSubmit = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    // Validate
    if (selectedStylistIds.length === 0) {
      setSubmitError("Vui lòng chọn ít nhất 1 thợ");
      return;
    }
    if (!startDate || !endDate) {
      setSubmitError("Vui lòng chọn ngày bắt đầu và kết thúc");
      return;
    }
    if (startDate > endDate) {
      setSubmitError("Ngày bắt đầu phải trước ngày kết thúc");
      return;
    }
    if (!startTime || !endTime) {
      setSubmitError("Vui lòng chọn giờ bắt đầu và kết thúc");
      return;
    }
    if (workDays.length === 0) {
      setSubmitError("Vui lòng chọn ít nhất 1 ngày trong tuần");
      return;
    }

    // Lọc breakTimes hợp lệ (đủ start/end)
    const validBreaks = breakTimes.filter(b => b.breakStart && b.breakEnd);

    const body = {
      stylistIds: selectedStylistIds,
      startDate,
      endDate,
      startTime,
      endTime,
      workDays,
      breakTimes: validBreaks,
      excludeDates,
    };

    setSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) throw new Error("Không có token xác thực — vui lòng đăng nhập lại");

      const res = await fetch(BULK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || (json.statusCode && json.statusCode >= 400)) {
        throw new Error(json.message || `HTTP ${res.status}`);
      }

      setSubmitSuccess(json.message || "Tạo lịch thành công");
      onSuccess();
      // Tự đóng sau 1s để người dùng kịp thấy thông báo
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error("Submit bulk schedule error:", err);
      setSubmitError(err instanceof Error ? err.message : "Lỗi khi tạo lịch");
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
        className="bg-background border rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Thêm lịch làm việc</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tạo lịch hàng loạt cho nhiều thợ trong khoảng thời gian
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="size-8">
            <IconX className="size-4" />
          </Button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stylists */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">
                Thợ cắt tóc
                {selectedStylistIds.length > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (đã chọn {selectedStylistIds.length})
                  </span>
                )}
              </Label>
              {stylists.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAllStylists}
                  className="text-xs text-primary hover:underline"
                >
                  {selectedStylistIds.length === stylists.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                </button>
              )}
            </div>

            {loadingStylists ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
                <IconLoader2 className="size-4 animate-spin" />
                Đang tải danh sách thợ...
              </div>
            ) : stylistError ? (
              <div className="text-sm text-red-600 py-2">
                Lỗi: {stylistError}
              </div>
            ) : stylists.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2">Không có thợ</div>
            ) : (
              <div className="border rounded-lg max-h-48 overflow-y-auto divide-y">
                {stylists.map(s => {
                  const checked = selectedStylistIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleStylist(s.id)}
                      />
                      <span className="flex-1">{getStylistName(s)}</span>
                      {s.email && <span className="text-xs text-muted-foreground">{s.email}</span>}
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium mb-1.5">Ngày bắt đầu</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium mb-1.5">Ngày kết thúc</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startTime" className="text-sm font-medium mb-1.5">Giờ bắt đầu</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime" className="text-sm font-medium mb-1.5">Giờ kết thúc</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          {/* Work days */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Ngày làm trong tuần</Label>
            <div className="flex gap-1.5 flex-wrap">
              {WEEK_DAYS.map(d => {
                const active = workDays.includes(d.value);
                return (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => toggleWorkDay(d.value)}
                    className={`size-10 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Break times */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-medium">Giờ nghỉ (không bắt buộc)</Label>
              <Button type="button" variant="outline" size="sm" onClick={addBreakTime}>
                <IconPlus className="size-3.5" />
                Thêm giờ nghỉ
              </Button>
            </div>
            <div className="space-y-2">
              {breakTimes.length === 0 && (
                <p className="text-xs text-muted-foreground">Chưa có giờ nghỉ</p>
              )}
              {breakTimes.map((b, idx) => (
                <div key={idx} className="flex items-end gap-2 p-2 border rounded-lg">
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1">Bắt đầu</Label>
                      <Input
                        type="time"
                        value={b.breakStart}
                        onChange={(e) => updateBreakTime(idx, "breakStart", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1">Kết thúc</Label>
                      <Input
                        type="time"
                        value={b.breakEnd}
                        onChange={(e) => updateBreakTime(idx, "breakEnd", e.target.value)}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1">Lý do</Label>
                      <Input
                        type="text"
                        value={b.reason}
                        onChange={(e) => updateBreakTime(idx, "reason", e.target.value)}
                        placeholder="VD: Ăn trưa"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBreakTime(idx)}
                    className="size-8 text-red-500 hover:text-red-600"
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Exclude dates */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Ngày loại trừ (không bắt buộc)</Label>
            <div className="flex gap-2 mb-2">
              <Input
                type="date"
                value={newExcludeDate}
                onChange={(e) => setNewExcludeDate(e.target.value)}
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addExcludeDate} disabled={!newExcludeDate}>
                <IconPlus className="size-4" />
                Thêm
              </Button>
            </div>
            {excludeDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {excludeDates.map(d => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => removeExcludeDate(d)}
                      className="hover:text-red-500"
                    >
                      <IconX className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status messages */}
          {submitError && (
            <div className="p-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-900 text-sm text-red-700 dark:text-red-300">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-900 text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
              <IconCheck className="size-4" />
              {submitSuccess}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <IconPlus className="size-4" />
                Tạo lịch
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}