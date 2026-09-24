import { useState, type ReactNode } from 'react';
import { catalogue, type Ouverture } from '../../data/types';
import { choixSelectionnes, coloris, formatDimensions, materiau, modele } from '../../lib/catalogue';
import { cheminEtape, naviguer } from '../../router';
import { useProjet } from '../../state/ProjetContext';
import { RenduMenuiserie } from '../apercu/RenduMenuiserie';
import { Pastille } from '../etapes/EtapeColoris';
import { Bouton } from '../ui/Bouton';
import { Liste } from '../ui/Champ';
import { useToast } from '../ui/Toast';
import { Fourchette } from './Estimation';

export function resumeOuverture(o: Ouverture) {
  const options = choixSelectionnes(o)
    .filter(({ choix }) => choix.prixFictif > 0)
    .map(({ choix }) => choix.libelle);
  const pose = catalogue.pose.types.find((p) => p.id === o.pose)?.libelle;
  return [modele(o.famille, o.modele).libelle, formatDimensions(o), `${materiau(o.materiau).libelle} ${coloris(o.coloris).libelle.toLowerCase()}`, ...options, pose, o.repriseAnciennes ? 'Reprise des anciennes' : ''].filter(Boolean) as string[];
}

export function CarteOuvertureLecture({ o, children }: { o: Ouverture; children?: ReactNode }) {
  return (
    <li className="flex gap-3 rounded-xl bg-white p-3 ring-1 ring-bord sm:gap-4 sm:p-4">
      <RenduMenuiserie {...o} avecMur decoratif className="h-24 w-20 shrink-0 rounded-lg sm:h-28 sm:w-28" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3">
          <p className="font-titre font-semibold text-marine">
            {o.libelle}
            {o.quantite > 1 && <span className="ml-1 text-bleu">× {o.quantite}</span>}
          </p>
          <Fourchette ouvertures={[o]} className="text-sm" />
        </div>
        <p className="mt-1 text-sm">{resumeOuverture(o).join(' · ')}</p>
        {children}
      </div>
    </li>
  );
}

export function ListeOuvertures() {
  const { projet, activer, dupliquer, supprimer, ajouterOuverture, appliquerColorisATous } = useProjet();
  const toast = useToast();
  const [harmonie, setHarmonie] = useState('');
  if (!projet) return null;

  const modifier = (id: string) => {
    activer(id);
    naviguer(cheminEtape(projet.id, 'produit'));
  };
  // Coloris proposés par au moins un matériau du projet.
  const colorisProjet = [...new Set(projet.ouvertures.flatMap((o) => materiau(o.materiau).coloris))];

  return (
    <div>
      <ul className="space-y-3">
        {projet.ouvertures.map((o) => (
          <CarteOuvertureLecture key={o.id} o={o}>
            <div className="mt-2 flex flex-wrap gap-1">
              <Bouton variante="discret" taille="petit" icone="crayon" onClick={() => modifier(o.id)} aria-label={`Modifier ${o.libelle}`}>
                Modifier
              </Bouton>
              <Bouton
                variante="discret"
                taille="petit"
                icone="dupliquer"
                onClick={() => {
                  dupliquer(o.id);
                  toast(`${o.libelle} dupliquée`);
                }}
                aria-label={`Dupliquer ${o.libelle}`}
              >
                Dupliquer
              </Bouton>
              {projet.ouvertures.length > 1 && (
                <Bouton
                  variante="discret"
                  taille="petit"
                  icone="poubelle"
                  className="text-red-700"
                  onClick={() => window.confirm(`Supprimer « ${o.libelle} » du projet ?`) && supprimer(o.id)}
                  aria-label={`Supprimer ${o.libelle}`}
                >
                  Supprimer
                </Bouton>
              )}
            </div>
          </CarteOuvertureLecture>
        ))}
      </ul>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Bouton
          variante="jaune"
          icone="plus"
          onClick={() => {
            ajouterOuverture();
            naviguer(cheminEtape(projet.id, 'produit'));
          }}
        >
          Ajouter une ouverture
        </Bouton>
        {projet.ouvertures.length > 1 && (
          <form
            className="flex flex-1 items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!harmonie) return;
              const n = appliquerColorisATous(harmonie);
              toast(n ? `Coloris « ${coloris(harmonie).libelle} » appliqué à ${n} ouverture${n > 1 ? 's' : ''}` : 'Aucune ouverture à modifier');
            }}
          >
            <Liste libelle="Même coloris pour toutes les ouvertures" value={harmonie} onChange={(e) => setHarmonie(e.target.value)} className="flex-1">
              <option value="">Choisir un coloris…</option>
              {colorisProjet.map((c) => (
                <option key={c} value={c}>
                  {coloris(c).libelle}
                </option>
              ))}
            </Liste>
            {harmonie && <Pastille id={harmonie} className="mb-1.5 size-9" />}
            <Bouton type="submit" variante="secondaire" disabled={!harmonie}>
              Appliquer
            </Bouton>
          </form>
        )}
      </div>
      {projet.ouvertures.length > 1 && <p className="mt-2 text-xs">Un coloris n'est appliqué qu'aux ouvertures dont le matériau le propose.</p>}
    </div>
  );
}
