export default function AddressLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen justify-center bg-white">
      <div className="w-full max-w-[400px]">{children}</div>
    </div>
  );
}
