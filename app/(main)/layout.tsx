import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
import ProfileFloatWidget from "@/features/profile/ui/ProfileFloatWidget";
import ChecklistFormModal from "@/widgets/checklist/ui/ChecklistFormModal";
// import { CursorPaw } from "@/shared/ui";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col" suppressHydrationWarning>
      {/* <CursorPaw /> */}
      <Header />
      <ProfileFloatWidget />
      <ChecklistFormModal />
      <main className="flex flex-1 flex-col">{children}</main>
      <FooterSection />
    </div>
  );
}
