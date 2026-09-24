import { useEffect, useRef, useState } from 'react';
import { catalogue } from '../data/types';
import { dernierProjetId, listerProjets } from '../lib/stockage';
import { cheminEtape, naviguer } from '../router';
import { creerProjet, useProjet } from '../state/ProjetContext';
import { MaisonInteractive } from '../components/maison/MaisonInteractive';
import { DetailCategorie, ListeCategories } from '../components/maison/PanneauCategorie';
import { BoutonsTransmission } from '../components/contact/BoutonAide';
import { FilAriane } from '../components/layout/EnTete';
import { RealisationsAvis } from '../components/projet/RealisationsAvis';
import { Bouton } from '../components/ui/Bouton';
import { Icone } from '../components/ui/Icone';

const ETAPES_CLIENT = [
  { t: 'Configurer', d: 'Fenêtre, porte, baie ou volet, aux bonnes dimensions.', i: 'crayon' },
  { t: 'Visualiser', d: 'Le résultat sur une photo de votre maison.', i: 'photo' },
  { t: 'Comparer', d: 'Standard ou sur mesure, pose et accessoires compris.', i: 'copier' },
  { t: 'Estimer', d: 'Un premier budget indicatif.', i: 'facture' },
  { t: 'Transmettre', d: 'Projet sauvegardé et envoyé à un conseiller.', i: 'chat' },
];

export function PageAccueil() {
  const { projet, charger, chargerParId, ajouterOuverture } = useProjet();
  const projets = listerProjets().slice(0, 3);
  const [focus, setFocus] = useState<string | null>(null);
  const [survol, setSurvol] = useState<string | null>(null);
  const [detailPret, setDetailPret] = useState(false);
  const panneau = useRef<HTMLDivElement>(null);

  // La maison reprend les choix du dernier projet (coches, coloris…).
  useEffect(() => {
    const id = dernierProjetId();
    if (!projet && id) chargerParId(id);
  }, [projet, chargerParId]);

  const choisir = (f: string) => {
    setSurvol(null);
    setDetailPret(false);
    setFocus(f);
  };
  const retour = () => {
    setDetailPret(false);
    setFocus(null);
  };
  const zoomTermine = () => {
    setDetailPret(true);
    // Sur mobile, le panneau est sous la maison : on l'amène à l'écran.
    if (window.matchMedia('(max-width: 1023px)').matches) panneau.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const configurer = (famille: string, modele: string, ajouter: boolean) => {
    if (ajouter && projet) {
      ajouterOuverture({ famille, modele });
      naviguer(cheminEtape(projet.id, 'dimensions'));
      return;
    }
    const p = creerProjet({ pointEntree: 'produit' }, { famille, modele });
    charger(p);
    naviguer(cheminEtape(p.id, 'dimensions'));
  };

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Menuiserie' }]} />
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-4">
        <section aria-labelledby="titre-maison">
          <p className="mb-2 inline-block rounded-full bg-jaune px-3 py-1 text-xs font-bold text-marine">Menuiserie extérieure · standard et sur mesure</p>
          <h1 id="titre-maison" className="text-2xl leading-tight font-bold sm:text-4xl">
            Fenêtres, portes, volets, portails : configurez et estimez en ligne
          </h1>
          <p className="mt-2 max-w-3xl sm:text-lg">Choisissez un élément de la maison. Donnez vos dimensions et votre manière de poser : nous vous proposons une solution standard et une solution sur mesure, pose et accessoires compris.</p>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="overflow-hidden rounded-3xl shadow-sm ring-1 ring-bord lg:self-start">
              <MaisonInteractive focus={focus} survol={survol} onSurvol={setSurvol} onChoisir={choisir} onZoomTermine={zoomTermine} ouvertures={projet?.ouvertures ?? []} />
            </div>
            <div ref={panneau} className="scroll-mt-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-bord">
              {focus && detailPret ? (
                <DetailCategorie
                  key={focus}
                  familleId={focus}
                  onRetour={retour}
                  onConfigurer={(modele, ajouter) => configurer(focus, modele, ajouter)}
                  projetEnCours={projet ? { id: projet.id, nb: projet.ouvertures.length } : null}
                />
              ) : focus ? (
                <p className="py-10 text-center font-bold text-marine" role="status">
                  Zoom sur l'élément…
                </p>
              ) : (
                <ListeCategories survol={survol} onSurvol={setSurvol} onChoisir={choisir} dansProjet={new Set(projet?.ouvertures.map((o) => o.famille))} />
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bord sm:flex-row sm:items-center">
          <div>
            <p className="flex items-center gap-2 font-titre text-xl font-semibold text-marine">
              <Icone nom="aide" className="size-6 text-bleu" /> Vous ne savez pas quoi choisir ?
            </p>
            <p className="mt-1">Froid, bruit, sécurité, facture d'énergie : répondez à 4 questions, nous vous recommandons un produit et une gamme.</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-sm">
              {catalogue.besoins.slice(0, 4).map((b) => (
                <li key={b.id} className="flex items-center gap-1.5 rounded-full bg-fond px-3 py-1">
                  <Icone nom={b.icone} className="size-4 shrink-0 text-bleu" />
                  {b.libelle}
                </li>
              ))}
            </ul>
          </div>
          <Bouton variante="jaune" className="shrink-0" iconeDroite="droite" onClick={() => naviguer('/besoin')}>
            Je pars de mon besoin
          </Bouton>
        </section>

        {projets.length > 0 && (
          <section aria-labelledby="titre-reprendre" className="rounded-2xl bg-jaune-clair p-4 ring-1 ring-jaune sm:p-5">
            <h2 id="titre-reprendre" className="text-lg font-semibold">
              Reprendre mon projet
            </h2>
            <ul className="mt-2 divide-y divide-jaune/60">
              {projets.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>
                    <strong className="text-marine">{p.nom}</strong> · {p.id} · {p.ouvertures.length} ouverture{p.ouvertures.length > 1 ? 's' : ''}
                  </span>
                  <Bouton taille="petit" iconeDroite="droite" onClick={() => naviguer(`/projet/${p.id}/recap`)}>
                    Reprendre
                  </Bouton>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="titre-comment">
          <h2 id="titre-comment" className="text-2xl font-semibold">
            Comment ça marche ?
          </h2>
          <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {ETAPES_CLIENT.map((e, i) => (
              <li key={e.t} className="rounded-2xl bg-white p-4 ring-1 ring-bord">
                <span className="grid size-9 place-items-center rounded-full bg-bleu font-titre font-bold text-white">{i + 1}</span>
                <p className="mt-2 font-bold text-marine">{e.t}</p>
                <p className="text-sm">{e.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titre-real">
          <h2 id="titre-real" className="mb-4 text-2xl font-semibold">
            Réalisations et avis clients
          </h2>
          <RealisationsAvis />
        </section>

        <section aria-labelledby="titre-minutepass" className="rounded-2xl bg-white p-5 ring-1 ring-bord">
          <h2 id="titre-minutepass" className="text-xl font-semibold">
            Vous préférez en parler à un conseiller ?
          </h2>
          <p className="mt-1 mb-4">Minute'pass menuiserie : rendez-vous en magasin, par téléphone ou en visio. Ou laissez-vous rappeler.</p>
          <BoutonsTransmission />
        </section>
      </div>
    </>
  );
}
