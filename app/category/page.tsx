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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IconReload, IconPlus, IconPencil, IconX } from "@tabler/icons-react";

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

// ─── Shared Dialog ────────────────────────────────────────────────────────────

interface CategoryFormData {
	name: string;
	slug: string;
	description: string;
	isActive: boolean;
}

interface CategoryDialogProps {
	isOpen: boolean;
	mode: "create" | "edit";
	initialData?: CategoryFormData & { id?: string };
	onClose: () => void;
	onSuccess: () => void;
}

function CategoryDialog({ isOpen, mode, initialData, onClose, onSuccess }: CategoryDialogProps) {
	const [formData, setFormData] = useState<CategoryFormData>({
		name: "",
		slug: "",
		description: "",
		isActive: true,
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Sync form khi dialog mở hoặc initialData thay đổi
	useEffect(() => {
		if (isOpen) {
			setFormData({
				name: initialData?.name ?? "",
				slug: initialData?.slug ?? "",
				description: initialData?.description ?? "",
				isActive: initialData?.isActive ?? true,
			});
			setError(null);
		}
	}, [isOpen, initialData]);

	// Auto-generate slug từ name (chỉ khi tạo mới)
	const handleNameChange = (value: string) => {
		setFormData((prev) => ({
			...prev,
			name: value,
			...(mode === "create"
				? {
						slug: value
							.toLowerCase()
							.normalize("NFD")
							.replace(/[\u0300-\u036f]/g, "")
							.replace(/đ/g, "d")
							.replace(/[^a-z0-9\s-]/g, "")
							.trim()
							.replace(/\s+/g, "-"),
					}
				: {}),
		}));
	};

	const validate = () => {
		if (!formData.name.trim()) return "Tên danh mục không được để trống";
		if (!formData.slug.trim()) return "Slug không được để trống";
		return null;
	};

	const handleSubmit = async () => {
		setError(null);
		const validateError = validate();
		if (validateError) {
			setError(validateError);
			return;
		}

		setIsSubmitting(true);
		try {
			const token = localStorage.getItem("accessToken");
			if (!token) throw new Error("Vui lòng đăng nhập lại");

			const url =
				mode === "edit"
					? `http://localhost:3002/api/v1/hair-categories/${initialData?.id}`
					: "http://localhost:3002/api/v1/hair-categories";

			const res = await fetch(url, {
				method: mode === "edit" ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: formData.name,
					slug: formData.slug,
					description: formData.description,
					isActive: formData.isActive,
				}),
			});

			if (!res.ok) {
				const err = await res.json().catch(() => null);
				throw new Error(err?.message || (mode === "edit" ? "Cập nhật thất bại" : "Tạo thất bại"));
			}

			onSuccess();
			onClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Lỗi không xác định");
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	const isEdit = mode === "edit";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

			<div className="relative bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
				{/* Header */}
				<div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
					<h2 className="text-lg font-semibold">
						{isEdit ? "Chỉnh sửa danh mục" : "Tạo danh mục mới"}
					</h2>
					<button
						onClick={onClose}
						className="p-1.5 rounded-lg hover:bg-muted transition-colors"
					>
						<IconX className="w-5 h-5" />
					</button>
				</div>

				{/* Body */}
				<div className="flex-1 overflow-y-auto px-6 py-6">
					<div className="space-y-5">
						{/* Tên */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="cat-name" className="text-sm font-medium">
								Tên danh mục <span className="text-red-500">*</span>
							</Label>
							<Input
								id="cat-name"
								placeholder="VD: Tóc ngắn"
								value={formData.name}
								onChange={(e) => handleNameChange(e.target.value)}
							/>
						</div>

						{/* Slug */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="cat-slug" className="text-sm font-medium">
								Slug <span className="text-red-500">*</span>
							</Label>
							<Input
								id="cat-slug"
								placeholder="VD: toc-ngan"
								value={formData.slug}
								onChange={(e) =>
									setFormData({ ...formData, slug: e.target.value })
								}
							/>
							<p className="text-xs text-muted-foreground">
								Dùng chữ thường, không dấu, phân cách bằng dấu gạch ngang
							</p>
						</div>

						{/* Mô tả */}
						<div className="flex flex-col gap-2">
							<Label htmlFor="cat-desc" className="text-sm font-medium">
								Mô tả
							</Label>
							<textarea
								id="cat-desc"
								placeholder="Mô tả ngắn về danh mục..."
								rows={3}
								value={formData.description}
								onChange={(e) =>
									setFormData({ ...formData, description: e.target.value })
								}
								className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none text-sm"
							/>
						</div>

						{/* Trạng thái */}
						<div className="flex items-center gap-3">
							<button
								type="button"
								role="switch"
								aria-checked={formData.isActive}
								onClick={() =>
									setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
								}
								className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring/30 ${
									formData.isActive ? "bg-primary" : "bg-muted-foreground/30"
								}`}
							>
								<span
									className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
										formData.isActive ? "translate-x-6" : "translate-x-1"
									}`}
								/>
							</button>
							<Label className="text-sm font-medium cursor-pointer select-none">
								{formData.isActive ? "Đang hoạt động" : "Không hoạt động"}
							</Label>
						</div>

						{/* Error */}
						{error && (
							<div className="rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
								{error}
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20 shrink-0">
					<Button variant="outline" onClick={onClose} disabled={isSubmitting}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={isSubmitting}>
						{isSubmitting ? (
							<span className="flex items-center gap-2">
								<span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
								{isEdit ? "Đang lưu..." : "Đang tạo..."}
							</span>
						) : (
							<span className="flex items-center gap-2">
								{isEdit ? (
									<>
										<IconPencil className="w-4 h-4" />
										Lưu thay đổi
									</>
								) : (
									<>
										<IconPlus className="w-4 h-4" />
										Tạo mới
									</>
								)}
							</span>
						)}
					</Button>
				</div>
			</div>
		</div>
	);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CategoryPage() {
	const [categories, setCategories] = useState<HairCategory[]>([]);
	const [meta, setMeta] = useState<CategoryMeta | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Dialog state
	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [editingCategory, setEditingCategory] = useState<HairCategory | null>(null);

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

	const openCreateDialog = () => {
		setEditingCategory(null);
		setDialogMode("create");
		setDialogOpen(true);
	};

	const openEditDialog = (category: HairCategory) => {
		setEditingCategory(category);
		setDialogMode("edit");
		setDialogOpen(true);
	};

	const handleDialogSuccess = () => {
		fetchCategories();
	};

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

		return (
			<>
				{/* Toolbar */}
				<div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 lg:px-6">
					<p className="text-sm text-muted-foreground">
						{meta
							? `Tổng ${meta.total} danh mục - Trang ${meta.page}/${meta.totalPages}`
							: `Tổng ${categories.length} danh mục`}
					</p>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={openCreateDialog}>
							<IconPlus className="h-4 w-4" />
							Tạo mới
						</Button>
						<Button variant="outline" size="sm" onClick={fetchCategories}>
							<IconReload className="h-4 w-4" />
							Tải lại
						</Button>
					</div>
				</div>

				{categories.length === 0 ? (
					<div className="flex min-h-[200px] items-center justify-center">
						<p className="text-sm text-muted-foreground">Không có dữ liệu danh mục</p>
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Danh mục</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Mô tả</TableHead>
								<TableHead>Thứ tự</TableHead>
								<TableHead>Số kiểu tóc</TableHead>
								<TableHead>Trạng thái</TableHead>
								<TableHead className="text-right">Thao tác</TableHead>
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
										<p className="max-w-[280px] text-sm text-muted-foreground line-clamp-2">
											{category.description || "Không có mô tả"}
										</p>
									</TableCell>
									<TableCell>{category.displayOrder}</TableCell>
									<TableCell>{category.hairstyleCount}</TableCell>
									<TableCell>
										<Badge 
											className={category.isActive 
												? "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30" 
												: "bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30"
											}
										>
											{category.isActive ? "Đang hoạt động" : "Không hoạt động"}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										<Button
											variant="outline"
											size="sm"
											onClick={() => openEditDialog(category)}
										>
											<IconPencil className="h-3.5 w-3.5" />
											Sửa
										</Button>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
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
								<div className="rounded-lg border border-border/40 bg-card shadow-sm">
									{renderTableContent()}
								</div>
							</div>
						</div>
					</div>
				</div>
			</SidebarInset>

			{/* Category Dialog (Create / Edit) */}
			<CategoryDialog
				isOpen={dialogOpen}
				mode={dialogMode}
				initialData={
					editingCategory
						? {
								id: editingCategory.id,
								name: editingCategory.name,
								slug: editingCategory.slug,
								description: editingCategory.description ?? "",
								isActive: editingCategory.isActive,
							}
						: undefined
				}
				onClose={() => setDialogOpen(false)}
				onSuccess={handleDialogSuccess}
			/>
		</SidebarProvider>
	);
}