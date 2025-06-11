
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
    return { error: "Chưa có tệp nào được tải lên." };
  }

  if (file.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" && !file.name.endsWith('.xlsx')) {
    return { error: "Loại tệp không hợp lệ. Vui lòng tải lên một tệp .xlsx." };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { error: "Không tìm thấy trang tính nào trong tệp Excel." };
    }
    const worksheet = workbook.Sheets[firstSheetName];
    
    // header: 1 ensures data is an array of arrays.
    // blankrows: false skips completely blank rows.
    const data: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false });

    if (data.length <= 1) { // Not enough rows for header + data
      return { error: "Tệp không chứa hàng dữ liệu nào sau hàng tiêu đề." };
    }
    
    // Skip the header row (data[0]), process from data[1] onwards.
    const actualDataRows = data.slice(1);
    
    const entries = actualDataRows
      .map(row => ({
        id: row && row[0] != null ? String(row[0]).trim() : null,
        name: row && row[1] != null ? String(row[1]).trim() : null,
      }))
      // Ensure both id and name are present and not empty strings
      .filter(entry => entry.id && entry.id.length > 0 && entry.name && entry.name.length > 0) as NameEntry[];

    if (entries.length === 0) {
      return { error: "Không tìm thấy mục (ID và Tên) hợp lệ nào trong các hàng dữ liệu (sau hàng tiêu đề). Hãy chắc chắn rằng cột đầu tiên chứa ID và cột thứ hai chứa Tên trong các hàng dữ liệu." };
    }

    return { entries };
  } catch (e) {
    console.error("Error processing Excel file:", e);
    return { error: "Không thể xử lý tệp Excel. Hãy chắc chắn rằng đó là một tệp .xlsx hợp lệ." };
  }
}

