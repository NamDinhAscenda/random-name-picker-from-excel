
"use server";

import *XLSX from 'xlsx';

interface ProcessExcelResult {
  names?: string[];
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
    
    // Convert sheet to JSON, assuming names are in the first column.
    // header: 1 creates an array of arrays.
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });
    
    const names = data
      .map(row => row[0]) // Get the first element of each row
      .filter(name => name !== null && name !== undefined && String(name).trim() !== "") // Filter out empty or undefined names
      .map(name => String(name).trim()); // Convert to string and trim whitespace

    if (names.length === 0) {
      return { error: "No names found in the first column of the Excel file." };
    }

    return { names };
  } catch (e) {
    console.error("Error processing Excel file:", e);
    return { error: "Failed to process the Excel file. Make sure it is a valid .xlsx file." };
  }
}
