import { catalogue } from '../data/types';
import { materiauxDisponibles, materiau } from '../lib/catalogue';
import { RenduMenuiserie } from '../components/apercu/RenduMenuiserie';

/* Page interne (non liée) : tous les modèles du catalogue, pour relire les rendus. Accès : #/galerie */
export function PageGalerie() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 pt-6">
      <h1 className="text-2xl font-semibold">Galerie des rendus du catalogue</h1>
      {catalogue.familles.map((f) => (
        <section key={f.id}>
          <h2 className="mb-3 text-lg font-semibold">{f.libelle}</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {f.modeles.map((m, i) => {
              const mat = materiauxDisponibles(f.id, m.id)[i % materiauxDisponibles(f.id, m.id).length];
              const col = materiau(mat).coloris[(i * 2) % materiau(mat).coloris.length];
              return (
                <li key={m.id} className="rounded-xl bg-white p-2 text-center text-xs ring-1 ring-bord">
                  <RenduMenuiserie famille={f.id} modele={m.id} materiau={mat} coloris={col} avecMur className="h-36 w-full" />
                  <p className="mt-1 font-bold text-marine">{m.libelle}</p>
                  <p>
                    {materiau(mat).libelle} · {col}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
