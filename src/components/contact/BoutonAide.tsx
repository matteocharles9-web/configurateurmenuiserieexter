import { Icone } from '../ui/Icone';
import { useContact } from './ContactProvider';

/* Bouton flottant présent sur chaque étape. */
export function BoutonAide({ etape }: { etape?: string }) {
  const { ouvrir } = useContact();
  return (
    <button
      type="button"
      onClick={() => ouvrir('aide', etape)}
      className="fixed right-4 bottom-24 z-30 flex items-center gap-2 rounded-full bg-jaune px-4 py-3 font-bold text-marine shadow-lg ring-2 ring-white hover:brightness-95 lg:bottom-6"
    >
      <Icone nom="aide" className="size-6" />
      <span className="hidden sm:inline">Aide en direct</span>
      <span className="sr-only sm:hidden">Aide en direct</span>
    </button>
  );
}

export function BoutonsTransmission({ vertical = false }: { vertical?: boolean }) {
  const { ouvrir } = useContact();
  return (
    <div className={`grid gap-2 ${vertical ? '' : 'sm:grid-cols-3'}`}>
      <button type="button" onClick={() => ouvrir('conseiller')} className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-bleu px-4 py-2.5 font-bold text-white hover:bg-marine">
        <Icone nom="chat" /> Envoyer à un conseiller
      </button>
      <button type="button" onClick={() => ouvrir('rdv')} className="flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-bleu bg-white px-4 py-2 font-bold text-bleu hover:bg-bleu-clair">
        <Icone nom="calendrier" /> Prendre RDV Minute'pass
      </button>
      <button type="button" onClick={() => ouvrir('rappel')} className="flex min-h-11 items-center justify-center gap-2 rounded-full border-2 border-bleu bg-white px-4 py-2 font-bold text-bleu hover:bg-bleu-clair">
        <Icone nom="telephone" /> Être rappelé
      </button>
    </div>
  );
}
