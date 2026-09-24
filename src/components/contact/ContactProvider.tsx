import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Modale } from '../ui/Modale';
import { AideEnDirect } from './AideEnDirect';
import { FormConseiller, FormRappel, FormRdv } from './Formulaires';

export type TypeContact = 'conseiller' | 'rdv' | 'rdv-visio' | 'rappel' | 'aide';

const TITRES: Record<TypeContact, string> = {
  conseiller: 'Envoyer mon projet à un conseiller',
  rdv: "Prendre RDV Minute'pass menuiserie",
  'rdv-visio': "Prendre RDV Minute'pass menuiserie",
  rappel: 'Être rappelé par un conseiller',
  aide: 'Aide en direct',
};

interface Valeur {
  ouvrir: (t: TypeContact, contexte?: string) => void;
}
const Ctx = createContext<Valeur>({ ouvrir: () => {} });

export function ContactProvider({ children }: { children: ReactNode }) {
  const [type, setType] = useState<TypeContact | null>(null);
  const [contexte, setContexte] = useState<string>();
  const ouvrir = useCallback((t: TypeContact, ctx?: string) => {
    setContexte(ctx);
    setType(t);
  }, []);
  const fermer = () => setType(null);

  return (
    <Ctx.Provider value={{ ouvrir }}>
      {children}
      <Modale ouverte={type !== null} onFermer={fermer} titre={type ? TITRES[type] : ''} large={type === 'rdv' || type === 'rdv-visio'}>
        {type === 'conseiller' && <FormConseiller onFermer={fermer} />}
        {(type === 'rdv' || type === 'rdv-visio') && <FormRdv key={type} onFermer={fermer} modeInitial={type === 'rdv-visio' ? 'visio' : 'magasin'} />}
        {type === 'rappel' && <FormRappel onFermer={fermer} />}
        {type === 'aide' && <AideEnDirect etape={contexte} basculer={(t) => setType(t)} />}
      </Modale>
    </Ctx.Provider>
  );
}

export const useContact = () => useContext(Ctx);
