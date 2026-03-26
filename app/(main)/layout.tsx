import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="pt-[54px]">{children}</main>
      <FooterSection />
    </>
  );
}
