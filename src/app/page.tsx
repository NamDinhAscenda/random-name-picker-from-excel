"use client";

import { useState, type ChangeEvent, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Users,
  Gift,
  AlertCircle,
  CheckCircle2,
  Search,
  UserCircle,
} from "lucide-react";
import { processExcelFile } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useVirtualizer } from "@tanstack/react-virtual";
import UploadFileCard from "@/components/upload-file-card";
import WinnerBanner from "@/components/winner-banner";
import WinnerHistory from "@/components/winner-history";
import Image from "next/image";
import ivivuLogo from "../../public/ivivu_w_slogan.png";
import summerTourBanner from "../../public/summer-tour.png";

const DEBOUNCE_DELAY = 300; // milliseconds
export const MAX_WINNER_HISTORY = 30;

interface NameEntry {
  id: string;
  name: string;
}

interface WinnerEntry {
  id: string;
  name: string;
  timestamp: Date;
}

export default function ExcelChooserPage() {
  const [entries, setEntries] = useState<NameEntry[]>([]);
  const [winnerHistory, setWinnerHistory] = useState<WinnerEntry[]>([]);
  const [currentWinner, setCurrentWinner] = useState<WinnerEntry | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("");
  const { toast } = useToast();

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setError(null);
      setEntries([]);
      setCurrentWinner(null);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      handleSubmitFile(selectedFile);
    }
  };

  const handleSubmitFile = async (currentFile: File) => {
    if (!currentFile) {
      setError("Vui lòng chọn một tệp trước.");
      toast({
        variant: "destructive",
        title: "Chưa chọn tệp",
        description: "Vui lòng chọn một tệp Excel để tải lên.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setEntries([]);
    setCurrentWinner(null);

    const formData = new FormData();
    formData.append("file", currentFile);

    const result = await processExcelFile(formData);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Lỗi xử lý tệp",
        description: result.error,
      });
    } else if (result.entries) {
      setEntries(result.entries);
      toast({
        title: "Xử lý tệp thành công!",
        description: `${result.entries.length} mục (ID/tên) đã được tải.`,
        action: <CheckCircle2 className="text-green-500" />,
      });
    }
    setIsLoading(false);
  };

  const filteredEntries = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return entries;
    }
    return entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        entry.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [entries, debouncedSearchQuery]);

  const handleChooseRandomName = () => {
    if (filteredEntries.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredEntries.length);
      const selectedEntry = filteredEntries[randomIndex];
      const winner: WinnerEntry = {
        ...selectedEntry,
        timestamp: new Date(),
      };

      setCurrentWinner(winner);

      // Add to winner history (keep only last 30)
      setWinnerHistory((prev) => {
        const newHistory = [...prev, winner];
        return newHistory.slice(-MAX_WINNER_HISTORY);
      });

      toast({
        title: "Đã chọn mục!",
        description: `"${selectedEntry.name} (ID: ${selectedEntry.id})" là người may mắn!`,
        action: <Gift className="text-primary" />,
      });
    } else if (entries.length > 0 && filteredEntries.length === 0) {
      toast({
        variant: "destructive",
        title: "Không có mục nào khớp",
        description: "Xóa tìm kiếm hoặc tải lên tệp mới để chọn.",
      });
    }
  };

  const rowVirtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58,
    overscan: 10,
  });

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Header */}
      <header className="w-full bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            {/* Logo and Brand */}
            <div className="flex items-center justify-center">
              <Image height={60} src={ivivuLogo} alt="iVIVU Logo" />
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end space-y-1 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
                  <span>Hotline: 1900 1870</span>
                </div>
                <div className="text-primary-foreground/80">7h30 - 21h</div>
              </div>
            </div>
          </div>

          {/* Event Title */}
          <div className="flex items-center justify-between gap-8">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-headline font-bold mb-3">
                🎉 Chill Mơ Màng với iVIVU thật dễ dàng 🎉
              </h2>
              <div className="max-w-4xl">
                <p className="text-lg text-primary-foreground/90 mb-2">
                  Cùng tìm ra{" "}
                  <span className="font-bold text-accent">
                    {MAX_WINNER_HISTORY} khách hàng may mắn nhất
                  </span>{" "}
                  với giải thưởng
                </p>
                <div className="bg-accent/20 rounded-lg px-4 py-2 inline-block">
                  <p className="font-semibold text-accent text-lg">
                    "01 Vé xem Những Thành Phố Mơ Màng Summer Tour 2025"
                  </p>
                </div>
              </div>
            </div>

            {/* Concert Banner */}
            <div className="hidden lg:block flex-shrink-0">
              <Image
                src={summerTourBanner}
                alt="Summer Tour 2025 Concert Banner"
                height={300}
                className="rounded-lg shadow-md object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - 2 Column Layout */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 min-h-[calc(100vh-200px)]">
          {/* Left Column - 40% width (2/5) */}
          <div className="lg:col-span-2 space-y-6">
            <UploadFileCard
              handleFileChange={handleFileChange}
              isLoading={isLoading}
            />

            {error && (
              <Alert variant="destructive" className="shadow-md">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle>Lỗi</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {entries.length > 0 && !isLoading && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 font-headline">
                    <Users className="h-6 w-6 text-primary" />
                    <span>Khách hàng</span>
                  </CardTitle>
                  <CardDescription>
                    Danh sách Khách hàng đã đặt dịch vụ tại iVIVU.com từ ngày
                    06/06 đến 22/06/2025.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Tìm kiếm ID hoặc tên..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div
                    ref={parentRef}
                    className="h-64 w-full rounded-md border overflow-y-auto bg-muted/30 p-2"
                  >
                    {rowVirtualizer.getTotalSize() > 0 ? (
                      <div
                        style={{
                          height: `${rowVirtualizer.getTotalSize()}px`,
                          width: "100%",
                          position: "relative",
                        }}
                      >
                        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                          const entry = filteredEntries[virtualRow.index];
                          return (
                            <div
                              key={virtualRow.key}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                              }}
                              className="w-full border-b border-border/50 hover:bg-primary/10 rounded-sm"
                            >
                              <div className="flex items-center px-3 py-3 h-full">
                                <UserCircle className="h-5 w-5 mr-2.5 text-primary/80 shrink-0" />
                                <div className="flex-grow overflow-hidden flex flex-col justify-center">
                                  <p className="font-medium truncate text-base leading-tight">
                                    {entry.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                                    {entry.id}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {searchQuery && entries.length > 0
                          ? "Không có mục nào khớp với tìm kiếm của bạn."
                          : "Chưa có mục nào được tải hoặc danh sách trống."}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Button
                    onClick={handleChooseRandomName}
                    disabled={
                      isLoading ||
                      filteredEntries.length === 0 ||
                      winnerHistory.length >= MAX_WINNER_HISTORY
                    }
                    size="lg"
                    className="font-semibold"
                  >
                    <Gift className="mr-2 h-5 w-5" />
                    Chọn ngẫu nhiên
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>

          {/* Right Column - 60% width (3/5) */}
          <div className="lg:col-span-3 space-y-6">
            <WinnerBanner winner={currentWinner} />
            <WinnerHistory winners={winnerHistory} />
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground py-6 border-t">
        <p>&copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
