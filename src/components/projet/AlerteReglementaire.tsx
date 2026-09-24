import { catalogue, type Regle } from '../../data/types';
import { Icone } from '../ui/Icone';

export function AlertesReglementaires({ alertes }: { alertes: Regle[] }) {
  if (!alertes.length)
    return (
      <p className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-bold text-ok">
        <Icone nom="ok" className="size-5" /> Aucune démarche particulière détectée avec les informations fournies.
      </p>
    );
  return (
    <div className="space-y-3" role="status">
      {alertes.map((r) => (
        <div key={r.id} className={`rounded-xl border-l-4 p-4 ${r.niveau === 'attention' ? 'border-alerte bg-alerte-fond' : 'border-bleu bg-bleu-clair'}`}>
          <p className={`flex items-start gap-2 font-bold ${r.niveau === 'attention' ? 'text-alerte' : 'text-marine'}`}>
            <Icone nom={r.niveau === 'attention' ? 'alerte' : 'info'} className="mt-0.5 size-5 shrink-0" />
            {r.titre}
          </p>
          <p className="mt-1 text-sm">{r.message}</p>
          <p className="mt-2 text-sm font-bold text-marine">La démarche à suivre :</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-sm">
            {r.demarche.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ol>
        </div>
      ))}
      <p className="text-xs italic">{catalogue.reglementaire.avertissement}</p>
    </div>
  );
}
