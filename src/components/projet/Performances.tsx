import { catalogue, type Ouverture } from '../../data/types';
import { benefices } from '../../lib/performances';

/* Performances traduites en bénéfices : niveaux qualitatifs et phrases simples, jamais de coefficient. */
export function Performances({ ouverture, compact = false, criteres }: { ouverture: Parameters<typeof benefices>[0]; compact?: boolean; criteres?: string[] }) {
  const liste = benefices(ouverture).filter((b) => !criteres || criteres.includes(b.id));
  return (
    <div>
      <ul className={compact ? 'grid gap-2 sm:grid-cols-2' : 'space-y-3'}>
        {liste.map((b) => (
          <li key={b.id} className="rounded-xl bg-fond p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="font-bold text-marine">{b.libelle}</span>
              <span className="flex items-center gap-2">
                <span className="flex gap-1" aria-hidden>
                  {[1, 2, 3].map((n) => (
                    <span key={n} className={`h-2 w-6 rounded-full ${n <= b.niveau ? 'bg-bleu' : 'bg-bord'}`} />
                  ))}
                </span>
                <span className="w-16 text-right text-sm font-bold text-bleu">{b.libelleNiveau}</span>
              </span>
            </div>
            {!compact && <p className="mt-1 text-sm">{b.phrase}</p>}
            {!compact && b.id === 'economies' && (
              <p className="mt-1 text-sm">
                <span className="font-bold">Montant des économies :</span> {catalogue.aChiffrer.economiesEnergie}
              </p>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs italic">{catalogue.meta.avertissementPerformances}</p>
    </div>
  );
}

export type { Ouverture };
