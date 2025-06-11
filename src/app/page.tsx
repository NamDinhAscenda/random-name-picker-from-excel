
"use client";

import { useState, type ChangeEvent, useEffect, useRef, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListChecks, UploadCloud, Users, Gift, AlertCircle, Loader2, FileText, CheckCircle2, Search } from 'lucide-react';
import { processExcelFile } from './actions';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useVirtualizer } from '@tanstack/react-virtual';

const DEBOUNCE_DELAY = 300; // milliseconds

export default function ExcelChooserPage() {
  const [file, setFile] = useState<File | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [chosenName, setChosenName] = useState<string | null>(null);
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
      setNames([]);
      setChosenName(null);
      setSearchQuery("");
      setDebouncedSearchQuery("");
      handleSubmitFile(selectedFile);
    } else {
      setFile(null);
    }
  };

  const handleSubmitFile = async (currentFile: File) => {
    if (!currentFile) {
      setError("Please select a file first.");
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select an Excel file to upload.",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setNames([]);
    setChosenName(null);

    const formData = new FormData();
    formData.append("file", currentFile);

    const result = await processExcelFile(formData);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Error processing file",
        description: result.error,
      });
    } else if (result.names) {
      setNames(result.names);
      toast({
        title: "File processed successfully!",
        description: `${result.names.length} names loaded.`,
        action: <CheckCircle2 className="text-green-500" />,
      });
    }
    setIsLoading(false);
  };

  const filteredNames = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return names;
    }
    return names.filter(name =>
      name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [names, debouncedSearchQuery]);

  const handleChooseRandomName = () => {
    if (filteredNames.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredNames.length);
      const selectedName = filteredNames[randomIndex];
      setChosenName(selectedName);
      toast({
        title: "Name Chosen!",
        description: `"${selectedName}" is the lucky one!`,
        action: <Gift className="text-primary" />,
      });
    } else if (names.length > 0 && filteredNames.length === 0) {
      toast({
        variant: "destructive",
        title: "No names match search",
        description: "Clear search or upload a new file to choose a name.",
      });
    }
  };

  useEffect(() => {
    setChosenName(null);
  }, [names, searchQuery]);


  const rowVirtualizer = useVirtualizer({
    count: filteredNames.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 28, 
    overscan: 10,
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background font-body">
      <main className="w-full max-w-2xl space-y-8">
        <header className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <ListChecks className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-headline font-bold text-foreground">ExcelentChooser</h1>
          </div>
          <p className="text-muted-foreground font-headline">Upload an Excel file with names and let fate decide!</p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 font-headline">
              <UploadCloud className="h-6 w-6 text-primary" />
              <span>Upload Your Excel File</span>
            </CardTitle>
            <CardDescription>
              Select an .xlsx file containing a list of names in a single column.
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
                  <span>Processing your file... Please wait.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {names.length > 0 && !isLoading && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 font-headline">
                <Users className="h-6 w-6 text-primary" />
                <span>Loaded Names ({filteredNames.length} / {names.length})</span>
              </CardTitle>
              <CardDescription>
                Here are the names loaded from your file. Use the search below or pick one randomly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search names..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div
                ref={parentRef}
                className="h-64 w-full rounded-md border overflow-y-auto bg-muted/30 p-4"
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
                      const name = filteredNames[virtualRow.index];
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
                          className="flex items-center"
                        >
                          <div className="text-sm text-foreground p-1 rounded hover:bg-primary/10 flex items-center h-full w-full">
                            <span className="mr-2 text-primary/70 w-7 text-right shrink-0 tabular-nums">
                              {(virtualRow.index + 1)}.
                            </span>
                            <FileText className="h-4 w-4 mr-2 text-primary/70 shrink-0" />
                            <span className="truncate">{name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery && names.length > 0 ? "No names match your search." : "No names loaded or list is empty."}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={handleChooseRandomName}
                disabled={isLoading || filteredNames.length === 0}
                size="lg"
                className="font-semibold"
              >
                <Gift className="mr-2 h-5 w-5" />
                Choose Random Name
              </Button>
            </CardFooter>
          </Card>
        )}

        {chosenName && (
          <Card className="bg-primary text-primary-foreground shadow-xl transform transition-all duration-500 ease-out scale-100 animate-in fade-in zoom-in-90">
            <CardHeader className="items-center text-center">
              <CardTitle className="text-3xl font-headline flex items-center justify-center space-x-2">
                <Gift className="h-8 w-8" />
                <span>And the chosen one is...</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold font-headline py-6 px-4 bg-primary-foreground/10 rounded-lg shadow-inner break-all">
                {chosenName}
              </p>
            </CardContent>
             <CardFooter className="justify-center">
                <Button variant="secondary" onClick={() => { setChosenName(null); setSearchQuery(""); setDebouncedSearchQuery("");}}>
                    Clear Choice & Search
                </Button>
            </CardFooter>
          </Card>
        )}
      </main>
      <footer className="mt-12 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Kim Oanh's ExcelentChooser. Choose wisely!</p>
      </footer>
    </div>
  );
}
