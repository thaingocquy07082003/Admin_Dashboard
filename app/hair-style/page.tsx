"use client";

import { useEffect, useState, useRef } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";
import { ThemeSelector } from "@/components/theme-selector";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IconClock, IconReload, IconUsers, IconPlus, IconX } from "@tabler/icons-react";

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

interface Stylist {
	id: string;
	fullName: string;
	avatarUrl: string | null;
}

interface StylistResponse {
	statusCode: number;
	message: string;
	data: Stylist[];
	timestamp: string;
}

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

interface CategoryResponse {
	statusCode: number;
	message: string;
	data: HairCategory[];
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

// ─── Create Hairstyle Dialog ──────────────────────────────────────────────────
interface CreateDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
	stylists: Stylist[];
	categories: HairCategory[];
}

function CreateHairstyleDialog({
  isOpen,
  onClose,
  onSuccess,
  stylists,
  categories,
}: CreateDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    imageUrl: "",
  });

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [difficulty, setDifficulty] = useState<"" | "easy" | "medium" | "hard">("");
  const [selectedStylists, setSelectedStylists] = useState<string[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── HANDLE IMAGE ─────────────────────────────────────
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ─── STYLIST TOGGLE ──────────────────────────────────
  const handleStylistToggle = (id: string) => {
    setSelectedStylists((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // ─── VALIDATE ─────────────────────────────────────────
  const validate = () => {
    if (!formData.name.trim()) return "Tên kiểu tóc không được để trống";
    if (!formData.price) return "Giá không được để trống";
    if (!formData.duration) return "Thời lượng không được để trống";
    if (!selectedCategoryId) return "Vui lòng chọn danh mục";
    if (!difficulty) return "Vui lòng chọn độ khó";
    if (!imageFile && !formData.imageUrl.trim())
      return "Vui lòng chọn ảnh hoặc nhập URL";

    return null;
  };

  // ─── SUBMIT ───────────────────────────────────────────
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

      // 👉 tìm category object
      const selectedCategory = categories.find(
        (c) => c.id === selectedCategoryId
      );

      if (!selectedCategory) {
        throw new Error("Danh mục không hợp lệ");
      }

      const form = new FormData();

      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("duration", formData.duration);
      form.append("difficulty", difficulty);

      // ✅ đúng backend yêu cầu
      form.append("category", selectedCategory.slug);
      form.append("category_id", selectedCategory.id);

      form.append("isActive", "true");

      if (selectedStylists.length > 0) {
        form.append("stylistIds", JSON.stringify(selectedStylists));
      }

      if (imageFile) {
        form.append("image", imageFile);
      } else {
        form.append("imageUrl", formData.imageUrl);
      }

      const res = await fetch(
        "http://localhost:3002/api/v1/hairstyles",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message || "Tạo thất bại");
      }

      // ✅ success
      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── RESET ────────────────────────────────────────────
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      imageUrl: "",
    });
    setSelectedCategoryId("");
    setDifficulty("");
    setSelectedStylists([]);
    setImageFile(null);
    setImagePreview(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-card border border-border rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tạo kiểu tóc mới</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="space-y-5">
            {/* Tên kiểu tóc */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Tên kiểu tóc <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="VD: Tóc Bob ngắn"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Mô tả */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Mô tả
              </Label>
              <textarea
                id="description"
                placeholder="Mô tả chi tiết về kiểu tóc, cách làm, phù hợp với ai..."
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none"
              />
            </div>

            {/* Giá và Thời lượng */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Giá (VND) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  placeholder="350000"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="duration" className="text-sm font-medium">
                  Thời lượng (phút) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  placeholder="45"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Danh mục và Độ khó */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Danh mục <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="difficulty" className="text-sm font-medium">
                  Độ khó <span className="text-red-500">*</span>
                </Label>
                <select
                  id="difficulty"
                  value={difficulty}
                  onChange={(e) =>
                    setDifficulty(e.target.value as any)
                  }
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30"
                >
                  <option value="">-- Chọn độ khó --</option>
                  <option value="easy">Dễ</option>
                  <option value="medium">Trung bình</option>
                  <option value="hard">Khó</option>
                </select>
              </div>
            </div>

            {/* Ảnh */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Ảnh kiểu tóc <span className="text-red-500">*</span></Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 space-y-3">
                {imagePreview && (
                  <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                      src={imagePreview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                    >
                      <IconX className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <IconPlus className="w-4 h-4 mr-2" />
                  Tải ảnh lên
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
              </div>
            </div>

            {/* Thợ cắt tóc */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium">Chọn thợ cắt tóc</Label>
              <div className="border border-border rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                {stylists.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Không có thợ cắt tóc</p>
                ) : (
                  stylists.map((s) => (
                    <label key={s.id} className="flex items-center gap-2 cursor-pointer hover:text-foreground text-muted-foreground">
                      <Checkbox
                        checked={selectedStylists.includes(s.id)}
                        onCheckedChange={() => handleStylistToggle(s.id)}
                      />
                      <span className="text-sm">{s.fullName}</span>
                    </label>
                  ))
                )}
              </div>
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
                Đang tạo...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <IconPlus className="w-4 h-4" />
                Tạo mới
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function HairStylePage() {
	const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
	const [meta, setMeta] = useState<HairstyleMeta | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [stylists, setStylists] = useState<Stylist[]>([]);
	const [categories, setCategories] = useState<HairCategory[]>([]);
	const [showCreateDialog, setShowCreateDialog] = useState(false);

	const fetchStylists = async () => {
		try {
			const token = localStorage.getItem("accessToken");
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
			}

			const response = await fetch("http://localhost:3002/api/v1/hairstyles/stylists/all", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const result: StylistResponse = await response.json();
				setStylists(result.data ?? []);
			}
		} catch (err) {
			console.error("Failed to fetch stylists:", err);
		}
	};

	const fetchCategories = async () => {
		try {
			const token = localStorage.getItem("accessToken");
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
			}

			const response = await fetch("http://localhost:3002/api/v1/hair-categories", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});

			if (response.ok) {
				const result: CategoryResponse = await response.json();
				setCategories(result.data ?? []);
			}
		} catch (err) {
			console.error("Failed to fetch categories:", err);
		}
	};

	const fetchHairstyles = async () => {
		try {
			setIsLoading(true);
			setError(null);

			const token = localStorage.getItem("accessToken");
			if (!token) {
				throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
			}

			const response = await fetch("http://localhost:3002/api/v1/hairstyles", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
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
		fetchStylists();
		fetchCategories();
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
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => setShowCreateDialog(true)}>
							<IconPlus className="h-4 w-4" />
							Tạo mới
						</Button>
						<Button variant="outline" size="sm" onClick={fetchHairstyles}>
							<IconReload className="h-4 w-4" />
							Tải lại
						</Button>
					</div>
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

			{/* Create Hairstyle Dialog */}
			<CreateHairstyleDialog
				isOpen={showCreateDialog}
				onClose={() => setShowCreateDialog(false)}
				onSuccess={() => {
					setShowCreateDialog(false);
					fetchHairstyles();
				}}
				stylists={stylists}
				categories={categories}
			/>
		</SidebarProvider>
	);
}
