import { catalogue, type ContexteLogement, type Ouverture, type Regle } from '../data/types';
import { coloris, typePose } from './catalogue';

/** Vrai si le projet change l'aspect de la façade (matériau, teinte ou forme). */
export function changementAspect(ctx: ContexteLogement, ouvertures: Ouverture[]): boolean {
  if (ctx.changementForme) return true;
  const actuel = ctx.aspectActuel;
  if (!actuel) return false;
  return ouvertures.some((o) => {
    if (!typePose(o.pose).remplacement) return false;
    // Les « teintes » claires et blanches sont considérées comme équivalentes à distance.
    const famille = (t?: string) => (t === 'clair' ? 'blanc' : t);
    const matChange = actuel.materiau && actuel.materiau !== 'inconnu' && actuel.materiau !== o.materiau;
    const teinteChange = actuel.teinte && famille(actuel.teinte) !== famille(coloris(o.coloris).teinte);
    return Boolean(matChange || teinteChange);
  });
}

export function alertes(ctx: ContexteLogement, ouvertures: Ouverture[]): Regle[] {
  const conditions: Record<Regle['condition'], boolean> = {
    copropriete: Boolean(ctx.copropriete),
    secteurProtege: ctx.secteurProtege === 'oui',
    secteurProtegeInconnu: ctx.secteurProtege === 'inconnu',
    changementAspect: changementAspect(ctx, ouvertures),
    portailOuCloture: ouvertures.some((o) => o.famille === 'portail' || o.famille === 'portillon'),
    // Création d'une ouverture dans le toit (une construction neuve relève déjà du permis).
    creationOuverture: ouvertures.some((o) => o.pose === 'toit_creation'),
  };
  return catalogue.reglementaire.regles.filter((r) => conditions[r.condition]);
}
