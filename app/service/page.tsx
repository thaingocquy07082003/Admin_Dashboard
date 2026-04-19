"use client";

import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
	Crown,
	Droplets,
	Scissors,
	Sparkles,
	WandSparkles,
	Plus,
	Trash2,
	Clock3,
	BadgeDollarSign,
	Tag,
	ListChecks,
} from "lucide-react";

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

type IconKey = "Scissors" | "Sparkles" | "Crown" | "Droplets" | "WandSparkles";

interface ServiceItem {
	id: string;
	name: string;
	description: string;
	duration: number;
	price: number;
	icon: LucideIcon;
	highlight: string;
	includes: string[];
}

const iconMap: Record<IconKey, LucideIcon> = {
	Scissors,
	Sparkles,
	Crown,
	Droplets,
	WandSparkles,
};

const serviceList: ServiceItem[] = [
	{
		id: "cut-basic",
		name: "Cắt tóc cơ bản",
		description:
			"Tư vấn nhanh, cắt gọn gàng theo khuôn mặt, làm sạch viền và hoàn thiện kiểu tóc tự nhiên.",
		duration: 30,
		price: 120000,
		icon: Scissors,
		highlight: "Phù hợp đi làm mỗi ngày",
		includes: ["Tư vấn kiểu tóc", "Cắt tạo form", "Sấy hoàn thiện"],
	},
	{
		id: "cut-styling",
		name: "Cắt + tạo kiểu",
		description:
			"Dành cho khách muốn chỉn chu hơn với phần tạo phồng, vuốt texture hoặc dựng form hiện đại.",
		duration: 45,
		price: 180000,
		icon: Sparkles,
		highlight: "Kiểu tóc lên form đẹp",
		includes: ["Cắt theo mặt", "Tạo kiểu bằng sáp", "Hướng dẫn tự styling"],
	},
	{
		id: "beard-trim",
		name: "Tỉa râu & chân tóc",
		description:
			"Làm sạch đường viền râu, chỉnh chân tóc và cân đối tổng thể khuôn mặt để gọn gàng hơn.",
		duration: 20,
		price: 90000,
		icon: Crown,
		highlight: "Gọn mặt, sáng nét hơn",
		includes: ["Tỉa râu", "Tạo viền cổ", "Xử lý tóc mai"],
	},
	{
		id: "wash-head-massage",
		name: "Gội đầu & massage",
		description:
			"Dịch vụ đi kèm giúp thư giãn da đầu, làm sạch tóc và mang lại cảm giác thoải mái sau khi cắt.",
		duration: 25,
		price: 80000,
		icon: Droplets,
		highlight: "Thư giãn sau giờ làm",
		includes: ["Gội sạch da đầu", "Massage vai gáy", "Sấy nhẹ tóc"],
	},
	{
		id: "color-refresh",
		name: "Nhuộm phủ bạc",
		description:
			"Giải pháp tinh gọn cho khách muốn che tóc bạc, giữ vẻ ngoài trẻ trung và màu tóc tự nhiên.",
		duration: 60,
		price: 350000,
		icon: WandSparkles,
		highlight: "Lên màu tự nhiên",
		includes: ["Tư vấn màu", "Nhuộm phủ bạc", "Chăm sóc sau nhuộm"],
	},
];

function formatPrice(price: number) {
	return new Intl.NumberFormat("vi-VN", {
		style: "currency",
		currency: "VND",
	}).format(price);
}

export default function ServicePage() {
	const [services, setServices] = useState<ServiceItem[]>(serviceList);

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [duration, setDuration] = useState("");
	const [price, setPrice] = useState("");
	const [highlight, setHighlight] = useState("");
	const [includesText, setIncludesText] = useState("");
	const [iconKey, setIconKey] = useState<IconKey>("Scissors");

	const avgPrice = useMemo(() => {
		if (services.length === 0) return 0;
		const total = services.reduce((sum, item) => sum + item.price, 0);
		return Math.round(total / services.length);
	}, [services]);

	const avgDuration = useMemo(() => {
		if (services.length === 0) return 0;
		const total = services.reduce((sum, item) => sum + item.duration, 0);
		return Math.round(total / services.length);
	}, [services]);

	const handleAddService = () => {
		const parsedDuration = Number(duration);
		const parsedPrice = Number(price);
		const includeItems = includesText
			.split(",")
			.map((item) => item.trim())
			.filter(Boolean);

		if (
			!name.trim() ||
			!description.trim() ||
			!highlight.trim() ||
			Number.isNaN(parsedDuration) ||
			parsedDuration <= 0 ||
			Number.isNaN(parsedPrice) ||
			parsedPrice <= 0
		) {
			return;
		}

		const normalizedId =
			name
				.toLowerCase()
				.trim()
				.replace(/[^a-z0-9\s-]/g, "")
				.replace(/\s+/g, "-") || `service-${Date.now()}`;

		const newService: ServiceItem = {
			id: `${normalizedId}-${Date.now()}`,
			name: name.trim(),
			description: description.trim(),
			duration: parsedDuration,
			price: parsedPrice,
			icon: iconMap[iconKey],
			highlight: highlight.trim(),
			includes:
				includeItems.length > 0
					? includeItems
					: ["Tư vấn theo nhu cầu", "Thực hiện dịch vụ"],
		};

		setServices((prev) => [newService, ...prev]);
		setName("");
		setDescription("");
		setDuration("");
		setPrice("");
		setHighlight("");
		setIncludesText("");
		setIconKey("Scissors");
	};

	const handleDeleteService = (id: string) => {
		setServices((prev) => prev.filter((item) => item.id !== id));
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
											<CardDescription>Tổng dịch vụ</CardDescription>
											<CardTitle className="text-2xl">{services.length}</CardTitle>
										</CardHeader>
										<CardContent className="pt-0 text-sm text-muted-foreground">
											Số dịch vụ đang được quản lý
										</CardContent>
									</Card>

									<Card className="gap-3 py-5">
										<CardHeader className="pb-0">
											<CardDescription>Giá trung bình</CardDescription>
											<CardTitle className="text-2xl">{formatPrice(avgPrice)}</CardTitle>
										</CardHeader>
										<CardContent className="pt-0 text-sm text-muted-foreground">
											Tối ưu theo mặt bằng dịch vụ hiện có
										</CardContent>
									</Card>

									<Card className="gap-3 py-5">
										<CardHeader className="pb-0">
											<CardDescription>Thời lượng trung bình</CardDescription>
											<CardTitle className="text-2xl">{avgDuration} phút</CardTitle>
										</CardHeader>
										<CardContent className="pt-0 text-sm text-muted-foreground">
											Cân bằng lịch làm việc của stylist
										</CardContent>
									</Card>
								</div>

								<Card>
									<CardHeader>
										<CardTitle>Thêm dịch vụ mới</CardTitle>
										<CardDescription>
											Dữ liệu ban đầu dùng cứng, bạn có thể thêm dịch vụ mới trực tiếp tại đây.
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid gap-4">
											<div className="grid gap-2 md:grid-cols-2">
												<div className="grid gap-2">
													<Label htmlFor="service-name">Tên dịch vụ</Label>
													<Input
														id="service-name"
														placeholder="Ví dụ: Uốn nhẹ tự nhiên"
														value={name}
														onChange={(e) => setName(e.target.value)}
													/>
												</div>
												<div className="grid gap-2">
													<Label>Icon dịch vụ</Label>
													<Select
														value={iconKey}
														onValueChange={(value: IconKey) => setIconKey(value)}
													>
														<SelectTrigger className="w-full">
															<SelectValue placeholder="Chọn icon" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="Scissors">Scissors</SelectItem>
															<SelectItem value="Sparkles">Sparkles</SelectItem>
															<SelectItem value="Crown">Crown</SelectItem>
															<SelectItem value="Droplets">Droplets</SelectItem>
															<SelectItem value="WandSparkles">WandSparkles</SelectItem>
														</SelectContent>
													</Select>
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

											<div className="grid gap-2 md:grid-cols-3">
												<div className="grid gap-2">
													<Label htmlFor="service-duration">Thời lượng (phút)</Label>
													<Input
														id="service-duration"
														type="number"
														min={1}
														placeholder="30"
														value={duration}
														onChange={(e) => setDuration(e.target.value)}
													/>
												</div>
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
													<Label htmlFor="service-highlight">Highlight</Label>
													<Input
														id="service-highlight"
														placeholder="Ví dụ: Tiết kiệm thời gian"
														value={highlight}
														onChange={(e) => setHighlight(e.target.value)}
													/>
												</div>
											</div>

											<div className="grid gap-2">
												<Label htmlFor="service-includes">
													Bao gồm (phân tách bằng dấu phẩy)
												</Label>
												<Input
													id="service-includes"
													placeholder="Ví dụ: Tư vấn, Cắt tạo form, Sấy hoàn thiện"
													value={includesText}
													onChange={(e) => setIncludesText(e.target.value)}
												/>
											</div>

											<div className="flex justify-end">
												<Button onClick={handleAddService} className="gap-2">
													<Plus className="size-4" />
													Thêm dịch vụ
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle>Danh sách dịch vụ</CardTitle>
										<CardDescription>
											Quản lý dịch vụ bằng dữ liệu cứng, cho phép thêm mới và xóa nhanh.
										</CardDescription>
									</CardHeader>
									<CardContent>
										{services.length === 0 ? (
											<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
												Chưa có dịch vụ nào.
											</div>
										) : (
											<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
												{services.map((service) => {
													const ServiceIcon = service.icon;

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
																<Button
																	variant="destructive"
																	size="sm"
																	onClick={() => handleDeleteService(service.id)}
																	className="gap-1.5"
																>
																	<Trash2 className="size-4" />
																	Xóa
																</Button>
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
															</div>

															<div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-2 text-xs text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
																<span className="font-medium">Highlight:</span> {service.highlight}
															</div>

															<div>
																<p className="mb-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
																	<ListChecks className="size-3.5" />
																	Bao gồm
																</p>
																<div className="flex flex-wrap gap-1.5">
																	{service.includes.map((item) => (
																		<Badge key={`${service.id}-${item}`} variant="secondary" className="gap-1">
																			<Tag className="size-3" />
																			{item}
																		</Badge>
																	))}
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
