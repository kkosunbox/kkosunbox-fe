import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
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
      <ChecklistFormModal />
      <main className="flex flex-1 flex-col">{children}</main>
      <FooterSection />
    </div>
  );
}
