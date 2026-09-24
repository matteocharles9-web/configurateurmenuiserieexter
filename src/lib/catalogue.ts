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

export const typePose = (id: string) => catalogue.pose.types.find((p) => p.id === id) ?? catalogue.pose.types[0];

/** Types de pose proposés pour un produit (certains ne valent que pour quelques modèles). */
export const posesDisponibles = (familleId: string, modeleId: string) =>
  famille(familleId)
    .poses.map(typePose)
    .filter((p) => !p.modeles || p.modeles.includes(modeleId));

/** Matériaux proposés selon la solution : en standard, seulement ceux de l'offre standard. */
export function materiauxPour(o: Pick<Ouverture, 'famille' | 'modele' | 'solution'>): string[] {
  const tous = materiauxDisponibles(o.famille, o.modele);
  const std = famille(o.famille).standard;
  if (o.solution !== 'standard' || !std) return tous;
  const communs = tous.filter((m) => std.materiaux.includes(m));
  return communs.length ? communs : tous;
}

export function colorisPour(o: Pick<Ouverture, 'famille' | 'materiau' | 'solution'>): string[] {
  const tous = materiau(o.materiau).coloris;
  const std = famille(o.famille).standard;
  if (o.solution !== 'standard' || !std) return tous;
  const communs = tous.filter((c) => std.coloris.includes(c));
  return communs.length ? communs : tous;
}
