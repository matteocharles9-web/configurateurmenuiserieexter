import type { ReactNode } from 'react';

export function Carte({ children, className = '', titre, id }: { children: ReactNode; className?: string; titre?: ReactNode; id?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-bord sm:p-5 ${className}`} aria-labelledby={titre && id ? id : undefined}>
      {titre && (
        <h2 id={id} className="mb-3 text-lg font-semibold">
          {titre}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Badge({ children, ton = 'jaune' }: { children: ReactNode; ton?: 'jaune' | 'bleu' | 'gris' | 'vert' }) {
  const t = {
    jaune: 'bg-jaune text-marine',
    bleu: 'bg-bleu-clair text-marine',
    gris: 'bg-fond text-texte ring-1 ring-bord',
    vert: 'bg-green-100 text-ok',
  }[ton];
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${t}`}>{children}</span>;
}
