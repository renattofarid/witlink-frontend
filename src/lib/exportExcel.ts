/**
 * Generates an .xlsx file from an array of flat row objects and triggers the
 * browser download. Each row's keys become the sheet's column headers.
 *
 * `xlsx` is imported dynamically so its (~400KB) bundle is loaded only when the
 * user actually exports, keeping it out of the initial bundle.
 */
export async function exportRowsToExcel(
  rows: Record<string, unknown>[],
  fileName: string,
  sheetName: string = "Datos",
) {
  const XLSX = await import("xlsx");
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}

/** Builds a filename like `liquidaciones_2026-07-31.xlsx`. */
export function excelFileName(prefix: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${prefix}_${y}-${m}-${d}.xlsx`;
}
