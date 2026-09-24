import { enMinuscules, gamme as getGamme, materiau as getMateriau, materiauxDisponibles, materiauxPour } from '../../lib/catalogue';
import { LimiteStandard } from './EtapeSolution';
import { useProjet } from '../../state/ProjetContext';
import { Performances } from '../projet/Performances';
import { CarteChoix, GroupeChoix } from '../ui/Choix';

export function EtapeMateriau() {
  const { ouverture: o, majOuverture } = useProjet();
  if (!o) return null;
  const dispo = materiauxPour(o).map(getMateriau);
  const limite = materiauxPour(o).length < materiauxDisponibles(o.famille, o.modele).length;

  return (
    <div className="space-y-8">
      {limite && <LimiteStandard quoi="matériaux" />}
      <GroupeChoix legende="Quel matériau ?" aide="Chaque matériau a ses atouts : voici ce qu'ils changent au quotidien.">
        {dispo.map((m) => (
          <CarteChoix
            key={m.id}
            nom="materiau"
            valeur={m.id}
            coche={o.materiau === m.id}
            onChange={() => majOuverture({ materiau: m.id })}
            titre={m.libelle}
            description={
              <>
                <span className="block">{m.resume}</span>
                <span className="mt-2 block space-y-1">
                  {m.points.map((p) => (
                    <span key={p} className="flex gap-2">
                      <span aria-hidden className="text-bleu">•</span>
                      {p}
                    </span>
                  ))}
                </span>
              </>
            }
          />
        ))}
      </GroupeChoix>

      <section aria-labelledby="titre-perf">
        <h3 id="titre-perf" className="mb-3 text-base font-semibold">
          Ce que vous gagnez avec {enMinuscules(getMateriau(o.materiau).libelle)} en gamme {getGamme(o.gamme).libelle}
        </h3>
        <Performances ouverture={o} />
      </section>
    </div>
  );
}
