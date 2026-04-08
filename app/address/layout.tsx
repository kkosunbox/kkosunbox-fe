export default function AddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {children}
    </div>
  );
}
