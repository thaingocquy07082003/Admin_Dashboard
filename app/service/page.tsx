"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Crown,
	Droplets,
	Scissors,
	Sparkles,
	WandSparkles,
	Plus,
	Pencil,
	Trash2,
	X,
	Clock3,
	BadgeDollarSign,
	RotateCw,
	AlertCircle,
	BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

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
} from "@/components/ui/select";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";


interface ServiceApiItem {
	id: string;
	name: string;
	description: string;
	price: number;
	duration: number;
	category: string | null;
	imageUrl: string | null;
	isAvailable: boolean;
	createdAt: string;
	updatedAt: string;
}

interface ServiceResponse {
	statusCode: number;
	message: string;
	data: ServiceApiItem[];
	meta?: {
		total: number;
		page: number;
		limit: number;
		totalPages: number;
	};
	timestamp?: string;
}

const iconMap: Record<string, LucideIcon> = {
	Scissors,
	Sparkles,
	Crown,
	Droplets,
	WandSparkles,
};

const SERVICES_API_URL = "http://localhost:3003/api/v1/services";
const ADMIN_SERVICES_API_URL = "http://localhost:3003/api/v1/services/admin";

function formatPrice(price: number) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(price);
}

function formatDateTime(value: string) {
	return new Intl.DateTimeFormat("vi-VN", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(new Date(value));
}

function getServiceIcon(service: ServiceApiItem) {
	const category = service.category?.toLowerCase() ?? "";
	const name = service.name.toLowerCase();

	if (category.includes("cắt") || name.includes("cắt")) return Scissors;
	if (category.includes("chăm") || name.includes("gội") || name.includes("massage")) return Droplets;
	if (category.includes("nhuộm") || name.includes("nhuộm")) return WandSparkles;
	if (category.includes("uốn") || category.includes("duỗi") || name.includes("uốn") || name.includes("duỗi")) return Sparkles;
	return Crown;
}

export default function ServicePage() {
	const [services, setServices] = useState<ServiceApiItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [duration, setDuration] = useState("");
	const [price, setPrice] = useState("");

	const getAuthToken = () => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem("accessToken");
	};

	const loadServices = useCallback(async () => {
		try {
			setIsLoading(true);
			setError(null);

			const response = await fetch(SERVICES_API_URL, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
				cache: "no-store",
			});

			const result: ServiceResponse = await response.json();
			if (!response.ok || result.statusCode >= 400) {
				throw new Error(result.message || "Không thể tải danh sách dịch vụ");
			}

			setServices(Array.isArray(result.data) ? result.data : []);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Có lỗi xảy ra khi tải dữ liệu");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadServices();
	}, [loadServices]);

	const sortedServices = useMemo(
		() => [...services].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()),
		[services]
	);

	const resetForm = () => {
		setEditingId(null);
		setName("");
		setDescription("");
		setDuration("");
		setPrice("");
	};

	const handleSubmitService = async () => {
		const parsedDuration = Number(duration);
		const parsedPrice = Number(price);

		if (
			!name.trim() ||
			!description.trim() ||
			Number.isNaN(parsedDuration) ||
			parsedDuration <= 0 ||
			Number.isNaN(parsedPrice) ||
			parsedPrice <= 0
		) {
			toast.error("Vui lòng nhập đầy đủ tên, mô tả, giá và thời lượng hợp lệ");
			return;
		}

		setIsSubmitting(true);
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
			}

			const endpoint = editingId
				? `${ADMIN_SERVICES_API_URL}/${editingId}`
				: ADMIN_SERVICES_API_URL;

			const response = await fetch(endpoint, {
				method: editingId ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: name.trim(),
					description: description.trim(),
					price: parsedPrice,
					duration: parsedDuration,
				}),
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok || (typeof result.statusCode === "number" && result.statusCode >= 400)) {
				throw new Error(
					result.message || (editingId ? "Không thể cập nhật dịch vụ" : "Không thể thêm dịch vụ mới")
				);
			}

			toast.success(result.message || (editingId ? "Cập nhật dịch vụ thành công" : "Thêm dịch vụ thành công"));
			resetForm();
			await loadServices();
		} catch (err) {
			const message = err instanceof Error ? err.message : editingId ? "Lỗi khi cập nhật dịch vụ" : "Lỗi khi thêm dịch vụ";
			setError(message);
			toast.error(message);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleStartEdit = (service: ServiceApiItem) => {
		setError(null);
		setEditingId(service.id);
		setName(service.name);
		setDescription(service.description);
		setDuration(String(service.duration));
		setPrice(String(service.price));
	};

	const handleDeleteService = async (id: string) => {
		setActionLoadingId(id);
		setError(null);
		try {
			const token = getAuthToken();
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
			}

			const response = await fetch(`${ADMIN_SERVICES_API_URL}/${id}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok || (typeof result.statusCode === "number" && result.statusCode >= 400)) {
				throw new Error(result.message || "Không thể xóa dịch vụ");
			}

			toast.success(result.message || "Xóa dịch vụ thành công");
			if (editingId === id) {
				resetForm();
			}
			await loadServices();
		} catch (err) {
			const message = err instanceof Error ? err.message : "Lỗi khi xóa dịch vụ";
			setError(message);
			toast.error(message);
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
										<CardTitle>{editingId ? "Cập nhật dịch vụ" : "Thêm dịch vụ mới"}</CardTitle>
										<CardDescription>
											{editingId
												? "Gọi PUT /api/v1/services/admin/:id và yêu cầu token Bearer."
												: "Gửi trực tiếp tới POST /api/v1/services/admin và yêu cầu token Bearer."}
										</CardDescription>
									</CardHeader>
									<CardContent>
										{error && (
											<div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
												<AlertCircle className="mt-0.5 size-4 shrink-0" />
												<span>{error}</span>
											</div>
										)}

										<div className="grid gap-4">
											<div className="grid gap-2 md:grid-cols-2">
												<div className="grid gap-2">
													<Label htmlFor="service-name">Tên dịch vụ</Label>
													<Input
														id="service-name"
														placeholder="Ví dụ: Gội đầu, xông hơi"
														value={name}
														onChange={(e) => setName(e.target.value)}
													/>
												</div>
												<div className="grid gap-2">
													<Label htmlFor="service-duration">Thời lượng (phút)</Label>
													<Input
														id="service-duration"
														type="number"
														min={1}
														placeholder="45"
														value={duration}
														onChange={(e) => setDuration(e.target.value)}
													/>
												</div>
											</div>

											<div className="grid gap-2">
												<Label htmlFor="service-description">Mô tả</Label>
												<textarea
													id="service-description"
													className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 min-h-24 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
													placeholder="Nhập mô tả chi tiết dịch vụ"
													value={description}
													onChange={(e) => setDescription(e.target.value)}
												/>
											</div>

											<div className="grid gap-2 md:grid-cols-2">
												<div className="grid gap-2">
													<Label htmlFor="service-price">Giá (VND)</Label>
													<Input
														id="service-price"
														type="number"
														min={1000}
														step={1000}
														placeholder="120000"
														value={price}
														onChange={(e) => setPrice(e.target.value)}
													/>
												</div>
												<div className="grid gap-2">
													<Label className="text-muted-foreground">API body</Label>
													<div className="rounded-md border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
														name, description, price, duration
													</div>
												</div>
											</div>

											<div className="flex justify-end">
												<div className="flex gap-2">
													{editingId && (
														<Button variant="outline" onClick={resetForm} className="gap-2" disabled={isSubmitting}>
															<X className="size-4" />
															Hủy sửa
														</Button>
													)}
													<Button onClick={handleSubmitService} className="gap-2" disabled={isSubmitting}>
														<Plus className="size-4" />
														{isSubmitting ? "Đang xử lý..." : editingId ? "Lưu thay đổi" : "Thêm dịch vụ"}
													</Button>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Danh sách dịch vụ</CardTitle>
										<CardDescription>
												Dữ liệu được tải từ GET /api/v1/services.
										</CardDescription>
									</CardHeader>
									<CardContent>
											<div className="mb-4 flex items-center justify-between gap-3">
												<p className="text-sm text-muted-foreground">
													{isLoading
														? "Đang tải danh sách dịch vụ..."
														: `Đã tải ${services.length} dịch vụ`}
												</p>
												<Button variant="outline" size="sm" onClick={loadServices} disabled={isLoading} className="gap-2">
													<RotateCw className={isLoading ? "size-4 animate-spin" : "size-4"} />
													Làm mới
												</Button>
											</div>

											{isLoading ? (
												<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
													Đang tải dữ liệu dịch vụ...
												</div>
											) : sortedServices.length === 0 ? (
												<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
													Chưa có dịch vụ nào từ API.
												</div>
											) : (
												<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
													{sortedServices.map((service) => {
														const ServiceIcon = getServiceIcon(service);

														return (
															<div
																key={service.id}
																className="rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
															>
																<div className="mb-3 flex items-start justify-between gap-3">
																	<div className="flex items-center gap-2">
																		<span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
																			<ServiceIcon className="size-4" />
																		</span>
																		<div>
																			<h3 className="font-medium leading-tight">{service.name}</h3>
																			<p className="mt-1 text-xs text-muted-foreground">
																				ID: {service.id}
																			</p>
																		</div>
																	</div>
																	<Badge variant={service.isAvailable ? "default" : "secondary"} className="gap-1.5">
																		<BadgeCheck className="size-3.5" />
																		{service.isAvailable ? "Đang bật" : "Đang ẩn"}
																	</Badge>
																</div>

																<p className="mb-3 text-sm text-muted-foreground">
																	{service.description}
																</p>

																<div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
																	<Badge variant="outline" className="gap-1.5">
																		<Clock3 className="size-3.5" />
																		{service.duration} phút
																	</Badge>
																	<Badge variant="outline" className="gap-1.5">
																		<BadgeDollarSign className="size-3.5" />
																		{formatPrice(service.price)}
																	</Badge>
																	<Badge variant="outline">{service.category ?? "Chưa phân loại"}</Badge>
																</div>

																<div className="rounded-md border bg-muted/30 px-2.5 py-2 text-xs text-muted-foreground">
																	Tạo lúc {formatDateTime(service.createdAt)}
																</div>

																<div className="mt-3 flex items-center gap-2">
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => handleStartEdit(service)}
																		disabled={isSubmitting || actionLoadingId === service.id}
																		className="gap-1.5"
																	>
																		<Pencil className="size-4" />
																		Sửa
																	</Button>
																	<Button
																		variant="destructive"
																		size="sm"
																		onClick={() => handleDeleteService(service.id)}
																		disabled={isSubmitting || actionLoadingId === service.id}
																		className="gap-1.5"
																	>
																		<Trash2 className="size-4" />
																		{actionLoadingId === service.id ? "Đang xóa..." : "Xóa"}
																	</Button>
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
