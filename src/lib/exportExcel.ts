export interface ExcelResponse {
  file_name: string;
  mime_type: string;
  file_base64: string;
}

/**
 * Decodes a base64 Excel payload returned by the backend export endpoints and
 * triggers the browser download using the server-provided file name.
 */
export function downloadExcelFromBase64({
  file_base64,
  file_name,
  mime_type,
}: ExcelResponse) {
  const byteChars = atob(file_base64);
  const buffer = new ArrayBuffer(byteChars.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  const blob = new Blob([buffer], { type: mime_type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", file_name);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
