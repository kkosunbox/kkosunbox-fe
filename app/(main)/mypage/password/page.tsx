import dynamic from "next/dynamic";

const PasswordManagementSection = dynamic(
  () => import("@/widgets/mypage/ui/PasswordManagementSection"),
);

export const metadata = { title: "비밀번호 변경 | 꼬순박스" };

export default function PasswordPage() {
  return (
    <div className="pt-[var(--header-offset)]">
      <PasswordManagementSection />
    </div>
  );
}
