'use client';

import { useEffect, useState } from 'react';
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
  colorClass: string; // e.g. "violet" | "sky" | "indigo" | "amber" | "blue" | "emerald" | "red"
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch('http://localhost:3003/api/v1/appointments/stats/overview', { headers }).then(r => r.json()),
      fetch('http://localhost:3003/api/v1/appointments/', { headers }).then(r => r.json()),
    ])
      .then(([statsRes, aptsRes]) => {
        if (statsRes.statusCode === 200) setStats(statsRes.data);
        if (aptsRes.statusCode === 200) setAppointments(aptsRes.data);
      })
      .catch(() => setError('Lỗi kết nối. Vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, []);

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-muted-foreground">
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
      </SidebarInset>
    </SidebarProvider>
  );
}