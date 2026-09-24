import { useEffect, useRef, useState, type ComponentType } from 'react';
import { ETAPES, type EtapeId } from '../data/types';
import { cheminEtape, naviguer } from '../router';
import { useProjet } from '../state/ProjetContext';
import { PanneauApercu } from '../components/apercu/PanneauApercu';
import { BoutonAide } from '../components/contact/BoutonAide';
import { useContact } from '../components/contact/ContactProvider';
import { EtapeColoris } from '../components/etapes/EtapeColoris';
import { EtapeDimensions } from '../components/etapes/EtapeDimensions';
import { EtapeMateriau } from '../components/etapes/EtapeMateriau';
import { EtapeOptions } from '../components/etapes/EtapeOptions';
import { EtapeProduit } from '../components/etapes/EtapeProduit';
import { NavigationEtapes, suivante } from '../components/etapes/NavigationEtapes';
import { BarreProgression } from '../components/layout/BarreProgression';
import { FilAriane } from '../components/layout/EnTete';
import { CarteEstimation, Fourchette } from '../components/projet/Estimation';
import { Bouton } from '../components/ui/Bouton';
import { Icone } from '../components/ui/Icone';
import { ProjetIntrouvable } from './ProjetIntrouvable';

const COMPOSANTS: Record<EtapeId, ComponentType> = {
  produit: EtapeProduit,
  dimensions: EtapeDimensions,
  materiau: EtapeMateriau,
  coloris: EtapeColoris,
  options: EtapeOptions,
};

const TITRES: Record<EtapeId, string> = {
  produit: 'Choisissez votre produit',
  dimensions: 'Indiquez les dimensions',
  materiau: 'Choisissez le matériau',
  coloris: 'Choisissez le coloris',
  options: 'Options et pose',
};

/** Charge le projet de l'URL s'il n'est pas déjà en mémoire. */
export function useProjetDeRoute(id: string) {
  const { projet, chargerParId } = useProjet();
  const [introuvable, setIntrouvable] = useState(false);
  useEffect(() => {
    if (projet?.id !== id) setIntrouvable(!chargerParId(id));
  }, [id, projet?.id, chargerParId]);
  return { projet: projet?.id === id ? projet : null, introuvable };
}

export function PageConfigurateur({ id, etape }: { id: string; etape: EtapeId }) {
  const { projet, introuvable } = useProjetDeRoute(id);
  const { ouverture, activer } = useProjet();
  const { ouvrir } = useContact();
  const titre = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
    titre.current?.focus({ preventScroll: true });
  }, [etape, ouverture?.id]);

  if (introuvable) return <ProjetIntrouvable id={id} />;
  if (!projet || !ouverture) return null;

  const Etape = COMPOSANTS[etape];
  const i = ETAPES.findIndex((e) => e.id === etape);
  const libelleEtape = ETAPES[i].libelle;

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Menuiserie', lien: '#/' }, { libelle: 'Configurateur' }]} />
      <div className="mx-auto max-w-7xl space-y-4 px-4 pt-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm">
              Projet <strong className="text-marine">{projet.id}</strong> · enregistré automatiquement
            </p>
            {projet.ouvertures.length > 1 ? (
              <label className="mt-1 flex items-center gap-2 text-sm font-bold text-marine">
                Ouverture en cours :
                <select value={ouverture.id} onChange={(e) => activer(e.target.value)} className="rounded-lg border-2 border-bord bg-white px-2 py-1.5 font-bold text-marine">
                  {projet.ouvertures.map((o, k) => (
                    <option key={o.id} value={o.id}>
                      {k + 1}. {o.libelle}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="mt-1 text-sm font-bold text-marine">{ouverture.libelle}</p>
            )}
          </div>
          <Bouton variante="discret" taille="petit" icone="sauver" onClick={() => naviguer(cheminEtape(projet.id, 'recap'))}>
            Mon projet ({projet.ouvertures.length})
          </Bouton>
        </div>

        <BarreProgression courante={etape} versEtape={(e) => `#${cheminEtape(projet.id, e)}`} />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start" aria-label="Aperçu et estimation">
            <PanneauApercu projetId={projet.id} ouverture={ouverture} />
            <div className="hidden space-y-3 lg:block">
              <CarteEstimation ouverture={ouverture} toutes={projet.ouvertures} />
              <Bouton pleineLargeur icone="chat" onClick={() => ouvrir('conseiller')}>
                Envoyer à un conseiller
              </Bouton>
            </div>
          </aside>

          <section aria-label="Étape en cours" className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-bord sm:p-6">
            <p className="text-sm font-bold text-bleu">
              Étape {i + 1} · {libelleEtape}
            </p>
            <h1 ref={titre} tabIndex={-1} className="mb-5 text-2xl font-semibold outline-none">
              {TITRES[etape]}
            </h1>
            <Etape />
            <NavigationEtapes etape={etape} />
          </section>
        </div>
      </div>

      {/* Barre d'action mobile : estimation + navigation, toujours à portée de pouce. */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-bord bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <button type="button" aria-label="Étape précédente" disabled={i === 0} onClick={() => naviguer(cheminEtape(projet.id, ETAPES[i - 1].id))} className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-bleu text-bleu disabled:opacity-30">
            <Icone nom="gauche" />
          </button>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="text-xs">Estimation · prix fictifs</p>
            <Fourchette ouvertures={[ouverture]} className="text-sm" />
          </div>
          <Bouton iconeDroite="droite" onClick={() => naviguer(cheminEtape(projet.id, suivante(etape)))}>
            {suivante(etape) === 'recap' ? 'Récap' : 'Suivant'}
          </Bouton>
        </div>
      </div>

      <BoutonAide etape={libelleEtape} />
    </>
  );
}
