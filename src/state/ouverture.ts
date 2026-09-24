import type { Ouverture } from '../data/types';
import { colorisPour, famille, materiauxPour, optionsParDefaut, posesDisponibles } from '../lib/catalogue';
import { nouvelIdOuverture } from '../lib/ids';

/** Rend une ouverture cohérente après un changement (modèle, matériau, coloris, options). */
export function normaliser(o: Ouverture): Ouverture {
  const f = famille(o.famille);
  const modele = f.modeles.some((m) => m.id === o.modele) ? o.modele : f.modeles[0].id;
  const solution = o.solution === 'standard' && f.standard ? 'standard' : 'surmesure';
  // En standard, le choix de matériaux et de coloris est limité à l'offre standard.
  const mats = materiauxPour({ famille: f.id, modele, solution });
  const mat = mats.includes(o.materiau) ? o.materiau : mats[0];
  const cols = colorisPour({ famille: f.id, materiau: mat, solution });
  const col = cols.includes(o.coloris) ? o.coloris : cols[0];
  const poses = posesDisponibles(f.id, modele).map((p) => p.id);
  const pose = poses.includes(o.pose) ? o.pose : poses[0];
  // On garde les choix existants qui s'appliquent encore, on complète avec les valeurs par défaut.
  const defauts = optionsParDefaut(f.id, modele);
  const options: Ouverture['options'] = {};
  for (const [g, v] of Object.entries(defauts)) options[g] = o.options[g] ?? v;
  return {
    ...o,
    modele,
    solution,
    posePar: o.posePar === 'client' ? 'client' : 'pro',
    pose,
    materiau: mat,
    coloris: col,
    options,
    quantite: Math.max(1, Math.round(o.quantite || 1)),
  };
}

export function nouvelleOuverture(partiel: Partial<Ouverture> = {}): Ouverture {
  const f = famille(partiel.famille ?? 'fenetre');
  return normaliser({
    id: nouvelIdOuverture(),
    libelle: partiel.libelle ?? f.libelle,
    famille: f.id,
    modele: f.modeles[0].id,
    gamme: 'confort',
    largeurCm: f.dimensions.defaut[0],
    hauteurCm: f.dimensions.defaut[1],
    dimensionsInconnues: false,
    quantite: 1,
    materiau: '',
    coloris: '',
    options: {},
    pose: '',
    posePar: 'pro',
    solution: 'surmesure',
    repriseAnciennes: true,
    ...partiel,
  });
}

/** Changement de famille : on repart des dimensions et du libellé par défaut du nouveau produit. */
export function changerFamille(o: Ouverture, familleId: string): Ouverture {
  const ancienne = famille(o.famille);
  const f = famille(familleId);
  return normaliser({
    ...o,
    famille: f.id,
    modele: f.modeles[0].id,
    libelle: o.libelle === ancienne.libelle ? f.libelle : o.libelle,
    largeurCm: f.dimensions.defaut[0],
    hauteurCm: f.dimensions.defaut[1],
    options: {},
  });
}
