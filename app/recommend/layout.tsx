import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export default function RecommendLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <FooterSection />
    </>
  );
}
