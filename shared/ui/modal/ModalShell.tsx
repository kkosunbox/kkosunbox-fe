"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalShellProps {
  /** 접근성 이름 — E2E의 getByRole("dialog", { name }) 이 이 값을 집는다 */
  label: string;
  /** ESC·배경 클릭 등 "닫기 요청"의 단일 경로 */
  onClose: () => void;
  children: ReactNode;
  /** 카드를 감싸는 정렬 컨테이너 클래스 (기존 `fixed inset-0 flex ...` 래퍼에서 남는 부분) */
  className?: string;
  /** 배경 어둡기 — 기본 60%, "soft"는 50% (globals.css의 ::backdrop 규칙과 짝) */
  backdrop?: "default" | "soft";
  /** 배경 클릭으로 닫을지 */
  dismissOnBackdrop?: boolean;
}

/**
 * 네이티브 `<dialog>.showModal()` 기반 모달 껍데기.
 *
 * 직접 구현하던 것들을 브라우저에 넘긴다:
 *  - ESC 닫기, 포커스 트랩, 배경 inert 처리, top layer 쌓임 순서
 *  - 배경 딤은 별도 `<div>`가 아니라 `::backdrop` (globals.css)
 *
 * 열림/닫힘은 "이 컴포넌트가 마운트되어 있는가"가 그대로 결정한다. 호출부는 기존처럼
 * 조건부 렌더만 하면 되고 별도 상태 동기화가 필요 없다.
 *
 * ⚠️ top layer는 z-index를 무시하고 "먼저 연 것 아래, 나중에 연 것 위"로 쌓인다.
 * 그래서 마이그레이션은 z-index 내림차순으로 진행해야 한다 (§2-3).
 * 계획: `.claude/contexts/modal-native-dialog-migration-plan.md`
 */
export default function ModalShell({
  label,
  onClose,
  children,
  className = "px-4",
  backdrop = "default",
  dismissOnBackdrop = true,
}: ModalShellProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    /* showModal()은 첫 포커스 가능 요소를 잡는다. 특정 버튼에 두고 싶으면 그 버튼에
     * [data-autofocus]를 달아둔다(AlertModal의 확인 버튼). showModal() 이후에 잡아야
     * 하므로 자식의 focus() 이펙트(자식이 먼저 실행된다)로는 대체할 수 없다. */
    dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-label={label}
      data-backdrop={backdrop === "soft" ? "soft" : undefined}
      /* ESC: 기본 닫힘을 막고 onClose 한 경로로 모은다 — onDismiss 등 정리 콜백을 보장하려면
       * close 이벤트가 아니라 여기서 받아야 한다(close로 받으면 언마운트와 서로를 부른다). */
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (!dismissOnBackdrop) return;
        if (e.target === dialogRef.current || e.target === contentRef.current) onClose();
      }}
      className="fixed inset-0 m-0 h-auto max-h-none w-auto max-w-none border-0 bg-transparent p-0"
    >
      <div ref={contentRef} className={`flex min-h-full items-center justify-center ${className}`}>
        {children}
      </div>
    </dialog>
  );
}
