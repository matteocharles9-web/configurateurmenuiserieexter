import type { ReactNode } from 'react';
import { Icone } from './Icone';

/*
 * Cartes de choix construites sur de vrais <input type="radio|checkbox"> :
 * navigation au clavier (flèches, espace) et lecteurs d'écran fonctionnent nativement.
 */
interface CarteChoixProps {
  nom: string;
  valeur: string;
  coche: boolean;
  onChange: () => void;
  titre: ReactNode;
  description?: ReactNode;
  visuel?: ReactNode;
  badge?: ReactNode;
  multiple?: boolean;
  compact?: boolean;
}

export function CarteChoix({ nom, valeur, coche, onChange, titre, description, visuel, badge, multiple, compact }: CarteChoixProps) {
  return (
    <label
      className={`relative flex cursor-pointer gap-3 rounded-xl border-2 bg-white transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bleu ${
        compact ? 'items-center p-3' : 'flex-col p-3 sm:p-4'
      } ${coche ? 'border-bleu bg-bleu-clair/60' : 'border-bord hover:border-bleu/60'}`}
    >
      <input type={multiple ? 'checkbox' : 'radio'} name={nom} value={valeur} checked={coche} onChange={onChange} className="sr-only" />
      {visuel && <span className={compact ? 'shrink-0' : 'flex justify-center'}>{visuel}</span>}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-2 font-bold text-marine">
          {titre}
          {badge}
        </span>
        {description && <span className="text-sm">{description}</span>}
      </span>
      <span
        aria-hidden
        className={`absolute top-2 right-2 grid size-6 place-items-center ${multiple ? 'rounded-md' : 'rounded-full'} border-2 ${
          coche ? 'border-bleu bg-bleu text-white' : 'border-bord bg-white'
        }`}
      >
        {coche && <Icone nom="ok" className="size-4" />}
      </span>
    </label>
  );
}

export function GroupeChoix({ legende, aide, children, colonnes = 'sm:grid-cols-2' }: { legende: ReactNode; aide?: ReactNode; children: ReactNode; colonnes?: string }) {
  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 font-titre text-base font-semibold text-marine">{legende}</legend>
      {aide && <p className="mb-2 text-sm">{aide}</p>}
      <div className={`mt-2 grid grid-cols-1 gap-3 ${colonnes}`}>{children}</div>
    </fieldset>
  );
}

/** Choix oui / non / je ne sais pas, en boutons radio segmentés. */
export function ChoixSegmente<T extends string>({ legende, nom, valeur, options, onChange }: { legende: ReactNode; nom: string; valeur: T | undefined; options: { v: T; l: string }[]; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-marine">{legende}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.v}
            className={`cursor-pointer rounded-full border-2 px-4 py-2 text-sm font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-bleu ${
              valeur === o.v ? 'border-bleu bg-bleu text-white' : 'border-bord bg-white text-marine hover:border-bleu'
            }`}
          >
            <input type="radio" name={nom} value={o.v} checked={valeur === o.v} onChange={() => onChange(o.v)} className="sr-only" />
            {o.l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
