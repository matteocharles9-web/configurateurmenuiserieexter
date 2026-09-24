import { memo, useEffect, useRef, type KeyboardEvent } from 'react';
import type { Ouverture } from '../../data/types';
import { RenduMenuiserie } from '../apercu/RenduMenuiserie';
import { cadrage, EMPLACEMENTS, SCENE, type Emplacement } from './scene';

/*
 * Maison type avec toutes les menuiseries extérieures.
 * Un clic (ou Entrée) sur un élément déclenche un zoom animé sur celui-ci.
 * Les éléments déjà présents dans le projet reprennent les choix du client (modèle, matériau, coloris).
 */

const DUREE = 750;
const adoucir = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

interface Props {
  focus: string | null;
  survol: string | null;
  onSurvol: (f: string | null) => void;
  onChoisir: (f: string) => void;
  onZoomTermine?: () => void;
  ouvertures: Ouverture[];
}

/** Décor (ciel, murs, toit, clôture) : ne dépend de rien, rendu une seule fois. */
const Decor = memo(function Decor() {
  return (
    <g>
      <defs>
        <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#CFE3F5" />
          <stop offset="1" stopColor="#EEF5FB" />
        </linearGradient>
        <pattern id="tuiles-maison" width="22" height="14" patternUnits="userSpaceOnUse">
          <rect width="22" height="14" fill="#B4553A" />
          <path d="M0 13 Q5.5 6 11 13 Q16.5 6 22 13" fill="none" stroke="#8E3F2A" strokeWidth="1.2" />
        </pattern>
        <pattern id="crepi" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="#F3EBDD" />
          <circle cx="4" cy="5" r="0.8" fill="#E6DCC9" />
          <circle cx="12" cy="11" r="0.8" fill="#E6DCC9" />
        </pattern>
      </defs>
      <rect width={SCENE.w} height={SCENE.h} fill="url(#ciel)" />
      <circle cx="860" cy="90" r="38" fill="#FBE7A1" />
      {/* sol, allée, entrée de garage */}
      <rect y="515" width={SCENE.w} height="125" fill="#A9C27F" />
      <path d="M365 520 L395 520 L412 640 L350 640 Z" fill="#D8CFC0" />
      <path d="M705 520 L870 520 L905 640 L680 640 Z" fill="#C9C3B8" />
      {/* garage */}
      <rect x="688" y="340" width="245" height="180" fill="url(#crepi)" stroke="#D9CDB8" />
      <path d="M676 342 L945 342 L935 322 L688 322 Z" fill="#6B4E3D" />
      {/* maison */}
      <rect x="168" y="250" width="522" height="270" fill="url(#crepi)" stroke="#D9CDB8" />
      <rect x="168" y="382" width="522" height="6" fill="#E3D8C4" />
      <path d="M138 256 L300 110 L560 110 L720 256 Z" fill="url(#tuiles-maison)" stroke="#7A3524" strokeWidth="2" />
      <rect x="505" y="80" width="34" height="48" fill="#9C8B7C" />
      <rect x="500" y="76" width="44" height="8" fill="#7E6F62" />
      {/* fenêtre de toit décorative et fenêtre d'étage avec volets battants ouverts */}
      <g opacity="0.95">
        <rect x="178" y="275" width="26" height="96" fill="#2F4A63" />
        <rect x="296" y="275" width="26" height="96" fill="#2F4A63" />
      </g>
      {/* marquise de la porte */}
      <path d="M340 392 L430 392 L420 380 L350 380 Z" fill="#555B62" />
      {/* balcon de la porte-fenêtre */}
      <g stroke="#3E4349" strokeWidth="2">
        <line x1="386" y1="352" x2="478" y2="352" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={388 + i * 8} y1="352" x2={388 + i * 8} y2="381" />)}
      </g>
      {/* clôture : muret et piliers */}
      <rect x="0" y="600" width="352" height="24" fill="#D9D2C5" stroke="#B5AD9F" />
      <rect x="408" y="600" width="294" height="24" fill="#D9D2C5" stroke="#B5AD9F" />
      <rect x="878" y="600" width="122" height="24" fill="#D9D2C5" stroke="#B5AD9F" />
      {[338, 408, 688, 878].map((x) => <rect key={x} x={x} y="540" width="14" height="86" fill="#CFC7B8" stroke="#B5AD9F" />)}
      {/* haie */}
      <path d="M0 600 Q20 575 40 600 Q60 575 80 600 Q100 575 120 600 Q140 575 160 600 Q180 575 200 600 Q220 575 240 600 Q260 575 280 600 Q300 575 320 600 L338 600" fill="#6F9A52" />
    </g>
  );
});

/** Fenêtre d'étage décorative (non cliquable) à côté des volets battants. */
const FenetreEtage = memo(function FenetreEtage() {
  return <RenduMenuiserie decoratif famille="fenetre" modele="battant-2" materiau="pvc" coloris="blanc" largeurCm={140} hauteurCm={150} position={{ x: 205, y: 275, width: 90, height: 96 }} />;
});

function Element({ e, ouvertures }: { e: Emplacement; ouvertures: Ouverture[] }) {
  const o = ouvertures.find((x) => x.famille === e.famille);
  const k = 1.6; // unités de scène → centimètres approximatifs
  return (
    <RenduMenuiserie
      decoratif
      famille={e.famille}
      modele={o?.modele ?? e.defaut.modele}
      materiau={o?.materiau ?? e.defaut.materiau}
      coloris={o?.coloris ?? e.defaut.coloris}
      options={o?.options ?? e.defaut.options}
      largeurCm={e.w * k}
      hauteurCm={e.h * k}
      position={{ x: e.x, y: e.y, width: e.w, height: e.h }}
    />
  );
}

export function MaisonInteractive({ focus, survol, onSurvol, onChoisir, onZoomTermine, ouvertures }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const courant = useRef<[number, number, number, number]>(cadrage(null));
  const familles = new Set(ouvertures.map((o) => o.famille));

  // Zoom animé : on interpole le viewBox directement sur le DOM (pas de re-rendu React à chaque image).
  useEffect(() => {
    const cible = cadrage(EMPLACEMENTS.find((e) => e.famille === focus) ?? null);
    const depart = courant.current;
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let image = 0;
    const t0 = performance.now();
    const pas = (t: number) => {
      const p = reduit ? 1 : Math.min(1, (t - t0) / DUREE);
      const v = depart.map((d, i) => d + (cible[i] - d) * adoucir(p)) as [number, number, number, number];
      courant.current = v;
      svg.current?.setAttribute('viewBox', v.join(' '));
      if (p < 1) image = requestAnimationFrame(pas);
      else if (focus) onZoomTermine?.();
    };
    image = requestAnimationFrame(pas);
    return () => cancelAnimationFrame(image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus]);

  const clavier = (f: string) => (ev: KeyboardEvent) => {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      onChoisir(f);
    }
  };

  return (
    <svg ref={svg} viewBox={courant.current.join(' ')} className="block h-auto w-full" role="group" aria-label="Maison avec ses menuiseries extérieures. Choisissez un élément à changer.">
      <Decor />
      <FenetreEtage />
      {EMPLACEMENTS.map((e) => (
        <Element key={e.famille} e={e} ouvertures={ouvertures} />
      ))}

      {/* surlignage de l'élément survolé ou choisi */}
      {EMPLACEMENTS.filter((e) => e.famille === (focus ?? survol)).map((e) => (
        <rect key={`s-${e.famille}`} x={e.x - 5} y={e.y - 5} width={e.w + 10} height={e.h + 10} rx={6} fill="none" stroke="#F7CE1A" strokeWidth={focus ? 3 : 4} strokeDasharray={focus ? undefined : '10 6'} pointerEvents="none" />
      ))}

      {/* points cliquables (masqués pendant le zoom) */}
      {!focus &&
        EMPLACEMENTS.map((e) => {
          const cx = e.x + e.w / 2;
          const cy = e.y + e.h / 2;
          const dansProjet = familles.has(e.famille);
          const actif = survol === e.famille;
          return (
            <g
              key={`h-${e.famille}`}
              className="hotspot"
              role="button"
              tabIndex={0}
              aria-label={`${e.libelle}${dansProjet ? ' (dans votre projet)' : ''}`}
              onClick={() => onChoisir(e.famille)}
              onKeyDown={clavier(e.famille)}
              onMouseEnter={() => onSurvol(e.famille)}
              onMouseLeave={() => onSurvol(null)}
              onFocus={() => onSurvol(e.famille)}
              onBlur={() => onSurvol(null)}
            >
              {/* zone de clic généreuse : tout l'élément */}
              <rect x={e.x} y={e.y} width={e.w} height={e.h} fill="transparent" />
              <circle className="onde" cx={cx} cy={cy} r={15} fill="#F7CE1A" />
              <circle className="anneau pastille" cx={cx} cy={cy} r={15} fill="#FFFFFF" stroke="#0B2E6F" strokeWidth={3} />
              {dansProjet ? (
                <path d={`M${cx - 6} ${cy} l4 4 l8 -9`} fill="none" stroke="#1D7A46" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" pointerEvents="none" />
              ) : (
                <path d={`M${cx - 7} ${cy} h14 M${cx} ${cy - 7} v14`} stroke="#0B2E6F" strokeWidth={3.5} strokeLinecap="round" pointerEvents="none" />
              )}
              {actif && (
                <g pointerEvents="none">
                  <rect x={cx - e.libelle.length * 4.6 - 12} y={cy - 52} width={e.libelle.length * 9.2 + 24} height={28} rx={14} fill="#0B2E6F" />
                  <text x={cx} y={cy - 33} textAnchor="middle" fontSize="15" fontWeight="700" fill="#FFFFFF" fontFamily="Nunito Sans, sans-serif">
                    {e.libelle}
                  </text>
                </g>
              )}
            </g>
          );
        })}
    </svg>
  );
}
