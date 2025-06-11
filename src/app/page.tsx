
"use client";

import { useState, type ChangeEvent, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListChecks, UploadCloud, Users, Gift, AlertCircle, Loader2, FileText, CheckCircle2, Search, UserCircle } from 'lucide-react';
import { processExcelFile } from './actions';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useVirtualizer } from '@tanstack/react-virtual';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


const DEBOUNCE_DELAY = 300; // milliseconds

interface NameEntry {
  id: string;
  name: string;
}

export default function ExcelChooserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<NameEntry[]>([]);
  const [chosenEntry, setChosenEntry] = useState<NameEntry | null>(null);
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
      setFile(selectedFile);
      setError(null);
      setEntries([]);
      setChosenEntry(null);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      handleSubmitFile(selectedFile);
    } else {
      setFile(null);
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
    setChosenEntry(null);

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
    return entries.filter(entry =>
      entry.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      entry.id.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [entries, debouncedSearchQuery]);

  const handleChooseRandomName = () => {
    if (filteredEntries.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredEntries.length);
      const selectedEntry = filteredEntries[randomIndex];
      setChosenEntry(selectedEntry);
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

  useEffect(() => {
    setChosenEntry(null);
  }, [entries, searchQuery]);


  const rowVirtualizer = useVirtualizer({
    count: filteredEntries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 58, 
    overscan: 10,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background font-body">
      <main className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <ListChecks className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-foreground">Trình chọn ID & tên Excel</h1>
          </div>
          <p className="text-muted-foreground font-headline">Tải lên tệp Excel chứa ID, tên và để số phận quyết định!</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-headline">
              <UploadCloud className="h-6 w-6 text-primary" />
              <span>Tải lên tệp Excel của bạn</span>
            </CardTitle>
            <CardDescription>
              Chọn một tệp .xlsx. <strong>Quan trọng:</strong> Tệp phải có một hàng tiêu đề. Dữ liệu ID phải ở cột đầu tiên và dữ liệu tên ở cột thứ hai, bắt đầu từ hàng thứ hai sau tiêu đề. Tên cột trong hàng tiêu đề không quan trọng, hàng tiêu đề sẽ được bỏ qua. Xem ví dụ định dạng bên dưới.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="">
              <Input
                id="excel-file"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={handleFileChange}
                disabled={isLoading}
                className={cn(
                  "bg-input",
                  "file:text-primary-foreground file:bg-primary hover:file:bg-primary/90",
                  "file:font-semibold",
                  "file:py-2 file:px-4",
                  "file:rounded-md",
                  "file:border-0",
                  "file:mr-3"
                )}
              />
              {isLoading && (
                <div className="flex items-center space-x-2 text-muted-foreground mt-2">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span>Đang xử lý tệp của bạn... Vui lòng đợi.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-headline">
              <FileText className="h-6 w-6 text-primary" />
              <span>Định dạng tệp Excel ví dụ</span>
            </CardTitle>
             <CardDescription>
              Dưới đây là ví dụ về cách tệp Excel của bạn nên được cấu trúc (hàng đầu tiên là tiêu đề và sẽ được bỏ qua).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Mã nhân viên (ví dụ)</TableHead>
                  <TableHead>Họ và tên (ví dụ)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">VTL0030358</TableCell>
                  <TableCell>Nguyễn Văn A</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">VTL0030359</TableCell>
                  <TableCell>Trần Thị B</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">NV0012345</TableCell>
                  <TableCell>Lê Văn C</TableCell>
                </TableRow>
                 <TableRow>
                  <TableCell className="font-medium">...</TableCell>
                  <TableCell>...</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>


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
                <span>Các mục đã tải ({filteredEntries.length} / {entries.length})</span>
              </CardTitle>
              <CardDescription>
                Đây là danh sách các ID và tên được tải từ tệp của bạn. Sử dụng ô tìm kiếm hoặc chọn một mục ngẫu nhiên.
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
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const entry = filteredEntries[virtualRow.index];
                      return (
                        <div
                          key={virtualRow.key}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: `${virtualRow.size}px`,
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                          className="w-full border-b border-border/50 hover:bg-primary/10 rounded-sm" 
                        >
                          <div className="flex items-start px-3 py-3 h-full">
                            <span className="mr-3 text-primary/80 w-8 text-right shrink-0 tabular-nums pt-[1px]">
                              {(virtualRow.index + 1)}.
                            </span>
                            <UserCircle className="h-5 w-5 mr-2.5 text-primary/80 shrink-0 mt-[1px]" />
                            <div className="flex-grow overflow-hidden flex flex-col">
                              <p className="font-medium truncate text-base">{entry.name}</p>
                              <p className="text-xs text-muted-foreground truncate mt-1">{entry.id}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery && entries.length > 0 ? "Không có mục nào khớp với tìm kiếm của bạn." : "Chưa có mục nào được tải hoặc danh sách trống."}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={handleChooseRandomName}
                disabled={isLoading || filteredEntries.length === 0}
                size="lg"
                className="font-semibold"
              >
                <Gift className="mr-2 h-5 w-5" />
                Chọn mục ngẫu nhiên
              </Button>
            </CardFooter>
          </Card>
        )}

        {chosenEntry && (
          <Card className="bg-primary text-primary-foreground shadow-xl transform transition-all duration-500 ease-out scale-100 animate-in fade-in zoom-in-90">
            <CardHeader className="items-center text-center">
              <CardTitle className="text-3xl font-headline flex items-center justify-center space-x-2">
                <Gift className="h-8 w-8" />
                <span>Và người được chọn là...</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
               <div className="py-6 px-4 bg-primary-foreground/10 rounded-lg shadow-inner">
                <p className="text-4xl font-bold font-headline break-all">{chosenEntry.name}</p>
                <p className="text-xl font-mono text-muted-foreground/90 mt-1">{chosenEntry.id}</p>
              </div>
            </CardContent>
             <CardFooter className="justify-center">
                <Button variant="secondary" onClick={() => { setChosenEntry(null); setSearchQuery(""); setDebouncedSearchQuery("");}}>
                    Xóa lựa chọn & tìm kiếm
                </Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Trình chọn ID & tên Excel bởi Kim Oanh. Hãy chọn một cách khôn ngoan!</p>
      </footer>
    </div>
  );
}

