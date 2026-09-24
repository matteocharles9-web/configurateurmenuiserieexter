import { ETAPES, type EtapeId } from './data/types';
import { useRoute } from './router';
import { ContactProvider } from './components/contact/ContactProvider';
import { EnTete, PiedPage } from './components/layout/EnTete';
import { ToastProvider } from './components/ui/Toast';
import { PageAccueil } from './pages/PageAccueil';
import { PageBesoin } from './pages/PageBesoin';
import { PageConfigurateur } from './pages/PageConfigurateur';
import { PageGalerie } from './pages/PageGalerie';
import { PagePartage } from './pages/PagePartage';
import { PageRecap } from './pages/PageRecap';
import { PageReprendre } from './pages/PageReprendre';
import { PageReprise } from './pages/PageReprise';
import { ProjetProvider } from './state/ProjetContext';

function Routes() {
  const [page, a, b] = useRoute();
  if (page === 'besoin') return <PageBesoin />;
  if (page === 'reprendre') return <PageReprendre />;
  if (page === 'galerie') return <PageGalerie />;
  if (page === 'r' && a) return <PageReprise id={a} donnees={b} />;
  if (page === 'partage' && a) return <PagePartage donnees={a} />;
  if (page === 'projet' && a) {
    if (b === 'recap') return <PageRecap id={a} />;
    const etape = (ETAPES.some((e) => e.id === b) ? b : 'produit') as EtapeId;
    return <PageConfigurateur id={a} etape={etape} />;
  }
  return <PageAccueil />;
}

export default function App() {
  return (
    <ProjetProvider>
      <ToastProvider>
        <ContactProvider>
          {/* Lien d'évitement : un bouton, car le hash sert au routage. */}
          <button type="button" onClick={() => document.getElementById('contenu')?.focus()} className="sr-only-focusable absolute top-2 left-2 z-50 rounded bg-white px-3 py-2 font-bold text-marine">
            Aller au contenu
          </button>
          <EnTete />
          <main id="contenu" tabIndex={-1} className="min-h-[60vh] outline-none">
            <Routes />
          </main>
          <PiedPage />
        </ContactProvider>
      </ToastProvider>
    </ProjetProvider>
  );
}
