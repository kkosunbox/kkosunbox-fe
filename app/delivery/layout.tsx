export default function DeliveryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen justify-center bg-[var(--color-surface-light)]">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
