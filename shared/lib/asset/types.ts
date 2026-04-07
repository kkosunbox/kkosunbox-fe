export interface PresignedUrlRequest {
  fileName: string;
  fileType: string; // MIME type (예: "image/jpeg", "application/pdf")
}

export interface PresignedUrlResponse {
  uploadUrl: string; // S3 직접 업로드용 Presigned URL
  fileUrl: string;   // 업로드 완료 후 파일 접근 URL (DB에 저장할 값)
  fileName: string;
}
