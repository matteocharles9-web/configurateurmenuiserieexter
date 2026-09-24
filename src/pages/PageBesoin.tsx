import { useEffect, useRef, useState } from 'react';
import { catalogue } from '../data/types';
import { enMinuscules, gamme, materiau, modele } from '../lib/catalogue';
import { recommander, type Budget, type ReponsesBesoin } from '../lib/recommandation';
import { cheminEtape, naviguer } from '../router';
import { creerProjet, useProjet } from '../state/ProjetContext';
import { RenduMenuiserie } from '../components/apercu/RenduMenuiserie';
import { BoutonAide } from '../components/contact/BoutonAide';
import { FilAriane } from '../components/layout/EnTete';
import { Performances } from '../components/projet/Performances';
import { Fourchette, MentionPrixFictifs } from '../components/projet/Estimation';
import { Bouton } from '../components/ui/Bouton';
import { CarteChoix, ChoixSegmente, GroupeChoix } from '../components/ui/Choix';
import { Icone } from '../components/ui/Icone';
import { nouvelleOuverture } from '../state/ouverture';

type Logement = { type?: 'maison' | 'appartement'; secteur?: 'oui' | 'non' | 'inconnu' };

export function PageBesoin() {
  const { charger } = useProjet();
  const [q, setQ] = useState(0);
  const [rep, setRep] = useState<ReponsesBesoin>({ famille: '', besoins: [], budget: 'equilibre' });
  const [logement, setLogement] = useState<Logement>({});
  const titre = useRef<HTMLHeadingElement>(null);
  useEffect(() => titre.current?.focus(), [q]);

  const QUESTIONS = ['Votre projet', 'Ce qui vous gêne', 'Votre logement', 'Votre budget'];
  const fini = q >= QUESTIONS.length;
  const peutContinuer = [Boolean(rep.famille), true, Boolean(logement.type && logement.secteur), true][q] ?? true;

  const reco = fini ? recommander(rep) : null;
  const apercuReco = reco ? nouvelleOuverture(reco.ouverture) : null;

  const configurer = () => {
    if (!reco) return;
    const p = creerProjet(
      {
        pointEntree: 'besoin',
        besoins: rep.besoins,
        contexte: { typeLogement: logement.type, copropriete: logement.type === 'appartement' ? true : undefined, secteurProtege: logement.secteur },
      },
      reco.ouverture,
    );
    charger(p);
    naviguer(cheminEtape(p.id, 'dimensions'));
  };

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Menuiserie', lien: '#/' }, { libelle: 'Je pars de mon besoin' }]} />
      <div className="mx-auto max-w-3xl px-4 pt-4">
        {!fini ? (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bord sm:p-7">
            <p className="text-sm font-bold text-bleu">
              Question {q + 1} sur {QUESTIONS.length}
            </p>
            <div className="mt-2 mb-5 flex gap-1.5" aria-hidden>
              {QUESTIONS.map((x, i) => (
                <span key={x} className={`h-1.5 flex-1 rounded-full ${i <= q ? 'bg-bleu' : 'bg-bord'}`} />
              ))}
            </div>
            <h1 ref={titre} tabIndex={-1} className="mb-5 text-2xl font-semibold outline-none">
              {['Quel est votre projet ?', "Qu'est-ce qui vous gêne aujourd'hui ?", 'Parlez-nous de votre logement', 'Quel budget envisagez-vous ?'][q]}
            </h1>

            {q === 0 && (
              <GroupeChoix legende={<span className="sr-only">Produit</span>} colonnes="grid-cols-2 sm:grid-cols-3">
                {[...catalogue.familles.map((f) => ({ id: f.id, l: f.libelle, f })), { id: 'inconnu', l: 'Je ne sais pas encore', f: null }].map((x) => (
                  <CarteChoix
                    key={x.id}
                    nom="q-famille"
                    valeur={x.id}
                    coche={rep.famille === x.id}
                    onChange={() => setRep({ ...rep, famille: x.id })}
                    titre={x.l}
                    visuel={
                      x.f ? (
                        <RenduMenuiserie decoratif famille={x.f.id} modele={x.f.modeles[0].id} materiau={x.f.modeles[0].materiaux?.[0] ?? x.f.materiaux[0]} coloris="blanc" className="h-16 w-full" />
                      ) : (
                        <span className="grid h-16 place-items-center text-bleu">
                          <Icone nom="aide" className="size-10" />
                        </span>
                      )
                    }
                  />
                ))}
              </GroupeChoix>
            )}

            {q === 1 && (
              <GroupeChoix legende={<span className="sr-only">Besoins</span>} aide="Plusieurs réponses possibles.">
                {catalogue.besoins.map((b) => (
                  <CarteChoix
                    key={b.id}
                    compact
                    multiple
                    nom="q-besoins"
                    valeur={b.id}
                    coche={rep.besoins.includes(b.id)}
                    onChange={() => setRep({ ...rep, besoins: rep.besoins.includes(b.id) ? rep.besoins.filter((x) => x !== b.id) : [...rep.besoins, b.id] })}
                    titre={b.libelle}
                    visuel={
                      <span className="grid size-10 place-items-center rounded-full bg-bleu-clair text-bleu">
                        <Icone nom={b.icone} />
                      </span>
                    }
                  />
                ))}
              </GroupeChoix>
            )}

            {q === 2 && (
              <div className="space-y-6">
                <ChoixSegmente
                  legende="Vous habitez"
                  nom="q-logement"
                  valeur={logement.type}
                  options={[
                    { v: 'maison', l: 'Une maison' },
                    { v: 'appartement', l: 'Un appartement (copropriété)' },
                  ]}
                  onChange={(v) => setLogement({ ...logement, type: v })}
                />
                <ChoixSegmente
                  legende="Votre logement est-il en secteur protégé (près d'un monument historique, centre ancien) ?"
                  nom="q-secteur"
                  valeur={logement.secteur}
                  options={[
                    { v: 'oui', l: 'Oui' },
                    { v: 'non', l: 'Non' },
                    { v: 'inconnu', l: 'Je ne sais pas' },
                  ]}
                  onChange={(v) => setLogement({ ...logement, secteur: v })}
                />
              </div>
            )}

            {q === 3 && (
              <GroupeChoix legende={<span className="sr-only">Budget</span>} colonnes="sm:grid-cols-3">
                {(
                  [
                    { v: 'maitrise', l: 'Maîtrisé', d: "L'essentiel, bien posé." },
                    { v: 'equilibre', l: 'Équilibré', d: 'Le bon compromis confort / prix.' },
                    { v: 'haut', l: 'Haut de gamme', d: 'Le meilleur confort et les plus belles finitions.' },
                  ] as { v: Budget; l: string; d: string }[]
                ).map((b) => (
                  <CarteChoix key={b.v} nom="q-budget" valeur={b.v} coche={rep.budget === b.v} onChange={() => setRep({ ...rep, budget: b.v })} titre={b.l} description={b.d} />
                ))}
              </GroupeChoix>
            )}

            <div className="mt-7 flex justify-between gap-3">
              <Bouton variante="secondaire" icone="gauche" onClick={() => (q === 0 ? naviguer('/') : setQ(q - 1))}>
                {q === 0 ? 'Accueil' : 'Précédent'}
              </Bouton>
              <Bouton iconeDroite="droite" disabled={!peutContinuer} onClick={() => setQ(q + 1)}>
                {q === QUESTIONS.length - 1 ? 'Voir ma recommandation' : 'Continuer'}
              </Bouton>
            </div>
          </div>
        ) : (
          reco && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bord sm:p-7">
              <p className="text-sm font-bold text-bleu">Notre recommandation</p>
              <h1 ref={titre} tabIndex={-1} className="mt-1 text-2xl font-semibold outline-none">
                {modele(reco.ouverture.famille, reco.ouverture.modele).libelle} en {enMinuscules(materiau(reco.ouverture.materiau).libelle)}, gamme {gamme(reco.ouverture.gamme).libelle}
              </h1>
              <div className="mt-5 grid gap-6 sm:grid-cols-[14rem_1fr]">
                <div>
                  <RenduMenuiserie {...apercuReco!} avecMur className="h-56 w-full rounded-xl" />
                  <div className="mt-3 text-center">
                    <MentionPrixFictifs />
                    <p className="mt-1 text-sm">Estimation indicative (dimensions standard)</p>
                    <Fourchette ouvertures={[apercuReco!]} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="font-titre font-semibold text-marine">Pourquoi ce choix ?</p>
                    <ul className="mt-2 space-y-2">
                      {reco.raisons.map((r) => (
                        <li key={r} className="flex gap-2">
                          <Icone nom="ok" className="mt-0.5 size-5 shrink-0 text-ok" />
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Performances ouverture={apercuReco!} compact />
                </div>
              </div>
              <div className="mt-7 flex flex-col-reverse justify-between gap-3 sm:flex-row">
                <Bouton variante="secondaire" icone="gauche" onClick={() => setQ(0)}>
                  Modifier mes réponses
                </Bouton>
                <Bouton variante="jaune" iconeDroite="droite" onClick={configurer}>
                  Personnaliser ce produit
                </Bouton>
              </div>
              <p className="mt-3 text-sm">Vous pourrez tout modifier ensuite : produit, matériau, coloris, options.</p>
            </div>
          )
        )}
      </div>
      <BoutonAide etape="Je pars de mon besoin" />
    </>
  );
}
