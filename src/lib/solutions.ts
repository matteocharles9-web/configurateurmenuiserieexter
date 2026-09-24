import type { Ouverture } from '../data/types';
import { famille, typePose } from './catalogue';

/*
 * Solution standard : on cherche la taille catalogue la plus proche de l'ouverture
 * qui respecte le sens de pose (produit posé dans l'ouverture ou la recouvrant)
 * et l'écart maximal toléré par le type de pose.
 */

export interface ResultatStandard {
  disponible: boolean;
  taille: [number, number] | null;
  /** Écart à combler (cm) en largeur et en hauteur ; 0 si l'ouverture est adaptée au produit. */
  ecart: { l: number; h: number };
  /** Vrai si l'ouverture sera construite ou adaptée aux dimensions du produit. */
  ouvertureAdaptee: boolean;
  raison?: string;
}

export function solutionStandard(o: Pick<Ouverture, 'famille' | 'pose' | 'largeurCm' | 'hauteurCm' | 'dimensionsInconnues'>): ResultatStandard {
  const f = famille(o.famille);
  const std = f.standard;
  const aucun = (raison: string): ResultatStandard => ({ disponible: false, taille: null, ecart: { l: 0, h: 0 }, ouvertureAdaptee: false, raison });
  if (!std?.tailles.length) return aucun("Ce produit n'existe pas en taille standard.");

  const tailles = std.tailles as [number, number][];
  const [L, H] = o.dimensionsInconnues ? f.dimensions.defaut : [o.largeurCm, o.hauteurCm];
  const pose = typePose(o.pose);
  const distance = ([w, h]: [number, number]) => Math.abs(L - w) + Math.abs(H - h);

  // Ouverture créée ou adaptée au produit : on propose simplement la taille la plus proche.
  if (pose.ecartMaxStandard === null) {
    const t = [...tailles].sort((a, b) => distance(a) - distance(b))[0];
    return { disponible: true, taille: t, ecart: { l: 0, h: 0 }, ouvertureAdaptee: true };
  }

  const max = pose.ecartMaxStandard;
  const candidates = tailles.filter(([w, h]) => {
    const dl = pose.sens === 'inferieur' ? L - w : w - L;
    const dh = pose.sens === 'inferieur' ? H - h : h - H;
    return dl >= 0 && dh >= 0 && dl <= max && dh <= max;
  });
  if (!candidates.length) {
    const plusPetite = tailles.every(([w, h]) => w > L || h > H) && pose.sens === 'inferieur';
    return aucun(
      plusPetite
        ? 'Votre ouverture est plus petite que les tailles standard.'
        : `Aucune taille standard ne s'ajuste à moins de ${max} cm de vos dimensions pour ce type de pose.`,
    );
  }
  const t = candidates.sort((a, b) => distance(a) - distance(b))[0];
  return { disponible: true, taille: t, ecart: { l: Math.abs(L - t[0]), h: Math.abs(H - t[1]) }, ouvertureAdaptee: false };
}
