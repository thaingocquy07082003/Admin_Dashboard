"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { ThemeSelector } from "@/components/theme-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconClock, IconReload, IconUsers } from "@tabler/icons-react";

interface Hairstyle {
	id: string;
	name: string;
	description: string;
	price: number;
	duration: number;
	imageUrl: string;
	category: string;
	difficulty: "easy" | "medium" | "hard";
	stylistIds: string[];
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface HairstyleMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

interface HairstyleResponse {
	statusCode: number;
	message: string;
	data: Hairstyle[];
	meta: HairstyleMeta;
	timestamp: string;
}

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
	style: "currency",
	currency: "VND",
	maximumFractionDigits: 0,
});

const difficultyMap: Record<Hairstyle["difficulty"], string> = {
	easy: "Dễ",
	medium: "Trung bình",
	hard: "Khó",
};

export default function HairStylePage() {
	const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
	const [meta, setMeta] = useState<HairstyleMeta | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchHairstyles = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch("http://localhost:3002/api/v1/hairstyles", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Không thể tải danh sách kiểu tóc");
			}

			const result: HairstyleResponse = await response.json();
			setHairstyles(result.data ?? []);
			setMeta(result.meta ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchHairstyles();
	}, []);

	const renderContent = () => {
		if (error) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<p className="text-sm text-red-500">{error}</p>
						<Button variant="outline" onClick={fetchHairstyles}>
							<IconReload className="h-4 w-4" />
							Thử lại
						</Button>
					</div>
				</div>
			);
		}

		if (isLoading) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<div className="flex flex-col items-center gap-2">
						<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
						<p className="text-sm text-muted-foreground">Đang tải danh sách kiểu tóc...</p>
					</div>
				</div>
			);
		}

		if (hairstyles.length === 0) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<p className="text-sm text-muted-foreground">Không có dữ liệu kiểu tóc</p>
				</div>
			);
		}

		return (
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4 lg:px-6">
					<div className="text-sm text-muted-foreground">
						{meta
							? `Tổng ${meta.total} kiểu tóc - Trang ${meta.page}/${meta.totalPages}`
							: `Tổng ${hairstyles.length} kiểu tóc`}
					</div>
					<Button variant="outline" size="sm" onClick={fetchHairstyles}>
						<IconReload className="h-4 w-4" />
						Tải lại
					</Button>
				</div>

				<div className="grid grid-cols-1 gap-4 px-4 pb-4 md:grid-cols-2 xl:grid-cols-3 lg:px-6 lg:pb-6">
					{hairstyles.map((item) => (
						<Card key={item.id} className="overflow-hidden">
							<div className="relative aspect-[4/3] w-full bg-muted">
								<img
									src={item.imageUrl}
									alt={item.name}
									className="h-full w-full object-cover"
									loading="lazy"
									referrerPolicy="no-referrer"
								/>
								<div className="absolute right-3 top-3">
									<Badge variant={item.isActive ? "default" : "secondary"}>
										{item.isActive ? "Đang hoạt động" : "Tạm ngưng"}
									</Badge>
								</div>
							</div>

							<CardHeader className="space-y-2">
								<div className="flex items-start justify-between gap-3">
									<CardTitle className="line-clamp-1 text-base">{item.name}</CardTitle>
									<Badge variant="outline">{difficultyMap[item.difficulty]}</Badge>
								</div>
								<p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
							</CardHeader>

							<CardContent className="space-y-3">
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Giá</span>
									<span className="font-semibold text-primary">{currencyFormatter.format(item.price)}</span>
								</div>

								<div className="flex items-center justify-between text-sm">
									<span className="inline-flex items-center gap-1 text-muted-foreground">
										<IconClock className="h-4 w-4" />
										{item.duration} phút
									</span>
									<span className="inline-flex items-center gap-1 text-muted-foreground">
										<IconUsers className="h-4 w-4" />
										{item.stylistIds.length} stylist
									</span>
								</div>

								<div className="pt-1">
									<Badge variant="secondary" className="capitalize">
										{item.category.replaceAll("_", " ")}
									</Badge>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	};

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as React.CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
					<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
						<SidebarTrigger className="-ml-1" />
						<Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
						<h1 className="text-base font-medium">Hair Style Management</h1>
						<div className="ml-auto flex items-center gap-2">
							<ThemeSelector />
							<ModeToggle />
						</div>
					</div>
				</header>

				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-1 flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6">
								<div className="rounded-lg border border-border/40 bg-card shadow-sm">{renderContent()}</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
