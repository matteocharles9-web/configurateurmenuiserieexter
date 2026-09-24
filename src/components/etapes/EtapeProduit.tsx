import { catalogue } from '../../data/types';
import { famille as getFamille } from '../../lib/catalogue';
import { useProjet } from '../../state/ProjetContext';
import { RenduMenuiserie } from '../apercu/RenduMenuiserie';
import { Badge } from '../ui/Carte';
import { Champ } from '../ui/Champ';
import { CarteChoix, GroupeChoix } from '../ui/Choix';

export function EtapeProduit() {
  const { ouverture: o, majOuverture, changerFamille } = useProjet();
  if (!o) return null;
  const fam = getFamille(o.famille);

  return (
    <div className="space-y-8">
      <Champ
        libelle="Nom de cette ouverture"
        aide="Pour vous repérer si votre projet en compte plusieurs (ex. « Fenêtre cuisine »)."
        value={o.libelle}
        maxLength={40}
        onChange={(e) => majOuverture({ libelle: e.target.value })}
      />

      <GroupeChoix legende="Quel produit souhaitez-vous remplacer ou installer ?" colonnes="grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
        {catalogue.familles.map((f) => (
          <CarteChoix
            key={f.id}
            nom="famille"
            valeur={f.id}
            coche={o.famille === f.id}
            onChange={() => changerFamille(f.id)}
            titre={f.libelle}
            description={f.accroche}
            visuel={
              <RenduMenuiserie
                decoratif
                famille={f.id}
                modele={f.modeles[0].id}
                materiau={f.modeles[0].materiaux?.[0] ?? f.materiaux[0]}
                coloris="blanc"
                className="h-20 w-full max-w-28"
              />
            }
          />
        ))}
      </GroupeChoix>

      <GroupeChoix legende={`Quel modèle de ${fam.libelle.toLowerCase()} ?`}>
        {fam.modeles.map((m) => (
          <CarteChoix
            key={m.id}
            compact
            nom="modele"
            valeur={m.id}
            coche={o.modele === m.id}
            onChange={() => majOuverture({ modele: m.id })}
            titre={m.libelle}
            description={m.description}
            visuel={<RenduMenuiserie decoratif famille={fam.id} modele={m.id} materiau={o.materiau} coloris={o.coloris} className="h-16 w-16" />}
          />
        ))}
      </GroupeChoix>

      <GroupeChoix legende="Quelle gamme ?" aide="La gamme joue sur les finitions et le niveau de confort." colonnes="sm:grid-cols-3">
        {catalogue.gammes.map((g) => (
          <CarteChoix
            key={g.id}
            nom="gamme"
            valeur={g.id}
            coche={o.gamme === g.id}
            onChange={() => majOuverture({ gamme: g.id })}
            titre={g.libelle}
            description={g.description}
            badge={g.conseille ? <Badge>Le plus choisi</Badge> : undefined}
          />
        ))}
      </GroupeChoix>
    </div>
  );
}
