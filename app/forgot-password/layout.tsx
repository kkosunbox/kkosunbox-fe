import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <div className="max-md:hidden">
        <FooterSection />
      </div>
    </>
  );
}
