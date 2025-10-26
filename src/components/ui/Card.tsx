export function Card({ children }: { children: React.ReactNode }) {
  return <div className="p-4 rounded-2xl bg-neutral-900 border border-white/10">{children}</div>;
}
export function CardTitle({ children }: { children: React.ReactNode }) {
  return <div className="text-lg font-semibold mb-2">{children}</div>;
}
export function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="mt-3 flex gap-3">{children}</div>;
}
