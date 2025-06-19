"use client";

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
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconLock,
  IconLockOpen,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: number;
  fullName: string;
  email: string;
  blocked: boolean;
  verified: boolean;
}

interface UserResponse {
  message: string;
  data: {
    content: User[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    };
  };
}

export default function Page() {
  const [currentPage, setCurrentPage] = useState(0);
  const [users, setUsers] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://stargazer-wgpb.onrender.com/users?page=${page}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async (userId: number, currentBlockedStatus: boolean) => {
    try {
      // Find the user by id to get their email
      const user = users?.data.content.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Optimistically update the UI first
      if (users) {
        const updatedContent = users.data.content.map(user => 
          user.id === userId ? { ...user, blocked: !currentBlockedStatus } : user
        );
        
        setUsers({
          ...users,
          data: {
            ...users.data,
            content: updatedContent,
          },
        });
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://stargazer-wgpb.onrender.com/user/${currentBlockedStatus ? 'unblock' : 'block'}?email=${user.email}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // If the request fails, revert the optimistic update
        if (users) {
          const revertedContent = users.data.content.map(user => 
            user.id === userId ? { ...user, blocked: currentBlockedStatus } : user
          );
          
          setUsers({
            ...users,
            data: {
              ...users.data,
              content: revertedContent,
            },
          });
        }
        throw new Error(`Failed to ${currentBlockedStatus ? 'unblock' : 'block'} user`);
      }

      toast.success(`User ${currentBlockedStatus ? 'unblocked' : 'blocked'} successfully`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const renderTableContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-red-500">Error: {error}</div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div className="text-sm text-muted-foreground">Loading users...</div>
          </div>
        </div>
      );
    }

    if (!users) {
      return null;
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              users.data.content.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.blocked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.blocked ? 'Blocked' : 'Active'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleBlock(user.id, user.blocked)}
                      className="hover:bg-muted"
                    >
                      {user.blocked ? (
                        <IconLockOpen className="h-4 w-4" />
                      ) : (
                        <IconLock className="h-4 w-4" />
                      )}
                      <span className="sr-only">{user.blocked ? 'Unblock user' : 'Block user'}</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-center px-2 py-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              Page {users.data.page.number + 1} of {users.data.page.totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(0)}
                disabled={users.data.page.number === 0}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(users.data.page.number - 1)}
                disabled={users.data.page.number === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(users.data.page.number + 1)}
                disabled={users.data.page.number === users.data.page.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(users.data.page.totalPages - 1)}
                disabled={users.data.page.number === users.data.page.totalPages - 1}
              >
                <span className="sr-only">Go to last page</span>
                <IconChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
                <h1 className="text-base font-medium">User Management</h1>
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
