const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sans 0/O ni 1/I, pour la saisie en magasin

export function aleatoire(n: number): string {
  const tab = new Uint32Array(n);
  crypto.getRandomValues(tab);
  return Array.from(tab, (v) => ALPHABET[v % ALPHABET.length]).join('');
}

export const nouvelIdProjet = () => `CAS-${aleatoire(6)}`;
export const nouvelIdOuverture = () => `o-${aleatoire(8)}`;
