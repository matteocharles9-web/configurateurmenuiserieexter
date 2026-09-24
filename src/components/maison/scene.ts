/*
 * Illustration de la maison : chaque famille de produits a un emplacement (en unités de la scène 1000 × 640).
 * Le rendu y est dessiné à partir de RenduMenuiserie ; « defaut » sert tant que le projet n'a pas ce produit.
 */
export interface Emplacement {
  famille: string;
  libelle: string;
  x: number;
  y: number;
  w: number;
  h: number;
  defaut: { modele: string; materiau: string; coloris: string; options?: Record<string, string | string[]> };
}

export const SCENE = { w: 1000, h: 640 };

export const EMPLACEMENTS: Emplacement[] = [
  { famille: 'fenetre-toit', libelle: 'Fenêtre de toit', x: 322, y: 160, w: 58, h: 68, defaut: { modele: 'rotation', materiau: 'bois', coloris: 'chene-naturel' } },
  { famille: 'fenetre', libelle: 'Fenêtre', x: 205, y: 405, w: 90, h: 92, defaut: { modele: 'battant-2', materiau: 'pvc', coloris: 'blanc' } },
  { famille: 'porte-fenetre', libelle: 'Porte-fenêtre', x: 395, y: 268, w: 74, h: 112, defaut: { modele: 'battant-2', materiau: 'pvc', coloris: 'blanc' } },
  { famille: 'volet', libelle: 'Volet', x: 555, y: 262, w: 86, h: 110, defaut: { modele: 'roulant-renovation', materiau: 'alu', coloris: 'anthracite' } },
  { famille: 'porte-entree', libelle: "Porte d'entrée", x: 352, y: 398, w: 66, h: 122, defaut: { modele: 'semi-vitree', materiau: 'alu', coloris: 'anthracite' } },
  { famille: 'baie', libelle: 'Baie coulissante', x: 478, y: 406, w: 172, h: 114, defaut: { modele: 'coulissant-2', materiau: 'alu', coloris: 'anthracite' } },
  { famille: 'porte-garage', libelle: 'Porte de garage', x: 712, y: 410, w: 148, h: 110, defaut: { modele: 'sectionnelle', materiau: 'acier', coloris: 'anthracite' } },
  { famille: 'porte-service', libelle: 'Porte de service', x: 876, y: 424, w: 42, h: 96, defaut: { modele: 'pleine', materiau: 'pvc', coloris: 'blanc' } },
  { famille: 'portail', libelle: 'Portail', x: 702, y: 548, w: 176, h: 76, defaut: { modele: 'battant-semi-ajoure', materiau: 'alu', coloris: 'anthracite' } },
  { famille: 'portillon', libelle: 'Portillon', x: 352, y: 556, w: 56, h: 68, defaut: { modele: 'semi-ajoure', materiau: 'alu', coloris: 'anthracite' } },
];

/** viewBox centré sur un emplacement, au format de la scène, avec de la marge autour. */
export function cadrage(e: Emplacement | null): [number, number, number, number] {
  if (!e) return [0, 0, SCENE.w, SCENE.h];
  const ratio = SCENE.w / SCENE.h;
  let h = Math.max(e.h * 2.4, (e.w * 1.8) / ratio, 150);
  let w = h * ratio;
  if (w > SCENE.w) {
    w = SCENE.w;
    h = w / ratio;
  }
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  const x = Math.min(Math.max(cx - w / 2, 0), SCENE.w - w);
  const y = Math.min(Math.max(cy - h / 2, 0), SCENE.h - h);
  return [x, y, w, h];
}
