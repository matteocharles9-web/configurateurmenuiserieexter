import { catalogue, type Critere, type Ouverture } from '../data/types';
import { choixSelectionnes, gamme, materiau } from './catalogue';

export interface NiveauCritere {
  id: string;
  libelle: string;
  niveau: number; // 1 à 3
  libelleNiveau: string;
  phrase: string;
}

const borne = (n: number) => Math.min(3, Math.max(1, n));

/** Niveaux qualitatifs (1 à 3) : matériau + gamme + options. Aucun coefficient chiffré. */
export function niveaux(o: Pick<Ouverture, 'materiau' | 'gamme'> & Partial<Ouverture>): Record<Critere, number> {
  const base = { ...materiau(o.materiau).perf };
  const bonus = gamme(o.gamme).bonus;
  (Object.keys(base) as Critere[]).forEach((k) => (base[k] += bonus[k] ?? 0));
  if (o.options && o.famille) {
    for (const { choix } of choixSelectionnes(o as Ouverture)) {
      (Object.keys(choix.perf ?? {}) as Critere[]).forEach((k) => (base[k] += choix.perf![k] ?? 0));
    }
  }
  (Object.keys(base) as Critere[]).forEach((k) => (base[k] = borne(base[k])));
  return base;
}

export function benefices(o: Parameters<typeof niveaux>[0]): NiveauCritere[] {
  const n = niveaux(o);
  return catalogue.performances.criteres.map((c) => {
    const niveau = n[(c.source ?? c.id) as Critere];
    return {
      id: c.id,
      libelle: c.libelle,
      niveau,
      libelleNiveau: catalogue.performances.libellesNiveaux[niveau - 1],
      phrase: c.niveaux[niveau - 1],
    };
  });
}
