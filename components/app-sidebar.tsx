"use client";

import * as React from "react";
import {
  IconBell,
  IconCamera,
  IconDashboard,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconTrash,
  IconUsers,
  IconCut,
  IconCategory,
  IconCalendarEvent,   // <-- thêm icon lịch làm việc
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type UserRole = "admin" | "stylist" | string | null;

const STYLIST_HIDDEN_TITLES = new Set([
  "Category",
  "Account",
  "Policy",
  "Delete Account",
]);

const STYLIST_ONLY_TITLES = new Set(["Notification", "Service"]);

const data = {
  user: {
    name: "admin01",
    email: "admin01@gmail.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Appointment",
      url: "/appointment",
      icon: IconFileWord,
    },
    {
      title: "Stylist",
      url: "/users",
      icon: IconUsers,
    },
    {
      title: "Lịch làm việc",          // <-- tab mới
      url: "/schedule",
      icon: IconCalendarEvent,
    },
    {
      title: "Hair Style",
      url: "/hair-style",
      icon: IconCut,
    },
    {
      title: "Category",
      url: "/category",
      icon: IconCategory,
    },
    {
      title: "Account",
      url: "/account",
      icon: IconUsers,
    },
    {
      title: "Policy",
      url: "/Policy_introduce",
      icon: IconFileDescription,
    },
    {
      title: "Delete Account",
      url: "/DeleteAccount",
      icon: IconTrash,
    },
    {
      title: "Notification",
      url: "/notification",
      icon: IconBell,
    },
    {
      title: "Service",
      url: "/service",
      icon: IconCamera,
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userRole, setUserRole] = React.useState<UserRole>(null);

  React.useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        setUserRole(null);
        return;
      }

      const parsedUser = JSON.parse(storedUser) as { role?: string };
      setUserRole(parsedUser.role ?? null);
    } catch {
      setUserRole(null);
    }
  }, []);

  const normalizedRole = userRole?.toLowerCase();

  const visibleNavMain =
    normalizedRole === "stylist"
      ? data.navMain.filter((item) => !STYLIST_HIDDEN_TITLES.has(item.title))
      : data.navMain.filter((item) => !STYLIST_ONLY_TITLES.has(item.title));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <img
                  src="/stargazerlogo.png"
                  alt="Dashboard Icon"
                  className="!size-6"
                />
                <span className="text-base font-semibold">
                  HairStyle Dashboard
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={visibleNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}