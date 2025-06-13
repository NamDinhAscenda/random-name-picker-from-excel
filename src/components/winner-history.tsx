import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Trophy, Calendar, User } from "lucide-react";

interface WinnerEntry {
  id: string;
  name: string;
  timestamp: Date;
}

interface WinnerHistoryProps {
  winners: WinnerEntry[];
}

export default function WinnerHistory({ winners }: WinnerHistoryProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 font-headline">
          <Trophy className="h-6 w-6 text-primary" />
          <span>Lịch sử người thắng ({winners.length}/30)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[500px] px-6 pb-6">
          {winners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có người thắng nào</p>
              <p className="text-sm">Hãy bắt đầu chọn ngẫu nhiên!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {winners.map((winner, index) => (
                <div
                  key={`${winner.id}-${winner.timestamp.getTime()}`}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="h-4 w-4 text-primary" />
                      <p className="font-medium truncate">{winner.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      ID: {winner.id}
                    </p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {winner.timestamp.toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
