interface SectionCardProps {
  title?: string;
  children: React.ReactNode;
}

export default function SectionCard({
  title,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      {title && (
        <h2 className="mb-4 text-lg font-semibold">
          {title}
        </h2>
      )}

      {children}
    </section>
  );
}