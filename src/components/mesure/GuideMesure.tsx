import { useState, type ReactNode } from 'react';
import { catalogue } from '../../data/types';
import { Bouton } from '../ui/Bouton';
import { Icone } from '../ui/Icone';

/* Guide de prise de mesures pas à pas, avec schémas SVG simples. */

const ASTUCE: Record<string, string> = {
  fenetre: "Notez aussi le sens d'ouverture souhaité et ce qui gêne sous la fenêtre (radiateur, prise, meuble).",
  'porte-fenetre': "Mesurez la hauteur depuis le sol fini (carrelage, parquet) : c'est lui qui compte pour le seuil.",
  baie: "Vérifiez la place disponible de chaque côté : une baie à galandage a besoin d'un mur libre pour s'escamoter.",
  'porte-entree': "Notez le côté des paumelles (charnières) vu depuis l'extérieur, et si la porte pousse vers l'intérieur.",
  'porte-service': "Notez le côté des paumelles vu depuis l'extérieur.",
  'porte-garage': "Mesurez aussi la retombée de linteau (du haut de l'ouverture au plafond) et la place de chaque côté : elles déterminent le type de porte possible.",
  'fenetre-toit': "Astuce : la taille de votre fenêtre de toit actuelle est souvent inscrite sur sa plaque d'identification, visible en ouvrant le vantail (en haut du dormant).",
  portail: "Mesurez entre les piliers, en haut et en bas : retenez la plus petite mesure. Notez aussi la hauteur des piliers et la pente éventuelle de l'allée.",
  portillon: "Mesurez entre les poteaux ou piliers, en haut et en bas, et retenez la plus petite mesure.",
  volet: "Pour un volet roulant, mesurez aussi la profondeur de l'embrasure ; pour un volet battant, vérifiez la place sur la façade de chaque côté.",
};

function Mur({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 220 170" className="h-44 w-full rounded-xl bg-[#EFE9DF]" aria-hidden>
      <defs>
        <marker id="fl" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10z" fill="#1557C0" />
        </marker>
      </defs>
      <rect x="60" y="25" width="100" height="120" fill="#A9C8E0" stroke="#6B7280" strokeWidth="2" />
      <rect x="54" y="19" width="112" height="132" fill="none" stroke="#9AA0A8" strokeWidth="6" />
      <rect x="48" y="151" width="124" height="8" fill="#D6D1C8" />
      {children}
    </svg>
  );
}

const fleche = { stroke: '#1557C0', strokeWidth: 3, markerStart: 'url(#fl)', markerEnd: 'url(#fl)' };

const ETAPES = [
  {
    titre: 'Repérez ce que vous mesurez',
    texte:
      "En pose rénovation, on mesure l'ancienne menuiserie (son cadre fixe, le « dormant »). En dépose totale ou dans le neuf, on mesure l'ouverture dans le mur, d'un côté du mur (tableau) à l'autre.",
    schema: (
      <Mur>
        <rect x="54" y="19" width="112" height="132" fill="none" stroke="#F7CE1A" strokeWidth="6" />
        <text x="110" y="12" textAnchor="middle" fontSize="11" fill="#0B2E6F" fontWeight="700">dormant</text>
        <text x="24" y="80" textAnchor="middle" fontSize="11" fill="#0B2E6F" fontWeight="700">tableau</text>
        <line x1="30" y1="85" x2="50" y2="85" stroke="#0B2E6F" strokeWidth="2" />
      </Mur>
    ),
  },
  {
    titre: 'Mesurez la largeur à 3 hauteurs',
    texte: 'En haut, au milieu et en bas. Les murs ne sont jamais parfaitement droits : retenez la plus petite des trois mesures.',
    schema: (
      <Mur>
        {[40, 85, 130].map((y) => <line key={y} x1="62" x2="158" y1={y} y2={y} {...fleche} />)}
      </Mur>
    ),
  },
  {
    titre: 'Mesurez la hauteur à 3 endroits',
    texte: 'À gauche, au milieu et à droite, du haut de l\'ouverture jusqu\'à l\'appui. Là encore, gardez la plus petite mesure.',
    schema: (
      <Mur>
        {[75, 110, 145].map((x) => <line key={x} x1={x} x2={x} y1="27" y2="143" {...fleche} />)}
      </Mur>
    ),
  },
  {
    titre: 'Notez et prenez une photo',
    texte: 'Reportez les deux mesures ici (largeur × hauteur) et prenez une photo de la façade : elle servira pour l\'aperçu et pour votre conseiller.',
    schema: (
      <svg viewBox="0 0 220 170" className="h-44 w-full rounded-xl bg-bleu-clair" aria-hidden>
        <rect x="75" y="20" width="70" height="130" rx="10" fill="#0B2E6F" />
        <rect x="81" y="32" width="58" height="100" rx="3" fill="#EFE9DF" />
        <rect x="96" y="52" width="28" height="44" fill="#A9C8E0" stroke="#6B7280" strokeWidth="2" />
        <rect x="93" y="49" width="34" height="50" fill="none" stroke="#9AA0A8" strokeWidth="3" />
        <circle cx="110" cy="141" r="5" fill="#F7CE1A" />
        <text x="110" y="120" textAnchor="middle" fontSize="10" fill="#0B2E6F" fontWeight="700">100 × 125</text>
      </svg>
    ),
  },
];

export function GuideMesure({ famille }: { famille: string }) {
  const [i, setI] = useState(0);
  const e = ETAPES[i];
  return (
    <div className="rounded-xl bg-white p-4 ring-1 ring-bord" role="region" aria-roledescription="guide pas à pas" aria-label="Guide de prise de mesures">
      <ol className="mb-4 flex gap-2" aria-label="Étapes du guide">
        {ETAPES.map((x, k) => (
          <li key={x.titre} className="flex-1">
            <button
              type="button"
              onClick={() => setI(k)}
              aria-current={k === i ? 'step' : undefined}
              aria-label={`Étape ${k + 1} : ${x.titre}`}
              className={`h-2 w-full rounded-full ${k <= i ? 'bg-bleu' : 'bg-bord'}`}
            />
          </li>
        ))}
      </ol>
      <div className="grid items-center gap-4 sm:grid-cols-2">
        {e.schema}
        <div aria-live="polite">
          <p className="text-sm font-bold text-bleu">Étape {i + 1} sur {ETAPES.length}</p>
          <h4 className="mt-1 text-lg font-semibold">{e.titre}</h4>
          <p className="mt-2">{e.texte}</p>
          {i === ETAPES.length - 1 && (
            <p className="mt-3 flex gap-2 rounded-lg bg-jaune-clair p-3 text-sm text-marine">
              <Icone nom="info" className="size-5 shrink-0" />
              {ASTUCE[famille] ?? ASTUCE.fenetre}
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-between gap-2">
        <Bouton variante="discret" taille="petit" icone="gauche" disabled={i === 0} onClick={() => setI(i - 1)}>
          Précédent
        </Bouton>
        {i < ETAPES.length - 1 ? (
          <Bouton taille="petit" iconeDroite="droite" onClick={() => setI(i + 1)}>
            Étape suivante
          </Bouton>
        ) : (
          <span className="text-sm font-bold text-ok">✓ Vous êtes prêt</span>
        )}
      </div>
      <p className="mt-3 border-t border-bord pt-3 text-sm italic">{catalogue.pose.noteMetrage}</p>
    </div>
  );
}
