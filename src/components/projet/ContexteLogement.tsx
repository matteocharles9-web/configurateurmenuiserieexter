import { catalogue, type Teinte } from '../../data/types';
import { alertes } from '../../lib/reglementaire';
import { useProjet } from '../../state/ProjetContext';
import { ChoixSegmente } from '../ui/Choix';
import { Liste } from '../ui/Champ';
import { AlertesReglementaires } from './AlerteReglementaire';

const ouiNon = [
  { v: 'oui', l: 'Oui' },
  { v: 'non', l: 'Non' },
] as const;

/* Questions simples sur le logement → alertes réglementaires (copropriété, secteur protégé, aspect de façade). */
export function ContexteLogement() {
  const { projet, majContexte } = useProjet();
  if (!projet) return null;
  const c = projet.contexte;
  const liste = alertes(c, projet.ouvertures);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <ChoixSegmente
          legende="Votre logement est-il en copropriété ?"
          nom="copro"
          valeur={c.copropriete === undefined ? undefined : c.copropriete ? 'oui' : 'non'}
          options={[...ouiNon]}
          onChange={(v) => majContexte({ copropriete: v === 'oui' })}
        />
        <ChoixSegmente
          legende="Est-il en secteur protégé (près d'un monument historique, centre ancien) ?"
          nom="secteur"
          valeur={c.secteurProtege}
          options={[...ouiNon, { v: 'inconnu', l: 'Je ne sais pas' }]}
          onChange={(v) => majContexte({ secteurProtege: v })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Liste
          libelle="Matériau de vos menuiseries actuelles"
          value={c.aspectActuel?.materiau ?? ''}
          onChange={(e) => majContexte({ aspectActuel: { ...c.aspectActuel, materiau: e.target.value || undefined } })}
        >
          <option value="">Non renseigné</option>
          {catalogue.materiaux.map((m) => (
            <option key={m.id} value={m.id}>
              {m.libelle}
            </option>
          ))}
          <option value="inconnu">Je ne sais pas</option>
        </Liste>
        <Liste
          libelle="Couleur actuelle"
          value={c.aspectActuel?.teinte ?? ''}
          onChange={(e) => majContexte({ aspectActuel: { ...c.aspectActuel, teinte: (e.target.value || undefined) as Teinte | undefined } })}
        >
          <option value="">Non renseignée</option>
          <option value="blanc">Blanc ou clair</option>
          <option value="fonce">Gris foncé ou noir</option>
          <option value="couleur">Une couleur (bleu, vert, rouge…)</option>
          <option value="bois">Aspect bois</option>
        </Liste>
      </div>
      <label className="flex cursor-pointer items-center gap-3">
        <input type="checkbox" className="size-5 accent-bleu" checked={Boolean(c.changementForme)} onChange={(e) => majContexte({ changementForme: e.target.checked })} />
        <span>Je change aussi la forme ou la taille de l'ouverture (agrandissement, nouveau découpage…)</span>
      </label>
      <AlertesReglementaires alertes={liste} />
    </div>
  );
}
