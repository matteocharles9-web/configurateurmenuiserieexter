import { catalogue, type Ouverture } from '../../data/types';
import { formatFourchette, fourchette } from '../../lib/prix';
import { Badge } from '../ui/Carte';

export function MentionPrixFictifs() {
  return <Badge>{catalogue.meta.avertissementPrix}</Badge>;
}

/** Fourchette compacte (panneau latéral, barre mobile). */
export function Fourchette({ ouvertures, className = '' }: { ouvertures: Ouverture[]; className?: string }) {
  return <span className={`font-titre font-bold text-marine ${className}`}>{formatFourchette(fourchette(ouvertures))}</span>;
}

export function CarteEstimation({ ouverture, toutes }: { ouverture: Ouverture; toutes: Ouverture[] }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-bord">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-bold">Estimation indicative</p>
        <MentionPrixFictifs />
      </div>
      <p className="mt-1 text-sm">{ouverture.libelle}</p>
      <Fourchette ouvertures={[ouverture]} className="text-2xl" />
      {toutes.length > 1 && (
        <p className="mt-2 border-t border-bord pt-2 text-sm">
          Projet complet ({toutes.length} ouvertures) : <Fourchette ouvertures={toutes} />
        </p>
      )}
      <p className="mt-2 text-xs">Aides et financement : {catalogue.aChiffrer.aides}</p>
    </div>
  );
}
