import { catalogue, type Ouverture } from '../../data/types';
import { devis, formatEuros, formatFourchette, fourchette, suffixePrix } from '../../lib/prix';
import { Badge } from '../ui/Carte';

export function MentionPrixFictifs() {
  return <Badge>{catalogue.meta.avertissementPrix}</Badge>;
}

/** Fourchette compacte (panneau latéral, barre mobile). */
export function Fourchette({ ouvertures, className = '' }: { ouvertures: Ouverture[]; className?: string }) {
  return <span className={`font-titre font-bold text-marine ${className}`}>{formatFourchette(fourchette(ouvertures), suffixePrix(ouvertures))}</span>;
}

export function CarteEstimation({ ouverture, toutes }: { ouverture: Ouverture; toutes: Ouverture[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-bord">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">Estimation indicative</p>
        <MentionPrixFictifs />
      </div>
      <p className="mt-1 text-sm">
        {ouverture.libelle} · {catalogue.solutions[ouverture.solution].libelle.toLowerCase()}
      </p>
      <Fourchette ouvertures={[ouverture]} className="text-2xl" />
      {toutes.length > 1 && (
        <p className="mt-2 border-t border-bord pt-2 text-sm">
          Projet complet ({toutes.length} ouvertures) : <Fourchette ouvertures={toutes} />
        </p>
      )}
      <p className="mt-2 text-xs">Pose et accessoires compris. Aides et financement : {catalogue.aChiffrer.aides}</p>
    </div>
  );
}

/** Répartition du projet : produits, pose, accessoires. */
export function RepartitionProjet({ ouvertures }: { ouvertures: Ouverture[] }) {
  const somme = (f: (d: ReturnType<typeof devis>) => number) => ouvertures.reduce((s, o) => s + f(devis(o)) * Math.max(1, o.quantite), 0);
  const lignes = [
    { l: 'Produits et options', v: somme((d) => d.produit + d.options) },
    { l: 'Pose par un installateur', v: somme((d) => d.pose + d.reprise) },
    { l: 'Accessoires de pose', v: somme((d) => d.totalAccessoires) },
  ];
  return (
    <dl className="mt-3 divide-y divide-bord text-sm">
      {lignes.map((x) => (
        <div key={x.l} className="flex justify-between gap-3 py-1.5">
          <dt>{x.l}</dt>
          <dd className="font-bold text-marine">{formatEuros(x.v)}</dd>
        </div>
      ))}
    </dl>
  );
}
