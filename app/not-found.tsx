import { Header } from "@/widgets/header";
import { NotFoundSection } from "@/widgets/not-found";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-[var(--header-offset)]">
        <NotFoundSection />
      </main>
    </>
  );
}
