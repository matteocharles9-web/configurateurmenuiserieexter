import { catalogue, type Famille, type GroupeOptions, type Ouverture } from '../data/types';

export const famille = (id: string): Famille =>
  catalogue.familles.find((f) => f.id === id) ?? catalogue.familles[0];

export const modele = (familleId: string, modeleId: string) => {
  const f = famille(familleId);
  return f.modeles.find((m) => m.id === modeleId) ?? f.modeles[0];
};

export const materiau = (id: string) =>
  catalogue.materiaux.find((m) => m.id === id) ?? catalogue.materiaux[0];

export const coloris = (id: string) =>
  catalogue.coloris.find((c) => c.id === id) ?? catalogue.coloris[0];

export const gamme = (id: string) =>
  catalogue.gammes.find((g) => g.id === id) ?? catalogue.gammes[0];

/** Matériaux proposés pour un produit (le modèle peut restreindre la liste de la famille). */
export const materiauxDisponibles = (familleId: string, modeleId: string): string[] =>
  modele(familleId, modeleId).materiaux ?? famille(familleId).materiaux;

export const colorisDisponibles = (materiauId: string) =>
  materiau(materiauId).coloris.map(coloris);

export const estMotorise = (o: Pick<Ouverture, 'options'>): boolean =>
  catalogue.optionsGroupes.some((g) => {
    const v = o.options[g.id];
    const ids = Array.isArray(v) ? v : v ? [v] : [];
    return g.choix.some((c) => c.motorise && ids.includes(c.id));
  });

/** Groupes d'options applicables à une ouverture (famille, modèle, motorisation). */
export const groupesOptions = (o: Pick<Ouverture, 'famille' | 'modele' | 'options'>): GroupeOptions[] =>
  catalogue.optionsGroupes.filter(
    (g) =>
      g.familles.includes(o.famille) &&
      (!g.modeles || g.modeles.includes(o.modele)) &&
      (!g.siMotorise || estMotorise(o)),
  );

/** Options par défaut : premier choix de chaque groupe « unique ». */
export const optionsParDefaut = (familleId: string, modeleId: string): Record<string, string | string[]> => {
  const res: Record<string, string | string[]> = {};
  for (const g of catalogue.optionsGroupes) {
    if (!g.familles.includes(familleId) || (g.modeles && !g.modeles.includes(modeleId))) continue;
    res[g.id] = g.type === 'unique' ? g.choix[0].id : [];
  }
  return res;
};

/** Choix sélectionnés dans les groupes réellement applicables. */
export const choixSelectionnes = (o: Ouverture) =>
  groupesOptions(o).flatMap((g) => {
    const v = o.options[g.id];
    const ids = Array.isArray(v) ? v : v ? [v] : [];
    return g.choix.filter((c) => ids.includes(c.id)).map((c) => ({ groupe: g, choix: c }));
  });

export const formatDimensions = (o: Ouverture) =>
  o.dimensionsInconnues ? 'Dimensions à relever' : `${o.largeurCm} × ${o.hauteurCm} cm`;

/** Libellé en milieu de phrase : « aluminium », mais « PVC » reste en capitales. */
export const enMinuscules = (libelle: string) => (libelle === libelle.toUpperCase() ? libelle : libelle.toLowerCase());
