import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="max-md:hidden">
        <Header />
      </div>
      {children}
      <div className="max-md:hidden">
        <FooterSection />
      </div>
    </>
  );
}
