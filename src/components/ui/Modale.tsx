import { useEffect, useRef, type ReactNode } from 'react';
import { Icone } from './Icone';

/* Modale basée sur <dialog> : focus piégé, fermeture par Échap et retour du focus gérés par le navigateur. */
export function Modale({ ouverte, onFermer, titre, children, large = false }: { ouverte: boolean; onFermer: () => void; titre: string; children: ReactNode; large?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (ouverte && !d.open) d.showModal();
    if (!ouverte && d.open) d.close();
  }, [ouverte]);

  return (
    <dialog
      ref={ref}
      onClose={onFermer}
      onClick={(e) => e.target === ref.current && onFermer()}
      aria-labelledby="titre-modale"
      className={`m-auto max-h-[92dvh] w-[calc(100%-1.5rem)] ${large ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto rounded-2xl bg-white p-0 text-texte shadow-2xl`}
    >
      {ouverte && (
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 id="titre-modale" className="text-xl font-semibold">
              {titre}
            </h2>
            <button type="button" onClick={onFermer} className="-m-2 rounded-full p-2 hover:bg-fond" aria-label="Fermer">
              <Icone nom="fermer" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
