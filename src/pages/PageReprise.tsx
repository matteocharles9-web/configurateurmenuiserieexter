import { useEffect, useState } from 'react';
import { decoderProjet } from '../lib/partage';
import { chargerProjet } from '../lib/stockage';
import { naviguer } from '../router';
import { useProjet } from '../state/ProjetContext';
import { ProjetIntrouvable } from './ProjetIntrouvable';

/* Ouverture d'un lien de reprise / QR code : on garde la version la plus récente (appareil ou lien). */
export function PageReprise({ id, donnees }: { id: string; donnees?: string }) {
  const { charger } = useProjet();
  const [echec, setEchec] = useState(false);

  useEffect(() => {
    let actif = true;
    (async () => {
      const local = chargerProjet(id);
      const lien = donnees ? await decoderProjet(donnees) : null;
      const choisi = lien && (!local || lien.modifieLe > local.modifieLe) ? lien : local;
      if (!actif) return;
      if (!choisi) return setEchec(true);
      charger(choisi);
      naviguer(`/projet/${choisi.id}/recap`, true);
    })();
    return () => {
      actif = false;
    };
  }, [id, donnees, charger]);

  return echec ? <ProjetIntrouvable id={id} /> : <p className="p-8 text-center" role="status">Chargement du projet…</p>;
}
