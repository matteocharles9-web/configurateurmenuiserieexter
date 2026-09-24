import { useState } from 'react';
import { catalogue, type Ouverture } from '../../data/types';
import { coloris, famille, formatDimensions, materiau, modele } from '../../lib/catalogue';
import { ApercuPhoto } from './ApercuPhoto';
import { RenduMenuiserie } from './RenduMenuiserie';

export function PanneauApercu({ projetId, ouverture: o }: { projetId: string; ouverture: Ouverture }) {
  const [onglet, setOnglet] = useState<'rendu' | 'photo'>('rendu');
  const onglets = [
    { id: 'rendu', libelle: 'Aperçu' },
    { id: 'photo', libelle: 'Sur votre photo' },
  ] as const;

  return (
    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-bord sm:p-4">
      <div role="tablist" aria-label="Type d'aperçu" className="mb-3 grid grid-cols-2 gap-1 rounded-full bg-fond p-1">
        {onglets.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`onglet-${t.id}`}
            aria-selected={onglet === t.id}
            aria-controls={`panneau-${t.id}`}
            tabIndex={onglet === t.id ? 0 : -1}
            onClick={() => setOnglet(t.id)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                const suivant = onglet === 'rendu' ? 'photo' : 'rendu';
                setOnglet(suivant);
                document.getElementById(`onglet-${suivant}`)?.focus();
              }
            }}
            className={`rounded-full px-3 py-2 text-sm font-bold ${onglet === t.id ? 'bg-white text-marine shadow' : 'text-texte'}`}
          >
            {t.libelle}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panneau-${onglet}`} aria-labelledby={`onglet-${onglet}`}>
        {onglet === 'rendu' ? (
          <>
            <RenduMenuiserie {...o} avecMur className="mx-auto block h-52 w-full sm:h-64 lg:h-72" />
            <p className="mt-3 text-center text-sm">
              <span className="font-bold text-marine">{modele(o.famille, o.modele).libelle}</span>
              <br />
              {materiau(o.materiau).libelle} · {coloris(o.coloris).libelle} · {formatDimensions(o)}
              {o.quantite > 1 && ` · × ${o.quantite}`}
              <br />
              <span className="text-xs">{catalogue.solutions[o.solution].libelle}</span>
            </p>
            <p className="sr-only">Produit : {famille(o.famille).libelle}</p>
          </>
        ) : (
          <ApercuPhoto projetId={projetId} ouverture={o} />
        )}
      </div>
    </div>
  );
}
