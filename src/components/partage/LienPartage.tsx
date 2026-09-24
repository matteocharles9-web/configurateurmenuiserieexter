import { lienPartage } from '../../lib/partage';
import { useProjet } from '../../state/ProjetContext';
import { Bouton } from '../ui/Bouton';
import { useToast } from '../ui/Toast';
import { copier, useLien } from './SauvegardeQr';

export function LienPartage() {
  const { projet } = useProjet();
  const toast = useToast();
  const lien = useLien(projet, lienPartage);
  if (!projet) return null;
  const texte = `Regarde mon projet menuiserie (${projet.ouvertures.length} ouverture${projet.ouvertures.length > 1 ? 's' : ''}) et dis-moi ce que tu en penses :`;
  const partageNatif = typeof navigator !== 'undefined' && 'share' in navigator;

  return (
    <div className="space-y-3">
      <p className="text-sm">Envoyez votre configuration à votre conjoint ou à votre famille : ils la voient telle quelle, sans rien ressaisir, et peuvent donner leur avis.</p>
      <div className="flex flex-wrap gap-2">
        {partageNatif && (
          <Bouton icone="partage" disabled={!lien} onClick={() => navigator.share({ title: projet.nom, text: texte, url: lien }).catch(() => {})}>
            Partager
          </Bouton>
        )}
        <Bouton variante={partageNatif ? 'secondaire' : 'primaire'} icone="copier" disabled={!lien} onClick={async () => (await copier(lien)) && toast('Lien de partage copié')}>
          Copier le lien
        </Bouton>
        <a className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-bleu px-5 py-2 font-bold text-bleu hover:bg-bleu-clair" href={`mailto:?subject=${encodeURIComponent(projet.nom)}&body=${encodeURIComponent(`${texte}\n${lien}`)}`}>
          Par e-mail
        </a>
      </div>
      <p className="text-xs italic">Prototype : la configuration voyage dans le lien. En production, le lien pointerait vers l'identifiant projet partagé.</p>
    </div>
  );
}
