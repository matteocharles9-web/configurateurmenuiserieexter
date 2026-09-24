import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bouton } from '../ui/Bouton';
import { Icone } from '../ui/Icone';
import type { TypeContact } from './ContactProvider';

/*
 * Aide en direct (simulée) : chat, rappel ou visio avec co-navigation,
 * déclenchés depuis l'étape où le client bloque. L'étape est transmise au conseiller.
 */
interface Message {
  de: 'client' | 'conseiller';
  texte: string;
}

export function AideEnDirect({ etape, basculer }: { etape?: string; basculer: (t: TypeContact) => void }) {
  const [chat, setChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [saisie, setSaisie] = useState('');
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => fin.current?.scrollIntoView({ block: 'nearest' }), [messages]);

  const demarrerChat = () => {
    setChat(true);
    setMessages([{ de: 'conseiller', texte: `Bonjour ! Je vois que vous êtes à l'étape « ${etape ?? 'Accueil'} ». Comment puis-je vous aider ?` }]);
  };
  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    if (!saisie.trim()) return;
    setMessages((m) => [...m, { de: 'client', texte: saisie.trim() }]);
    setSaisie('');
    setTimeout(
      () => setMessages((m) => [...m, { de: 'conseiller', texte: "Merci pour votre question. (Réponse simulée : en production, un conseiller menuiserie vous répond ici, avec votre projet sous les yeux.)" }]),
      900,
    );
  };

  if (chat)
    return (
      <div>
        <div className="h-72 space-y-2 overflow-y-auto rounded-xl bg-fond p-3" aria-live="polite">
          {messages.map((m, i) => (
            <p key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.de === 'client' ? 'ml-auto bg-bleu text-white' : 'bg-white text-texte ring-1 ring-bord'}`}>
              <span className="sr-only">{m.de === 'client' ? 'Vous : ' : 'Conseiller : '}</span>
              {m.texte}
            </p>
          ))}
          <div ref={fin} />
        </div>
        <form onSubmit={envoyer} className="mt-3 flex gap-2">
          <label htmlFor="saisie-chat" className="sr-only">
            Votre message
          </label>
          <input id="saisie-chat" value={saisie} onChange={(e) => setSaisie(e.target.value)} className="min-w-0 flex-1 rounded-full border-2 border-bord px-4 py-2 focus:border-bleu focus:outline-none" placeholder="Écrivez votre question…" />
          <Bouton type="submit" aria-label="Envoyer" icone="droite" />
        </form>
        <p className="mt-2 text-xs italic">Chat simulé – prototype.</p>
      </div>
    );

  const choix = [
    { icone: 'chat', titre: 'Discuter par chat', texte: 'Une réponse écrite, sans quitter la page.', action: demarrerChat },
    { icone: 'telephone', titre: 'Être rappelé', texte: 'Un conseiller vous appelle au moment choisi.', action: () => basculer('rappel') },
    { icone: 'visio', titre: 'Visio avec co-navigation', texte: 'Le conseiller voit votre configuration et vous guide à l\'écran.', action: () => basculer('rdv-visio') },
  ];
  return (
    <div>
      {etape && (
        <p className="mb-4 rounded-lg bg-bleu-clair p-3 text-sm text-marine">
          Vous êtes à l'étape <strong>{etape}</strong> : le conseiller le saura.
        </p>
      )}
      <ul className="space-y-3">
        {choix.map((c) => (
          <li key={c.titre}>
            <button type="button" onClick={c.action} className="flex w-full items-center gap-4 rounded-xl border-2 border-bord p-4 text-left hover:border-bleu">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-bleu-clair text-bleu">
                <Icone nom={c.icone} />
              </span>
              <span>
                <span className="block font-bold text-marine">{c.titre}</span>
                <span className="text-sm">{c.texte}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
