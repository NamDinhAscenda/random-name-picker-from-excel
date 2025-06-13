import { Loader2, UploadCloud } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

export default function UploadFileCard({
  handleFileChange,
  isLoading,
}: {
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-headline">
          <UploadCloud className="h-6 w-6 text-primary" />
          <span>Tải lên tệp Excel của bạn</span>
        </CardTitle>
        <CardDescription>Chọn một tệp .xlsx</CardDescription>
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
  );
}
