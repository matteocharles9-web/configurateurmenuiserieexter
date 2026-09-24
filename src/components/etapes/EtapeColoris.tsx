import { colorisPour, coloris as getColoris, materiau as getMateriau } from '../../lib/catalogue';
import { LimiteStandard } from './EtapeSolution';
import { useProjet } from '../../state/ProjetContext';
import { ContexteLogement } from '../projet/ContexteLogement';
import { Bouton } from '../ui/Bouton';
import { Badge } from '../ui/Carte';
import { useToast } from '../ui/Toast';

export function Pastille({ id, className = 'size-10' }: { id: string; className?: string }) {
  const c = getColoris(id);
  return (
    <span
      aria-hidden
      className={`inline-block shrink-0 rounded-full ring-1 ring-black/15 ${className}`}
      style={{
        background: c.texture === 'bois' ? `repeating-linear-gradient(170deg, ${c.hex} 0 5px, color-mix(in srgb, ${c.hex}, #000 18%) 5px 7px)` : c.hex,
      }}
    />
  );
}

export function EtapeColoris() {
  const { projet, ouverture: o, majOuverture, basculerEchantillon, appliquerColorisATous } = useProjet();
  const toast = useToast();
  if (!o || !projet) return null;
  const choix = getColoris(o.coloris);
  const demande = projet.echantillons.includes(o.coloris);
  const plusieurs = projet.ouvertures.length > 1;

  return (
    <div className="space-y-8">
      {colorisPour(o).length < getMateriau(o.materiau).coloris.length && <LimiteStandard quoi="coloris" />}
      <fieldset>
        <legend className="font-titre text-base font-semibold text-marine">Coloris disponibles en {getMateriau(o.materiau).libelle}</legend>
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4 xl:grid-cols-6">
          {colorisPour(o).map(getColoris).map((c) => (
            <label
              key={c.id}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-2 text-center text-sm font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bleu ${
                o.coloris === c.id ? 'border-bleu bg-bleu-clair/60 text-marine' : 'border-transparent bg-white hover:border-bord'
              }`}
            >
              <input type="radio" name="coloris" value={c.id} checked={o.coloris === c.id} onChange={() => majOuverture({ coloris: c.id })} className="sr-only" />
              <Pastille id={c.id} className="size-12" />
              {c.libelle}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-bord">
        <Pastille id={choix.id} className="size-14" />
        <div className="min-w-40 flex-1">
          <p className="font-bold text-marine">{choix.libelle}</p>
          <p className="text-sm">Un doute sur la teinte ? Recevez un échantillon avant de valider.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Bouton
            variante={demande ? 'secondaire' : 'jaune'}
            taille="petit"
            icone={demande ? 'ok' : 'echantillon'}
            aria-pressed={demande}
            onClick={() => {
              basculerEchantillon(o.coloris);
              toast(demande ? 'Échantillon retiré de votre liste' : `Échantillon « ${choix.libelle} » ajouté à votre liste`);
            }}
          >
            {demande ? 'Échantillon demandé' : "Commander l'échantillon"}
          </Bouton>
          {plusieurs && (
            <Bouton
              variante="secondaire"
              taille="petit"
              icone="copier"
              onClick={() => {
                const n = appliquerColorisATous(o.coloris);
                toast(n ? `Coloris appliqué à ${n} autre${n > 1 ? 's' : ''} ouverture${n > 1 ? 's' : ''}` : 'Toutes les ouvertures compatibles ont déjà ce coloris');
              }}
            >
              Appliquer à toutes les ouvertures
            </Bouton>
          )}
        </div>
        {projet.echantillons.length > 0 && (
          <p className="w-full text-sm">
            <Badge ton="bleu">{projet.echantillons.length}</Badge> échantillon{projet.echantillons.length > 1 ? 's' : ''} dans votre liste, à valider depuis le récapitulatif.
          </p>
        )}
      </div>

      <section aria-labelledby="titre-regl" className="rounded-2xl bg-white p-4 ring-1 ring-bord sm:p-5">
        <h3 id="titre-regl" className="text-base font-semibold">
          Votre façade change-t-elle d'aspect ?
        </h3>
        <p className="mb-4 text-sm">Quelques questions pour savoir si une autorisation est nécessaire avant les travaux.</p>
        <ContexteLogement />
      </section>
    </div>
  );
}
