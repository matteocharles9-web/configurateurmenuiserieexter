import type { Projet } from '../data/types';

// localStorage peut être indisponible (navigation privée, quota) : on ne plante jamais.
const CLE_PROJETS = 'cfgmen:projets';
const CLE_DERNIER = 'cfgmen:dernier';
const clePhoto = (id: string) => `cfgmen:photo:${id}`;

function lire<T>(cle: string, defaut: T): T {
  try {
    const v = localStorage.getItem(cle);
    return v ? (JSON.parse(v) as T) : defaut;
  } catch {
    return defaut;
  }
}
function ecrire(cle: string, valeur: unknown): boolean {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur));
    return true;
  } catch {
    return false;
  }
}

export const listerProjets = (): Projet[] =>
  Object.values(lire<Record<string, Projet>>(CLE_PROJETS, {})).sort((a, b) => b.modifieLe.localeCompare(a.modifieLe));

export const chargerProjet = (id: string): Projet | null => lire<Record<string, Projet>>(CLE_PROJETS, {})[id] ?? null;

export function sauverProjet(p: Projet): boolean {
  const tous = lire<Record<string, Projet>>(CLE_PROJETS, {});
  tous[p.id] = p;
  return ecrire(CLE_PROJETS, tous) && ecrire(CLE_DERNIER, p.id);
}

export function supprimerProjet(id: string) {
  const tous = lire<Record<string, Projet>>(CLE_PROJETS, {});
  delete tous[id];
  ecrire(CLE_PROJETS, tous);
  try {
    localStorage.removeItem(clePhoto(id));
  } catch {
    /* rien */
  }
}

export const dernierProjetId = () => lire<string | null>(CLE_DERNIER, null);

export interface PhotoProjet {
  dataUrl: string;
  x: number; // position du rendu, en % de la photo
  y: number;
  largeur: number; // largeur du rendu, en % de la photo
  opacite: number;
}
export const chargerPhoto = (id: string) => lire<PhotoProjet | null>(clePhoto(id), null);
export const sauverPhoto = (id: string, photo: PhotoProjet | null) =>
  photo ? ecrire(clePhoto(id), photo) : (localStorage.removeItem(clePhoto(id)), true);
