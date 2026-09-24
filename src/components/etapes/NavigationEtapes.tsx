import { ETAPES, type EtapeId } from '../../data/types';
import { naviguer, cheminEtape } from '../../router';
import { useProjet } from '../../state/ProjetContext';
import { Bouton } from '../ui/Bouton';

export function suivante(e: EtapeId): string {
  const i = ETAPES.findIndex((x) => x.id === e);
  return i < ETAPES.length - 1 ? ETAPES[i + 1].id : 'recap';
}

export function NavigationEtapes({ etape }: { etape: EtapeId }) {
  const { projet } = useProjet();
  if (!projet) return null;
  const i = ETAPES.findIndex((x) => x.id === etape);
  const suite = suivante(etape);
  return (
    <div className="mt-6 hidden items-center justify-between gap-3 lg:flex">
      {i > 0 ? (
        <Bouton variante="secondaire" icone="gauche" onClick={() => naviguer(cheminEtape(projet.id, ETAPES[i - 1].id))}>
          {ETAPES[i - 1].libelle}
        </Bouton>
      ) : (
        <span />
      )}
      <Bouton iconeDroite="droite" onClick={() => naviguer(cheminEtape(projet.id, suite))}>
        {suite === 'recap' ? 'Voir mon récapitulatif' : `Étape suivante : ${ETAPES[i + 1].libelle}`}
      </Bouton>
    </div>
  );
}
