import { catalogue, type Ouverture } from '../data/types';
import { choixSelectionnes, famille, materiau, modele } from './catalogue';

export interface Fourchette {
  min: number;
  max: number;
}

const arrondir = (n: number) => Math.round(n / catalogue.prix.arrondi) * catalogue.prix.arrondi;

/** Prix central FICTIF d'une ouverture (quantité incluse). Toutes les valeurs viennent de catalogue.json. */
export function prixCentral(o: Ouverture): number {
  const f = famille(o.famille);
  const p = catalogue.prix;
  // Si les dimensions ne sont pas connues, on estime sur les dimensions par défaut.
  const [l, h] = o.dimensionsInconnues ? f.dimensions.defaut : [o.largeurCm, o.hauteurCm];
  const m2 = (l * h) / 10000;
  const produit =
    (f.prixFictif.base + f.prixFictif.parM2 * m2) *
    materiau(o.materiau).coefPrix *
    (modele(o.famille, o.modele).coefPrix ?? 1) *
    (p.coefGamme[o.gamme] ?? 1);
  const options = choixSelectionnes(o).reduce((s, { choix }) => s + choix.prixFictif, 0);
  const pose = p.pose[o.pose].fixe + p.pose[o.pose].parM2 * m2;
  const reprise = o.repriseAnciennes ? p.repriseAnciennes : 0;
  return (produit + options + pose + reprise) * Math.max(1, o.quantite);
}

export function fourchette(ouvertures: Ouverture[]): Fourchette {
  const total = ouvertures.reduce((s, o) => s + prixCentral(o), 0);
  return {
    min: arrondir(total * catalogue.prix.fourchette.min),
    max: arrondir(total * catalogue.prix.fourchette.max),
  };
}

const eur = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** « entre 1 200 et 1 500 € TTC posé », ou « XXX € TTC posé » si les prix sont masqués. */
export function formatFourchette(f: Fourchette): string {
  if (catalogue.prix.modePrix === 'masque') return 'XXX € TTC posé';
  return `${eur.format(f.min)} – ${eur.format(f.max)} € TTC posé`;
}
