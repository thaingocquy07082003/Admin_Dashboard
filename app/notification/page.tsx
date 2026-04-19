"use client";

import { useMemo, useState } from "react";
import {
	IconBell,
	IconTrash,
	IconUsers,
	IconUser,
	IconAlertTriangle,
	IconInfoCircle,
	IconMessageCircle,
	IconPlus,
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type NotificationType = "info" | "warning" | "promotion";
type NotificationAudience = "all" | "customer" | "stylist";

interface NotificationItem {
	id: string;
	title: string;
	message: string;
	type: NotificationType;
	audience: NotificationAudience;
	createdAt: string;
}

const fakeNotifications: NotificationItem[] = [
	{
		id: "ntf-1001",
		title: "Lịch hẹn mới cần xác nhận",
		message: "Bạn có 3 lịch hẹn mới trong hôm nay. Vui lòng kiểm tra và xác nhận sớm.",
		type: "info",
		audience: "all",
		createdAt: "2026-04-20T08:45:00.000Z",
	},
	{
		id: "ntf-1002",
		title: "Khuyến mãi cuối tuần",
		message: "Áp dụng giảm 15% cho dịch vụ nhuộm tóc từ thứ 6 đến chủ nhật tuần này.",
		type: "promotion",
		audience: "customer",
		createdAt: "2026-04-19T03:20:00.000Z",
	},
	{
		id: "ntf-1003",
		title: "Nhắc cập nhật lịch làm việc",
		message: "Một số stylist chưa cập nhật lịch làm việc tuần tới. Hãy kiểm tra lại.",
		type: "warning",
		audience: "stylist",
		createdAt: "2026-04-18T13:10:00.000Z",
	},
];

function getTypeMeta(type: NotificationType) {
	switch (type) {
		case "warning":
			return {
				label: "Cảnh báo",
				className:
					"bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
				icon: IconAlertTriangle,
			};
		case "promotion":
			return {
				label: "Khuyến mãi",
				className:
					"bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
				icon: IconMessageCircle,
			};
		default:
			return {
				label: "Thông tin",
				className:
					"bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
				icon: IconInfoCircle,
			};
	}
}

function getAudienceLabel(audience: NotificationAudience) {
	switch (audience) {
		case "customer":
			return "Khách hàng";
		case "stylist":
			return "Stylist";
		default:
			return "Toàn bộ";
	}
}

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
	const [notifications, setNotifications] =
		useState<NotificationItem[]>(fakeNotifications);
	const [title, setTitle] = useState("");
	const [message, setMessage] = useState("");
	const [type, setType] = useState<NotificationType>("info");
	const [audience, setAudience] = useState<NotificationAudience>("all");

	const audienceSummary = useMemo(
		() => ({
			customer: notifications.filter((item) => item.audience === "customer").length,
			stylist: notifications.filter((item) => item.audience === "stylist").length,
		}),
		[notifications]
	);

	const handleAddNotification = () => {
		const trimmedTitle = title.trim();
		const trimmedMessage = message.trim();

		if (!trimmedTitle || !trimmedMessage) {
			return;
		}

		const newNotification: NotificationItem = {
			id:
				typeof crypto !== "undefined" && crypto.randomUUID
					? crypto.randomUUID()
					: `${Date.now()}`,
			title: trimmedTitle,
			message: trimmedMessage,
			type,
			audience,
			createdAt: new Date().toISOString(),
		};

		setNotifications((prev) => [newNotification, ...prev]);
		setTitle("");
		setMessage("");
		setType("info");
		setAudience("all");
	};

	const handleDeleteNotification = (id: string) => {
		setNotifications((prev) => prev.filter((item) => item.id !== id));
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
				<SiteHeader />
				<div className="flex flex-1 flex-col">
					<div className="@container/main flex flex-1 flex-col gap-2">
						<div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
							<div className="space-y-4 px-4 lg:px-6">
								<div className="grid gap-4 md:grid-cols-3">
									<Card className="gap-3 py-5">
										<CardHeader className="pb-0">
											<CardDescription>Tổng thông báo</CardDescription>
											<CardTitle className="text-2xl">{notifications.length}</CardTitle>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
												<IconBell className="size-4" />
												Tất cả thông báo hiện có
											</div>
										</CardContent>
									</Card>

									<Card className="gap-3 py-5">
										<CardHeader className="pb-0">
												<CardDescription>Nhóm khách hàng</CardDescription>
												<CardTitle className="text-2xl">{audienceSummary.customer}</CardTitle>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
													<IconUsers className="size-4" />
													Thông báo gửi riêng cho khách hàng
											</div>
										</CardContent>
									</Card>

									<Card className="gap-3 py-5">
										<CardHeader className="pb-0">
												<CardDescription>Nhóm stylist</CardDescription>
												<CardTitle className="text-2xl">{audienceSummary.stylist}</CardTitle>
										</CardHeader>
										<CardContent className="pt-0">
											<div className="flex items-center gap-2 text-muted-foreground text-sm">
													<IconUser className="size-4" />
													Thông báo gửi riêng cho stylist
											</div>
										</CardContent>
									</Card>
								</div>

								<Card>
									<CardHeader>
										<CardTitle>Tạo thông báo mới</CardTitle>
										<CardDescription>
											Dữ liệu đang dùng fake data để demo thêm và xóa thông báo.
										</CardDescription>
									</CardHeader>
									<CardContent>
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
												<Label htmlFor="notification-message">Nội dung</Label>
												<textarea
													id="notification-message"
													className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
													placeholder="Nhập nội dung chi tiết thông báo"
													value={message}
													onChange={(e) => setMessage(e.target.value)}
												/>
											</div>

											<div className="grid gap-4 md:grid-cols-2">
												<div className="grid gap-2">
													<Label>Loại thông báo</Label>
													<Select
														value={type}
														onValueChange={(value: NotificationType) => setType(value)}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Chọn loại" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="info">Thông tin</SelectItem>
															<SelectItem value="warning">Cảnh báo</SelectItem>
															<SelectItem value="promotion">Khuyến mãi</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="grid gap-2">
													<Label>Nhóm nhận</Label>
													<Select
														value={audience}
														onValueChange={(value: NotificationAudience) =>
															setAudience(value)
														}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Chọn nhóm nhận" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="all">Toàn bộ</SelectItem>
															<SelectItem value="customer">Khách hàng</SelectItem>
															<SelectItem value="stylist">Stylist</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>

											<div className="flex justify-end">
												<Button onClick={handleAddNotification} className="gap-2">
													<IconPlus className="size-4" />
													Thêm thông báo
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader className="flex flex-row items-center justify-between gap-4">
										<div className="space-y-1">
											<CardTitle>Danh sách thông báo</CardTitle>
											<CardDescription>
													Quản lý thông báo hiện có, tập trung tạo mới và xóa.
											</CardDescription>
										</div>
									</CardHeader>
									<CardContent>
										{notifications.length === 0 ? (
											<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
												Chưa có thông báo nào.
											</div>
										) : (
											<div className="space-y-3">
												{notifications.map((item) => {
													const typeMeta = getTypeMeta(item.type);
													const TypeIcon = typeMeta.icon;

													return (
														<div
															key={item.id}
															className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
														>
															<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
																<div className="space-y-2">
																	<div className="flex flex-wrap items-center gap-2">
																		<h3 className="font-medium">{item.title}</h3>
																		<Badge className={`border ${typeMeta.className}`}>
																			<TypeIcon className="size-3.5" />
																			{typeMeta.label}
																		</Badge>
																	</div>
																	<p className="text-sm text-muted-foreground">
																		{item.message}
																	</p>
																	<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
																		<span className="inline-flex items-center gap-1">
																			{item.audience === "all" ? (
																				<IconUsers className="size-3.5" />
																			) : (
																				<IconUser className="size-3.5" />
																			)}
																			{getAudienceLabel(item.audience)}
																		</span>
																		<span>{formatDateTime(item.createdAt)}</span>
																	</div>
																</div>

																<div className="flex items-center gap-2">
																	<Button
																		variant="destructive"
																		size="sm"
																		onClick={() => handleDeleteNotification(item.id)}
																		className="gap-1.5"
																	>
																		<IconTrash className="size-4" />
																		Xóa
																	</Button>
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
