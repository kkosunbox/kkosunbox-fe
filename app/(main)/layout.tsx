import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
// import { CursorPaw } from "@/shared/ui";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* <CursorPaw /> */}
      <Header />
      <main className="flex flex-1 flex-col pt-[54px]">{children}</main>
      <FooterSection />
    </div>
  );
}
