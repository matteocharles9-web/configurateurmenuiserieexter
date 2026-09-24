import { ETAPES, type EtapeId } from '../../data/types';
import { Icone } from '../ui/Icone';

/* Barre de progression : chaque étape est un lien, on peut revenir à n'importe laquelle. */
export function BarreProgression({ courante, versEtape }: { courante: EtapeId | 'recap'; versEtape: (e: string) => string }) {
  const idx = courante === 'recap' ? ETAPES.length : ETAPES.findIndex((e) => e.id === courante);
  const pct = Math.round((idx / ETAPES.length) * 100);
  return (
    <nav aria-label="Étapes de la configuration" className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-bord">
      <div className="mb-2 flex items-center justify-between text-xs font-bold sm:hidden">
        <span className="text-marine">
          Étape {Math.min(idx + 1, ETAPES.length)} sur {ETAPES.length}
          {courante !== 'recap' && ` · ${ETAPES[idx].libelle}`}
        </span>
        <span>{pct} %</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-fond sm:hidden" aria-hidden>
        <div className="h-full rounded-full bg-bleu transition-all" style={{ width: `${Math.max(pct, 6)}%` }} />
      </div>
      <ol className="mt-2 flex gap-1 overflow-x-auto sm:mt-0 sm:gap-2">
        {[...ETAPES, { id: 'recap', libelle: 'Récapitulatif' }].map((e, i) => {
          const actif = i === idx;
          const fait = i < idx;
          return (
            <li key={e.id} className="flex-1">
              <a
                href={versEtape(e.id)}
                aria-current={actif ? 'step' : undefined}
                className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-center text-xs font-bold sm:flex-row sm:gap-2 sm:text-sm ${
                  actif ? 'bg-bleu text-white' : fait ? 'text-marine hover:bg-bleu-clair' : 'text-texte hover:bg-fond'
                }`}
              >
                <span
                  className={`grid size-6 shrink-0 place-items-center rounded-full text-xs ${
                    actif ? 'bg-jaune text-marine' : fait ? 'bg-bleu text-white' : 'bg-fond ring-1 ring-bord'
                  }`}
                >
                  {fait ? <Icone nom="ok" className="size-3.5" /> : i + 1}
                </span>
                <span className="hidden sm:inline">{e.libelle}</span>
                <span className="sr-only sm:hidden">{e.libelle}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
