import catalogueJson from './catalogue.json';

export type Critere = 'thermique' | 'acoustique' | 'securite' | 'entretien';
export type Niveaux = Partial<Record<Critere, number>>;
export type Teinte = 'blanc' | 'clair' | 'fonce' | 'couleur' | 'bois';
export type TypePose = 'renovation' | 'depose_totale';
export type EtapeId = 'produit' | 'dimensions' | 'materiau' | 'coloris' | 'options';

export interface Modele {
  id: string;
  libelle: string;
  description: string;
  materiaux?: string[];
  coefPrix?: number;
}

export interface Famille {
  id: string;
  libelle: string;
  pluriel: string;
  accroche: string;
  materiaux: string[];
  dimensions: { largeur: number[]; hauteur: number[]; defaut: number[] };
  prixFictif: { base: number; parM2: number };
  modeles: Modele[];
}

export interface Gamme {
  id: string;
  libelle: string;
  description: string;
  bonus: Niveaux;
  conseille?: boolean;
}

export interface Materiau {
  id: string;
  libelle: string;
  coefPrix: number;
  epaisseurProfil: number;
  resume: string;
  points: string[];
  perf: Record<Critere, number>;
  coloris: string[];
}

export interface Coloris {
  id: string;
  libelle: string;
  hex: string;
  teinte: Teinte;
  texture?: string;
}

export interface ChoixOption {
  id: string;
  libelle: string;
  description?: string;
  prixFictif: number;
  perf?: Niveaux;
  motorise?: boolean;
}

export interface GroupeOptions {
  id: string;
  libelle: string;
  type: 'unique' | 'multiple';
  familles: string[];
  modeles?: string[];
  siMotorise?: boolean;
  aide?: string;
  choix: ChoixOption[];
}

export interface Regle {
  id: string;
  condition: 'copropriete' | 'secteurProtege' | 'secteurProtegeInconnu' | 'changementAspect';
  niveau: 'attention' | 'info';
  titre: string;
  message: string;
  demarche: string[];
}

export interface Besoin {
  id: string;
  libelle: string;
  icone: string;
  explication: string;
  options?: Record<string, string | string[]>;
  gammeMin?: string;
  materiaux?: string[];
}

export interface Realisation {
  id: string;
  titre: string;
  lieu: string;
  famille: string;
  modele: string;
  materiau: string;
  coloris: string;
  pose: TypePose;
  texte: string;
}

export interface Avis {
  id: string;
  auteur: string;
  note: number;
  famille: string;
  texte: string;
}

export interface Catalogue {
  meta: Record<'version' | 'avertissementPrix' | 'avertissementPerformances' | 'avertissementDonnees' | 'aChiffrer', string>;
  prix: {
    modePrix: 'fictif' | 'masque';
    fourchette: { min: number; max: number };
    arrondi: number;
    pose: Record<TypePose, { fixe: number; parM2: number }>;
    repriseAnciennes: number;
    coefGamme: Record<string, number>;
  };
  aChiffrer: Record<'delaiFabrication' | 'delaiPose' | 'aides' | 'economiesEnergie' | 'financement', string>;
  familles: Famille[];
  gammes: Gamme[];
  materiaux: Materiau[];
  coloris: Coloris[];
  optionsGroupes: GroupeOptions[];
  performances: {
    criteres: { id: string; libelle: string; source?: string; niveaux: string[] }[];
    libellesNiveaux: string[];
  };
  pose: {
    types: { id: TypePose; libelle: string; description: string }[];
    reprise: { libelle: string; description: string };
    noteMetrage: string;
  };
  reglementaire: { avertissement: string; regles: Regle[] };
  besoins: Besoin[];
  rdv: { magasins: string[]; creneaux: string[]; joursProposes: number };
  realisations: Realisation[];
  avis: Avis[];
}

export const catalogue = catalogueJson as unknown as Catalogue;

/* ---------- Modèle du projet ---------- */

export interface Ouverture {
  id: string;
  libelle: string;
  famille: string;
  modele: string;
  gamme: string;
  largeurCm: number;
  hauteurCm: number;
  dimensionsInconnues: boolean;
  quantite: number;
  materiau: string;
  coloris: string;
  /** groupe d'options → choix (id) ou liste de choix */
  options: Record<string, string | string[]>;
  pose: TypePose;
  repriseAnciennes: boolean;
}

export interface ContexteLogement {
  typeLogement?: 'maison' | 'appartement';
  copropriete?: boolean;
  secteurProtege?: 'oui' | 'non' | 'inconnu';
  aspectActuel?: { materiau?: string; teinte?: Teinte };
  changementForme?: boolean;
}

export interface Demande {
  type: 'conseiller' | 'rdv' | 'rappel' | 'echantillons';
  date: string;
  detail: string;
}

export interface Projet {
  id: string;
  nom: string;
  creeLe: string;
  modifieLe: string;
  pointEntree: 'produit' | 'besoin';
  besoins: string[];
  contexte: ContexteLogement;
  ouvertures: Ouverture[];
  ouvertureActive: string;
  echantillons: string[];
  demandes: Demande[];
}

export const ETAPES: { id: EtapeId; libelle: string }[] = [
  { id: 'produit', libelle: 'Produit' },
  { id: 'dimensions', libelle: 'Dimensions' },
  { id: 'materiau', libelle: 'Matériau' },
  { id: 'coloris', libelle: 'Coloris' },
  { id: 'options', libelle: 'Options' },
];
