import { useState } from 'react';
import { catalogue } from '../../data/types';
import { famille as getFamille } from '../../lib/catalogue';
import { useProjet } from '../../state/ProjetContext';
import { GuideMesure } from '../mesure/GuideMesure';
import { Bouton } from '../ui/Bouton';
import { Badge } from '../ui/Carte';
import { Champ } from '../ui/Champ';
import { Icone } from '../ui/Icone';

export function EtapeDimensions() {
  const { ouverture: o, majOuverture } = useProjet();
  const [guide, setGuide] = useState(false);
  if (!o) return null;
  const f = getFamille(o.famille);
  const [lMin, lMax] = f.dimensions.largeur;
  const [hMin, hMax] = f.dimensions.hauteur;
  const horsPlage = (v: number, min: number, max: number) =>
    !o.dimensionsInconnues && (v < min || v > max) ? `Hors des dimensions standard (${min} à ${max} cm) : votre conseiller étudiera une solution sur mesure.` : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-xl bg-bleu-clair p-4 text-marine">
        <Icone nom="info" className="mt-0.5 size-5 shrink-0" />
        <p>
          <strong>Pas d'inquiétude sur la précision.</strong> {catalogue.pose.noteMetrage}
        </p>
      </div>

      <fieldset className="space-y-4">
        <legend className="font-titre text-base font-semibold text-marine">Dimensions de votre {f.libelle.toLowerCase()} (en cm)</legend>
        <div className="grid grid-cols-2 gap-4">
          <Champ
            libelle="Largeur"
            type="number"
            inputMode="numeric"
            min={1}
            value={o.largeurCm || ''}
            disabled={o.dimensionsInconnues}
            onChange={(e) => majOuverture({ largeurCm: Number(e.target.value) })}
            aide={`De ${lMin} à ${lMax} cm en standard`}
            erreur={horsPlage(o.largeurCm, lMin, lMax)}
          />
          <Champ
            libelle="Hauteur"
            type="number"
            inputMode="numeric"
            min={1}
            value={o.hauteurCm || ''}
            disabled={o.dimensionsInconnues}
            onChange={(e) => majOuverture({ hauteurCm: Number(e.target.value) })}
            aide={`De ${hMin} à ${hMax} cm en standard`}
            erreur={horsPlage(o.hauteurCm, hMin, hMax)}
          />
        </div>
        <label className="flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="size-5 accent-bleu" checked={o.dimensionsInconnues} onChange={(e) => majOuverture({ dimensionsInconnues: e.target.checked })} />
          <span>Je ne connais pas encore mes dimensions : le conseiller les relèvera avec moi.</span>
        </label>
      </fieldset>

      <div>
        <p id="libelle-qte" className="mb-2 font-titre font-semibold text-marine">Combien d'ouvertures identiques ?</p>
        <div className="inline-flex items-center gap-1 rounded-full border-2 border-bord bg-white p-1" role="group" aria-labelledby="libelle-qte">
          <button type="button" className="grid size-10 place-items-center rounded-full text-xl font-bold text-bleu hover:bg-bleu-clair disabled:opacity-40" aria-label="Diminuer la quantité" disabled={o.quantite <= 1} onClick={() => majOuverture({ quantite: o.quantite - 1 })}>
            −
          </button>
          <output aria-live="polite" className="w-10 text-center text-lg font-bold text-marine">
            {o.quantite}
          </output>
          <button type="button" className="grid size-10 place-items-center rounded-full text-xl font-bold text-bleu hover:bg-bleu-clair" aria-label="Augmenter la quantité" onClick={() => majOuverture({ quantite: o.quantite + 1 })}>
            +
          </button>
        </div>
        <p className="mt-1 text-sm">Des ouvertures différentes ? Ajoutez-les au projet depuis le récapitulatif.</p>
      </div>

      <div className="rounded-2xl border-2 border-dashed border-bleu/40 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-titre font-semibold text-marine">Comment bien mesurer ?</p>
            <p className="text-sm">Un guide pas à pas avec des schémas, en 4 étapes.</p>
          </div>
          <Bouton variante={guide ? 'secondaire' : 'jaune'} icone="metre" onClick={() => setGuide(!guide)} aria-expanded={guide} aria-controls="guide-mesure">
            {guide ? 'Masquer le guide' : "M'aider à mesurer"}
          </Bouton>
        </div>
        {guide && (
          <div id="guide-mesure" className="mt-4">
            <GuideMesure famille={o.famille} />
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-white p-4 ring-1 ring-bord">
        <Icone nom="telephone" className="mt-0.5 size-5 shrink-0 text-bleu" />
        <div>
          <p className="flex flex-wrap items-center gap-2 font-bold text-marine">
            Mesure assistée par smartphone <Badge ton="gris">Bientôt</Badge>
          </p>
          <p className="text-sm">Emplacement prévu pour une brique de mesure par la caméra du téléphone (solution éditeur).</p>
        </div>
      </div>
    </div>
  );
}
