import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import type { Ouverture } from '../../data/types';
import { chargerPhoto, sauverPhoto, type PhotoProjet } from '../../lib/stockage';
import { Bouton } from '../ui/Bouton';
import { Icone } from '../ui/Icone';
import { RenduMenuiserie } from './RenduMenuiserie';

/*
 * « Aperçu sur votre photo » : le client importe une photo et place le rendu à la main
 * (glisser, poignée de redimensionnement, curseurs ou clavier).
 * Volontairement sans détection automatique ni réalité augmentée : brique à acheter à un éditeur.
 */

const TAILLE_MAX = 1280;

async function reduireImage(fichier: File): Promise<string> {
  const url = URL.createObjectURL(fichier);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, TAILLE_MAX / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * k);
    c.height = Math.round(img.naturalHeight * k);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

const borne = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export function ApercuPhoto({ projetId, ouverture }: { projetId: string; ouverture: Ouverture }) {
  const [photo, setPhoto] = useState<PhotoProjet | null>(() => chargerPhoto(projetId));
  const [memoireSeule, setMemoireSeule] = useState(false);
  const [erreur, setErreur] = useState('');
  const zone = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const glisse = useRef<{ mode: 'deplacer' | 'taille'; x: number; y: number; depart: PhotoProjet } | null>(null);

  useEffect(() => setPhoto(chargerPhoto(projetId)), [projetId]);

  const maj = (p: PhotoProjet | null) => {
    setPhoto(p);
    setMemoireSeule(!sauverPhoto(projetId, p));
  };

  const importer = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) return setErreur('Ce fichier n\'est pas une image.');
    setErreur('');
    try {
      maj({ dataUrl: await reduireImage(f), x: 30, y: 25, largeur: 40, opacite: 1 });
    } catch {
      setErreur("Impossible de lire cette image. Essayez une photo au format JPEG ou PNG.");
    }
  };

  const debut = (mode: 'deplacer' | 'taille') => (e: PointerEvent) => {
    if (!photo) return;
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    glisse.current = { mode, x: e.clientX, y: e.clientY, depart: photo };
  };
  const bouger = (e: PointerEvent) => {
    const g = glisse.current;
    const r = zone.current?.getBoundingClientRect();
    if (!g || !r) return;
    const dx = ((e.clientX - g.x) / r.width) * 100;
    const dy = ((e.clientY - g.y) / r.height) * 100;
    if (g.mode === 'deplacer') setPhoto({ ...g.depart, x: borne(g.depart.x + dx, -20, 100), y: borne(g.depart.y + dy, -20, 100) });
    else setPhoto({ ...g.depart, largeur: borne(g.depart.largeur + dx, 5, 120) });
  };
  const fin = () => {
    if (glisse.current && photo) maj(photo);
    glisse.current = null;
  };

  const clavier = (e: KeyboardEvent) => {
    if (!photo) return;
    const pas = e.shiftKey ? 5 : 1;
    const t: Record<string, Partial<PhotoProjet>> = {
      ArrowLeft: { x: photo.x - pas },
      ArrowRight: { x: photo.x + pas },
      ArrowUp: { y: photo.y - pas },
      ArrowDown: { y: photo.y + pas },
      '+': { largeur: borne(photo.largeur + pas, 5, 120) },
      '=': { largeur: borne(photo.largeur + pas, 5, 120) },
      '-': { largeur: borne(photo.largeur - pas, 5, 120) },
    };
    if (t[e.key]) {
      e.preventDefault();
      maj({ ...photo, ...t[e.key] });
    }
  };

  const champFichier = (
    <input ref={input} type="file" accept="image/*" className="sr-only" tabIndex={-1} aria-hidden onChange={(e) => importer(e.target.files?.[0] ?? undefined)} />
  );

  if (!photo)
    return (
      <div>
        {champFichier}
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            importer(e.dataTransfer.files[0]);
          }}
          className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-bleu/50 bg-bleu-clair/40 px-4 py-10 text-center hover:bg-bleu-clair"
        >
          <Icone nom="photo" className="size-10 text-bleu" />
          <span className="font-bold text-marine">Importer une photo de ma façade</span>
          <span className="text-sm">ou prendre une photo avec mon téléphone</span>
        </button>
        {erreur && <p className="mt-2 text-sm font-bold text-red-700">{erreur}</p>}
        <p className="mt-3 text-xs">La photo reste sur votre appareil. Vous placez vous-même le rendu : pas de détection automatique dans ce prototype.</p>
      </div>
    );

  return (
    <div>
      {champFichier}
      <div ref={zone} className="relative touch-none overflow-hidden rounded-xl bg-black select-none" onPointerMove={bouger} onPointerUp={fin} onPointerCancel={fin}>
        <img src={photo.dataUrl} alt="Votre photo de façade" className="block w-full" draggable={false} />
        <div
          role="group"
          tabIndex={0}
          aria-label="Rendu de la menuiserie sur votre photo. Flèches pour déplacer, plus et moins pour redimensionner."
          onKeyDown={clavier}
          onPointerDown={debut('deplacer')}
          className="absolute cursor-move outline-offset-2 focus-visible:outline-3 focus-visible:outline-jaune"
          style={{ left: `${photo.x}%`, top: `${photo.y}%`, width: `${photo.largeur}%`, opacity: photo.opacite }}
        >
          <RenduMenuiserie decoratif {...ouverture} className="block h-auto w-full drop-shadow-lg" />
          <span
            onPointerDown={debut('taille')}
            aria-hidden
            className="absolute -right-3 -bottom-3 grid size-7 cursor-nwse-resize place-items-center rounded-full border-2 border-white bg-jaune text-marine shadow"
          >
            <Icone nom="plus" className="size-4" />
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="text-sm font-bold text-marine">
          Taille
          <input type="range" min={5} max={120} value={Math.round(photo.largeur)} onChange={(e) => maj({ ...photo, largeur: Number(e.target.value) })} className="mt-1 w-full accent-bleu" />
        </label>
        <label className="text-sm font-bold text-marine">
          Transparence
          <input type="range" min={30} max={100} value={Math.round(photo.opacite * 100)} onChange={(e) => maj({ ...photo, opacite: Number(e.target.value) / 100 })} className="mt-1 w-full accent-bleu" />
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Bouton variante="secondaire" taille="petit" icone="photo" onClick={() => input.current?.click()}>
          Changer de photo
        </Bouton>
        <Bouton variante="danger" taille="petit" icone="poubelle" onClick={() => maj(null)}>
          Supprimer
        </Bouton>
      </div>
      {memoireSeule && <p className="mt-2 text-xs font-bold text-alerte">Photo trop lourde pour être enregistrée dans le navigateur : elle sera perdue en quittant la page.</p>}
      <p className="mt-2 text-xs">Glissez le rendu pour le placer, tirez la poignée jaune pour l'agrandir. Au clavier : flèches et touches + / −.</p>
    </div>
  );
}
