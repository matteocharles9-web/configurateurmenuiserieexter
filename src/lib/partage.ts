import type { Projet } from '../data/types';

/*
 * Le projet est encodé dans l'URL (JSON compressé puis base64url).
 * Prototype : le lien fonctionne réellement d'un appareil à l'autre, sans serveur.
 * Production : le lien ne porterait que l'identifiant projet du socle commun.
 */

const versB64 = (octets: Uint8Array) => {
  let s = '';
  octets.forEach((o) => (s += String.fromCharCode(o)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const depuisB64 = (b64: string) => {
  const s = atob(b64.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

async function transformer(octets: Uint8Array, flux: CompressionStream | DecompressionStream) {
  const sortie = new Blob([octets as BlobPart]).stream().pipeThrough(flux);
  return new Uint8Array(await new Response(sortie).arrayBuffer());
}

export async function encoderProjet(p: Projet): Promise<string> {
  const { demandes: _d, ...leger } = p;
  const octets = new TextEncoder().encode(JSON.stringify(leger));
  if (typeof CompressionStream !== 'undefined') {
    return 'z' + versB64(await transformer(octets, new CompressionStream('deflate-raw')));
  }
  return 'j' + versB64(octets);
}

export async function decoderProjet(code: string): Promise<Projet | null> {
  try {
    let octets = depuisB64(code.slice(1));
    if (code[0] === 'z') octets = await transformer(octets, new DecompressionStream('deflate-raw'));
    const p = JSON.parse(new TextDecoder().decode(octets)) as Projet;
    if (!p?.id || !Array.isArray(p.ouvertures) || !p.ouvertures.length) return null;
    return { ...p, demandes: p.demandes ?? [], echantillons: p.echantillons ?? [], besoins: p.besoins ?? [], contexte: p.contexte ?? {} };
  } catch {
    return null;
  }
}

/** Base de l'URL courante, sans le hash (fonctionne en local comme sur GitHub Pages). */
export const baseUrl = () => window.location.href.split('#')[0];

export async function lienReprise(p: Projet) {
  return `${baseUrl()}#/r/${p.id}/${await encoderProjet(p)}`;
}
export async function lienPartage(p: Projet) {
  return `${baseUrl()}#/partage/${await encoderProjet(p)}`;
}
