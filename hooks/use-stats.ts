import { useState, useEffect } from 'react';

export interface SummaryAdmin {
  totalAppointments: number;
  completedRevenue: number;
  depositRevenue: number;
  totalRevenue: number;
  totalStylists: number;
  totalCustomers: number;
}

export interface SummaryStylist {
  totalAppointments: number;
  completedRevenue: number;
  depositRevenue: number;
  totalRevenue: number;
  totalDayOffs: number;
}

export type Summary = SummaryAdmin | SummaryStylist;

export interface ChartDataPoint {
  label: string;
  date: string;
  totalAppointments: number;
  completedRevenue: number;
  depositRevenue: number;
  totalRevenue: number;
  dayOffCount?: number;
}

export interface StatsData {
  statusCode: number;
  message: string;
  role: 'admin' | 'stylist';
  period: 'week' | 'month' | 'year';
  data: {
    summary: Summary;
    chart: ChartDataPoint[];
  };
  timestamp: string;
}

export interface UseStatsReturn {
  data: StatsData | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isStylist: boolean;
}

export function useStats(period: 'week' | 'month' | 'year' = 'week'): UseStatsReturn {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Lấy token từ localStorage (như hair-style page)
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          console.error('❌ Không tìm thấy accessToken trong localStorage');
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        console.log('✅ Token tìm thấy:', token.substring(0, 20) + '...');

        // ✅ Dùng fetch API (như hair-style page)
        const res = await fetch(
          `http://localhost:3003/api/v1/stats/revenue?period=${period}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          
          if (res.status === 401) {
            throw new Error('❌ Lỗi 401: Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (res.status === 403) {
            throw new Error('❌ Lỗi 403: Bạn không có quyền truy cập tài nguyên này');
          } else if (res.status === 404) {
            throw new Error('❌ Lỗi 404: API endpoint không tìm thấy');
          } else {
            throw new Error(errorData?.message || `Lỗi ${res.status}: ${res.statusText}`);
          }
        }

        const result: StatsData = await res.json();
        setData(result);
        console.log('✅ Lấy dữ liệu thành công:', result);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Lỗi khi lấy dữ liệu';
        console.error('🚨 Error:', message);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  return {
    data,
    loading,
    error,
    isAdmin: data?.role === 'admin',
    isStylist: data?.role === 'stylist',
  };
}
