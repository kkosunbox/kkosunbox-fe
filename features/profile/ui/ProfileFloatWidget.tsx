"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import { BreedCombobox, DatePicker } from "@/shared/ui";
import type { DogGender } from "@/features/profile/api/types";

const DISMISS_KEY = "profile-widget-dismissed-date";

function isDismissedToday(): boolean {
  try {
    const stored = localStorage.getItem(DISMISS_KEY);
    if (!stored) return false;
    return stored === new Date().toISOString().slice(0, 10);
  } catch {
    return false;
  }
}

function dismissToday() {
  try {
    localStorage.setItem(DISMISS_KEY, new Date().toISOString().slice(0, 10));
  } catch {
    // ignore
  }
}

export default function ProfileFloatWidget() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { profiles, profile, refreshProfile, isProfilesReady } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);      // 조건 기반 자동 표시
  const [forceVisible, setForceVisible] = useState(false); // CTA 등 명시적 표시
  const [submitting, setSubmitting] = useState(false);

  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<DogGender | null>(null);
  const [note, setNote] = useState("");

  // 활성 프로필이 바뀔 때마다 폼을 해당 프로필 데이터로 갱신
  const lastPrefillId = useRef<number | null>(null);
  useEffect(() => {
    if (!profile) return;
    if (lastPrefillId.current === profile.id) return;
    lastPrefillId.current = profile.id;
    setDogName(profile.name ?? "");
    setBreed(profile.breed ?? "");
    setWeight(profile.weight != null ? String(profile.weight) : "");
    if (profile.birthDate) {
      const [y, mo, d] = profile.birthDate.split("-").map(Number);
      setBirthDate(new Date(y, mo - 1, d));
    } else {
      setBirthDate(null);
    }
    setGender(profile.gender ?? null);
    setNote(profile.specialNotes ?? "");
  }, [profile]);

  // 표시 조건 판단: 인증·프로필 fetch 완료 후에만 평가 (fetch 전 빈 배열로 잠깐 뜨는 것 방지)
  useEffect(() => {
    if (isAuthLoading || !isProfilesReady) {
      setVisible(false);
      return;
    }
    if (!isLoggedIn) {
      setVisible(false);
      return;
    }
    if (isDismissedToday()) {
      setVisible(false);
      return;
    }
    const needsProfile = profiles.length === 0;
    const needsChecklist = profile != null && !hasChecklistAnswers(profile);
    setVisible(needsProfile || needsChecklist);
  }, [isLoggedIn, isAuthLoading, isProfilesReady, profiles, profile]);

  // CTA 버튼 등 외부에서 명시적으로 표시 요청 시 강제 오픈 (로그인 여부 무관)
  useEffect(() => {
    const handler = () => setForceVisible(true);
    window.addEventListener("ggosoon:show-profile-widget", handler);
    return () => window.removeEventListener("ggosoon:show-profile-widget", handler);
  }, []);

  function handleClose() {
    dismissToday();
    setVisible(false);
    setForceVisible(false);
  }

  async function handleSubmit() {
    if (submitting) return;
    // 비로그인 상태에서 제출 시 로그인 페이지로
    if (!isLoggedIn) {
      router.push("/login?next=/");
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        name: dogName || undefined,
        breed: breed || undefined,
        gender: gender ?? undefined,
        birthDate: birthDate
          ? `${birthDate.getFullYear()}-${String(birthDate.getMonth() + 1).padStart(2, "0")}-${String(birthDate.getDate()).padStart(2, "0")}`
          : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        specialNotes: note || undefined,
      };
      if (profile) {
        await updateProfile(profile.id, body);
      } else {
        await createProfile(body);
      }
      await refreshProfile();
      setVisible(false);
      setForceVisible(false);
      window.dispatchEvent(new CustomEvent("ggosoon:open-checklist-form"));
    } catch {
      window.dispatchEvent(new CustomEvent("ggosoon:open-checklist-form"));
    } finally {
      setSubmitting(false);
    }
  }

  if (pathname !== "/") return null;
  if (!visible && !forceVisible) return null;

  return (
    <div className="fixed z-[200] overflow-hidden shadow-2xl max-md:bottom-0 max-md:right-0 max-md:w-full max-md:rounded-t-2xl md:top-20 md:right-4 md:w-[300px] md:rounded-2xl">
      {/* 헤더 */}
      <div
        className="relative flex flex-col items-center justify-center px-10 py-4 gap-1"
        style={{ background: "var(--color-accent-orange)" }}
      >
        <button
          type="button"
          aria-label="닫기"
          onClick={handleClose}
          className="absolute top-3 right-4 text-white opacity-80 hover:opacity-100 transition-opacity text-[20px] leading-none"
        >
          ×
        </button>
        <div className="flex items-center gap-2">
          <span className="text-white text-[18px]">🐾</span>
          <span className="text-white text-[17px] font-bold">프로필 작성</span>
          <span className="text-white text-[18px]">🐾</span>
        </div>
        <p className="text-white text-[12px] opacity-90">강아지 프로필을 작성해주세요.</p>
      </div>

      {/* 폼 */}
      <div className="bg-white px-5 py-5 flex flex-col gap-4">
        {/* 강아지 이름 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--color-text-label)]">강아지 이름</label>
          <input
            type="text"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            placeholder="이름"
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-warm)] px-4 py-3 text-[13px] outline-none focus:border-[var(--color-accent-orange)] transition-colors"
          />
        </div>

        {/* 강아지 품종 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--color-text-label)]">강아지 품종</label>
          <BreedCombobox
            id="float-widget-breed"
            value={breed}
            onChange={setBreed}
            placeholder="ex) 웰시코기"
            className="text-[13px] rounded-xl bg-[var(--color-surface-warm)]"
          />
        </div>

        {/* 몸무게 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--color-text-label)]">몸무게</label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.1"
              className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-warm)] px-4 py-3 text-[13px] outline-none focus:border-[var(--color-accent-orange)] transition-colors pr-10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[13px] text-[var(--color-text-label)]">kg</span>
          </div>
        </div>

        {/* 생년월일 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--color-text-label)]">생년월일</label>
          <DatePicker
            id="float-widget-birth"
            value={birthDate}
            onChange={setBirthDate}
            placeholder="2020.01.01"
            formatDisplay={(d) =>
              `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`
            }
            maxDate={new Date()}
            minDate={new Date(new Date().getFullYear() - 40, 0, 1)}
            triggerClassName="!rounded-xl !bg-[var(--color-surface-warm)] !border-[var(--color-border-light)] hover:!border-[var(--color-accent-orange)] [&_span:first-child]:!text-[13px]"
          />
        </div>

        {/* 성별 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--color-text-label)]">성별</label>
          <div className="flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className="flex-1 rounded-xl py-2.5 text-[14px] font-medium transition-colors border"
                style={
                  gender === g
                    ? {
                        background: "var(--color-accent-orange-light)",
                        color: "var(--color-accent-orange)",
                        borderColor: "var(--color-accent-orange)",
                      }
                    : {
                        background: "white",
                        color: "var(--color-text-label)",
                        borderColor: "var(--color-border-light)",
                      }
                }
              >
                {g === "male" ? "남" : "여"}
              </button>
            ))}
          </div>
        </div>

        {/* 특징 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-medium text-[var(--color-text-label)]">특징</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="알러지, 건강 상태 등"
            rows={3}
            className="w-full rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface-warm)] px-4 py-3 text-[13px] outline-none focus:border-[var(--color-accent-orange)] transition-colors resize-none"
          />
        </div>

        {/* 제출 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-1 w-full rounded-2xl py-4 text-[15px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: "var(--color-brown-dark)" }}
        >
          간식박스 추천받기
        </button>
      </div>
    </div>
  );
}
