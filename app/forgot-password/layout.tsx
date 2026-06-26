import { Header } from "@/widgets/header";
import { FooterSection } from "@/widgets/footer";
import { NOINDEX_METADATA } from "@/shared/lib/seo";

export const metadata = NOINDEX_METADATA;

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
