'use client';

import { useCallback, useEffect, useState } from 'react';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  IconCalendar,
  IconCalendarCheck,
  IconCalendarClock,
  IconCalendarX,
  IconCalendarStats,
  IconCalendarUp,
  IconCalendarDue,
  IconLoader2,
  IconAlertCircle,
  IconEye,
  IconSearch,
  IconFilter,
  IconX,
  IconUser,
  IconPhone,
  IconMail,
  IconClock,
  IconCurrencyDong,
  IconScissors,
  IconNotes,
  IconBan,
  IconCheck,
  IconPencil,
} from '@tabler/icons-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OverviewStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  noShow: number;
  todayAppointments: number;
  upcomingAppointments: number;
}

interface Appointment {
  id: string;
  customerId: string;
  stylistId: string;
  hairstyleId: string;
  serviceIds?: string[];
  appointmentDate: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes: string | null;
  cancellationReason: string | null;
  price: number;
  depositAmount: number;
  depositPaid: boolean;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

interface AppointmentDetail extends Appointment {
  stylistName: string;
  stylistAvatar: string | null;
  hairstyleName: string;
  hairstyleImage: string | null;
  customerFullName: string;
  customerUserEmail: string;
  customerUserPhone: string;
}

interface RefStylist {
  id: string;
  fullName?: string;
  name?: string;
}

interface RefHairstyle {
  id: string;
  name: string;
}

interface RefService {
  id: string;
  name: string;
}

interface AppointmentUpdatePayload {
  stylistId?: string;
  hairstyleId?: string;
  serviceIds?: string[];
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
  status?: Appointment['status'];
  price?: number;
  depositAmount?: number;
  depositPaid?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; textClass: string; bgClass: string; borderClass: string; dotClass: string }> = {
  pending:   { label: 'Chờ xác nhận', textClass: 'text-amber-700 dark:text-amber-400',   bgClass: 'bg-amber-50 dark:bg-amber-950/40',    borderClass: 'border-amber-200 dark:border-amber-800',   dotClass: 'bg-amber-400' },
  confirmed: { label: 'Đã xác nhận',  textClass: 'text-blue-700 dark:text-blue-400',     bgClass: 'bg-blue-50 dark:bg-blue-950/40',      borderClass: 'border-blue-200 dark:border-blue-800',     dotClass: 'bg-blue-500' },
  completed: { label: 'Hoàn thành',   textClass: 'text-emerald-700 dark:text-emerald-400',bgClass: 'bg-emerald-50 dark:bg-emerald-950/40',borderClass: 'border-emerald-200 dark:border-emerald-800',dotClass: 'bg-emerald-500' },
  cancelled: { label: 'Đã hủy',       textClass: 'text-red-700 dark:text-red-400',       bgClass: 'bg-red-50 dark:bg-red-950/40',        borderClass: 'border-red-200 dark:border-red-800',       dotClass: 'bg-red-400' },
  no_show:   { label: 'Vắng mặt',     textClass: 'text-muted-foreground',                bgClass: 'bg-muted',                            borderClass: 'border-border',                            dotClass: 'bg-muted-foreground' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bgClass} ${cfg.borderClass} ${cfg.textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, colorClass, sub,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  colorClass: string;
  sub?: string;
}) {
  const colorMap: Record<string, { border: string; iconBg: string; iconText: string }> = {
    violet:  { border: 'border-l-violet-500',  iconBg: 'bg-violet-500',  iconText: 'text-white' },
    sky:     { border: 'border-l-sky-500',      iconBg: 'bg-sky-500',     iconText: 'text-white' },
    indigo:  { border: 'border-l-indigo-500',   iconBg: 'bg-indigo-500',  iconText: 'text-white' },
    amber:   { border: 'border-l-amber-500',    iconBg: 'bg-amber-500',   iconText: 'text-white' },
    blue:    { border: 'border-l-blue-500',     iconBg: 'bg-blue-500',    iconText: 'text-white' },
    emerald: { border: 'border-l-emerald-500',  iconBg: 'bg-emerald-500', iconText: 'text-white' },
    red:     { border: 'border-l-red-400',      iconBg: 'bg-red-400',     iconText: 'text-white' },
  };
  const c = colorMap[colorClass] ?? colorMap['violet'];

  return (
    <div className={`bg-card text-card-foreground rounded-2xl border border-border border-l-4 ${c.border} p-5 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold tabular-nums">{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
          <Icon className={`w-5 h-5 ${c.iconText}`} />
        </div>
      </div>
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function DetailRow({ icon: Icon, label, value, valueClass }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-border/40 last:border-0">
      <div className="p-1 rounded-lg bg-muted shrink-0 mt-0.5">
        <Icon className="w-3 h-3 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground/80 mb-0.5">{label}</p>
        <p className={`text-sm font-medium break-words ${valueClass ?? ''}`}>{value}</p>
      </div>
    </div>
  );
}

function AppointmentDetailModal({
  appointmentId,
  onClose,
}: {
  appointmentId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Không tìm thấy token.');
      setLoading(false);
      return;
    }

    fetch(`http://localhost:3003/api/v1/appointments/${appointmentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.statusCode === 200) {
          setDetail(res.data);
        } else {
          setError(res.message ?? 'Không thể tải chi tiết.');
        }
      })
      .catch(() => setError('Lỗi kết nối. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [appointmentId]);

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border/50 shrink-0">
          <div>
            <h2 className="text-base font-semibold">Chi tiết lịch hẹn</h2>
            <p className="text-xs text-muted-foreground mt-1 font-mono">{appointmentId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground shrink-0"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <IconLoader2 className="w-7 h-7 animate-spin" />
              <span className="text-sm">Đang tải chi tiết...</span>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-red-400">
              <IconAlertCircle className="w-7 h-7" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {detail && (
            <div className="p-6 space-y-6">

              {/* Status + hairstyle image header */}
              <div className="flex items-start gap-4">
                {detail.hairstyleImage && (
                  <img
                    src={detail.hairstyleImage}
                    alt={detail.hairstyleName}
                    className="w-20 h-20 rounded-xl object-cover border border-border shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <StatusBadge status={detail.status} />
                  </div>
                  <h3 className="text-lg font-bold truncate">{detail.hairstyleName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(detail.appointmentDate)} &bull; {detail.startTime.slice(0, 5)} – {detail.endTime.slice(0, 5)} ({detail.duration} phút)
                  </p>
                </div>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6">

                {/* Customer info */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Khách hàng</p>
                  <div className="bg-muted/40 rounded-xl px-4 py-1">
                    <DetailRow icon={IconUser} label="Họ tên" value={detail.customerFullName || detail.customerName} />
                    <DetailRow icon={IconPhone} label="Điện thoại" value={detail.customerUserPhone || detail.customerPhone} />
                    <DetailRow icon={IconMail} label="Email" value={detail.customerUserEmail || detail.customerEmail} />
                  </div>
                </div>

                {/* Stylist info */}
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thợ cắt tóc</p>
                  <div className="bg-muted/40 rounded-xl px-4 py-1">
                    <div className="flex items-start gap-3 py-2.5 border-b border-border/50">
                      <div className="p-1.5 rounded-lg bg-muted shrink-0 mt-0.5">
                        <IconScissors className="w-3.5 h-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-0.5">Tên thợ</p>
                        <div className="flex items-center gap-2">
                          {detail.stylistAvatar && (
                            <img src={detail.stylistAvatar} alt={detail.stylistName} className="w-5 h-5 rounded-full object-cover" />
                          )}
                          <p className="text-sm font-medium">{detail.stylistName}</p>
                        </div>
                      </div>
                    </div>
                    <DetailRow icon={IconScissors} label="Kiểu tóc" value={detail.hairstyleName} />
                    <DetailRow
                      icon={IconClock}
                      label="Thời lượng"
                      value={`${detail.duration} phút`}
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Thanh toán</p>
                <div className="bg-muted/40 rounded-xl px-4 py-1">
                  <DetailRow
                    icon={IconCurrencyDong}
                    label="Tổng giá"
                    value={formatCurrency(detail.price)}
                    valueClass="text-primary font-bold"
                  />
                  {detail.depositAmount > 0 && (
                    <DetailRow
                      icon={IconCurrencyDong}
                      label="Đặt cọc"
                      value={
                        <span className="flex items-center gap-1.5">
                          {formatCurrency(detail.depositAmount)}
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${detail.depositPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'}`}>
                            {detail.depositPaid ? '✓ Đã cọc' : '✗ Chưa cọc'}
                          </span>
                        </span>
                      }
                    />
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lịch sử trạng thái</p>
                <div className="bg-muted/40 rounded-xl px-4 py-1">
                  <DetailRow icon={IconCalendar} label="Ngày tạo" value={formatDateTime(detail.createdAt)} />
                  {detail.confirmedAt && (
                    <DetailRow icon={IconCheck} label="Xác nhận lúc" value={formatDateTime(detail.confirmedAt)} valueClass="text-blue-600 dark:text-blue-400" />
                  )}
                  {detail.completedAt && (
                    <DetailRow icon={IconCheck} label="Hoàn thành lúc" value={formatDateTime(detail.completedAt)} valueClass="text-emerald-600 dark:text-emerald-400" />
                  )}
                  {detail.cancelledAt && (
                    <DetailRow icon={IconBan} label="Hủy lúc" value={formatDateTime(detail.cancelledAt)} valueClass="text-red-500 dark:text-red-400" />
                  )}
                </div>
              </div>

              {/* Notes / Cancellation reason */}
              {(detail.notes || detail.cancellationReason) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Ghi chú</p>
                  <div className="bg-muted/40 rounded-xl px-4 py-1">
                    {detail.cancellationReason && (
                      <DetailRow
                        icon={IconBan}
                        label="Lý do hủy"
                        value={detail.cancellationReason}
                        valueClass="text-red-500 dark:text-red-400"
                      />
                    )}
                    {detail.notes && (
                      <DetailRow icon={IconNotes} label="Ghi chú" value={detail.notes} />
                    )}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-muted transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentEditModal({
  appointment,
  stylists,
  hairstyles,
  services,
  onClose,
  onSuccess,
}: {
  appointment: Appointment;
  stylists: RefStylist[];
  hairstyles: RefHairstyle[];
  services: RefService[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState({
    stylistId: appointment.stylistId,
    hairstyleId: appointment.hairstyleId,
    appointmentDate: appointment.appointmentDate?.slice(0, 10) ?? '',
    startTime: appointment.startTime?.slice(0, 5) ?? '',
    duration: String(appointment.duration ?? 0),
    customerName: appointment.customerName ?? '',
    customerPhone: appointment.customerPhone ?? '',
    customerEmail: appointment.customerEmail ?? '',
    notes: appointment.notes ?? '',
    status: appointment.status,
    price: String(appointment.price ?? 0),
    depositAmount: String(appointment.depositAmount ?? 0),
    depositPaid: appointment.depositPaid,
  });
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(appointment.serviceIds ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) throw new Error('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');

      const price = Number(form.price);
      const depositAmount = Number(form.depositAmount);

      if (!Number.isFinite(price) || price < 0) {
        throw new Error('Giá không hợp lệ.');
      }
      if (!Number.isFinite(depositAmount) || depositAmount < 0) {
        throw new Error('Tiền cọc không hợp lệ.');
      }

      const trimmedCustomerName = form.customerName.trim();
      const trimmedCustomerPhone = form.customerPhone.trim();
      const trimmedCustomerEmail = form.customerEmail.trim();
      const trimmedNotes = form.notes.trim();

      const payload: AppointmentUpdatePayload = {
        ...(form.stylistId ? { stylistId: form.stylistId } : {}),
        ...(form.hairstyleId ? { hairstyleId: form.hairstyleId } : {}),
        ...(selectedServiceIds.length > 0 ? { serviceIds: selectedServiceIds } : {}),
        ...(trimmedCustomerName ? { customerName: trimmedCustomerName } : {}),
        ...(trimmedCustomerPhone ? { customerPhone: trimmedCustomerPhone } : {}),
        ...(trimmedCustomerEmail ? { customerEmail: trimmedCustomerEmail } : {}),
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        status: form.status,
        price,
        depositAmount,
        depositPaid: form.depositPaid,
      };

      const response = await fetch(`http://localhost:3003/api/v1/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || (typeof result.statusCode === 'number' && result.statusCode >= 400)) {
        throw new Error(result.message || 'Không thể cập nhật lịch hẹn');
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật lịch hẹn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-card text-card-foreground rounded-xl border border-border shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 shrink-0">
          <h2 className="text-base font-semibold">Chỉnh sửa lịch hẹn</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Thợ cắt tóc</label>
              <select
                value={form.stylistId}
                onChange={(e) => setForm((prev) => ({ ...prev, stylistId: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="">-- Chọn stylist --</option>
                {stylists.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName || s.name || s.id}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm">Kiểu tóc</label>
              <select
                value={form.hairstyleId}
                onChange={(e) => setForm((prev) => ({ ...prev, hairstyleId: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="">-- Chọn kiểu tóc --</option>
                {hairstyles.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm">Dịch vụ (serviceIds)</label>
            <div className="mt-1 border border-border rounded-lg p-3 max-h-36 overflow-y-auto space-y-2">
              {services.length === 0 ? (
                <p className="text-xs text-muted-foreground">Không có dữ liệu dịch vụ</p>
              ) : (
                services.map((service) => (
                  <label key={service.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServiceIds.includes(service.id)}
                      onChange={() => toggleService(service.id)}
                    />
                    <span>{service.name}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Ngày hẹn</label>
              <input
                type="date"
                value={form.appointmentDate}
                disabled
                className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm">Giờ bắt đầu</label>
              <input
                type="time"
                value={form.startTime}
                disabled
                className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-sm">Thời lượng (phút)</label>
              <input
                type="number"
                value={form.duration}
                disabled
                className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
              />
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Thời gian lịch hẹn không thể chỉnh sửa ở màn hình này.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Tên khách hàng</label>
              <input value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="text-sm">Số điện thoại</label>
              <input value={form.customerPhone} onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="text-sm">Email</label>
              <input type="email" value={form.customerEmail} onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm">Trạng thái</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as Appointment['status'] }))}
                className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background"
              >
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
                <option value="no_show">Vắng mặt</option>
              </select>
            </div>
            <div>
              <label className="text-sm">Giá</label>
              <input type="number" min={0} value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
            <div>
              <label className="text-sm">Tiền cọc</label>
              <input type="number" min={0} value={form.depositAmount} onChange={(e) => setForm((prev) => ({ ...prev, depositAmount: e.target.value }))} className="mt-1 w-full px-3 py-2 border border-input rounded-lg bg-background" />
            </div>
          </div>

          <div>
            <label className="inline-flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={form.depositPaid}
                onChange={(e) => setForm((prev) => ({ ...prev, depositPaid: e.target.checked }))}
              />
              Đã thanh toán cọc
            </label>
          </div>

          <div>
            <label className="text-sm">Ghi chú</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="mt-1 w-full min-h-20 px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border bg-muted/20 shrink-0 flex justify-end gap-2">
          <button className="px-4 py-2 text-sm border border-border rounded-lg" onClick={onClose} disabled={loading}>Hủy</button>
          <button className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground" onClick={submit} disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stylists, setStylists] = useState<RefStylist[]>([]);
  const [hairstyles, setHairstyles] = useState<RefHairstyle[]>([]);
  const [services, setServices] = useState<RefService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [statsRes, aptsRes] = await Promise.all([
        fetch('http://localhost:3003/api/v1/appointments/stats/overview', { headers }).then(r => r.json()),
        fetch('http://localhost:3003/api/v1/appointments/', { headers }).then(r => r.json()),
      ]);

      if (statsRes.statusCode === 200) setStats(statsRes.data);
      if (aptsRes.statusCode === 200) setAppointments(aptsRes.data);
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReferenceData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const [stylistsRes, hairstylesRes, servicesRes] = await Promise.all([
        fetch('http://localhost:3002/api/v1/hairstyles/stylists/all', { headers }).then(r => r.json()),
        fetch('http://localhost:3002/api/v1/hairstyles', { headers }).then(r => r.json()),
        fetch('http://localhost:3003/api/v1/services').then(r => r.json()),
      ]);

      if (stylistsRes.statusCode === 200) setStylists(stylistsRes.data ?? []);
      if (hairstylesRes.statusCode === 200) setHairstyles(hairstylesRes.data ?? []);
      if (servicesRes.statusCode === 200) setServices(servicesRes.data ?? []);
    } catch {
      // Keep page usable even if references fail.
    }
  }, []);

  useEffect(() => {
    void fetchDashboardData();
    void fetchReferenceData();
  }, [fetchDashboardData, fetchReferenceData]);

  const filtered = appointments.filter(a => {
    const matchSearch =
      a.customerName.toLowerCase().includes(search.toLowerCase()) ||
      a.customerPhone.includes(search) ||
      a.customerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Loading ──
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <IconLoader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Đang tải dữ liệu...</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-3 text-red-400">
              <IconAlertCircle className="w-8 h-8" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />

        <div className="flex flex-col gap-6 p-6 bg-background min-h-screen">

          {/* ── Page header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Lịch hẹn</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Quản lý và theo dõi tất cả lịch hẹn</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 xl:grid-cols-8">
              <div className="col-span-2 lg:col-span-2">
                <StatCard label="Tổng lịch hẹn" value={stats.total} icon={IconCalendarStats} colorClass="violet" sub="Toàn bộ hệ thống" />
              </div>
              <div className="col-span-1">
                <StatCard label="Hôm nay" value={stats.todayAppointments} icon={IconCalendarDue} colorClass="sky" />
              </div>
              <div className="col-span-1">
                <StatCard label="Sắp tới" value={stats.upcomingAppointments} icon={IconCalendarUp} colorClass="indigo" />
              </div>
              <div className="col-span-1">
                <StatCard label="Chờ xác nhận" value={stats.pending} icon={IconCalendarClock} colorClass="amber" />
              </div>
              <div className="col-span-1">
                <StatCard label="Đã xác nhận" value={stats.confirmed} icon={IconCalendarCheck} colorClass="blue" />
              </div>
              <div className="col-span-1">
                <StatCard label="Hoàn thành" value={stats.completed} icon={IconCalendar} colorClass="emerald" />
              </div>
              <div className="col-span-1">
                <StatCard label="Đã hủy" value={stats.cancelled} icon={IconCalendarX} colorClass="red" />
              </div>
            </div>
          )}

          {/* ── Table card ── */}
          <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-sm overflow-hidden">

            {/* Table toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold">
                Danh sách lịch hẹn
                <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {filtered.length} kết quả
                </span>
              </h2>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:w-64">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Tìm tên, SĐT, email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring bg-background text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                {/* Status filter */}
                <div className="relative">
                  <IconFilter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="pl-7 pr-3 py-2 text-sm border border-input rounded-xl focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring bg-background text-foreground appearance-none cursor-pointer"
                  >
                    <option value="all">Tất cả</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="confirmed">Đã xác nhận</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                    <option value="no_show">Vắng mặt</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Khách hàng</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ngày hẹn</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Giờ</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Thời lượng</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Trạng thái</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Giá</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Đặt cọc</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Ghi chú</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-16 text-muted-foreground">
                        <IconCalendarX className="w-8 h-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Không có lịch hẹn nào</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map(apt => (
                      <tr key={apt.id} className="hover:bg-muted/50 transition-colors">

                        {/* Customer */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                              {apt.customerName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{apt.customerName}</p>
                              <p className="text-xs text-muted-foreground truncate">{apt.customerPhone}</p>
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-sm">
                          {formatDate(apt.appointmentDate)}
                        </td>

                        {/* Time */}
                        <td className="px-4 py-3.5 whitespace-nowrap font-mono text-xs text-muted-foreground">
                          {apt.startTime.slice(0, 5)} – {apt.endTime.slice(0, 5)}
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                          {apt.duration} phút
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <StatusBadge status={apt.status} />
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-semibold text-sm">
                          {formatCurrency(apt.price)}
                        </td>

                        {/* Deposit */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {apt.depositAmount > 0 ? (
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs">{formatCurrency(apt.depositAmount)}</span>
                              <span className={`text-xs font-medium ${apt.depositPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>
                                {apt.depositPaid ? '✓ Đã cọc' : '✗ Chưa cọc'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Notes */}
                        <td className="px-4 py-3.5 max-w-[180px]">
                          {apt.cancellationReason ? (
                            <span className="text-xs text-red-500 dark:text-red-400 italic truncate block" title={apt.cancellationReason}>
                              Hủy: {apt.cancellationReason}
                            </span>
                          ) : apt.notes ? (
                            <span className="text-xs text-muted-foreground truncate block" title={apt.notes}>
                              {apt.notes}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center gap-2">
                            <button
                              onClick={() => setEditingAppointment(apt)}
                              title="Chỉnh sửa"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-amber-50 hover:border-amber-300 hover:text-amber-600 dark:hover:bg-amber-950/30 dark:hover:border-amber-700 dark:hover:text-amber-400 text-muted-foreground transition-colors"
                            >
                              <IconPencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedAppointmentId(apt.id)}
                              title="Xem chi tiết"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-background hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950/30 dark:hover:border-blue-700 dark:hover:text-blue-400 text-muted-foreground transition-colors"
                            >
                              <IconEye className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Hiển thị <span className="font-medium text-foreground">{filtered.length}</span> / <span className="font-medium text-foreground">{appointments.length}</span> lịch hẹn
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = appointments.filter(a => a.status === key).length;
                    if (count === 0) return null;
                    return (
                      <span key={key} className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotClass}`} />
                        {cfg.label}: {count}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Detail Modal ── */}
        {selectedAppointmentId && (
          <AppointmentDetailModal
            appointmentId={selectedAppointmentId}
            onClose={() => setSelectedAppointmentId(null)}
          />
        )}

        {editingAppointment && (
          <AppointmentEditModal
            appointment={editingAppointment}
            stylists={stylists}
            hairstyles={hairstyles}
            services={services}
            onClose={() => setEditingAppointment(null)}
            onSuccess={() => {
              setEditingAppointment(null);
              void fetchDashboardData();
            }}
          />
        )}

      </SidebarInset>
    </SidebarProvider>
  );
}