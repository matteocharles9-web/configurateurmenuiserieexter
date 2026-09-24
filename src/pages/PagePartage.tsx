import { useEffect, useState } from 'react';
import type { Projet } from '../data/types';
import { decoderProjet } from '../lib/partage';
import { alertes } from '../lib/reglementaire';
import { sauverProjet } from '../lib/stockage';
import { naviguer } from '../router';
import { useProjet } from '../state/ProjetContext';
import { FilAriane } from '../components/layout/EnTete';
import { AlertesReglementaires } from '../components/projet/AlerteReglementaire';
import { Fourchette, MentionPrixFictifs } from '../components/projet/Estimation';
import { CarteOuvertureLecture } from '../components/projet/ListeOuvertures';
import { Bouton } from '../components/ui/Bouton';
import { Carte } from '../components/ui/Carte';
import { Zone } from '../components/ui/Champ';
import { useToast } from '../components/ui/Toast';
import { ProjetIntrouvable } from './ProjetIntrouvable';

type Avis = 'jaime' | 'arevoir';

/* Vue partagée « décider à deux » : lecture seule, avis par ouverture, copie modifiable. */
export function PagePartage({ donnees }: { donnees: string }) {
  const { charger } = useProjet();
  const toast = useToast();
  const [projet, setProjet] = useState<Projet | null | undefined>(undefined);
  const [avis, setAvis] = useState<Record<string, Avis>>({});
  const [commentaire, setCommentaire] = useState('');

  useEffect(() => {
    decoderProjet(donnees).then(setProjet);
  }, [donnees]);

  if (projet === undefined) return <p className="p-8 text-center" role="status">Ouverture du projet partagé…</p>;
  if (projet === null) return <ProjetIntrouvable />;

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Projet partagé' }]} />
      <div className="mx-auto max-w-4xl space-y-5 px-4 pt-4">
        <div className="rounded-2xl bg-bleu-clair p-4 text-marine">
          <p className="text-sm font-bold">On vous a partagé un projet menuiserie</p>
          <h1 className="text-2xl font-semibold">{projet.nom}</h1>
          <p className="text-sm">Donnez votre avis sur chaque ouverture : il sera transmis à la personne qui vous a envoyé ce lien.</p>
        </div>

        <Carte titre={`Les ouvertures (${projet.ouvertures.length})`} id="t-p-ouv">
          <ul className="space-y-3">
            {projet.ouvertures.map((o) => (
              <CarteOuvertureLecture key={o.id} o={o}>
                <div className="mt-2 flex gap-2" role="group" aria-label={`Votre avis sur ${o.libelle}`}>
                  {(
                    [
                      ['jaime', "👍 J'aime"],
                      ['arevoir', '🤔 À revoir'],
                    ] as [Avis, string][]
                  ).map(([v, l]) => (
                    <Bouton key={v} taille="petit" variante={avis[o.id] === v ? 'primaire' : 'secondaire'} aria-pressed={avis[o.id] === v} onClick={() => setAvis({ ...avis, [o.id]: v })}>
                      {l}
                    </Bouton>
                  ))}
                </div>
              </CarteOuvertureLecture>
            ))}
          </ul>
        </Carte>

        <div className="grid gap-5 sm:grid-cols-2">
          <Carte titre="Estimation indicative" id="t-p-est">
            <MentionPrixFictifs />
            <Fourchette ouvertures={projet.ouvertures} className="mt-2 block text-2xl" />
          </Carte>
          <Carte titre="Démarches" id="t-p-regl">
            <AlertesReglementaires alertes={alertes(projet.contexte, projet.ouvertures)} />
          </Carte>
        </div>

        <Carte titre="Votre avis" id="t-p-avis">
          <Zone libelle="Un commentaire ?" value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Ex. : je préfère le gris anthracite pour la baie." />
          <div className="mt-3 flex flex-wrap gap-2">
            <Bouton icone="chat" onClick={() => toast('Avis envoyé (simulation)')}>
              Envoyer mon avis
            </Bouton>
            <Bouton
              variante="secondaire"
              icone="crayon"
              onClick={() => {
                sauverProjet(projet);
                charger(projet);
                naviguer(`/projet/${projet.id}/recap`);
              }}
            >
              Modifier le projet à mon tour
            </Bouton>
          </div>
          <p className="mt-2 text-xs italic">Envoi simulé. « Modifier » enregistre une copie du projet dans ce navigateur.</p>
        </Carte>
      </div>
    </>
  );
}
