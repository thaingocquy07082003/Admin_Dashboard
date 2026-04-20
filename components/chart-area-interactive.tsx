"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { useStats } from "@/hooks/use-stats"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { Skeleton } from "@/components/ui/skeleton"

interface ChartAreaInteractiveProps {
  period: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
}

const chartConfig = {
  totalRevenue: {
    label: "Tổng doanh thu",
    color: "hsl(var(--primary))",
  },
  completedRevenue: {
    label: "Doanh thu hoàn tất",
    color: "hsl(142 71% 45%)",
  },
  depositRevenue: {
    label: "Tiền cọc",
    color: "hsl(38 92% 50%)",
  },
} satisfies ChartConfig

function getPeriodLabel(period: 'week' | 'month' | 'year'): string {
  const labels = {
    week: 'Tuần này',
    month: 'Tháng này',
    year: 'Năm này',
  };
  return labels[period];
}

export function ChartAreaInteractive({ period, onPeriodChange }: ChartAreaInteractiveProps) {
  const isMobile = useIsMobile()
  const { data, loading, error, isAdmin } = useStats(period)

  if (error) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu</CardTitle>
          <CardDescription>
            <span className="text-red-600">{error}</span>
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Biểu đồ doanh thu</CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <Skeleton className="h-[250px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const chartData = data?.data?.chart || [];

  // Transform data for chart display - convert VND to millions for better readability
  const transformedData = chartData.map(item => ({
    label: item.label,
    date: item.date,
    totalRevenue: item.totalRevenue,
    completedRevenue: item.completedRevenue,
    depositRevenue: item.depositRevenue,
    totalAppointments: item.totalAppointments,
  }));

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Biểu đồ doanh thu</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {getPeriodLabel(period)}
          </span>
          <span className="@[540px]/card:hidden">Doanh thu {period}</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={period}
            onValueChange={(value) => {
              if (value) onPeriodChange(value as 'week' | 'month' | 'year');
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="week">Tuần này</ToggleGroupItem>
            <ToggleGroupItem value="month">Tháng này</ToggleGroupItem>
            <ToggleGroupItem value="year">Năm này</ToggleGroupItem>
          </ToggleGroup>
          <Select value={period} onValueChange={(value) => {
            onPeriodChange(value as 'week' | 'month' | 'year');
          }}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Chọn kỳ"
            >
              <SelectValue placeholder={getPeriodLabel(period)} />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="week" className="rounded-lg">
                Tuần này
              </SelectItem>
              <SelectItem value="month" className="rounded-lg">
                Tháng này
              </SelectItem>
              <SelectItem value="year" className="rounded-lg">
                Năm này
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={transformedData}>
            <defs>
              <linearGradient id="fillTotalRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillCompletedRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(142 71% 45%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(142 71% 45%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillDepositRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(38 92% 50%)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(38 92% 50%)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <YAxis
              tickFormatter={(value) => {
                if (value >= 1000000) {
                  return `${(value / 1000000).toFixed(0)}M`;
                } else if (value >= 1000) {
                  return `${(value / 1000).toFixed(0)}K`;
                }
                return value.toString();
              }}
            />
            <ChartTooltip
              cursor={false}
              defaultIndex={isMobile ? -1 : 0}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => value}
                  formatter={(value) => {
                    if (typeof value === 'number') {
                      return new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                        maximumFractionDigits: 0,
                      }).format(value);
                    }
                    return value;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="totalRevenue"
              type="natural"
              fill="url(#fillTotalRevenue)"
              stroke="hsl(var(--primary))"
              stackId="a"
            />
            <Area
              dataKey="completedRevenue"
              type="natural"
              fill="url(#fillCompletedRevenue)"
              stroke="hsl(142 71% 45%)"
              stackId="a"
            />
            <Area
              dataKey="depositRevenue"
              type="natural"
              fill="url(#fillDepositRevenue)"
              stroke="hsl(38 92% 50%)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
