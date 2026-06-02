import Link from "next/link";
import { notFound } from "next/navigation";
import { TossPaymentTest } from "./TossPaymentTest";

export default function TossTestPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-950">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="space-y-2">
          <Link href="/test" className="text-sm font-medium text-zinc-500 hover:underline">
            ← /test
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">
            토스페이먼츠 결제 연동 테스트
          </h1>
          <p className="text-sm leading-6 text-zinc-600">
            문서용 테스트 키로 동작하며 실제 금액이 청구되지 않습니다.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <TossPaymentTest />
        </section>
      </div>
    </main>
  );
}
