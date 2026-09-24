import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

const base = 'w-full rounded-lg border-2 border-bord bg-white px-3 py-2.5 text-texte placeholder:text-slate-500 focus:border-bleu focus:outline-none';

interface ChampProps extends InputHTMLAttributes<HTMLInputElement> {
  libelle: ReactNode;
  aide?: ReactNode;
  erreur?: string;
}

export function Champ({ libelle, aide, erreur, className = '', ...rest }: ChampProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-marine">
        {libelle}
        {rest.required && <span aria-hidden> *</span>}
      </label>
      <input id={id} className={`${base} ${erreur ? 'border-red-600' : ''}`} aria-invalid={Boolean(erreur)} aria-describedby={aide || erreur ? `${id}-aide` : undefined} {...rest} />
      {(aide || erreur) && (
        <p id={`${id}-aide`} className={`mt-1 text-sm ${erreur ? 'font-bold text-red-700' : ''}`}>
          {erreur ?? aide}
        </p>
      )}
    </div>
  );
}

export function Zone({ libelle, className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & { libelle: ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-marine">
        {libelle}
      </label>
      <textarea id={id} className={`${base} min-h-24`} {...rest} />
    </div>
  );
}

export function Liste({ libelle, children, className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { libelle: ReactNode }) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-bold text-marine">
        {libelle}
      </label>
      <select id={id} className={base} {...rest}>
        {children}
      </select>
    </div>
  );
}
