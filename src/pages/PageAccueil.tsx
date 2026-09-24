import { catalogue } from '../data/types';
import { listerProjets } from '../lib/stockage';
import { cheminEtape, naviguer } from '../router';
import { creerProjet, useProjet } from '../state/ProjetContext';
import { RenduMenuiserie } from '../components/apercu/RenduMenuiserie';
import { BoutonsTransmission } from '../components/contact/BoutonAide';
import { FilAriane } from '../components/layout/EnTete';
import { RealisationsAvis } from '../components/projet/RealisationsAvis';
import { Bouton } from '../components/ui/Bouton';
import { Icone } from '../components/ui/Icone';

const ETAPES_CLIENT = [
  { t: 'Configurer', d: 'Fenêtre, porte, baie ou volet, aux bonnes dimensions.', i: 'crayon' },
  { t: 'Visualiser', d: 'Le résultat sur une photo de votre maison.', i: 'photo' },
  { t: 'Comparer', d: 'Matériaux, coloris, confort et options.', i: 'copier' },
  { t: 'Estimer', d: 'Un premier budget indicatif.', i: 'facture' },
  { t: 'Transmettre', d: 'Projet sauvegardé et envoyé à un conseiller.', i: 'chat' },
];

export function PageAccueil() {
  const { charger } = useProjet();
  const projets = listerProjets().slice(0, 3);

  const demarrer = (famille: string) => {
    const p = creerProjet({ pointEntree: 'produit' }, { famille });
    charger(p);
    naviguer(cheminEtape(p.id, 'produit'));
  };

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Menuiserie' }]} />
      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-4">
        <section className="grid items-center gap-6 overflow-hidden rounded-3xl bg-marine p-6 text-white sm:p-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="mb-2 inline-block rounded-full bg-jaune px-3 py-1 text-xs font-bold text-marine">Configurateur menuiserie extérieure</p>
            <h1 className="text-3xl leading-tight font-bold text-white sm:text-4xl">Fenêtres, portes et volets sur mesure : configurez et estimez en ligne</h1>
            <p className="mt-3 text-white/85 sm:text-lg">Matériau, coloris, options, aperçu sur votre maison, puis rendez-vous avec un conseiller qui a déjà votre projet en main.</p>
          </div>
          <RenduMenuiserie decoratif famille="baie" modele="coulissant-2" materiau="alu" coloris="anthracite" avecMur options={{ 'volet-integre': 'motorise-radio' }} className="mx-auto h-48 w-full max-w-sm rounded-2xl sm:h-56" />
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

        <section aria-labelledby="titre-entree">
          <h2 id="titre-entree" className="text-2xl font-semibold">
            Par où voulez-vous commencer ?
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bord">
              <p className="flex items-center gap-2 font-titre text-xl font-semibold text-marine">
                <Icone nom="ok" className="size-6 text-bleu" /> Je sais ce que je veux
              </p>
              <p className="mt-1">Choisissez directement votre produit.</p>
              <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {catalogue.familles.map((f) => (
                  <li key={f.id}>
                    <button type="button" onClick={() => demarrer(f.id)} className="flex h-full w-full flex-col items-center gap-1 rounded-xl border-2 border-bord p-2 text-center text-sm font-bold text-marine hover:border-bleu hover:bg-bleu-clair/50">
                      <RenduMenuiserie decoratif famille={f.id} modele={f.modeles[0].id} materiau={f.modeles[0].materiaux?.[0] ?? f.materiaux[0]} coloris="blanc" className="h-14 w-full" />
                      {f.libelle}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bord">
              <p className="flex items-center gap-2 font-titre text-xl font-semibold text-marine">
                <Icone nom="aide" className="size-6 text-bleu" /> Je pars de mon besoin
              </p>
              <p className="mt-1">Froid, bruit, sécurité, facture d'énergie : répondez à 4 questions, nous vous recommandons un produit et une gamme.</p>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                {catalogue.besoins.slice(0, 4).map((b) => (
                  <li key={b.id} className="flex items-center gap-2 rounded-lg bg-fond p-2">
                    <Icone nom={b.icone} className="size-5 shrink-0 text-bleu" />
                    {b.libelle}
                  </li>
                ))}
              </ul>
              <Bouton variante="jaune" className="mt-auto self-start" iconeDroite="droite" onClick={() => naviguer('/besoin')}>
                Trouver ce qu'il me faut
              </Bouton>
            </div>
          </div>
        </section>

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
