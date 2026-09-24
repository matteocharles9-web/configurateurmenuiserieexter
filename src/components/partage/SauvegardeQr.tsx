import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import type { Projet } from '../../data/types';
import { lienReprise } from '../../lib/partage';
import { useProjet } from '../../state/ProjetContext';
import { Bouton } from '../ui/Bouton';
import { Champ } from '../ui/Champ';
import { Icone } from '../ui/Icone';
import { useToast } from '../ui/Toast';

export async function copier(texte: string) {
  try {
    await navigator.clipboard.writeText(texte);
    return true;
  } catch {
    window.prompt('Copiez ce lien :', texte);
    return false;
  }
}

/** Lien (et QR code) regénéré quand le projet change. */
export function useLien(projet: Projet | null, fabrique: (p: Projet) => Promise<string>) {
  const [lien, setLien] = useState('');
  useEffect(() => {
    let actif = true;
    if (projet) fabrique(projet).then((l) => actif && setLien(l));
    return () => {
      actif = false;
    };
  }, [projet, fabrique]);
  return lien;
}

export function SauvegardeQr() {
  const { projet, sauvegardeOk, renommer } = useProjet();
  const toast = useToast();
  const lien = useLien(projet, lienReprise);
  const [qr, setQr] = useState('');

  useEffect(() => {
    if (lien) QRCode.toDataURL(lien, { margin: 1, width: 320, errorCorrectionLevel: 'L', color: { dark: '#0B2E6F', light: '#FFFFFF' } }).then(setQr, () => setQr(''));
  }, [lien]);

  if (!projet) return null;
  return (
    <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
      <div className="space-y-3">
        <p className="flex items-center gap-2 text-sm font-bold text-ok">
          <Icone nom="ok" className="size-5" />
          {sauvegardeOk ? 'Enregistré automatiquement dans ce navigateur, sans créer de compte.' : 'Enregistrement impossible dans ce navigateur (mode privé ?). Utilisez le lien ci-dessous.'}
        </p>
        <div>
          <p className="text-sm">Votre identifiant projet</p>
          <p className="font-titre text-3xl font-bold tracking-wider text-marine">{projet.id}</p>
          <p className="text-sm">À donner en magasin ou à la hotline pour reprendre votre projet.</p>
        </div>
        <Champ libelle="Nom du projet" value={projet.nom} maxLength={60} onChange={(e) => renommer(e.target.value)} />
        <Bouton variante="secondaire" taille="petit" icone="lien" disabled={!lien} onClick={async () => (await copier(lien)) && toast('Lien de reprise copié')}>
          Copier le lien de reprise
        </Bouton>
      </div>
      <figure className="mx-auto text-center">
        {qr ? <img src={qr} alt={`QR code pour reprendre le projet ${projet.id} sur un autre appareil`} className="size-40 rounded-lg ring-1 ring-bord" /> : <div className="size-40 animate-pulse rounded-lg bg-fond" />}
        <figcaption className="mt-1 max-w-40 text-xs">Scannez pour reprendre sur mobile ou en magasin</figcaption>
      </figure>
    </div>
  );
}
