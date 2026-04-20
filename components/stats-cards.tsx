"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useStats, Summary } from "@/hooks/use-stats";
import { Users, Briefcase, TrendingUp, AlertCircle, Clock } from "lucide-react";

interface StatsCardsProps {
  period: 'week' | 'month' | 'year';
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export function StatsCards({ period }: StatsCardsProps) {
  const { data, loading, error, isAdmin, isStylist } = useStats(period);

  if (error) {
    return (
      <div className="flex flex-row gap-4">
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Lỗi</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-row gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="flex-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data?.data?.summary) {
    return null;
  }

  const summary = data.data.summary;

  return (
    <div className="flex flex-col gap-4">
      {/* Main stats row */}
      <div className="flex flex-row gap-4 flex-wrap">
        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh thu</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Gồm cả tiền cọc và hoàn tất
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hoàn tất</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.completedRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Từ các cuộc hẹn đã hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiền cọc</CardTitle>
            <Briefcase className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.depositRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Tiền khách hàng cọc trước
            </p>
          </CardContent>
        </Card>

        <Card className="flex-1 min-w-[200px]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng cuộc hẹn</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">
              Trong kỳ {period === 'week' ? 'này' : 'này'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin-specific stats */}
      {isAdmin && 'totalStylists' in summary && (
        <div className="flex flex-row gap-4 flex-wrap">
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thợ cắt tóc</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary as any).totalStylists}
              </div>
              <p className="text-xs text-muted-foreground">
                Số thợ cắt tóc trong hệ thống
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng khách hàng</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary as any).totalCustomers}
              </div>
              <p className="text-xs text-muted-foreground">
                Số khách hàng đã đăng ký
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stylist-specific stats */}
      {isStylist && 'totalDayOffs' in summary && (
        <div className="flex flex-row gap-4 flex-wrap">
          <Card className="flex-1 min-w-[200px]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ngày nghỉ</CardTitle>
              <Clock className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(summary as any).totalDayOffs}
              </div>
              <p className="text-xs text-muted-foreground">
                Tổng số ngày nghỉ trong kỳ
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 