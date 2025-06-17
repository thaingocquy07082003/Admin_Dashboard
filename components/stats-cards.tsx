import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Star } from "lucide-react";

export function StatsCards() {
  return (
    <div className="flex flex-row gap-4">
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5</div>
          <p className="text-xs text-muted-foreground">
            +20.1% so với tháng trước
          </p>
        </CardContent>
      </Card>
      <Card className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số đánh giá</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2</div>
          <p className="text-xs text-muted-foreground">
            +15.3% so với tháng trước
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 