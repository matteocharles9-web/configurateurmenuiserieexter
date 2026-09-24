import { naviguer } from '../../router';
import { Icone } from '../ui/Icone';

/*
 * En-tête dans l'esprit du site marchand, pour montrer le configurateur « en situation ».
 * Les éléments du site (recherche, compte, panier) sont purement décoratifs dans le prototype.
 * Pas de logo officiel : un logotype texte.
 */
export function EnTete() {
  return (
    <header className="bg-marine text-white">
      <BandeauPrototype />
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6">
        <span aria-hidden className="text-white/80 lg:hidden">
          <Icone nom="menu" className="size-6" />
        </span>
        <a href="#/" className="flex items-center gap-2 rounded" aria-label="Accueil du configurateur">
          <span aria-hidden className="grid size-8 place-items-center rounded-md bg-jaune text-marine">
            <Icone nom="maison" className="size-5" />
          </span>
          <span className="font-titre text-xl font-bold tracking-tight sm:text-2xl">Castorama</span>
        </a>
        <div aria-hidden className="hidden flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 text-slate-500 md:flex">
          <Icone nom="recherche" className="size-5 text-marine" />
          <span className="text-sm">Rechercher un produit, une marque, un conseil…</span>
        </div>
        <div aria-hidden className="ml-auto flex items-center gap-4 text-xs sm:gap-6">
          <span className="hidden flex-col items-center sm:flex">
            <Icone nom="magasin" className="size-6" />
            Mon magasin
          </span>
          <span className="flex flex-col items-center">
            <Icone nom="utilisateur" className="size-6" />
            <span className="hidden sm:inline">Mon compte</span>
          </span>
          <span className="flex flex-col items-center">
            <Icone nom="panier" className="size-6" />
            <span className="hidden sm:inline">Panier</span>
          </span>
        </div>
      </div>
      <nav aria-label="Rayons (décoratif)" className="hidden border-t border-white/15 bg-marine-fonce lg:block">
        <ul aria-hidden className="mx-auto flex max-w-7xl gap-6 px-4 py-2 text-sm font-semibold text-white/85">
          {['Menuiserie', 'Fenêtres', 'Portes', 'Volets', 'Portes de garage', 'Jardin', 'Salle de bains', 'Cuisine', 'Idées & conseils'].map((r) => (
            <li key={r} className={r === 'Menuiserie' ? 'text-jaune' : ''}>
              {r}
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

export function BandeauPrototype() {
  return (
    <p className="bg-jaune px-4 py-1.5 text-center text-xs font-bold text-marine sm:text-sm">
      Prototype interne – maquette non contractuelle, prix et données fictifs. Ce site n'est pas castorama.fr.
    </p>
  );
}

export function FilAriane({ elements }: { elements: { libelle: string; lien?: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="mx-auto max-w-7xl px-4 pt-3 text-sm">
      <ol className="flex flex-wrap items-center gap-1">
        {elements.map((e, i) => (
          <li key={e.libelle} className="flex items-center gap-1">
            {i > 0 && <Icone nom="droite" className="size-3.5" />}
            {e.lien ? (
              <a href={e.lien} className="underline-offset-2 hover:underline">
                {e.libelle}
              </a>
            ) : (
              <span aria-current="page" className="font-bold text-marine">
                {e.libelle}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PiedPage() {
  return (
    <footer className="mt-16 bg-marine pb-28 text-white/85 lg:pb-8">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
        <div>
          <p className="font-titre text-lg font-bold text-white">Menuiserie extérieure</p>
          <p>Configurateur en ligne – prototype de démonstration.</p>
        </div>
        <div>
          <p className="font-bold text-white">Besoin d'aide ?</p>
          <p>Minute'pass menuiserie : rendez-vous en magasin, par téléphone ou en visio.</p>
        </div>
        <div>
          <p className="font-bold text-white">À propos de ce prototype</p>
          <p>Aucune donnée n'est envoyée : le projet est enregistré uniquement dans votre navigateur.</p>
          <button type="button" onClick={() => naviguer('/reprendre')} className="mt-2 underline">
            Reprendre un projet
          </button>
        </div>
      </div>
    </footer>
  );
}
