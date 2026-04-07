import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
// import { CursorPaw } from "@/shared/ui";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <CursorPaw /> */}
      <Header />
      <main className="pt-[54px]">{children}</main>
      <FooterSection />
    </>
  );
}
