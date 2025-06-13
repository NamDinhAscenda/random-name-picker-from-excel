import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Gift, Sparkles, Crown } from "lucide-react";

interface WinnerEntry {
  id: string;
  name: string;
  timestamp: Date;
}

interface WinnerBannerProps {
  winner: WinnerEntry | null;
}

export default function WinnerBanner({ winner }: WinnerBannerProps) {
  if (!winner) {
    return (
      <Card className="shadow-lg bg-gradient-to-br from-muted/50 to-muted/30 border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative">
            <Gift className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <Sparkles className="h-6 w-6 text-muted-foreground/30 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-xl font-headline font-semibold text-muted-foreground mb-2">
            Chưa có người thắng
          </h3>
          <p className="text-muted-foreground/80">
            Tải lên file Excel và chọn ngẫu nhiên để tìm người may mắn!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 transform transition-all duration-500 ease-out animate-in fade-in zoom-in-95">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-headline flex items-center justify-center space-x-2">
          <Crown className="h-8 w-8 text-yellow-300" />
          <span>🎉 NGƯỜI THẮNG MỚI NHẤT 🎉</span>
          <Crown className="h-8 w-8 text-yellow-300" />
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="relative py-8 px-6 bg-primary-foreground/10 rounded-xl shadow-inner mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-xl"></div>
          <div className="relative">
            <p className="text-3xl md:text-4xl font-bold font-headline break-all mb-2">
              {winner.name}
            </p>
            <p className="text-lg font-mono text-primary-foreground/90 mb-3">
              ID: {winner.id}
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-primary-foreground/80">
              <Gift className="h-4 w-4" />
              <span>Thời gian: {winner.timestamp.toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-2 text-primary-foreground/90">
          <Sparkles className="h-5 w-5 animate-pulse" />
          <span className="font-medium">Chúc mừng người chiến thắng!</span>
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
