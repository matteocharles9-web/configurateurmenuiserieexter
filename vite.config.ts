import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' : le build fonctionne à la racine d'un domaine comme dans un sous-dossier
// (GitHub Pages sert le site sous /configurateurmenuiserieexter/).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
