import { catalogue, type GroupeOptions } from '../../data/types';
import { groupesOptions } from '../../lib/catalogue';
import { useProjet } from '../../state/ProjetContext';
import { Performances } from '../projet/Performances';
import { Badge } from '../ui/Carte';
import { CarteChoix, GroupeChoix } from '../ui/Choix';

const prixOption = (p: number) => (p > 0 ? <Badge ton="gris">option</Badge> : undefined);

export function EtapeOptions() {
  const { ouverture: o, majOuverture } = useProjet();
  if (!o) return null;

  const choisir = (g: GroupeOptions, id: string) => {
    const v = o.options[g.id];
    if (g.type === 'unique') return majOuverture({ options: { ...o.options, [g.id]: id } });
    const liste = Array.isArray(v) ? v : [];
    majOuverture({ options: { ...o.options, [g.id]: liste.includes(id) ? liste.filter((x) => x !== id) : [...liste, id] } });
  };
  const estCoche = (g: GroupeOptions, id: string) => {
    const v = o.options[g.id];
    return Array.isArray(v) ? v.includes(id) : v === id;
  };

  return (
    <div className="space-y-8">
      {groupesOptions(o).map((g) => (
        <GroupeChoix key={g.id} legende={g.libelle} aide={g.aide}>
          {g.choix.map((c) => (
            <CarteChoix
              key={c.id}
              compact
              multiple={g.type === 'multiple'}
              nom={`opt-${g.id}`}
              valeur={c.id}
              coche={estCoche(g, c.id)}
              onChange={() => choisir(g, c.id)}
              titre={c.libelle}
              description={c.description}
              badge={c.motorise ? <Badge ton="bleu">Motorisé</Badge> : prixOption(c.prixFictif)}
            />
          ))}
        </GroupeChoix>
      ))}

      <GroupeChoix legende="Type de pose" aide="Votre conseiller confirmera la pose la plus adaptée lors du métrage.">
        {catalogue.pose.types.map((p) => (
          <CarteChoix key={p.id} nom="pose" valeur={p.id} coche={o.pose === p.id} onChange={() => majOuverture({ pose: p.id })} titre={p.libelle} description={p.description} />
        ))}
      </GroupeChoix>

      <GroupeChoix legende="Vos anciennes menuiseries" colonnes="">
        <CarteChoix
          multiple
          compact
          nom="reprise"
          valeur="reprise"
          coche={o.repriseAnciennes}
          onChange={() => majOuverture({ repriseAnciennes: !o.repriseAnciennes })}
          titre={catalogue.pose.reprise.libelle}
          description={catalogue.pose.reprise.description}
        />
      </GroupeChoix>

      <section aria-labelledby="titre-perf-opt">
        <h3 id="titre-perf-opt" className="mb-3 text-base font-semibold">
          Vos bénéfices avec ces options
        </h3>
        <Performances ouverture={o} compact />
      </section>
    </div>
  );
}
