"use client";

import * as React from "react";
import {
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
                  StarGazer Dashboard
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}