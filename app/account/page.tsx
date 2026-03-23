"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { ThemeSelector } from "@/components/theme-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

interface Profile {
	id: string;
	email: string;
	fullName: string;
	phone: string;
	role: string;
	verified: boolean;
	avatarUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

interface ProfilesMeta {
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

interface ProfilesResponse {
	statusCode: number;
	message: string;
	data: Profile[];
	meta: ProfilesMeta;
	timestamp: string;
}

export default function AccountPage() {
	const [profiles, setProfiles] = useState<Profile[]>([]);
	const [meta, setMeta] = useState<ProfilesMeta | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchProfiles = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
			if (!token) {
				throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
			}

			const response = await fetch("http://localhost:3002/api/v1/profiles", {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error("Không thể tải danh sách tài khoản. Vui lòng kiểm tra token hoặc API.");
			}

			const result: ProfilesResponse = await response.json();
			setProfiles(result.data ?? []);
			setMeta(result.meta ?? null);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchProfiles();
	}, []);

	const getInitials = (fullName: string) => {
		const words = fullName.trim().split(" ").filter(Boolean);
		if (words.length === 0) return "NA";
		if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
		return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
	};

	const formatDateTime = (isoDate: string) => {
		const date = new Date(isoDate);
		return date.toLocaleString("vi-VN");
	};

	const renderTableContent = () => {
		if (error) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<div className="flex flex-col items-center gap-3">
						<p className="text-sm text-red-500">{error}</p>
						<Button variant="outline" onClick={fetchProfiles}>
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
						<p className="text-sm text-muted-foreground">Đang tải danh sách tài khoản...</p>
					</div>
				</div>
			);
		}

		if (profiles.length === 0) {
			return (
				<div className="flex min-h-[360px] items-center justify-center">
					<p className="text-sm text-muted-foreground">Không có dữ liệu tài khoản</p>
				</div>
			);
		}

		return (
			<>
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
					<p className="text-sm text-muted-foreground">
						{meta
							? `Tổng ${meta.total} tài khoản - Trang ${meta.page}/${meta.totalPages}`
							: `Tổng ${profiles.length} tài khoản`}
					</p>
					<Button variant="outline" size="sm" onClick={fetchProfiles}>
						<IconReload className="h-4 w-4" />
						Tải lại
					</Button>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Tài khoản</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Số điện thoại</TableHead>
							<TableHead>Vai trò</TableHead>
							<TableHead>Xác thực</TableHead>
							<TableHead>Ngày tạo</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{profiles.map((profile) => (
							<TableRow key={profile.id}>
								<TableCell>
									<div className="flex items-center gap-3">
										<Avatar className="h-9 w-9">
											<AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.fullName} />
											<AvatarFallback>{getInitials(profile.fullName)}</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-medium leading-none">{profile.fullName}</p>
											<p className="mt-1 text-xs text-muted-foreground">ID: {profile.id}</p>
										</div>
									</div>
								</TableCell>
								<TableCell>{profile.email}</TableCell>
								<TableCell>{profile.phone}</TableCell>
								<TableCell>
									<Badge variant="outline" className="capitalize">
										{profile.role}
									</Badge>
								</TableCell>
								<TableCell>
									<Badge variant={profile.verified ? "default" : "secondary"}>
										{profile.verified ? "Đã xác thực" : "Chưa xác thực"}
									</Badge>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">{formatDateTime(profile.createdAt)}</TableCell>
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
						<h1 className="text-base font-medium">Account Management</h1>
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
