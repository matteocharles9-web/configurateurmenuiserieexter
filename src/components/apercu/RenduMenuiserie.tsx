import { useId, type ReactNode } from 'react';
import type { Ouverture } from '../../data/types';
import { coloris as getColoris, famille as getFamille, materiau as getMateriau, modele as getModele } from '../../lib/catalogue';

/*
 * Rendu SVG simplifié d'une menuiserie, en centimètres.
 * Il change selon le produit, le modèle, le matériau (épaisseur des profils),
 * le coloris (teinte, veinage bois) et certaines options (volet intégré, croisillons, hublots…).
 */

type Props = Pick<Ouverture, 'famille' | 'modele' | 'materiau' | 'coloris'> &
  Partial<Pick<Ouverture, 'options' | 'largeurCm' | 'hauteurCm'>> & {
    avecMur?: boolean;
    className?: string;
    decoratif?: boolean;
    /** Placement quand le rendu est imbriqué dans un autre SVG (illustration de la maison). */
    position?: { x: number; y: number; width: number; height: number };
  };

function nuance(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(Math.min(255, Math.max(0, k < 0 ? c * (1 + k) : c + (255 - c) * k)));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f);
  return `rgb(${r} ${g} ${b})`;
}

const a = (v: string | string[] | undefined, id: string) => (Array.isArray(v) ? v.includes(id) : v === id);

export function RenduMenuiserie(props: Props) {
  const { famille, modele, materiau, coloris, options = {}, avecMur = false, className = '', decoratif = false, position } = props;
  const f = getFamille(famille);
  const w = props.largeurCm && props.largeurCm > 0 ? props.largeurCm : f.dimensions.defaut[0];
  const h = props.hauteurCm && props.hauteurCm > 0 ? props.hauteurCm : f.dimensions.defaut[1];
  const col = getColoris(coloris);
  const mat = getMateriau(materiau);
  const t = mat.epaisseurProfil;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const cadre = col.texture === 'bois' ? `url(#bois${uid})` : col.hex;
  const trait = nuance(col.hex, col.teinte === 'fonce' ? 0.35 : -0.35);
  const fin = Math.max(0.6, Math.min(w, h) / 160);
  const verre = `url(#verre${uid})`;
  const poignee = col.teinte === 'fonce' || col.teinte === 'bois' ? '#D9D9D9' : '#8A8F98';

  const avecCoffre =
    (famille === 'volet' && (modele === 'roulant-renovation' || modele === 'bso')) ||
    (['fenetre', 'porte-fenetre', 'baie'].includes(famille) && options['volet-integre'] && options['volet-integre'] !== 'aucun') ||
    (famille === 'porte-garage' && modele === 'enroulable') ||
    (famille === 'fenetre-toit' && options['occultation-toit'] === 'volet-solaire');
  const coffre = avecCoffre ? Math.max(16, Math.min(28, h * 0.12)) : 0;
  const m = avecMur ? Math.max(20, Math.max(w, h) * 0.18) : 2;
  const vb = { x: -m, y: -m - coffre, w: w + 2 * m, h: h + coffre + 2 * m };

  /* ---------- primitives ---------- */
  const Vitre = ({ x, y, l, ht }: { x: number; y: number; l: number; ht: number }) => (
    <>
      <rect x={x} y={y} width={l} height={ht} fill={verre} />
      <path d={`M${x + l * 0.15} ${y + ht * 0.35} L${x + l * 0.45} ${y + ht * 0.08} M${x + l * 0.2} ${y + ht * 0.5} L${x + l * 0.6} ${y + ht * 0.14}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={fin * 1.6} />
    </>
  );

  const Croisillons = ({ x, y, l, ht }: { x: number; y: number; l: number; ht: number }) =>
    a(options['aeration'], 'croisillons') ? (
      <g fill={cadre} stroke={trait} strokeWidth={fin * 0.4}>
        <rect x={x + l / 2 - t * 0.25} y={y} width={t * 0.5} height={ht} />
        {[1, 2].map((i) => (
          <rect key={i} x={x} y={y + (ht * i) / 3 - t * 0.25} width={l} height={t * 0.5} />
        ))}
      </g>
    ) : null;

  /** Vantail ouvrant : cadre + vitre + symbole d'ouverture (la pointe indique le côté des paumelles). */
  const Vantail = ({ x, y, l, ht, charniere, oscillo, soubassement }: { x: number; y: number; l: number; ht: number; charniere: 'g' | 'd' | 'b' | 'fixe' | 'coul'; oscillo?: boolean; soubassement?: boolean }) => {
    const e = t * 0.9;
    const gx = x + e, gy = y + e, gl = l - 2 * e;
    const sb = soubassement ? ht * 0.28 : 0;
    const gh = ht - 2 * e - sb;
    const lignes: string[] = [];
    if (charniere === 'g') lignes.push(`M${gx + gl} ${gy} L${gx} ${gy + gh / 2} L${gx + gl} ${gy + gh}`);
    if (charniere === 'd') lignes.push(`M${gx} ${gy} L${gx + gl} ${gy + gh / 2} L${gx} ${gy + gh}`);
    if (charniere === 'b' || oscillo) lignes.push(`M${gx} ${gy} L${gx + gl / 2} ${gy + gh} L${gx + gl} ${gy}`);
    const px = charniere === 'g' ? x + l - e / 2 : charniere === 'd' ? x + e / 2 : x + l / 2;
    return (
      <g>
        <rect x={x} y={y} width={l} height={ht} fill={cadre} stroke={trait} strokeWidth={fin} />
        <Vitre x={gx} y={gy} l={gl} ht={gh} />
        <Croisillons x={gx} y={gy} l={gl} ht={gh} />
        {sb > 0 && <rect x={gx} y={gy + gh + e * 0.5} width={gl} height={sb - e * 0.5} fill={cadre} stroke={trait} strokeWidth={fin * 0.6} />}
        <rect x={gx} y={gy} width={gl} height={gh} fill="none" stroke={trait} strokeWidth={fin * 0.6} />
        {lignes.map((d) => (
          <path key={d} d={d} fill="none" stroke={trait} strokeOpacity={0.6} strokeWidth={fin * 0.7} strokeDasharray={`${fin * 4} ${fin * 3}`} />
        ))}
        {charniere !== 'fixe' && charniere !== 'coul' && (
          charniere === 'b'
            ? <rect x={px - 5} y={y + e * 0.2} width={10} height={e * 0.6} rx={1} fill={poignee} />
            : <rect x={px - e * 0.3} y={y + ht / 2 - 6} width={e * 0.6} height={12} rx={1} fill={poignee} />
        )}
        {charniere === 'coul' && <rect x={x + l - e * 0.7} y={y + ht / 2 - 8} width={e * 0.4} height={16} rx={1} fill={poignee} />}
      </g>
    );
  };

  const Dormant = ({ children }: { children: ReactNode }) => (
    <g>
      <rect x={0} y={0} width={w} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
      {children}
    </g>
  );

  const Fleche = ({ x1, x2, y }: { x1: number; x2: number; y: number }) => (
    <path d={`M${x1} ${y} L${x2} ${y} M${x2 - Math.sign(x2 - x1) * 6} ${y - 4} L${x2} ${y} L${x2 - Math.sign(x2 - x1) * 6} ${y + 4}`} stroke={trait} strokeOpacity={0.7} strokeWidth={fin * 1.2} fill="none" />
  );

  const Coffre = ({ largeur = w }: { largeur?: number }) =>
    coffre ? (
      <g>
        <rect x={-2} y={-coffre} width={largeur + 4} height={coffre} rx={2} fill={cadre} stroke={trait} strokeWidth={fin} />
        <line x1={0} x2={largeur} y1={-coffre * 0.25} y2={-coffre * 0.25} stroke={trait} strokeOpacity={0.4} strokeWidth={fin * 0.6} />
      </g>
    ) : null;

  const Lames = ({ x, y, l, ht, pas = 6, couleur = cadre }: { x: number; y: number; l: number; ht: number; pas?: number; couleur?: string }) => (
    <g>
      <rect x={x} y={y} width={l} height={ht} fill={couleur} stroke={trait} strokeWidth={fin} />
      {Array.from({ length: Math.max(0, Math.floor(ht / pas)) }, (_, i) => (
        <line key={i} x1={x} x2={x + l} y1={y + (i + 1) * pas} y2={y + (i + 1) * pas} stroke={trait} strokeOpacity={0.45} strokeWidth={fin * 0.6} />
      ))}
    </g>
  );

  /** Fenêtre blanche générique, affichée derrière un volet. */
  const FenetreFond = () => {
    const e = 6;
    return (
      <g>
        <rect x={0} y={0} width={w} height={h} fill="#F2F2EE" stroke="#9AA0A8" strokeWidth={fin} />
        <Vitre x={e} y={e} l={w / 2 - e * 1.5} ht={h - 2 * e} />
        <Vitre x={w / 2 + e / 2} y={e} l={w / 2 - e * 1.5} ht={h - 2 * e} />
      </g>
    );
  };

  /* ---------- produits ---------- */
  function rendu(): ReactNode {
    const pf = famille === 'porte-fenetre';

    if (famille === 'fenetre' || pf) {
      if (modele === 'fixe')
        return (
          <Dormant>
            <Vitre x={t} y={t} l={w - 2 * t} ht={h - 2 * t} />
            <Croisillons x={t} y={t} l={w - 2 * t} ht={h - 2 * t} />
            <rect x={t} y={t} width={w - 2 * t} height={h - 2 * t} fill="none" stroke={trait} strokeWidth={fin * 0.6} />
          </Dormant>
        );
      if (modele === 'soufflet') return <Dormant><Vantail x={t * 0.6} y={t * 0.6} l={w - t * 1.2} ht={h - t * 1.2} charniere="b" /></Dormant>;
      if (modele === 'battant-1') return <Dormant><Vantail x={t * 0.6} y={t * 0.6} l={w - t * 1.2} ht={h - t * 1.2} charniere="g" soubassement={pf} /></Dormant>;
      if (modele === 'coulissant-2')
        return (
          <Dormant>
            <Vantail x={t * 0.6} y={t * 0.6} l={w * 0.52} ht={h - t * 1.2} charniere="coul" />
            <Vantail x={w * 0.48 - t * 0.6} y={t * 0.6} l={w * 0.52} ht={h - t * 1.2} charniere="coul" />
            <Fleche x1={w * 0.62} x2={w * 0.82} y={h * 0.85} />
          </Dormant>
        );
      const lv = (w - t * 1.2) / 2;
      return (
        <Dormant>
          <Vantail x={t * 0.6} y={t * 0.6} l={lv} ht={h - t * 1.2} charniere="g" soubassement={pf} />
          <Vantail x={t * 0.6 + lv} y={t * 0.6} l={lv} ht={h - t * 1.2} charniere="d" oscillo={modele === 'oscillo-2'} soubassement={pf} />
        </Dormant>
      );
    }

    if (famille === 'baie') {
      const n = modele === 'coulissant-3' ? 3 : 2;
      const utile = w - t * 1.2;
      const lv = utile / n + t; // les vantaux se chevauchent légèrement
      const pasV = (utile - lv) / (n - 1);
      return (
        <Dormant>
          {Array.from({ length: n }, (_, i) => (
            <Vantail key={i} x={t * 0.6 + i * pasV} y={t * 0.6} l={lv} ht={h - t * 1.2} charniere="coul" />
          ))}
          <Fleche x1={w * 0.6} x2={w * 0.8} y={h * 0.88} />
          {modele === 'levant-coulissant' && <path d={`M${w * 0.85} ${h * 0.55} v-${h * 0.12} m-4 5 l4 -5 l4 5`} stroke={trait} strokeWidth={fin * 1.2} fill="none" />}
          {modele === 'galandage' && <rect x={-m * 0.8} y={0} width={m * 0.7} height={h} fill="none" stroke={trait} strokeDasharray="6 4" strokeWidth={fin} />}
        </Dormant>
      );
    }

    if (famille === 'porte-entree' || famille === 'porte-service') {
      const e = t * 1.1;
      const vitre =
        modele === 'vitree'
          ? { x: w * 0.3, y: h * 0.1, l: w * 0.4, ht: h * 0.72 }
          : modele === 'semi-vitree'
            ? famille === 'porte-service'
              ? { x: w * 0.2, y: h * 0.1, l: w * 0.6, ht: h * 0.35 }
              : { x: w * 0.42, y: h * 0.12, l: w * 0.16, ht: h * 0.6 }
            : null;
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
          <rect x={e} y={e} width={w - 2 * e} height={h - e} fill={cadre} stroke={trait} strokeWidth={fin} />
          {!vitre && [0.3, 0.5, 0.7].map((k) => <line key={k} x1={w * 0.2} x2={w * 0.8} y1={h * k} y2={h * k} stroke={trait} strokeOpacity={0.5} strokeWidth={fin} />)}
          {vitre && (
            <g>
              <rect x={vitre.x} y={vitre.y} width={vitre.l} height={vitre.ht} fill="#DCE6EE" stroke={trait} strokeWidth={fin} />
              <path d={`M${vitre.x} ${vitre.y + vitre.ht * 0.3} Q${vitre.x + vitre.l / 2} ${vitre.y + vitre.ht * 0.1} ${vitre.x + vitre.l} ${vitre.y + vitre.ht * 0.3}`} stroke="#fff" strokeOpacity={0.8} strokeWidth={fin * 2} fill="none" />
            </g>
          )}
          {a(options['accessoires-porte'], 'barre-tirage') ? (
            <rect x={w * 0.82} y={h * 0.25} width={3} height={h * 0.45} rx={1.5} fill="#C8CCD2" stroke="#7B8088" strokeWidth={fin * 0.5} />
          ) : (
            <g fill={poignee}>
              <rect x={w * 0.84} y={h * 0.5 - 1.5} width={w * 0.1} height={3} rx={1.5} />
              <circle cx={w * 0.86} cy={h * 0.5 + 6} r={1.4} />
            </g>
          )}
          {a(options['accessoires-porte'], 'judas') && <circle cx={w / 2} cy={h * 0.35} r={1.6} fill="#555" />}
        </g>
      );
    }

    if (famille === 'porte-garage') {
      if (modele === 'enroulable') return <><Coffre /><Lames x={0} y={0} l={w} ht={h} pas={8} /></>;
      if (modele === 'battante-2')
        return (
          <g>
            {[0, w / 2].map((x) => (
              <g key={x}>
                <rect x={x} y={0} width={w / 2} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
                {Array.from({ length: Math.floor(w / 2 / 12) }, (_, i) => <line key={i} x1={x + (i + 1) * 12} x2={x + (i + 1) * 12} y1={0} y2={h} stroke={trait} strokeOpacity={0.4} strokeWidth={fin * 0.6} />)}
              </g>
            ))}
            <rect x={w / 2 - 8} y={h / 2 - 2} width={6} height={4} fill={poignee} />
          </g>
        );
      if (modele === 'basculante')
        return (
          <g>
            <rect x={0} y={0} width={w} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
            {Array.from({ length: Math.floor(w / 14) }, (_, i) => <line key={i} x1={(i + 1) * 14} x2={(i + 1) * 14} y1={4} y2={h - 4} stroke={trait} strokeOpacity={0.45} strokeWidth={fin * 0.7} />)}
            <rect x={w / 2 - 8} y={h * 0.55} width={16} height={4} rx={2} fill={poignee} />
            {a(options['garage-plus'], 'hublots') && [0.25, 0.5, 0.75].map((k) => <rect key={k} x={w * k - 12} y={h * 0.18} width={24} height={10} rx={4} fill="#DCE6EE" stroke={trait} strokeWidth={fin} />)}
            {a(options['garage-plus'], 'portillon') && <rect x={w * 0.62} y={h * 0.08} width={w * 0.2} height={h * 0.9} fill="none" stroke={trait} strokeWidth={fin * 1.2} />}
          </g>
        );
      const panneaux = Math.max(4, Math.round(h / 50));
      return (
        <g>
          <rect x={0} y={0} width={w} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
          {Array.from({ length: panneaux - 1 }, (_, i) => <line key={i} x1={0} x2={w} y1={((i + 1) * h) / panneaux} y2={((i + 1) * h) / panneaux} stroke={trait} strokeOpacity={0.6} strokeWidth={fin} />)}
          {Array.from({ length: panneaux }, (_, i) => <line key={`r${i}`} x1={4} x2={w - 4} y1={((i + 0.5) * h) / panneaux} y2={((i + 0.5) * h) / panneaux} stroke={trait} strokeOpacity={0.2} strokeWidth={fin * 0.6} />)}
          {modele === 'sectionnelle' && a(options['garage-plus'], 'hublots') && [0.2, 0.4, 0.6, 0.8].map((k) => <rect key={k} x={w * k - 12} y={h / panneaux + 6} width={24} height={h / panneaux - 12} rx={4} fill="#DCE6EE" stroke={trait} strokeWidth={fin} />)}
          {modele === 'sectionnelle' && a(options['garage-plus'], 'portillon') && (
            <g>
              <rect x={w * 0.62} y={h * 0.08} width={Math.min(90, w * 0.25)} height={h * 0.9} fill="none" stroke={trait} strokeWidth={fin * 1.4} />
              <rect x={w * 0.62 + Math.min(90, w * 0.25) - 10} y={h * 0.5} width={6} height={3} fill={poignee} />
            </g>
          )}
          {modele === 'coulissante-laterale' && <Fleche x1={w * 0.6} x2={w * 0.9} y={h * 0.5} />}
        </g>
      );
    }

    if (famille === 'fenetre-toit') {
      const e = 7; // raccord et capot aluminium gris
      const tab = modele === 'tabatiere';
      const occ = options['occultation-toit'];
      return (
        <g>
          <rect x={-4} y={-4} width={w + 8} height={h + 8} rx={2} fill="#555B62" />
          <rect x={0} y={0} width={w} height={h} fill="#6B7178" stroke="#3E4349" strokeWidth={fin} />
          <rect x={e * 0.6} y={e * 0.6} width={w - e * 1.2} height={h - e * 1.2} fill={cadre} stroke={trait} strokeWidth={fin} />
          <Vitre x={e * 1.4} y={e * 1.4} l={w - e * 2.8} ht={h - e * 2.8} />
          {occ === 'store' && <rect x={e * 1.4} y={e * 1.4} width={w - e * 2.8} height={(h - e * 2.8) * 0.45} fill="#24365C" opacity={0.85} />}
          {occ === 'volet-solaire' && (
            <>
              <Lames x={e * 1.4} y={e * 1.4} l={w - e * 2.8} ht={(h - e * 2.8) * 0.4} pas={4} couleur="#6B7178" />
              <rect x={w * 0.35} y={-coffre + 3} width={w * 0.3} height={coffre - 6} fill="#1F3A5F" stroke="#9FB3C8" strokeWidth={fin * 0.5} />
            </>
          )}
          {modele === 'rotation' && <rect x={w / 2 - w * 0.25} y={e * 0.8} width={w * 0.5} height={3} rx={1.5} fill={poignee} />}
          {modele === 'projection' && <path d={`M${e * 1.4} ${e * 1.4} L${w / 2} ${h - e * 1.4} L${w - e * 1.4} ${e * 1.4}`} fill="none" stroke={trait} strokeOpacity={0.6} strokeWidth={fin * 0.7} strokeDasharray={`${fin * 4} ${fin * 3}`} />}
          {tab && <line x1={w * 0.8} y1={h - e} x2={w * 0.95} y2={h * 0.55} stroke="#3E4349" strokeWidth={fin * 1.5} />}
        </g>
      );
    }

    if (famille === 'portail' || famille === 'portillon') {
      const style = modele.includes('semi') ? 'semi' : modele.includes('ajoure') ? 'ajoure' : 'plein';
      const coulissant = modele.startsWith('coulissant');
      const vantaux = famille === 'portillon' || coulissant ? 1 : 2;
      const lv = w / vantaux;
      const cadreE = 5;
      const Vantail = ({ x }: { x: number }) => {
        const barreaux = Math.max(2, Math.floor(lv / 11));
        const limite = style === 'semi' ? h * 0.42 : style === 'ajoure' ? h - cadreE : cadreE; // hauteur de la partie barreaudée
        return (
          <g>
            {/* partie pleine */}
            {style !== 'ajoure' && (
              <g>
                <rect x={x} y={limite} width={lv} height={h - limite} fill={cadre} stroke={trait} strokeWidth={fin} />
                {Array.from({ length: Math.floor((h - limite) / 12) }, (_, i) => (
                  <line key={i} x1={x + 3} x2={x + lv - 3} y1={limite + (i + 1) * 12} y2={limite + (i + 1) * 12} stroke={trait} strokeOpacity={0.45} strokeWidth={fin * 0.6} />
                ))}
              </g>
            )}
            {/* barreaudage */}
            {style !== 'plein' && (
              <g fill={cadre} stroke={trait} strokeWidth={fin * 0.5}>
                <rect x={x} y={0} width={lv} height={cadreE} />
                {style === 'ajoure' && <rect x={x} y={h - cadreE * 2} width={lv} height={cadreE * 2} />}
                {Array.from({ length: barreaux }, (_, i) => (
                  <rect key={i} x={x + ((i + 0.5) * lv) / barreaux - 1.5} y={0} width={3} height={style === 'ajoure' ? h : limite} />
                ))}
              </g>
            )}
            <rect x={x} y={0} width={lv} height={h} fill="none" stroke={trait} strokeWidth={fin * 1.4} />
          </g>
        );
      };
      return (
        <g>
          {coulissant && <rect x={-w * 0.05} y={h} width={w * 1.9} height={3} fill="#8A8F98" />}
          {Array.from({ length: vantaux }, (_, i) => <Vantail key={i} x={i * lv} />)}
          {famille === 'portillon' || coulissant ? (
            <rect x={w - 12} y={h * 0.45} width={8} height={3} rx={1.5} fill={poignee} />
          ) : (
            <rect x={w / 2 - 4} y={h * 0.45} width={8} height={3} rx={1.5} fill={poignee} />
          )}
          {coulissant && <Fleche x1={w * 0.35} x2={w * 0.65} y={h + 12} />}
          {a(options['equipements-portail'], 'boite-lettres') && <rect x={famille === 'portillon' ? w * 0.15 : w * 0.08} y={h * 0.5} width={24} height={16} fill="#3E4349" stroke="#1E1E1E" strokeWidth={fin} />}
        </g>
      );
    }

    // Volets
    if (modele === 'roulant-renovation' || modele === 'roulant-traditionnel') {
      const baisse = h * 0.62;
      return (
        <g>
          <FenetreFond />
          {modele === 'roulant-traditionnel' && <rect x={-4} y={-6} width={w + 8} height={6} fill="#CFC6B6" />}
          <rect x={-2} y={0} width={4} height={h} fill={cadre} stroke={trait} strokeWidth={fin * 0.5} />
          <rect x={w - 2} y={0} width={4} height={h} fill={cadre} stroke={trait} strokeWidth={fin * 0.5} />
          <Lames x={0} y={0} l={w} ht={baisse} pas={5} />
          <rect x={0} y={baisse - 3} width={w} height={3} fill={trait} />
          <Coffre />
        </g>
      );
    }
    if (modele === 'bso') {
      const pas = 9;
      return (
        <g>
          <FenetreFond />
          <Coffre />
          {Array.from({ length: Math.floor(h / pas) }, (_, i) => (
            <rect key={i} x={0} y={i * pas + 1} width={w} height={pas * 0.55} fill={cadre} stroke={trait} strokeWidth={fin * 0.5} />
          ))}
        </g>
      );
    }
    if (modele === 'persienne-pliante') {
      const n = w > 140 ? 6 : 4;
      const l = w / n;
      return (
        <g>
          <FenetreFond />
          {Array.from({ length: n }, (_, i) => (
            <g key={i}>
              <rect x={i * l} y={0} width={l} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
              {Array.from({ length: Math.floor((h - 8) / 5) }, (_, j) => (
                <line key={j} x1={i * l + 3} x2={(i + 1) * l - 3} y1={4 + (j + 1) * 5} y2={4 + (j + 1) * 5} stroke={trait} strokeOpacity={0.5} strokeWidth={fin * 0.7} />
              ))}
            </g>
          ))}
        </g>
      );
    }
    if (modele === 'coulissant') {
      // Volet entrouvert : il glisse sur un rail le long de la façade.
      const x0 = w * 0.45;
      const lp = w * 0.62;
      return (
        <g>
          <FenetreFond />
          <rect x={-4} y={-8} width={w * 1.1} height={4} fill="#8A8F98" />
          <rect x={x0} y={-4} width={lp} height={h + 4} fill={cadre} stroke={trait} strokeWidth={fin} />
          {Array.from({ length: Math.floor(lp / 12) }, (_, i) => <line key={i} x1={x0 + (i + 1) * 12} x2={x0 + (i + 1) * 12} y1={-4} y2={h} stroke={trait} strokeOpacity={0.4} strokeWidth={fin * 0.6} />)}
          <Fleche x1={w * 0.85} x2={w * 0.6} y={h * 0.5} />
        </g>
      );
    }
    // Volets battants
    const vantaux = w > 90 ? 2 : 1;
    const lv = w / vantaux;
    return (
      <g>
        {Array.from({ length: vantaux }, (_, i) => {
          const x = i * lv;
          return (
            <g key={i}>
              <rect x={x} y={0} width={lv} height={h} fill={cadre} stroke={trait} strokeWidth={fin} />
              {modele === 'battant-persienne'
                ? Array.from({ length: Math.floor((h - 10) / 5) }, (_, j) => <line key={j} x1={x + 5} x2={x + lv - 5} y1={5 + (j + 1) * 5} y2={5 + (j + 1) * 5} stroke={trait} strokeOpacity={0.5} strokeWidth={fin * 0.7} />)
                : Array.from({ length: Math.floor(lv / 11) }, (_, j) => <line key={j} x1={x + (j + 1) * 11} x2={x + (j + 1) * 11} y1={0} y2={h} stroke={trait} strokeOpacity={0.4} strokeWidth={fin * 0.6} />)}
              {modele === 'battant-z' && (
                <g fill={cadre} stroke={trait} strokeWidth={fin * 0.8}>
                  <rect x={x + 3} y={h * 0.15} width={lv - 6} height={9} />
                  <rect x={x + 3} y={h * 0.78} width={lv - 6} height={9} />
                  <path d={`M${x + 3} ${h * 0.78} L${x + lv - 3} ${h * 0.15 + 19} L${x + lv - 3} ${h * 0.15 + 9} L${x + 3} ${h * 0.78 - 10} Z`} transform={i === 1 ? `translate(${2 * x + lv} 0) scale(-1 1)` : undefined} />
                </g>
              )}
              {[0.18, 0.8].map((k) => <rect key={k} x={i === 0 ? x - 3 : x + lv - 8} y={h * k} width={11} height={3} fill="#3B3B3B" />)}
            </g>
          );
        })}
      </g>
    );
  }

  const volet = famille === 'volet';
  const titre = `Aperçu : ${f.libelle.toLowerCase()} – ${getModele(famille, modele).libelle}, ${mat.libelle}, coloris ${col.libelle.toLowerCase()}`;

  return (
    <svg
      viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
      className={className}
      {...position}
      role={decoratif ? undefined : 'img'}
      aria-hidden={decoratif || undefined}
      aria-label={decoratif ? undefined : titre}
    >
      <defs>
        <linearGradient id={`verre${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8E9F5" />
          <stop offset="0.55" stopColor="#A9C8E0" />
          <stop offset="1" stopColor="#8DB2D0" />
        </linearGradient>
        <pattern id={`bois${uid}`} width="40" height="12" patternUnits="userSpaceOnUse">
          <rect width="40" height="12" fill={col.hex} />
          <path d="M0 3 Q10 1 20 3 T40 3 M0 8 Q12 10 22 8 T40 8" stroke={nuance(col.hex, -0.25)} strokeWidth="0.8" fill="none" />
        </pattern>
        <pattern id={`tuiles${uid}`} width="18" height="12" patternUnits="userSpaceOnUse">
          <rect width="18" height="12" fill="#B4553A" />
          <path d="M0 11 Q4.5 5 9 11 Q13.5 5 18 11" fill="none" stroke="#8E3F2A" strokeWidth="1" />
        </pattern>
        <pattern id={`mur${uid}`} width="30" height="15" patternUnits="userSpaceOnUse">
          <rect width="30" height="15" fill="#EFE9DF" />
          <path d="M0 15 H30 M15 0 V15" stroke="#E2DACB" strokeWidth="0.8" />
        </pattern>
      </defs>
      {avecMur && (famille === 'portail' || famille === 'portillon') && (
        <g>
          <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill="#DCEBF5" />
          <rect x={vb.x} y={h} width={vb.w} height={m} fill="#B9C79A" />
          <rect x={-m * 0.8} y={-12} width={m * 0.7} height={h + 12} fill="#D9D2C5" stroke="#B5AD9F" strokeWidth={fin} />
          <rect x={w + m * 0.1} y={-12} width={m * 0.7} height={h + 12} fill="#D9D2C5" stroke="#B5AD9F" strokeWidth={fin} />
        </g>
      )}
      {avecMur && famille === 'fenetre-toit' && <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={`url(#tuiles${uid})`} />}
      {avecMur && !['portail', 'portillon', 'fenetre-toit'].includes(famille) && (
        <g>
          <rect x={vb.x} y={vb.y} width={vb.w} height={vb.h} fill={`url(#mur${uid})`} />
          {famille === 'porte-garage' || famille.startsWith('porte') || famille === 'baie' ? (
            <rect x={vb.x} y={h} width={vb.w} height={m} fill="#C9C3B8" />
          ) : (
            <rect x={-6} y={h} width={w + 12} height={6} fill="#D6D1C8" stroke="#B8B2A7" strokeWidth={fin * 0.5} />
          )}
        </g>
      )}
      {rendu()}
      {!volet && famille !== 'porte-garage' && <Coffre />}
    </svg>
  );
}
