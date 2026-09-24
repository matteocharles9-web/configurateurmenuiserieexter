import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Icone } from './Icone';

type Variante = 'primaire' | 'secondaire' | 'jaune' | 'discret' | 'danger';

const STYLES: Record<Variante, string> = {
  primaire: 'bg-bleu text-white hover:bg-marine border-bleu hover:border-marine',
  secondaire: 'bg-white text-bleu border-bleu hover:bg-bleu-clair',
  jaune: 'bg-jaune text-marine border-jaune hover:brightness-95',
  discret: 'bg-transparent text-bleu border-transparent hover:bg-bleu-clair',
  danger: 'bg-white text-red-700 border-red-200 hover:bg-red-50',
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  icone?: string;
  iconeDroite?: string;
  taille?: 'normal' | 'petit';
  pleineLargeur?: boolean;
  children?: ReactNode;
}

export function classesBouton({ variante = 'primaire', taille = 'normal', pleineLargeur = false }: Pick<Props, 'variante' | 'taille' | 'pleineLargeur'> = {}) {
  return [
    'inline-flex items-center justify-center gap-2 rounded-full border-2 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
    taille === 'petit' ? 'px-3 py-1.5 text-sm min-h-9' : 'px-5 py-2.5 min-h-11',
    pleineLargeur ? 'w-full' : '',
    STYLES[variante],
  ].join(' ');
}

export function Bouton({ variante, icone, iconeDroite, taille, pleineLargeur, className = '', children, type = 'button', ...rest }: Props) {
  return (
    <button type={type} className={`${classesBouton({ variante, taille, pleineLargeur })} ${className}`} {...rest}>
      {icone && <Icone nom={icone} className={taille === 'petit' ? 'size-4' : 'size-5'} />}
      {children}
      {iconeDroite && <Icone nom={iconeDroite} className={taille === 'petit' ? 'size-4' : 'size-5'} />}
    </button>
  );
}
