import { useState, type FormEvent } from 'react';
import { listerProjets, supprimerProjet } from '../lib/stockage';
import { naviguer } from '../router';
import { useProjet } from '../state/ProjetContext';
import { FilAriane } from '../components/layout/EnTete';
import { Bouton } from '../components/ui/Bouton';
import { Carte } from '../components/ui/Carte';
import { Champ } from '../components/ui/Champ';

export function PageReprendre() {
  const { chargerParId, projet, charger } = useProjet();
  const [saisie, setSaisie] = useState('');
  const [erreur, setErreur] = useState('');
  const [projets, setProjets] = useState(listerProjets);

  const reprendre = (e: FormEvent) => {
    e.preventDefault();
    const id = saisie.trim().toUpperCase().replace(/^(CAS)?-?/, 'CAS-');
    if (chargerParId(id)) naviguer(`/projet/${id}/recap`);
    else setErreur(`Aucun projet ${id} dans ce navigateur. Sur un autre appareil, utilisez le QR code ou le lien de reprise.`);
  };

  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Reprendre un projet' }]} />
      <div className="mx-auto max-w-2xl space-y-5 px-4 pt-4">
        <h1 className="text-2xl font-semibold">Reprendre un projet</h1>
        <Carte>
          <form onSubmit={reprendre} className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <Champ className="flex-1" libelle="Identifiant projet" placeholder="CAS-XXXXXX" value={saisie} onChange={(e) => setSaisie(e.target.value)} erreur={erreur || undefined} autoCapitalize="characters" />
            <Bouton type="submit" className="sm:mt-6">
              Reprendre
            </Bouton>
          </form>
          <p className="mt-3 text-sm">Prototype : l'identifiant retrouve les projets enregistrés dans ce navigateur. En production, il serait partagé entre le site, le magasin et la hotline.</p>
        </Carte>
        {projets.length > 0 && (
          <Carte titre="Projets enregistrés sur cet appareil" id="t-liste">
            <ul className="divide-y divide-bord">
              {projets.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span>
                    <strong className="text-marine">{p.nom}</strong>
                    <br />
                    <span className="text-sm">
                      {p.id} · {p.ouvertures.length} ouverture{p.ouvertures.length > 1 ? 's' : ''} · modifié le {new Date(p.modifieLe).toLocaleDateString('fr-FR')}
                    </span>
                  </span>
                  <span className="flex gap-2">
                    <Bouton taille="petit" onClick={() => naviguer(`/projet/${p.id}/recap`)}>
                      Ouvrir
                    </Bouton>
                    <Bouton
                      taille="petit"
                      variante="danger"
                      aria-label={`Supprimer le projet ${p.id}`}
                      onClick={() => {
                        if (!window.confirm(`Supprimer définitivement le projet ${p.id} de cet appareil ?`)) return;
                        supprimerProjet(p.id);
                        if (projet?.id === p.id) charger(null);
                        setProjets(listerProjets());
                      }}
                    >
                      Supprimer
                    </Bouton>
                  </span>
                </li>
              ))}
            </ul>
          </Carte>
        )}
      </div>
    </>
  );
}
