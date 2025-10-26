export default function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm opacity-75">{label}</span>
      {children}
    </label>
  );
}
