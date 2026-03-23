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
import { useState, useEffect } from "react";
import { IconReload } from "@tabler/icons-react";

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
}

interface StylistResponse {
  statusCode: number;
  message: string;
  data: Stylist[];
  timestamp: string;
}

export default function Page() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStylists = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("http://localhost:3002/api/v1/hairstyles/stylists/all", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stylists");
      }

      const result: StylistResponse = await response.json();
      setStylists(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thợ cắt tóc</TableHead>
              <TableHead>Kinh nghiệm</TableHead>
              <TableHead>Đánh giá</TableHead>
              <TableHead>Lượt đặt</TableHead>
              <TableHead>Chuyên môn</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stylists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
    </SidebarProvider>
  );
}
