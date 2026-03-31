import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <div className="max-md:hidden">
        <FooterSection />
      </div>
    </>
  );
}
