"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useProfile } from "@/features/profile/ui/ProfileProvider";
import { hasChecklistAnswers } from "@/features/profile/lib/profileStatus";
import { createProfile, updateProfile } from "@/features/profile/api/profileApi";
import {
  BreedCombobox,
  DatePicker,
  ProfileStepPawLeft,
  ProfileStepPawRight,
  PROFILE_PET_BREED_INPUT_CLASS,
  PROFILE_PET_DATE_TRIGGER_CLASS,
  PROFILE_PET_FIELD,
  PROFILE_PET_FORM_STACK,
  PROFILE_PET_INPUT,
  PROFILE_PET_INPUT_SUFFIX,
  PROFILE_PET_LABEL,
  PROFILE_PET_GENDER_ROW,
  PROFILE_PET_SUBMIT_BTN,
  PROFILE_PET_MODAL_SUBTITLE,
  PROFILE_PET_MODAL_TITLE,
  PROFILE_PET_WIDGET_CARD,
  PROFILE_PET_WIDGET_HEADER,
  profilePetGenderBtnClass,
} from "@/shared/ui";
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

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M16 2L2 16M2 2L16 16"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BreedSearchGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="var(--color-text-secondary)" strokeWidth="2" />
      <path
        d="m20 20-3.65-3.65"
        stroke="var(--color-text-secondary)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function ProfileFloatWidget() {
  const { isLoggedIn, isAuthLoading } = useAuth();
  const { profiles, profile, refreshProfile, isProfilesReady } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  const [visible, setVisible] = useState(false);
  const [forceVisible, setForceVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gender, setGender] = useState<DogGender | null>(null);
  const [note, setNote] = useState("");

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

  useEffect(() => {
    const handler = () => setForceVisible(true);
    window.addEventListener("ggosoon:show-profile-widget", handler);
    return () => window.removeEventListener("ggosoon:show-profile-widget", handler);
  }, []);

  const isOpen = visible || forceVisible;

  useEffect(() => {
    if (!isOpen || pathname !== "/") return;
    const mq = window.matchMedia("(max-width: 767px)");
    if (!mq.matches) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, pathname]);

  function handleClose() {
    dismissToday();
    setVisible(false);
    setForceVisible(false);
  }

  async function handleSubmit() {
    if (submitting) return;
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
  if (!isOpen) return null;

  return (
    <div
      className={[
        "fixed z-[200] flex flex-col overflow-hidden bg-white max-md:inset-0 max-md:min-h-[100dvh] md:top-20 md:right-4 md:h-auto",
        PROFILE_PET_WIDGET_CARD,
      ].join(" ")}
      role="dialog"
      aria-modal="true"
      aria-label="프로필 작성"
    >
      <div
        className={PROFILE_PET_WIDGET_HEADER}
        style={{ background: "var(--color-cta-button)" }}
      >
        <div className="relative flex flex-col items-center gap-1 py-3">
          <div className="relative flex h-7 w-full items-center justify-center">
            <span className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2">
              <ProfileStepPawLeft />
            </span>
            <span className="pointer-events-none absolute right-10 top-1/2 -translate-y-1/2">
              <ProfileStepPawRight />
            </span>
            <span className={`${PROFILE_PET_MODAL_TITLE} text-white`}>프로필 작성</span>
            <button
              type="button"
              aria-label="닫기"
              onClick={handleClose}
              className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-70"
            >
              <CloseIcon />
            </button>
          </div>
          <p className={PROFILE_PET_MODAL_SUBTITLE}>강아지 프로필을 작성해주세요.</p>
        </div>
      </div>

      <div
        className={[
          "flex min-h-0 flex-1 flex-col overflow-y-auto bg-white px-6 py-5 max-md:pb-[env(safe-area-inset-bottom,0px)]",
          PROFILE_PET_FORM_STACK,
        ].join(" ")}
      >
        <div className={PROFILE_PET_FIELD}>
          <label className={PROFILE_PET_LABEL}>강아지 이름</label>
          <input
            type="text"
            value={dogName}
            onChange={(e) => setDogName(e.target.value)}
            placeholder="이름"
            className={PROFILE_PET_INPUT}
          />
        </div>

        <div className={PROFILE_PET_FIELD}>
          <label htmlFor="float-widget-breed" className={PROFILE_PET_LABEL}>
            강아지 품종
          </label>
          <div className="relative w-full">
            <BreedCombobox
              id="float-widget-breed"
              value={breed}
              onChange={setBreed}
              placeholder="ex) 웰시코기"
              className="w-full"
              inputClassName={PROFILE_PET_BREED_INPUT_CLASS}
              clearButtonRight="right-[40px]"
            />
            <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
              <BreedSearchGlyph />
            </span>
          </div>
        </div>

        <div className={PROFILE_PET_FIELD}>
          <label className={PROFILE_PET_LABEL}>몸무게</label>
          <div className="relative">
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.1"
              className={PROFILE_PET_INPUT}
            />
            <span className={PROFILE_PET_INPUT_SUFFIX}>kg</span>
          </div>
        </div>

        <div className={PROFILE_PET_FIELD}>
          <label htmlFor="float-widget-birth" className={PROFILE_PET_LABEL}>
            생년월일
          </label>
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
            triggerClassName={PROFILE_PET_DATE_TRIGGER_CLASS}
          />
        </div>

        <div className={PROFILE_PET_FIELD}>
          <label className={PROFILE_PET_LABEL}>성별</label>
          <div className={PROFILE_PET_GENDER_ROW}>
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={profilePetGenderBtnClass(gender === g)}
              >
                {g === "male" ? "남" : "여"}
              </button>
            ))}
          </div>
        </div>

        <div className={PROFILE_PET_FIELD}>
          <label htmlFor="float-widget-note" className={PROFILE_PET_LABEL}>
            특징
          </label>
          <input
            id="float-widget-note"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="알러지, 건강 상태 등"
            className={PROFILE_PET_INPUT}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className={PROFILE_PET_SUBMIT_BTN}
        >
          간식박스 추천받기
        </button>
      </div>
    </div>
  );
}
