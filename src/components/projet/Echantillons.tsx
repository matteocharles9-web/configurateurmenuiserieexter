import { useState } from 'react';
import { coloris } from '../../lib/catalogue';
import { useProjet } from '../../state/ProjetContext';
import { Pastille } from '../etapes/EtapeColoris';
import { Bouton } from '../ui/Bouton';
import { ChoixSegmente } from '../ui/Choix';
import { useToast } from '../ui/Toast';

export function Echantillons() {
  const { projet, basculerEchantillon, viderEchantillons, ajouterDemande } = useProjet();
  const toast = useToast();
  const [mode, setMode] = useState<'magasin' | 'domicile'>('domicile');
  if (!projet) return null;

  if (!projet.echantillons.length)
    return <p className="text-sm">Aucun échantillon demandé. Ajoutez-en depuis l'étape Coloris pour vérifier une teinte avant de valider.</p>;

  return (
    <div className="space-y-4">
      <ul className="flex flex-wrap gap-2">
        {projet.echantillons.map((id) => (
          <li key={id} className="flex items-center gap-2 rounded-full bg-fond py-1 pr-1 pl-1.5 ring-1 ring-bord">
            <Pastille id={id} className="size-7" />
            <span className="text-sm font-bold text-marine">{coloris(id).libelle}</span>
            <button type="button" onClick={() => basculerEchantillon(id)} className="rounded-full px-2 py-1 text-sm hover:bg-white" aria-label={`Retirer l'échantillon ${coloris(id).libelle}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>
      <ChoixSegmente
        legende="Comment les recevoir ?"
        nom="mode-echantillon"
        valeur={mode}
        options={[
          { v: 'domicile', l: 'Envoi à domicile' },
          { v: 'magasin', l: 'Retrait en magasin' },
        ]}
        onChange={setMode}
      />
      <Bouton
        variante="jaune"
        icone="echantillon"
        onClick={() => {
          const liste = projet.echantillons.map((id) => coloris(id).libelle).join(', ');
          ajouterDemande({ type: 'echantillons', detail: `Échantillons (${mode === 'domicile' ? 'envoi à domicile' : 'retrait en magasin'}) : ${liste}` });
          viderEchantillons();
          toast('Demande d\'échantillons enregistrée (simulation)');
        }}
      >
        Commander {projet.echantillons.length} échantillon{projet.echantillons.length > 1 ? 's' : ''}
      </Bouton>
      <p className="text-xs italic">Commande simulée – aucun envoi réel.</p>
    </div>
  );
}
