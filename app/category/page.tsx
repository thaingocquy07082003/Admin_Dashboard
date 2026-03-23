"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { ThemeSelector } from "@/components/theme-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconReload } from "@tabler/icons-react";

interface HairCategory {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	icon: string | null;
	imageUrl: string | null;
	displayOrder: number;
	isActive: boolean;
	metaTitle: string | null;
	metaDescription: string | null;
	createdAt: string;
	updatedAt: string;
	hairstyleCount: number;
}

interface CategoryMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

interface HairCategoryResponse {
	statusCode: number;
	message: string;
	data: HairCategory[];
	meta: CategoryMeta;
	timestamp: string;
}

export default function CategoryPage() {
	const [categories, setCategories] = useState<HairCategory[]>([]);
	const [meta, setMeta] = useState<CategoryMeta | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchCategories = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const token = localStorage.getItem("accessToken");
			if (!token) {
				throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
			}

			const response = await fetch("http://localhost:3002/api/v1/hair-categories", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Không thể tải danh mục. Vui lòng kiểm tra token hoặc API.");
			}

			const result: HairCategoryResponse = await response.json();
			setCategories(result.data ?? []);
			setMeta(result.meta ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const renderTableContent = () => {
		if (error) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<p className="text-sm text-red-500">{error}</p>
						<Button variant="outline" onClick={fetchCategories}>
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
						<p className="text-sm text-muted-foreground">Đang tải danh sách danh mục...</p>
					</div>
				</div>
			);
		}

		if (categories.length === 0) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<p className="text-sm text-muted-foreground">Không có dữ liệu danh mục</p>
				</div>
			);
		}

		return (
			<>
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
					<p className="text-sm text-muted-foreground">
						{meta
							? `Tổng ${meta.total} danh mục - Trang ${meta.page}/${meta.totalPages}`
							: `Tổng ${categories.length} danh mục`}
					</p>
					<Button variant="outline" size="sm" onClick={fetchCategories}>
						<IconReload className="h-4 w-4" />
						Tải lại
					</Button>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Danh mục</TableHead>
							<TableHead>Slug</TableHead>
							<TableHead>Mô tả</TableHead>
							<TableHead>Thứ tự</TableHead>
							<TableHead>Số kiểu tóc</TableHead>
							<TableHead>Trạng thái</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{categories.map((category) => (
							<TableRow key={category.id}>
								<TableCell>
									<div>
										<p className="font-medium leading-none">{category.name}</p>
										<p className="mt-1 text-xs text-muted-foreground">ID: {category.id}</p>
									</div>
								</TableCell>
								<TableCell>
									<span className="text-sm">{category.slug}</span>
								</TableCell>
								<TableCell>
									<p className="max-w-[340px] text-sm text-muted-foreground line-clamp-2">
										{category.description || "Không có mô tả"}
									</p>
								</TableCell>
								<TableCell>{category.displayOrder}</TableCell>
								<TableCell>{category.hairstyleCount}</TableCell>
								<TableCell>
									<Badge variant={category.isActive ? "default" : "secondary"}>
										{category.isActive ? "Đang hoạt động" : "Không hoạt động"}
									</Badge>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</>
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
						<h1 className="text-base font-medium">Category Management</h1>
						<div className="ml-auto flex items-center gap-2">
							<ThemeSelector />
							<ModeToggle />
						</div>
					</div>
				</header>

				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="px-4 lg:px-6">
								<div className="rounded-lg border border-border/40 bg-card shadow-sm">{renderTableContent()}</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
