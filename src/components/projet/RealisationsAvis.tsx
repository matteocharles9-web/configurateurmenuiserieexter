import { catalogue } from '../../data/types';
import { famille as getFamille } from '../../lib/catalogue';
import { RenduMenuiserie } from '../apercu/RenduMenuiserie';
import { Badge } from '../ui/Carte';
import { Icone } from '../ui/Icone';

/* Réalisations et avis (données fictives), filtrés sur les produits du projet quand c'est possible. */
export function RealisationsAvis({ familles, max = 3 }: { familles?: string[]; max?: number }) {
  const filtre = <T extends { famille: string }>(l: T[]) => {
    const f = familles?.length ? l.filter((x) => familles.includes(x.famille)) : [];
    return (f.length ? f : l).slice(0, max);
  };
  const realisations = filtre(catalogue.realisations);
  const avis = filtre(catalogue.avis);
  const filtree = familles?.length && catalogue.realisations.some((r) => familles.includes(r.famille));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Badge ton="gris">{catalogue.meta.avertissementDonnees}</Badge>
        {filtree && <span>Sélection sur {familles!.map((f) => getFamille(f).pluriel.toLowerCase()).join(', ')}. En production : chantiers proches de chez vous.</span>}
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {realisations.map((r) => (
          <li key={r.id} className="overflow-hidden rounded-xl bg-white ring-1 ring-bord">
            <RenduMenuiserie {...r} avecMur decoratif className="h-36 w-full bg-fond" />
            <div className="p-3">
              <p className="font-bold text-marine">{r.titre}</p>
              <p className="text-xs font-bold text-bleu">{r.lieu}</p>
              <p className="mt-1 text-sm">{r.texte}</p>
            </div>
          </li>
        ))}
      </ul>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {avis.map((a) => (
          <li key={a.id} className="rounded-xl bg-white p-4 ring-1 ring-bord">
            <p className="flex gap-0.5 text-jaune" aria-label={`Note fictive : ${a.note} sur 5`}>
              {[1, 2, 3, 4, 5].map((n) => (
                <Icone key={n} nom="etoile" className={`size-4 ${n <= a.note ? 'fill-jaune' : 'text-bord'}`} />
              ))}
            </p>
            <blockquote className="mt-2 text-sm">« {a.texte} »</blockquote>
            <p className="mt-2 text-xs font-bold text-marine">{a.auteur}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
