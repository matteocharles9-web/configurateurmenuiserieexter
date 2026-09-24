import { catalogue, type Ouverture } from '../data/types';
import { famille, materiauxDisponibles, optionsParDefaut } from './catalogue';

export type Budget = 'maitrise' | 'equilibre' | 'haut';

export interface ReponsesBesoin {
  famille: string; // id de famille ou 'inconnu'
  besoins: string[];
  budget: Budget;
}

export interface Recommandation {
  ouverture: Pick<Ouverture, 'famille' | 'modele' | 'gamme' | 'materiau' | 'options'>;
  raisons: string[];
}

const GAMME_BUDGET: Record<Budget, string> = { maitrise: 'essentiel', equilibre: 'confort', haut: 'premium' };
const ordreGamme = (id: string) => catalogue.gammes.findIndex((g) => g.id === id);

export function recommander(r: ReponsesBesoin): Recommandation {
  const fam = famille(r.famille === 'inconnu' ? 'fenetre' : r.famille);
  const modeleId = fam.modeles.find((m) => m.id.startsWith('oscillo'))?.id ?? fam.modeles[0].id;
  const besoins = catalogue.besoins.filter((b) => r.besoins.includes(b.id));
  const raisons: string[] = [];

  // Matériau : celui que citent le plus de besoins, parmi ceux proposés pour ce produit.
  const dispo = materiauxDisponibles(fam.id, modeleId);
  const score = (m: string) => besoins.filter((b) => b.materiaux?.includes(m)).length;
  const prefereBudget = r.budget === 'haut' ? ['mixte', 'bois', 'alu'] : r.budget === 'maitrise' ? ['pvc', 'acier'] : [];
  const rang = (m: string) => (prefereBudget.includes(m) ? prefereBudget.indexOf(m) : prefereBudget.length);
  const materiau = [...dispo].sort((a, b) => score(b) - score(a) || rang(a) - rang(b))[0];

  // Gamme : la plus haute entre le budget et les besoins exprimés.
  let gamme = GAMME_BUDGET[r.budget];
  for (const b of besoins) if (b.gammeMin && ordreGamme(b.gammeMin) > ordreGamme(gamme)) gamme = b.gammeMin;

  // Options : celles suggérées par chaque besoin, si elles existent pour ce produit.
  const options = optionsParDefaut(fam.id, modeleId);
  for (const b of besoins) {
    for (const [g, v] of Object.entries(b.options ?? {})) if (g in options) options[g] = v;
    raisons.push(b.explication);
  }

  if (r.famille === 'inconnu') raisons.unshift("Vous n'avez pas encore choisi de produit : nous partons d'une fenêtre, le plus fréquent. Vous pourrez changer à l'étape 1.");
  if (!besoins.length) raisons.push('Sans besoin particulier, la gamme correspondant à votre budget est un bon point de départ.');

  return { ouverture: { famille: fam.id, modele: modeleId, gamme, materiau, options }, raisons };
}
