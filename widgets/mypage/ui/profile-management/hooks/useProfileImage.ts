"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/features/profile/api/profileApi";
import type { Profile } from "@/features/profile/api/types";
import { getErrorMessage } from "@/shared/lib/api/errorMessages";
import { getProfileImagePresignedUrl, uploadToS3 } from "@/shared/lib/asset";
import { ACCEPT_IMAGE, MAX_PROFILE_IMAGE_BYTES } from "../profileManagementHelpers";

/**
 * 프로필 이미지 URL state·S3 업로드·파일 input·인라인 imageError를 소유한다.
 */
export function useProfileImage({
  profile,
  isCreating,
  isNewProfile,
  refreshProfile,
  router,
}: {
  profile: Profile | null;
  isCreating: boolean;
  isNewProfile: boolean;
  refreshProfile: () => Promise<void>;
  router: ReturnType<typeof useRouter>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(
    profile?.profileImageUrl ?? null,
  );
  const [imageError, setImageError] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (isNewProfile) return;
    setProfileImageUrl(profile?.profileImageUrl ?? null);
  }, [profile?.id, profile?.profileImageUrl, isNewProfile]);

  async function handleProfileImageSelected(file: File) {
    setImageError(null);
    if (!ACCEPT_IMAGE.split(",").includes(file.type)) {
      setImageError("JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setImageError("이미지는 5MB 이하만 업로드할 수 있습니다.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const { uploadUrl, fileUrl } = await getProfileImagePresignedUrl({
        fileName: file.name,
        fileType: file.type,
      });
      await uploadToS3(uploadUrl, file, file.type);

      if (isCreating) {
        setProfileImageUrl(fileUrl);
      } else if (profile) {
        await updateProfile(profile.id, { profileImageUrl: fileUrl });
        setProfileImageUrl(fileUrl);
        await refreshProfile();
        router.refresh();
      }
    } catch (error) {
      setImageError(getErrorMessage(error, "이미지 업로드에 실패했습니다. 다시 시도해주세요."));
    } finally {
      setIsUploadingImage(false);
    }
  }

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void handleProfileImageSelected(file);
  }

  return {
    profileImageUrl,
    fileInputRef,
    imageError,
    isUploadingImage,
    openFilePicker,
    handleProfileImageSelected,
    hiddenFileInputProps: {
      ref: fileInputRef,
      type: "file" as const,
      accept: ACCEPT_IMAGE,
      className: "sr-only",
      "aria-label": "프로필 이미지 파일 선택",
      onChange: handleFileInputChange,
    },
  };
}
