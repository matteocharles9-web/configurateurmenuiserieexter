import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Icone } from './Icone';

const Ctx = createContext<(message: string) => void>(() => {});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<{ texte: string; cle: number } | null>(null);
  const afficher = useCallback((texte: string) => {
    const cle = Date.now();
    setMessage({ texte, cle });
    setTimeout(() => setMessage((m) => (m?.cle === cle ? null : m)), 3500);
  }, []);
  return (
    <Ctx.Provider value={afficher}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 lg:bottom-6">
        {message && (
          <div key={message.cle} className="pointer-events-auto flex items-center gap-2 rounded-full bg-marine px-4 py-3 text-sm font-bold text-white shadow-lg">
            <Icone nom="ok" className="size-4 text-jaune" />
            {message.texte}
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export const useToast = () => useContext(Ctx);
