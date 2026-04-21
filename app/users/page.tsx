"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { IconReload, IconEye, IconEdit, IconX, IconStar, IconCalendar, IconUpload, IconPlus } from "@tabler/icons-react";

interface Stylist {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  experience: number;
  rating: number;
  totalBookings: number;
  specialties: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  email?: string;
  phone?: string;
}

interface StylistResponse {
  statusCode: number;
  message: string;
  data: Stylist[];
  timestamp: string;
}

interface StylistDetailResponse {
  statusCode: number;
  message: string;
  data: Stylist;
  timestamp: string;
}

interface CreateStylistPayload {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  experience?: number;
  specialties?: string[];
}

// ─── View Detail Dialog ───────────────────────────────────────────────────────
function ViewDetailDialog({
  stylist,
  onClose,
}: {
  stylist: Stylist | null;
  onClose: () => void;
}) {
  if (!stylist) return null;

  const getInitials = (name: string) => {
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 0) return "NA";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Chi tiết thợ cắt tóc</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={stylist.avatarUrl ?? undefined} alt={stylist.fullName} />
              <AvatarFallback className="text-lg">{getInitials(stylist.fullName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold leading-tight">{stylist.fullName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">ID: {stylist.id}</p>
              <span
                className={`mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  stylist.isAvailable
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {stylist.isAvailable ? "Sẵn sàng" : "Bận"}
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/40 py-3">
              <div className="flex items-center gap-1 text-yellow-500">
                <IconStar className="h-4 w-4 fill-yellow-500" />
                <span className="font-semibold text-foreground">{stylist.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-muted-foreground">Đánh giá</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/40 py-3">
              <span className="font-semibold">{stylist.experience}</span>
              <span className="text-xs text-muted-foreground">Năm KN</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border bg-muted/40 py-3">
              <div className="flex items-center gap-1">
                <IconCalendar className="h-4 w-4 text-primary" />
                <span className="font-semibold">{stylist.totalBookings}</span>
              </div>
              <span className="text-xs text-muted-foreground">Lượt đặt</span>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <p className="text-sm font-medium mb-2">Chuyên môn</p>
            <div className="flex flex-wrap gap-1.5">
              {stylist.specialties.length > 0 ? (
                stylist.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">Chưa có thông tin</span>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground border-t border-border pt-4">
            <div>
              <p className="font-medium text-foreground mb-0.5">Ngày tạo</p>
              <p>{new Date(stylist.createdAt).toLocaleDateString("vi-VN")}</p>
            </div>
            <div>
              <p className="font-medium text-foreground mb-0.5">Cập nhật lần cuối</p>
              <p>{new Date(stylist.updatedAt).toLocaleDateString("vi-VN")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────
function EditDialog({
  stylist,
  onClose,
  onSuccess,
}: {
  stylist: Stylist | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fullName, setFullName] = useState(stylist?.fullName ?? "");
  const [experience, setExperience] = useState(
    stylist?.experience?.toString() ?? ""
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    stylist?.avatarUrl ?? null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 0) return "NA";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!stylist) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("experience", experience);
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(
        `http://localhost:3002/api/v1/hairstyles/stylists/${stylist.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message ?? "Cập nhật thất bại");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!stylist) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Chỉnh sửa thợ cắt tóc</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {/* Avatar upload */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                <AvatarImage src={imagePreview ?? undefined} alt={fullName} />
                <AvatarFallback className="text-lg">{getInitials(fullName)}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <IconUpload className="h-5 w-5 text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm font-medium">{stylist.fullName}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 h-7 text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <IconUpload className="h-3 w-3" />
                Tải ảnh lên
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* User info display */}
          {(stylist.email || stylist.phone) && (
            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
              {stylist.email && (
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{stylist.email}</p>
                </div>
              )}
              {stylist.phone && (
                <div>
                  <p className="text-muted-foreground">Số điện thoại</p>
                  <p className="font-medium">{stylist.phone}</p>
                </div>
              )}
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="edit-fullName" className="text-xs font-medium">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-1.5">
              <Label htmlFor="edit-experience" className="text-xs font-medium">
                Kinh nghiệm (năm)
              </Label>
              <Input
                id="edit-experience"
                type="number"
                min={0}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="3"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Đang lưu...
              </span>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Create Dialog ───────────────────────────────────────────────────────────
function CreateStylistDialog({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("0");
  const [specialtiesText, setSpecialtiesText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedFullName = fullName.trim();
    const trimmedPhone = phone.trim();
    const parsedExperience = experience.trim() === "" ? 0 : Number(experience);
    const specialties = specialtiesText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!trimmedEmail || !trimmedPassword || !trimmedFullName) {
      setError("Email, mật khẩu và họ tên là bắt buộc.");
      return;
    }

    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      setError("Kinh nghiệm phải là số không âm.");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      const payload: CreateStylistPayload = {
        email: trimmedEmail,
        password: trimmedPassword,
        fullName: trimmedFullName,
        ...(trimmedPhone ? { phone: trimmedPhone } : {}),
        experience: parsedExperience,
        ...(specialties.length > 0 ? { specialties } : {}),
      };

      const response = await fetch("http://localhost:3001/api/v1/auth/create-stylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.message ?? "Tạo stylist thất bại");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold">Tạo stylist mới</h2>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <IconX className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-email" className="text-xs font-medium">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="stylistSSR@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-password" className="text-xs font-medium">
              Mật khẩu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-fullName" className="text-xs font-medium">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="create-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nguyễn Văn A"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-phone" className="text-xs font-medium">Số điện thoại</Label>
              <Input
                id="create-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="create-experience" className="text-xs font-medium">Kinh nghiệm (năm)</Label>
              <Input
                id="create-experience"
                type="number"
                min={0}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="3"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="create-specialties" className="text-xs font-medium">Chuyên môn</Label>
            <Input
              id="create-specialties"
              value={specialtiesText}
              onChange={(e) => setSpecialtiesText(e.target.value)}
              placeholder="Cắt tóc nam, Uốn tóc"
            />
            <p className="text-xs text-muted-foreground">Nhập nhiều chuyên môn, ngăn cách bằng dấu phẩy.</p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                Đang tạo...
              </span>
            ) : (
              "Tạo stylist"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Page() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View detail state
  const [viewStylist, setViewStylist] = useState<Stylist | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  // Edit state
  const [editStylist, setEditStylist] = useState<Stylist | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchStylists = async () => {
    try {
      setIsLoading(true);
      setError(null);

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

      if (!response.ok) throw new Error("Failed to fetch stylists");

      const result: StylistResponse = await response.json();
      setStylists(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStylistDetail = async (id: string) => {
    setIsLoadingDetail(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      const response = await fetch(
        `http://localhost:3002/api/v1/hairstyles/stylists/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch stylist detail");
      const result: StylistDetailResponse = await response.json();
      setViewStylist(result.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleViewDetail = (stylist: Stylist) => {
    fetchStylistDetail(stylist.id);
  };

  const handleEdit = (stylist: Stylist) => {
    setEditStylist(stylist);
  };

  useEffect(() => {
    fetchStylists();
  }, []);

  const getInitials = (name: string) => {
    const words = name.trim().split(" ").filter(Boolean);
    if (words.length === 0) return "NA";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
  };

  const renderTableContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <div className="text-red-500">Error: {error}</div>
            <Button variant="outline" onClick={fetchStylists}>Thử lại</Button>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-muted-foreground">Đang tải danh sách thợ cắt tóc...</div>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold">Danh sách stylist</p>
            <p className="text-xs text-muted-foreground">Quản lý thợ cắt tóc và thông tin hồ sơ</p>
          </div>
          <Button size="sm" onClick={() => setIsCreateOpen(true)}>
            <IconPlus className="h-4 w-4" />
            Tạo stylist
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thợ cắt tóc</TableHead>
              <TableHead>Kinh nghiệm</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Lượt đặt</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stylists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">Không có dữ liệu stylist</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              stylists.map((stylist) => (
                <TableRow key={stylist.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={stylist.avatarUrl ?? undefined} alt={stylist.fullName} />
                        <AvatarFallback>{getInitials(stylist.fullName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium leading-none">{stylist.fullName}</p>
                        <p className="text-xs text-muted-foreground mt-1">ID: {stylist.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{stylist.experience} năm</TableCell>
                  <TableCell>{stylist.rating.toFixed(1)}</TableCell>
                  <TableCell>{stylist.totalBookings}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {stylist.specialties.map((specialty) => (
                        <span
                          key={`${stylist.id}-${specialty}`}
                          className="rounded-full border px-2 py-0.5 text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        stylist.isAvailable
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {stylist.isAvailable ? "Sẵn sàng" : "Bận"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* View detail button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleViewDetail(stylist)}
                        disabled={isLoadingDetail}
                        title="Xem chi tiết"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                      {/* Edit button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleEdit(stylist)}
                        title="Chỉnh sửa"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end px-4 py-4">
          <Button variant="outline" size="sm" onClick={fetchStylists}>
            <IconReload className="h-4 w-4" />
            Tải lại
          </Button>
        </div>
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
            <Separator
              orientation="vertical"
              className="mx-2 data-[orientation=vertical]:h-4"
            />
            <h1 className="text-base font-medium">Stylist Management</h1>
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

      {/* View Detail Dialog */}
      {viewStylist && (
        <ViewDetailDialog
          stylist={viewStylist}
          onClose={() => setViewStylist(null)}
        />
      )}

      {/* Edit Dialog */}
      {editStylist && (
        <EditDialog
          stylist={editStylist}
          onClose={() => setEditStylist(null)}
          onSuccess={fetchStylists}
        />
      )}

      {isCreateOpen && (
        <CreateStylistDialog
          onClose={() => setIsCreateOpen(false)}
          onSuccess={fetchStylists}
        />
      )}
    </SidebarProvider>
  );
}