
"use server";

import * as XLSX from 'xlsx';

interface NameEntry {
  id: string;
  name: string;
}

interface ProcessExcelResult {
  entries?: NameEntry[];
  error?: string;
}

export async function processExcelFile(formData: FormData): Promise<ProcessExcelResult> {
  const file = formData.get("file") as File;

  if (!file) {
    return { error: "No file uploaded." };
  }

  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && !file.name.endsWith('.xlsx')) {
    return { error: "Invalid file type. Please upload an .xlsx file." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { error: "No sheets found in the Excel file." };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
    
    const entries = data
      .map(row => ({
        id: row && row[0] != null ? String(row[0]).trim() : null,
        name: row && row[1] != null ? String(row[1]).trim() : null,
      }))
      .filter(entry => entry.id && entry.id.length > 0 && entry.name && entry.name.length > 0) as NameEntry[];

    if (entries.length === 0) {
      return { error: "No valid entries (ID and Name pairs) found. Ensure the first column is ID and the second is Name." };
    }

    return { entries };
  } catch (e) {
    console.error("Error processing Excel file:", e);
    return { error: "Failed to process the Excel file. Make sure it is a valid .xlsx file." };
  }
}
