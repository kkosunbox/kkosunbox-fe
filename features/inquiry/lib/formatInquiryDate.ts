export function formatInquiryDate(iso: string): string {
  if (!iso) return "";
  return iso.slice(0, 10).replace(/-/g, ".");
}
