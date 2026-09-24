import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react';
import type { ContexteLogement, Demande, Ouverture, Projet } from '../data/types';
import { coloris as getColoris, colorisPour } from '../lib/catalogue';
import { nouvelIdOuverture, nouvelIdProjet } from '../lib/ids';
import { chargerProjet, sauverProjet } from '../lib/stockage';
import { changerFamille, normaliser, nouvelleOuverture } from './ouverture';

type Action =
  | { type: 'charger'; projet: Projet | null }
  | { type: 'majOuverture'; id: string; patch: Partial<Ouverture> }
  | { type: 'changerFamille'; id: string; famille: string }
  | { type: 'ajouterOuverture'; ouverture: Ouverture }
  | { type: 'dupliquer'; id: string; copie: Ouverture }
  | { type: 'supprimer'; id: string }
  | { type: 'activer'; id: string }
  | { type: 'appliquerColoris'; coloris: string }
  | { type: 'contexte'; patch: Partial<ContexteLogement> }
  | { type: 'echantillon'; coloris: string }
  | { type: 'viderEchantillons' }
  | { type: 'demande'; demande: Demande }
  | { type: 'renommer'; nom: string };

function majOuvertures(p: Projet, f: (o: Ouverture) => Ouverture): Projet {
  return { ...p, ouvertures: p.ouvertures.map(f) };
}

function reducer(p: Projet | null, a: Action): Projet | null {
  // Au chargement, on complète les projets enregistrés par une version antérieure du prototype.
  if (a.type === 'charger') return a.projet && { ...a.projet, ouvertures: a.projet.ouvertures.map((o) => normaliser(o)) };
  if (!p) return p;
  const suite = ((): Projet => {
    switch (a.type) {
      case 'majOuverture':
        return majOuvertures(p, (o) => (o.id === a.id ? normaliser({ ...o, ...a.patch }) : o));
      case 'changerFamille':
        return majOuvertures(p, (o) => (o.id === a.id ? changerFamille(o, a.famille) : o));
      case 'ajouterOuverture':
        return { ...p, ouvertures: [...p.ouvertures, a.ouverture], ouvertureActive: a.ouverture.id };
      case 'dupliquer': {
        const i = p.ouvertures.findIndex((o) => o.id === a.id);
        const ouvertures = [...p.ouvertures];
        ouvertures.splice(i + 1, 0, a.copie);
        return { ...p, ouvertures, ouvertureActive: a.copie.id };
      }
      case 'supprimer': {
        if (p.ouvertures.length <= 1) return p;
        const ouvertures = p.ouvertures.filter((o) => o.id !== a.id);
        return { ...p, ouvertures, ouvertureActive: p.ouvertureActive === a.id ? ouvertures[0].id : p.ouvertureActive };
      }
      case 'activer':
        return { ...p, ouvertureActive: a.id };
      case 'appliquerColoris':
        // Seules les ouvertures dont le matériau propose ce coloris sont modifiées.
        return majOuvertures(p, (o) => (colorisPour(o).includes(a.coloris) ? { ...o, coloris: a.coloris } : o));
      case 'contexte':
        return { ...p, contexte: { ...p.contexte, ...a.patch } };
      case 'echantillon':
        return {
          ...p,
          echantillons: p.echantillons.includes(a.coloris)
            ? p.echantillons.filter((c) => c !== a.coloris)
            : [...p.echantillons, a.coloris],
        };
      case 'viderEchantillons':
        return { ...p, echantillons: [] };
      case 'demande':
        return { ...p, demandes: [...p.demandes, a.demande] };
      case 'renommer':
        return { ...p, nom: a.nom };
    }
  })();
  return suite === p ? p : { ...suite, modifieLe: new Date().toISOString() };
}

export function creerProjet(partiel: Partial<Projet> = {}, ouverture?: Partial<Ouverture>): Projet {
  const o = nouvelleOuverture(ouverture);
  const maintenant = new Date().toISOString();
  return {
    id: nouvelIdProjet(),
    nom: 'Mon projet menuiserie',
    creeLe: maintenant,
    modifieLe: maintenant,
    pointEntree: 'produit',
    besoins: [],
    contexte: {},
    ouvertures: [o],
    ouvertureActive: o.id,
    echantillons: [],
    demandes: [],
    ...partiel,
  };
}

interface ContexteValeur {
  projet: Projet | null;
  ouverture: Ouverture | null;
  sauvegardeOk: boolean;
  charger: (p: Projet | null) => void;
  chargerParId: (id: string) => boolean;
  majOuverture: (patch: Partial<Ouverture>, id?: string) => void;
  changerFamille: (famille: string) => void;
  ajouterOuverture: (partiel?: Partial<Ouverture>) => void;
  dupliquer: (id: string) => void;
  supprimer: (id: string) => void;
  activer: (id: string) => void;
  appliquerColorisATous: (coloris: string) => number;
  majContexte: (patch: Partial<ContexteLogement>) => void;
  basculerEchantillon: (coloris: string) => void;
  viderEchantillons: () => void;
  ajouterDemande: (d: Omit<Demande, 'date'>) => void;
  renommer: (nom: string) => void;
}

const Ctx = createContext<ContexteValeur | null>(null);

export function ProjetProvider({ children }: { children: ReactNode }) {
  const [projet, dispatch] = useReducer(reducer, null);
  const [sauvegardeOk, setSauvegardeOk] = useState(true);

  // Sauvegarde automatique à chaque modification.
  useEffect(() => {
    if (projet) setSauvegardeOk(sauverProjet(projet));
  }, [projet]);

  const ouverture = projet?.ouvertures.find((o) => o.id === projet.ouvertureActive) ?? projet?.ouvertures[0] ?? null;

  const charger = useCallback((p: Projet | null) => dispatch({ type: 'charger', projet: p }), []);
  const chargerParId = useCallback((id: string) => {
    const p = chargerProjet(id);
    if (p) dispatch({ type: 'charger', projet: p });
    return Boolean(p);
  }, []);

  const valeur = useMemo<ContexteValeur>(
    () => ({
      projet,
      ouverture,
      sauvegardeOk,
      charger,
      chargerParId,
      majOuverture: (patch, id) => ouverture && dispatch({ type: 'majOuverture', id: id ?? ouverture.id, patch }),
      changerFamille: (famille) => ouverture && dispatch({ type: 'changerFamille', id: ouverture.id, famille }),
      ajouterOuverture: (partiel) => {
        const n = (projet?.ouvertures.length ?? 0) + 1;
        const o = nouvelleOuverture({ ...partiel });
        dispatch({ type: 'ajouterOuverture', ouverture: { ...o, libelle: `${o.libelle} ${n}` } });
      },
      dupliquer: (id) => {
        const src = projet?.ouvertures.find((o) => o.id === id);
        if (src) dispatch({ type: 'dupliquer', id, copie: { ...src, options: { ...src.options }, id: nouvelIdOuverture(), libelle: `${src.libelle} (copie)` } });
      },
      supprimer: (id) => dispatch({ type: 'supprimer', id }),
      activer: (id) => dispatch({ type: 'activer', id }),
      appliquerColorisATous: (c) => {
        dispatch({ type: 'appliquerColoris', coloris: c });
        return projet?.ouvertures.filter((o) => colorisPour(o).includes(c) && o.coloris !== c).length ?? 0;
      },
      majContexte: (patch) => dispatch({ type: 'contexte', patch }),
      basculerEchantillon: (c) => dispatch({ type: 'echantillon', coloris: getColoris(c).id }),
      viderEchantillons: () => dispatch({ type: 'viderEchantillons' }),
      ajouterDemande: (d) => dispatch({ type: 'demande', demande: { ...d, date: new Date().toISOString() } }),
      renommer: (nom) => dispatch({ type: 'renommer', nom }),
    }),
    [projet, ouverture, sauvegardeOk, charger, chargerParId],
  );

  return <Ctx.Provider value={valeur}>{children}</Ctx.Provider>;
}

export function useProjet() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProjet doit être utilisé dans ProjetProvider');
  return v;
}
