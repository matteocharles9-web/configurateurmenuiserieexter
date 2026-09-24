import { useEffect, useState } from 'react';

/*
 * Routage par hash (#/…) : aucun serveur nécessaire, les liens et QR codes
 * fonctionnent aussi bien en local que sur un hébergement statique.
 *
 *   #/                         accueil
 *   #/besoin                   questionnaire « Je pars de mon besoin »
 *   #/projet/:id/:etape        parcours (produit, dimensions, materiau, coloris, options)
 *   #/projet/:id/recap         récapitulatif
 *   #/reprendre                reprendre un projet par identifiant
 *   #/r/:id/:donnees           reprise par QR code / lien
 *   #/partage/:donnees         vue partagée (décider à deux)
 */

const lireHash = () => window.location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

export function useRoute(): string[] {
  const [route, setRoute] = useState(lireHash);
  useEffect(() => {
    const maj = () => setRoute(lireHash());
    window.addEventListener('hashchange', maj);
    return () => window.removeEventListener('hashchange', maj);
  }, []);
  return route;
}

export function naviguer(chemin: string, remplacer = false) {
  const hash = `#${chemin.startsWith('/') ? chemin : `/${chemin}`}`;
  if (remplacer) window.history.replaceState(null, '', hash);
  else window.location.hash = hash;
  if (remplacer) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

export const cheminEtape = (id: string, etape: string) => `/projet/${id}/${etape}`;
