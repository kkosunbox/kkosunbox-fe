/**
 * Presigned URL로 S3에 파일을 직접 업로드합니다.
 *
 * 업로드 완료 후 PresignedUrlResponse.fileUrl을 DB에 저장하세요.
 *
 * @example
 * const { uploadUrl, fileUrl } = await getProfileImagePresignedUrl({ fileName, fileType });
 * await uploadToS3(uploadUrl, file, file.type);
 * // fileUrl을 프로필 profileImageUrl로 저장
 */
export async function uploadToS3(
  uploadUrl: string,
  file: File | Blob,
  fileType: string,
): Promise<void> {
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": fileType },
    body: file,
  });

  if (!res.ok) {
    throw new Error(`S3 업로드 실패 (${res.status})`);
  }
}
