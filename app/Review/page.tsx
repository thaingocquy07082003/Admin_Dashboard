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
  IconEye,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Review {
  reviewID: number;
  userName: string;
  userEmail: string;
  context: string;
}

interface ReviewResponse {
  message: string;
  data: {
    content: Review[];
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
  const [reviews, setReviews] = useState<ReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("reviews");

  const fetchReviews = async (page: number, isHidden: boolean = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoint = isHidden 
        ? `https://stargazer-wgpb.onrender.com/review/readed?page=${page}`
        : `https://stargazer-wgpb.onrender.com/review/all?page=${page}`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };


//   ẩn đi review 
  const handleViewReview = async (reviewID: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://stargazer-wgpb.onrender.com/review/hidden/${reviewID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to view review');
      }

      // Remove the viewed review from the current page
      if (reviews) {
        const updatedContent = reviews.data.content.filter(
          (review) => review.reviewID !== reviewID
        );
        
        setReviews({
          ...reviews,
          data: {
            ...reviews.data,
            content: updatedContent,
            page: {
              ...reviews.data.page,
              totalElements: reviews.data.page.totalElements - 1,
            },
          },
        });

        toast.success('Review marked as viewed');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to view review');
    }
  };

  useEffect(() => {
    fetchReviews(currentPage, activeTab === "hidden");
  }, [currentPage, activeTab]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(0); // Reset to first page when changing tabs
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
            <div className="text-sm text-muted-foreground">Loading reviews...</div>
          </div>
        </div>
      );
    }

    if (!reviews) {
      return null;
    }

    return (
      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Review ID</TableHead>
              <TableHead>User Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Context</TableHead>
              {activeTab !== "hidden" && <TableHead className="w-[100px]">Hidden</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.data.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={activeTab === "hidden" ? 4 : 5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-muted-foreground">You don&apos;t have any Review</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              reviews.data.content.map((review) => (
                <TableRow key={review.reviewID}>
                  <TableCell>{review.reviewID}</TableCell>
                  <TableCell>{review.userName}</TableCell>
                  <TableCell>{review.userEmail}</TableCell>
                  <TableCell>{review.context}</TableCell>
                  {activeTab !== "hidden" && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewReview(review.reviewID)}
                        className="hover:bg-muted"
                      >
                        <IconEye className="h-4 w-4" />
                        <span className="sr-only">View review</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        
        {/* Pagination */}
        <div className="flex items-center justify-center px-2 py-4">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              Page {reviews.data.page.number + 1} of {reviews.data.page.totalPages}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(0)}
                disabled={reviews.data.page.number === 0}
              >
                <span className="sr-only">Go to first page</span>
                <IconChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(reviews.data.page.number - 1)}
                disabled={reviews.data.page.number === 0}
              >
                <span className="sr-only">Go to previous page</span>
                <IconChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(reviews.data.page.number + 1)}
                disabled={reviews.data.page.number === reviews.data.page.totalPages - 1}
              >
                <span className="sr-only">Go to next page</span>
                <IconChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => handlePageChange(reviews.data.page.totalPages - 1)}
                disabled={reviews.data.page.number === reviews.data.page.totalPages - 1}
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
                <h1 className="text-base font-medium">Review Management</h1>
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
                <Tabs defaultValue="reviews" value={activeTab} onValueChange={handleTabChange} className="mb-4">
                  <TabsList>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    <TabsTrigger value="hidden">Hidden Reviews</TabsTrigger>
                  </TabsList>
                </Tabs>
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
