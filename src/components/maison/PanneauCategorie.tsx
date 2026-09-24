import { useEffect, useRef, useState } from 'react';
import { catalogue } from '../../data/types';
import { famille as getFamille, materiauxDisponibles, typePose } from '../../lib/catalogue';
import { RenduMenuiserie } from '../apercu/RenduMenuiserie';
import { Bouton } from '../ui/Bouton';
import { Badge } from '../ui/Carte';
import { Icone } from '../ui/Icone';
import { EMPLACEMENTS } from './scene';

/* Panneau à côté de la maison : liste des catégories, puis le détail de la catégorie choisie. */

export function ListeCategories({ survol, onSurvol, onChoisir, dansProjet }: { survol: string | null; onSurvol: (f: string | null) => void; onChoisir: (f: string) => void; dansProjet: Set<string> }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">Que voulez-vous changer ?</h2>
      <p className="mt-1 text-sm">Touchez un élément de la maison, ou choisissez dans la liste.</p>
      <ul className="mt-4 grid grid-cols-2 gap-2">
        {EMPLACEMENTS.map((e) => {
          const f = getFamille(e.famille);
          return (
            <li key={e.famille}>
              <button
                type="button"
                onClick={() => onChoisir(e.famille)}
                onMouseEnter={() => onSurvol(e.famille)}
                onMouseLeave={() => onSurvol(null)}
                onFocus={() => onSurvol(e.famille)}
                onBlur={() => onSurvol(null)}
                className={`flex w-full items-center gap-2 rounded-xl border-2 p-2 text-left text-sm font-bold text-marine transition-colors ${
                  survol === e.famille ? 'border-bleu bg-bleu-clair' : 'border-bord bg-white hover:border-bleu'
                }`}
              >
                <RenduMenuiserie decoratif famille={f.id} {...e.defaut} className="h-10 w-10 shrink-0" />
                <span className="min-w-0 flex-1">{f.libelle}</span>
                {dansProjet.has(f.id) && <Icone nom="ok" className="size-4 shrink-0 text-ok" titre="Dans votre projet" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

interface DetailProps {
  familleId: string;
  onRetour: () => void;
  onConfigurer: (modele: string, ajouter: boolean) => void;
  projetEnCours?: { id: string; nb: number } | null;
}

export function DetailCategorie({ familleId, onRetour, onConfigurer, projetEnCours }: DetailProps) {
  const f = getFamille(familleId);
  const emplacement = EMPLACEMENTS.find((e) => e.famille === familleId);
  const [modele, setModele] = useState(emplacement?.defaut.modele ?? f.modeles[0].id);
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => titre.current?.focus({ preventScroll: true }), []);

  const mat = emplacement && materiauxDisponibles(f.id, modele).includes(emplacement.defaut.materiau) ? emplacement.defaut.materiau : materiauxDisponibles(f.id, modele)[0];
  const col = catalogue.materiaux.find((m) => m.id === mat)?.coloris.includes(emplacement?.defaut.coloris ?? '') ? emplacement!.defaut.coloris : catalogue.materiaux.find((m) => m.id === mat)!.coloris[0];
  const [lMin, lMax] = f.dimensions.largeur;

  return (
    <div className="apparition">
      <button type="button" onClick={onRetour} className="mb-3 inline-flex items-center gap-1 rounded text-sm font-bold text-bleu hover:underline">
        <Icone nom="gauche" className="size-4" /> Toute la maison
      </button>
      <div className="flex flex-wrap items-center gap-2">
        <h2 ref={titre} tabIndex={-1} className="text-2xl font-semibold outline-none">
          {f.pluriel}
        </h2>
        {f.standard && <Badge ton="bleu">Standard</Badge>}
        <Badge ton="bleu">Sur mesure</Badge>
      </div>
      <p className="mt-1">{f.accroche}</p>

      <RenduMenuiserie famille={f.id} modele={modele} materiau={mat} coloris={col} avecMur className="mt-3 h-44 w-full rounded-xl" />

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-bold text-marine">Choisissez un modèle</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
          {f.modeles.map((m) => (
            <label
              key={m.id}
              className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 p-2 text-center text-xs font-bold text-marine has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bleu ${
                modele === m.id ? 'border-bleu bg-bleu-clair' : 'border-bord bg-white hover:border-bleu/60'
              }`}
            >
              <input type="radio" name="modele-accueil" className="sr-only" checked={modele === m.id} onChange={() => setModele(m.id)} />
              <RenduMenuiserie decoratif famille={f.id} modele={m.id} materiau={materiauxDisponibles(f.id, m.id)[0]} coloris={col} className="h-12 w-full" />
              {m.libelle}
            </label>
          ))}
        </div>
        <p className="mt-2 text-sm">{f.modeles.find((m) => m.id === modele)?.description}</p>
      </fieldset>

      <ul className="mt-4 space-y-1.5 text-sm">
        {f.standard && (
          <li className="flex gap-2">
            <Icone nom="ok" className="mt-0.5 size-4 shrink-0 text-ok" />
            {f.standard.tailles.length} tailles standard, au meilleur prix
          </li>
        )}
        <li className="flex gap-2">
          <Icone nom="ok" className="mt-0.5 size-4 shrink-0 text-ok" />
          Sur mesure de {lMin} à {lMax} cm de large
        </li>
        <li className="flex gap-2">
          <Icone nom="ok" className="mt-0.5 size-4 shrink-0 text-ok" />
          Pose : {f.poses.map((p) => typePose(p).libelle.split(' (')[0].toLowerCase()).join(', ')}
        </li>
        <li className="flex gap-2">
          <Icone nom="ok" className="mt-0.5 size-4 shrink-0 text-ok" />
          Pose par un installateur ou par vous-même, accessoires chiffrés
        </li>
      </ul>

      <div className="mt-5 flex flex-col gap-2">
        {projetEnCours ? (
          <>
            <Bouton variante="jaune" iconeDroite="droite" onClick={() => onConfigurer(modele, true)}>
              Ajouter à mon projet ({projetEnCours.nb} ouverture{projetEnCours.nb > 1 ? 's' : ''})
            </Bouton>
            <Bouton variante="secondaire" onClick={() => onConfigurer(modele, false)}>
              Commencer un nouveau projet
            </Bouton>
          </>
        ) : (
          <Bouton variante="jaune" iconeDroite="droite" onClick={() => onConfigurer(modele, false)}>
            Configurer {f.libelle.toLowerCase().startsWith('porte') || f.libelle.startsWith('Fenêtre') || f.libelle.startsWith('Baie') ? 'ma' : 'mon'} {f.libelle.toLowerCase()}
          </Bouton>
        )}
        <p className="text-center text-xs">Dimensions et manière de poser, puis comparaison standard / sur mesure.</p>
      </div>
    </div>
  );
}
