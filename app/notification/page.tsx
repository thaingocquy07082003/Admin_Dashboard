"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import {
	IconInfoCircle,
	IconPlus,
	IconRefresh,
	IconPencil,
	IconTrash,
	IconX,
} from "@tabler/icons-react";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface NotificationItem {
	id: string;
	title: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

interface NotificationsResponse {
	statusCode: number;
	message: string;
	data: NotificationItem[];
	meta?: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	timestamp?: string;
}

const NOTIFICATIONS_API_URL = "http://localhost:3002/api/v1/notifications";

function formatDateTime(dateString: string) {
	return new Date(dateString).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export default function NotificationPage() {
	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);

	const getAuthToken = () => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("accessToken");
	};

	const loadNotifications = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(NOTIFICATIONS_API_URL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			});

			const result: NotificationsResponse = await response.json();
			if (!response.ok || result.statusCode >= 400) {
				throw new Error(result.message || "Không thể tải danh sách thông báo");
			}

			setNotifications(Array.isArray(result.data) ? result.data : []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadNotifications();
	}, [loadNotifications]);

	const handleAddNotification = async () => {
		const trimmedTitle = title.trim();
		const trimmedContent = content.trim();

		if (!trimmedTitle || !trimmedContent) {
			return;
		}

		setIsSubmitting(true);
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại bằng tài khoản admin.");
			}

			const endpoint = editingId
				? `${NOTIFICATIONS_API_URL}/${editingId}`
				: NOTIFICATIONS_API_URL;

			const response = await fetch(endpoint, {
				method: editingId ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					title: trimmedTitle,
					content: trimmedContent,
				}),
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok || (typeof result.statusCode === "number" && result.statusCode >= 400)) {
				throw new Error(result.message || (editingId ? "Không thể cập nhật thông báo" : "Không thể tạo thông báo mới"));
			}

			setTitle("");
			setContent("");
			setEditingId(null);
			await loadNotifications();
		} catch (err) {
			setError(err instanceof Error ? err.message : editingId ? "Có lỗi xảy ra khi cập nhật thông báo" : "Có lỗi xảy ra khi tạo thông báo");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStartEdit = (item: NotificationItem) => {
		setError(null);
		setEditingId(item.id);
		setTitle(item.title);
		setContent(item.content);
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setTitle("");
		setContent("");
		setError(null);
	};

	const handleDeleteNotification = async (id: string) => {
		setActionLoadingId(id);
		setError(null);
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại bằng tài khoản admin.");
			}

			const response = await fetch(`${NOTIFICATIONS_API_URL}/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok || (typeof result.statusCode === "number" && result.statusCode >= 400)) {
				throw new Error(result.message || "Không thể xóa thông báo");
			}

			if (editingId === id) {
				handleCancelEdit();
			}

			await loadNotifications();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa thông báo");
		} finally {
			setActionLoadingId(null);
		}
	};

	return (
		<SidebarProvider
			style={
				{
					"--sidebar-width": "calc(var(--spacing) * 72)",
					"--header-height": "calc(var(--spacing) * 12)",
				} as CSSProperties
			}
		>
			<AppSidebar variant="inset" />
			<SidebarInset>
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="space-y-4 px-4 lg:px-6">
								<Card>
									<CardHeader>
										<CardTitle>{editingId ? "Chỉnh sửa thông báo" : "Tạo thông báo mới"}</CardTitle>
										<CardDescription>
											{editingId
												? "Cập nhật qua PUT /api/v1/notifications/:id (cần bearer token admin)."
												: "Gửi trực tiếp tới POST /api/v1/notifications (cần bearer token admin)."}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{error && (
											<div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
												{error}
											</div>
										)}

										<div className="grid gap-4">
											<div className="grid gap-2">
												<Label htmlFor="notification-title">Tiêu đề</Label>
												<Input
													id="notification-title"
													placeholder="Ví dụ: Cập nhật lịch làm việc tuần tới"
													value={title}
													onChange={(e) => setTitle(e.target.value)}
												/>
											</div>

											<div className="grid gap-2">
												<Label htmlFor="notification-content">Nội dung</Label>
												<textarea
													id="notification-content"
													className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
													placeholder="Nhập nội dung chi tiết thông báo"
													value={content}
													onChange={(e) => setContent(e.target.value)}
												/>
											</div>

											<div className="flex justify-end">
												<div className="flex gap-2">
													{editingId && (
														<Button variant="outline" onClick={handleCancelEdit} className="gap-2" disabled={isSubmitting}>
															<IconX className="size-4" />
															Hủy sửa
														</Button>
													)}
													<Button onClick={handleAddNotification} className="gap-2" disabled={isSubmitting}>
													<IconPlus className="size-4" />
													{isSubmitting ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Thêm thông báo"}
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between gap-4">
										<div className="space-y-1">
											<CardTitle>Danh sách thông báo</CardTitle>
											<CardDescription>
													Dữ liệu được lấy từ GET /api/v1/notifications.
											</CardDescription>
										</div>
										<Button variant="outline" size="sm" onClick={loadNotifications} disabled={isLoading} className="gap-2">
											<IconRefresh className={isLoading ? "size-4 animate-spin" : "size-4"} />
											Làm mới
										</Button>
									</CardHeader>
									<CardContent>
										{isLoading ? (
											<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
												Đang tải dữ liệu thông báo...
											</div>
										) : notifications.length === 0 ? (
											<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
												Chưa có thông báo nào.
											</div>
										) : (
											<div className="space-y-3">
												{notifications.map((item) => {
													return (
														<div
															key={item.id}
															className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
														>
															<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
																<div className="space-y-2">
																	<div className="flex flex-wrap items-center gap-2">
																		<h3 className="font-medium">{item.title}</h3>
																		<Badge className="border bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
																			<IconInfoCircle className="size-3.5" />
																			Thông báo
																		</Badge>
																	</div>
																	<p className="text-sm text-muted-foreground">
																		{item.content}
																	</p>
																	<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
																		<span>{formatDateTime(item.createdAt)}</span>
																		<span>Cập nhật: {formatDateTime(item.updatedAt)}</span>
																	</div>
																	<div className="flex items-center gap-2 pt-1">
																		<Button
																			variant="outline"
																			size="sm"
																			onClick={() => handleStartEdit(item)}
																			disabled={isSubmitting || actionLoadingId === item.id}
																			className="gap-1.5"
																		>
																			<IconPencil className="size-4" />
																			Sửa
																		</Button>
																		<Button
																			variant="destructive"
																			size="sm"
																			onClick={() => handleDeleteNotification(item.id)}
																			disabled={isSubmitting || actionLoadingId === item.id}
																			className="gap-1.5"
																		>
																			<IconTrash className="size-4" />
																			{actionLoadingId === item.id ? "Đang xóa..." : "Xóa"}
																		</Button>
																	</div>
																</div>
															</div>
														</div>
													);
												})}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
