/* Jeu d'icônes en SVG (trait), pour ne dépendre d'aucune bibliothèque. */
const TRACES: Record<string, string> = {
  maison: 'M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6',
  telephone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  visio: 'M3 7h12v10H3zM15 10l6-3v10l-6-3',
  chat: 'M4 5h16v11H9l-5 4z',
  aide: 'M12 21a9 9 0 110-18 9 9 0 010 18zM9.5 9a2.5 2.5 0 115 .5c0 1.5-2.5 2-2.5 3.5M12 17h.01',
  sauver: 'M5 3h11l3 3v15H5zM8 3v5h7V3M8 14h8v7H8z',
  partage: 'M18 8a3 3 0 100-6 3 3 0 000 6zM6 15a3 3 0 100-6 3 3 0 000 6zM18 22a3 3 0 100-6 3 3 0 000 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4',
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h3v3h-3zM18 18h3v3h-3zM14 20h2M20 14v2',
  echantillon: 'M4 4h7v16H4zM11 8l6-3 3 7-9 4M7 16h.01',
  ok: 'M5 12l5 5 9-10',
  alerte: 'M12 3l10 18H2zM12 10v5M12 18h.01',
  info: 'M12 21a9 9 0 110-18 9 9 0 010 18zM12 11v6M12 7.5h.01',
  gauche: 'M15 5l-7 7 7 7',
  droite: 'M9 5l7 7-7 7',
  bas: 'M5 9l7 7 7-7',
  copier: 'M8 8h12v12H8zM4 16V4h12',
  poubelle: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  plus: 'M12 5v14M5 12h14',
  dupliquer: 'M8 8h12v12H8zM4 16V4h12M14 11v6M11 14h6',
  photo: 'M3 7h4l2-3h6l2 3h4v13H3zM12 17a4 4 0 100-8 4 4 0 000 8z',
  metre: 'M3 15l12-12 6 6-12 12zM7 11l2 2M10 8l2 2M13 5l2 2',
  etoile: 'M12 3l2.8 5.8 6.2.9-4.5 4.4 1 6.2L12 17.4 6.5 20.3l1-6.2L3 9.7l6.2-.9z',
  magasin: 'M3 9l2-5h14l2 5M4 9v11h16V9M3 9h18M9 20v-6h6v6',
  utilisateur: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
  panier: 'M3 4h3l2.5 11h10L21 7H7M10 20h.01M17 20h.01',
  recherche: 'M11 18a7 7 0 100-14 7 7 0 000 14zM20 20l-4-4',
  fermer: 'M6 6l12 12M18 6L6 18',
  crayon: 'M4 20h4L20 8l-4-4L4 16zM14 6l4 4',
  froid: 'M12 2v20M4.9 7l14.2 10M4.9 17L19.1 7M9 4l3 2 3-2M9 20l3-2 3 2',
  bruit: 'M4 9h4l5-4v14l-5-4H4zM16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11',
  securite: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4',
  facture: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
  entretien: 'M12 3c3 4 6 7 6 11a6 6 0 01-12 0c0-4 3-7 6-11z',
  lumiere: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5',
  calendrier: 'M4 5h16v16H4zM4 10h16M9 3v4M15 3v4',
  lien: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  menu: 'M4 7h16M4 12h16M4 17h16',
};

export function Icone({ nom, className = 'size-5', titre }: { nom: string; className?: string; titre?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden={titre ? undefined : true}
      role={titre ? 'img' : undefined}
    >
      {titre && <title>{titre}</title>}
      <path d={TRACES[nom] ?? TRACES.info} />
    </svg>
  );
}
