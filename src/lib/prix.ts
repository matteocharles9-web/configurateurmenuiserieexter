import { catalogue, type Accessoire, type Ouverture, type Solution } from '../data/types';
import { choixSelectionnes, famille, materiau, modele, typePose } from './catalogue';
import { solutionStandard } from './solutions';

/* Estimations FICTIVES : toutes les valeurs viennent de catalogue.json. */

export interface Fourchette {
  min: number;
  max: number;
}

export interface LigneAccessoire {
  accessoire: Accessoire;
  quantite: number;
  unite: string;
  prix: number;
}

export interface Devis {
  solution: Solution;
  disponible: boolean;
  largeur: number;
  hauteur: number;
  produit: number;
  options: number;
  pose: number;
  reprise: number;
  accessoires: LigneAccessoire[];
  totalAccessoires: number;
  /** Total pour une ouverture (hors quantité). */
  unitaire: number;
  /** Total quantité incluse. */
  total: number;
}

const arrondir = (n: number) => Math.round(n / catalogue.prix.arrondi) * catalogue.prix.arrondi;

function accessoiresPour(o: Ouverture, solution: Solution, l: number, h: number, ecart: boolean): LigneAccessoire[] {
  return catalogue.accessoires.liste
    .filter(
      (a) =>
        (!a.familles || a.familles.includes(o.famille)) &&
        (!a.modeles || a.modeles.includes(o.modele)) &&
        (!a.poses || a.poses.includes(o.pose)) &&
        (!a.solutions || a.solutions.includes(solution)) &&
        (!a.siEcart || ecart),
    )
    .map((a) => {
      const quantite =
        a.unite === 'metre' ? Math.ceil((2 * (l + h)) / 100) : a.unite === 'metreLargeur' ? Math.ceil(l / 100) : (a.quantite ?? 1);
      const unite = a.unite === 'metre' || a.unite === 'metreLargeur' ? 'm' : a.unite === 'kit' ? 'kit' : quantite > 1 ? 'pièces' : 'pièce';
      return { accessoire: a, quantite, unite, prix: quantite * a.prixFictif };
    });
}

export function devis(o: Ouverture, solution: Solution = o.solution): Devis {
  const f = famille(o.famille);
  const p = catalogue.prix;
  const std = solution === 'standard' ? solutionStandard(o) : null;
  const [lOuv, hOuv] = o.dimensionsInconnues ? f.dimensions.defaut : [o.largeurCm, o.hauteurCm];
  const [l, h] = std?.taille ?? [lOuv, hOuv];
  const m2 = (l * h) / 10000;

  const produit =
    (f.prixFictif.base + f.prixFictif.parM2 * m2) *
    materiau(o.materiau).coefPrix *
    (modele(o.famille, o.modele).coefPrix ?? 1) *
    (p.coefGamme[o.gamme] ?? 1) *
    (solution === 'standard' ? p.coefStandard : 1);
  const options = choixSelectionnes(o).reduce((s, { choix }) => s + choix.prixFictif, 0);
  const tp = typePose(o.pose);
  const pro = o.posePar === 'pro';
  const pose = pro ? tp.prixFictif.fixe + tp.prixFictif.parM2 * m2 : 0;
  const reprise = pro && tp.remplacement && o.repriseAnciennes ? p.repriseAnciennes : 0;
  const ecart = Boolean(std && (std.ecart.l > 0 || std.ecart.h > 0));
  const accessoires = accessoiresPour(o, solution, lOuv, hOuv, ecart);
  const totalAccessoires = accessoires.reduce((s, a) => s + a.prix, 0);
  const unitaire = produit + options + pose + reprise + totalAccessoires;

  return {
    solution,
    disponible: std ? std.disponible : true,
    largeur: l,
    hauteur: h,
    produit,
    options,
    pose,
    reprise,
    accessoires,
    totalAccessoires,
    unitaire,
    total: unitaire * Math.max(1, o.quantite),
  };
}

/** Prix central FICTIF d'une ouverture (quantité incluse), pour la solution choisie. */
export const prixCentral = (o: Ouverture) => devis(o).total;

export function fourchetteDe(montant: number): Fourchette {
  return { min: arrondir(montant * catalogue.prix.fourchette.min), max: arrondir(montant * catalogue.prix.fourchette.max) };
}

export const fourchette = (ouvertures: Ouverture[]): Fourchette => fourchetteDe(ouvertures.reduce((s, o) => s + prixCentral(o), 0));

const eur = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export const formatEuros = (n: number) => (catalogue.prix.modePrix === 'masque' ? 'XXX €' : `${eur.format(arrondir(n))} €`);

/** « 1 200 – 1 500 € TTC posé » (ou « fourni » si le client pose lui-même), ou « XXX € » si les prix sont masqués. */
export function formatFourchette(f: Fourchette, suffixe = 'TTC posé'): string {
  if (catalogue.prix.modePrix === 'masque') return `XXX € ${suffixe}`;
  return `${eur.format(f.min)} – ${eur.format(f.max)} € ${suffixe}`;
}

/** Suffixe selon le mode de pose des ouvertures. */
export const suffixePrix = (ouvertures: Ouverture[]) =>
  ouvertures.every((o) => o.posePar === 'client') ? 'TTC fourni' : ouvertures.some((o) => o.posePar === 'client') ? 'TTC' : 'TTC posé';
