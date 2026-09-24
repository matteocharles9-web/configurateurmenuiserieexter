import { useEffect } from 'react';
import { catalogue } from '../data/types';
import { alertes } from '../lib/reglementaire';
import { cheminEtape, naviguer } from '../router';
import { useProjet } from '../state/ProjetContext';
import { BoutonAide, BoutonsTransmission } from '../components/contact/BoutonAide';
import { BarreProgression } from '../components/layout/BarreProgression';
import { FilAriane } from '../components/layout/EnTete';
import { LienPartage } from '../components/partage/LienPartage';
import { SauvegardeQr } from '../components/partage/SauvegardeQr';
import { AlertesReglementaires } from '../components/projet/AlerteReglementaire';
import { Echantillons } from '../components/projet/Echantillons';
import { Fourchette, MentionPrixFictifs } from '../components/projet/Estimation';
import { ListeOuvertures } from '../components/projet/ListeOuvertures';
import { RealisationsAvis } from '../components/projet/RealisationsAvis';
import { Carte } from '../components/ui/Carte';
import { Icone } from '../components/ui/Icone';
import { useProjetDeRoute } from './PageConfigurateur';
import { ProjetIntrouvable } from './ProjetIntrouvable';

export function PageRecap({ id }: { id: string }) {
  const { projet, introuvable } = useProjetDeRoute(id);
  const { ouverture } = useProjet();
  useEffect(() => window.scrollTo({ top: 0 }), []);

  if (introuvable) return <ProjetIntrouvable id={id} />;
  if (!projet || !ouverture) return null;

  const liste = alertes(projet.contexte, projet.ouvertures);
  const lignesAChiffrer = [
    { l: 'Délai de fabrication', v: catalogue.aChiffrer.delaiFabrication, i: 'calendrier' },
    { l: 'Délai de pose', v: catalogue.aChiffrer.delaiPose, i: 'calendrier' },
    { l: 'Aides à la rénovation', v: catalogue.aChiffrer.aides, i: 'facture' },
    { l: 'Économies d\'énergie', v: catalogue.aChiffrer.economiesEnergie, i: 'lumiere' },
    { l: 'Solutions de financement', v: catalogue.aChiffrer.financement, i: 'facture' },
  ];
  const familles = [...new Set(projet.ouvertures.map((o) => o.famille))];

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Menuiserie', lien: '#/' }, { libelle: 'Mon projet' }]} />
      <div className="mx-auto max-w-7xl space-y-5 px-4 pt-3">
        <BarreProgression courante="recap" versEtape={(e) => `#${cheminEtape(projet.id, e)}`} />

        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-bold text-bleu">Récapitulatif · {projet.id}</p>
            <h1 className="text-2xl font-semibold sm:text-3xl">{projet.nom}</h1>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="min-w-0 space-y-5">
            <Carte titre={`Vos ouvertures (${projet.ouvertures.length})`} id="t-ouvertures">
              <ListeOuvertures />
            </Carte>

            <Carte titre="Démarches administratives" id="t-regl">
              <AlertesReglementaires alertes={liste} />
              <button type="button" onClick={() => naviguer(cheminEtape(projet.id, 'coloris'))} className="mt-3 text-sm font-bold text-bleu underline">
                Modifier les informations sur mon logement
              </button>
            </Carte>

            <Carte titre="Échantillons de coloris" id="t-ech">
              <Echantillons />
            </Carte>
          </div>

          <div className="min-w-0 space-y-5">
            <Carte titre="Estimation indicative" id="t-estim">
              <MentionPrixFictifs />
              <p className="mt-3 text-sm">Projet complet, fourni et posé :</p>
              <Fourchette ouvertures={projet.ouvertures} className="text-3xl" />
              <ul className="mt-4 divide-y divide-bord text-sm">
                {lignesAChiffrer.map((x) => (
                  <li key={x.l} className="flex items-center justify-between gap-3 py-2">
                    <span className="flex items-center gap-2">
                      <Icone nom={x.i} className="size-4 text-bleu" />
                      {x.l}
                    </span>
                    <span className="rounded-full bg-fond px-2 py-0.5 font-bold text-marine ring-1 ring-bord">{x.v}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs">Estimation hors métrage. Le prix définitif est établi par devis après la visite du poseur.</p>
            </Carte>

            <Carte titre="Et maintenant ?" id="t-transmettre">
              <p className="mb-3 text-sm">Votre conseiller reçoit votre projet complet : dimensions, choix et photo.</p>
              <BoutonsTransmission vertical />
              {projet.demandes.length > 0 && (
                <div className="mt-4 rounded-xl bg-fond p-3">
                  <p className="text-sm font-bold text-marine">Vos demandes (simulées)</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {projet.demandes.map((d) => (
                      <li key={d.date} className="flex gap-2">
                        <Icone nom="ok" className="mt-0.5 size-4 shrink-0 text-ok" />
                        <span>
                          {d.detail} <span className="text-xs">({new Date(d.date).toLocaleDateString('fr-FR')})</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Carte>

            <Carte titre="Sauvegarde sans compte" id="t-sauv">
              <SauvegardeQr />
            </Carte>

            <Carte titre="Décider à deux" id="t-partage">
              <LienPartage />
            </Carte>
          </div>
        </div>

        <section aria-labelledby="t-real" className="pt-4">
          <h2 id="t-real" className="mb-4 text-2xl font-semibold">
            Ils ont réalisé un projet similaire
          </h2>
          <RealisationsAvis familles={familles} />
        </section>
      </div>
      <BoutonAide etape="Récapitulatif" />
    </>
  );
}
