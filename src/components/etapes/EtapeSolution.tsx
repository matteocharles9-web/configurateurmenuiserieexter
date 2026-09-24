import { catalogue, type Ouverture, type Solution } from '../../data/types';
import { coloris, famille, materiau, typePose } from '../../lib/catalogue';
import { devis, formatEuros, formatFourchette, fourchetteDe, suffixePrix, type Devis } from '../../lib/prix';
import { solutionStandard, type ResultatStandard } from '../../lib/solutions';
import { useProjet } from '../../state/ProjetContext';
import { normaliser } from '../../state/ouverture';
import { MentionPrixFictifs } from '../projet/Estimation';
import { Bouton } from '../ui/Bouton';
import { Badge } from '../ui/Carte';
import { Icone } from '../ui/Icone';

/* Étape « Standard ou sur mesure » : deux solutions chiffrées côte à côte (produit, pose, accessoires). */

/** Schéma : l'ouverture du client (pointillés) et le produit standard, avec l'écart à combler. */
function SchemaEcart({ L: Lr, H: Hr, w: wr, h: hr, sens }: { L: number; H: number; w: number; h: number; sens: 'inferieur' | 'superieur' }) {
  // Schéma non à l'échelle : un petit écart est agrandi pour rester visible.
  const grossir = (a: number, b: number) => (a === b ? b : a + Math.sign(b - a) * Math.max(Math.abs(b - a), Math.max(a, b) * 0.12));
  const [L, H] = [Lr, Hr];
  const w = grossir(Lr, wr);
  const h = grossir(Hr, hr);
  const ext = { w: Math.max(L, w), h: Math.max(H, h) };
  const m = Math.max(ext.w, ext.h) * 0.08;
  const centre = (a: number, b: number) => (Math.max(a, b) - a) / 2;
  const produit = { x: centre(w, L), y: centre(h, H), w, h };
  const ouverture = { x: centre(L, w), y: centre(H, h), w: L, h: H };
  const trait = Math.max(ext.w, ext.h) / 120;
  return (
    <svg viewBox={`${-m} ${-m} ${ext.w + 2 * m} ${ext.h + 2 * m}`} className="h-28 w-full" aria-hidden>
      <defs>
        <pattern id="hachures" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="8" height="8" fill="#FEF6D3" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#F7CE1A" strokeWidth="4" />
        </pattern>
      </defs>
      {sens === 'inferieur' ? (
        <>
          <rect {...ouverture} width={ouverture.w} height={ouverture.h} fill="url(#hachures)" />
          <rect {...produit} width={produit.w} height={produit.h} fill="#E3ECFA" stroke="#1557C0" strokeWidth={trait} />
          <rect {...ouverture} width={ouverture.w} height={ouverture.h} fill="none" stroke="#3D475C" strokeWidth={trait} strokeDasharray={`${trait * 4} ${trait * 3}`} />
        </>
      ) : (
        <>
          <rect {...produit} width={produit.w} height={produit.h} fill="url(#hachures)" stroke="#1557C0" strokeWidth={trait} />
          <rect {...ouverture} width={ouverture.w} height={ouverture.h} fill="#E3ECFA" stroke="#3D475C" strokeWidth={trait} strokeDasharray={`${trait * 4} ${trait * 3}`} />
        </>
      )}
    </svg>
  );
}

function Ligne({ libelle, montant, detail }: { libelle: string; montant: string; detail?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-1.5">
      <dt>
        {libelle}
        {detail && <span className="block text-xs">{detail}</span>}
      </dt>
      <dd className="shrink-0 font-bold text-marine">{montant}</dd>
    </div>
  );
}

function DetailDevis({ d, o }: { d: Devis; o: Ouverture }) {
  const q = Math.max(1, o.quantite);
  return (
    <div>
      <dl className="divide-y divide-bord text-sm">
        <Ligne libelle="Produit" montant={formatEuros(d.produit * q)} />
        {d.options > 0 && <Ligne libelle="Options" montant={formatEuros(d.options * q)} />}
        <Ligne
          libelle="Pose"
          detail={o.posePar === 'pro' ? typePose(o.pose).libelle : 'Par vos soins'}
          montant={o.posePar === 'pro' ? formatEuros(d.pose * q) : '0 €'}
        />
        {d.reprise > 0 && <Ligne libelle="Reprise des anciennes" montant={formatEuros(d.reprise * q)} />}
        <Ligne libelle={`Accessoires de pose (${d.accessoires.length})`} montant={formatEuros(d.totalAccessoires * q)} />
      </dl>
      {d.accessoires.length > 0 && (
        <details className="mt-1 rounded-lg bg-fond p-2 text-sm">
          <summary className="cursor-pointer font-bold text-bleu">Voir les accessoires nécessaires</summary>
          <ul className="mt-2 space-y-1">
            {d.accessoires.map((a) => (
              <li key={a.accessoire.id} className="flex justify-between gap-3">
                <span>
                  {a.accessoire.libelle}
                  <span className="text-xs"> · {a.quantite} {a.unite}</span>
                </span>
                <span className="shrink-0 font-bold">{formatEuros(a.prix * q)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function descriptionTaille(o: Ouverture, r: ResultatStandard) {
  if (!r.taille) return null;
  const [w, h] = r.taille;
  if (r.ouvertureAdaptee) return `Taille catalogue ${w} × ${h} cm : l'ouverture sera réalisée à cette dimension.`;
  const pose = typePose(o.pose);
  if (!r.ecart.l && !r.ecart.h) return `Taille catalogue ${w} × ${h} cm : elle correspond exactement à votre ouverture.`;
  const verbe = pose.sens === 'inferieur' ? 'comblé par des profils de compensation' : 'recouvrement de votre ouverture';
  return `Taille catalogue ${w} × ${h} cm : écart de ${r.ecart.l} cm en largeur et ${r.ecart.h} cm en hauteur (${verbe}).`;
}

function CarteSolution({ o, solution, d, std, recommandee, onChoisir }: { o: Ouverture; solution: Solution; d: Devis; std: ResultatStandard; recommandee: boolean; onChoisir: () => void }) {
  const info = catalogue.solutions[solution];
  const coche = o.solution === solution;
  const indisponible = solution === 'standard' && !std.disponible;
  const [L, H] = o.dimensionsInconnues ? famille(o.famille).dimensions.defaut : [o.largeurCm, o.hauteurCm];
  const offre = famille(o.famille).standard;

  return (
    <label
      className={`relative flex flex-col gap-3 rounded-2xl border-2 bg-white p-4 has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bleu ${
        indisponible ? 'cursor-not-allowed border-bord opacity-70' : coche ? 'cursor-pointer border-bleu bg-bleu-clair/40' : 'cursor-pointer border-bord hover:border-bleu/60'
      }`}
    >
      <input type="radio" name="solution" value={solution} checked={coche} disabled={indisponible} onChange={onChoisir} className="sr-only" />
      <span aria-hidden className={`absolute top-3 right-3 grid size-6 place-items-center rounded-full border-2 ${coche ? 'border-bleu bg-bleu text-white' : 'border-bord bg-white'}`}>
        {coche && <Icone nom="ok" className="size-4" />}
      </span>
      <span className="pr-8">
        <span className="flex flex-wrap items-center gap-2 font-titre text-lg font-semibold text-marine">
          {info.libelle}
          {recommandee && !indisponible && <Badge>Recommandée</Badge>}
        </span>
        <span className="text-sm">{info.accroche}</span>
      </span>

      {indisponible ? (
        <p className="flex gap-2 rounded-lg bg-alerte-fond p-3 text-sm text-alerte">
          <Icone nom="info" className="size-5 shrink-0" />
          <span>
            <strong>Pas de taille standard adaptée.</strong> {std.raison} Le sur mesure est la bonne solution pour votre ouverture.
          </span>
        </p>
      ) : (
        <>
          <p className="text-sm">
            {solution === 'standard' ? descriptionTaille(o, std) : `Fabriquée à ${L} × ${H} cm${o.dimensionsInconnues ? ' (à confirmer au métrage)' : ''}.`}
          </p>
          {solution === 'standard' && std.taille && !std.ouvertureAdaptee && (std.ecart.l > 0 || std.ecart.h > 0) && (
            <div>
              <SchemaEcart L={L} H={H} w={std.taille[0]} h={std.taille[1]} sens={typePose(o.pose).sens} />
              <p className="flex flex-wrap items-center justify-center gap-x-4 text-xs">
                <span><span className="inline-block h-0.5 w-4 border-t-2 border-dashed border-texte align-middle" /> votre ouverture</span>
                <span><span className="inline-block size-3 bg-bleu-clair ring-1 ring-bleu align-middle" /> produit standard</span>
                <span><span className="inline-block size-3 bg-jaune align-middle" /> écart à habiller</span>
                <span className="italic">(schéma non à l'échelle)</span>
              </p>
            </div>
          )}
          <DetailDevis d={d} o={o} />
          <div className="rounded-xl bg-fond p-3">
            <p className="text-sm">Total estimé{o.quantite > 1 ? ` pour ${o.quantite} ouvertures` : ''}</p>
            <p className="font-titre text-xl font-bold text-marine">{formatFourchette(fourchetteDe(d.total), suffixePrix([o]))}</p>
            <p className="text-xs">Délai : {info.delai}</p>
          </div>
          <ul className="space-y-1 text-sm">
            {info.avantages.map((a) => (
              <li key={a} className="flex gap-2">
                <Icone nom="ok" className="mt-0.5 size-4 shrink-0 text-ok" />
                {a}
              </li>
            ))}
          </ul>
          {solution === 'standard' && offre && (
            <p className="text-xs">
              En standard : {offre.materiaux.map((m) => materiau(m).libelle).join(', ')} · {offre.coloris.map((c) => coloris(c).libelle.toLowerCase()).join(', ')}.
            </p>
          )}
        </>
      )}
    </label>
  );
}

export function EtapeSolution() {
  const { ouverture: o, majOuverture } = useProjet();
  if (!o) return null;
  const std = solutionStandard(o);
  const dStd = devis(normaliser({ ...o, solution: 'standard' }), 'standard');
  const dSm = devis(normaliser({ ...o, solution: 'surmesure' }), 'surmesure');
  // Recommandation : le standard dès qu'il s'ajuste dans la tolérance de la pose (moins cher), sinon le sur mesure.
  const max = typePose(o.pose).ecartMaxStandard ?? 0;
  const standardConseille = std.disponible && (std.ouvertureAdaptee || std.ecart.l + std.ecart.h <= max);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p>
          À partir de vos dimensions et de la pose choisie, voici les deux solutions possibles, <strong>pose et accessoires compris</strong>.
        </p>
        <MentionPrixFictifs />
      </div>
      <fieldset>
        <legend className="sr-only">Choisissez une solution</legend>
        <div className="grid gap-4 xl:grid-cols-2">
          <CarteSolution o={o} solution="standard" d={dStd} std={std} recommandee={standardConseille} onChoisir={() => majOuverture({ solution: 'standard' })} />
          <CarteSolution o={o} solution="surmesure" d={dSm} std={std} recommandee={!standardConseille} onChoisir={() => majOuverture({ solution: 'surmesure' })} />
        </div>
      </fieldset>
      <p className="flex gap-2 text-sm">
        <Icone nom="info" className="mt-0.5 size-4 shrink-0 text-bleu" />
        {catalogue.pose.noteMetrage} Les prix suivent vos choix de matériau, de coloris et d'options aux étapes suivantes.
      </p>
    </div>
  );
}

/** Message affiché aux étapes Matériau et Coloris quand l'offre standard limite le choix. */
export function LimiteStandard({ quoi }: { quoi: string }) {
  const { majOuverture } = useProjet();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-jaune-clair p-3 text-sm text-marine ring-1 ring-jaune">
      <span className="flex gap-2">
        <Icone nom="info" className="mt-0.5 size-4 shrink-0" />
        Solution standard : seuls les {quoi} de l'offre standard sont proposés.
      </span>
      <Bouton taille="petit" variante="secondaire" onClick={() => majOuverture({ solution: 'surmesure' })}>
        Voir tout en sur mesure
      </Bouton>
    </div>
  );
}
