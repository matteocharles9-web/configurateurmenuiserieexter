import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { catalogue } from '../../data/types';
import { useProjet } from '../../state/ProjetContext';
import { Bouton } from '../ui/Bouton';
import { Champ, Liste, Zone } from '../ui/Champ';
import { ChoixSegmente } from '../ui/Choix';
import { Icone } from '../ui/Icone';

/* Formulaires simulés : validation réelle côté navigateur, mais rien n'est envoyé. */

const TEL = /^(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/;
const MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Coordonnees {
  nom: string;
  telephone: string;
  email: string;
  consentement: boolean;
}

function useCoordonnees(emailObligatoire: boolean, telObligatoire: boolean) {
  const [c, setC] = useState<Coordonnees>({ nom: '', telephone: '', email: '', consentement: false });
  const [tente, setTente] = useState(false);
  const erreurs = {
    nom: !c.nom.trim() ? 'Indiquez votre nom.' : undefined,
    telephone: (telObligatoire || c.telephone) && !TEL.test(c.telephone.trim()) ? 'Numéro de téléphone français attendu (ex. 06 12 34 56 78).' : undefined,
    email: (emailObligatoire || c.email) && !MAIL.test(c.email.trim()) ? 'Adresse e-mail invalide.' : undefined,
    consentement: !c.consentement ? 'Votre accord est nécessaire pour être recontacté.' : undefined,
  };
  const valide = !Object.values(erreurs).some(Boolean);
  const champs = (
    <div className="space-y-3">
      <Champ libelle="Nom" required autoComplete="name" value={c.nom} onChange={(e) => setC({ ...c, nom: e.target.value })} erreur={tente ? erreurs.nom : undefined} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Champ libelle="Téléphone" required={telObligatoire} type="tel" autoComplete="tel" inputMode="tel" value={c.telephone} onChange={(e) => setC({ ...c, telephone: e.target.value })} erreur={tente ? erreurs.telephone : undefined} />
        <Champ libelle="E-mail" required={emailObligatoire} type="email" autoComplete="email" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} erreur={tente ? erreurs.email : undefined} />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-bleu" checked={c.consentement} onChange={(e) => setC({ ...c, consentement: e.target.checked })} />
        <span>
          J'accepte d'être recontacté au sujet de ce projet. <span className="italic">(Mention RGPD complète à rédiger avec le DPO.)</span>
          {tente && erreurs.consentement && <span className="block font-bold text-red-700">{erreurs.consentement}</span>}
        </span>
      </label>
    </div>
  );
  return { c, champs, valide, setTente };
}

function Confirmation({ titre, children, onFermer }: { titre: string; children: ReactNode; onFermer: () => void }) {
  return (
    <div className="text-center" role="status">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-green-100 text-ok">
        <Icone nom="ok" className="size-8" />
      </span>
      <p className="mt-3 font-titre text-lg font-semibold text-marine">{titre}</p>
      <div className="mt-2 space-y-2 text-sm">{children}</div>
      <p className="mt-4 rounded-lg bg-jaune-clair p-3 text-xs text-marine">
        <strong>Simulation :</strong> aucune donnée n'a été envoyée. En production, la demande serait transmise au CRM avec l'identifiant projet.
      </p>
      <Bouton className="mt-4" onClick={onFermer}>
        Fermer
      </Bouton>
    </div>
  );
}

function ProjetJoint() {
  const { projet } = useProjet();
  if (!projet) return null;
  return (
    <p className="flex items-center gap-2 rounded-lg bg-bleu-clair p-3 text-sm text-marine">
      <Icone nom="ok" className="size-5 shrink-0" />
      <span>
        Votre projet <strong>{projet.id}</strong> ({projet.ouvertures.length} ouverture{projet.ouvertures.length > 1 ? 's' : ''}, dimensions et photos) sera joint : pas besoin de tout réexpliquer.
      </span>
    </p>
  );
}

export function FormConseiller({ onFermer }: { onFermer: () => void }) {
  const { ajouterDemande } = useProjet();
  const { c, champs, valide, setTente } = useCoordonnees(true, false);
  const [message, setMessage] = useState('');
  const [envoye, setEnvoye] = useState(false);
  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    setTente(true);
    if (!valide) return;
    ajouterDemande({ type: 'conseiller', detail: `Projet envoyé à un conseiller (${c.email})` });
    setEnvoye(true);
  };
  if (envoye)
    return (
      <Confirmation titre="Projet envoyé à un conseiller" onFermer={onFermer}>
        <p>Un conseiller menuiserie étudie votre projet et vous recontacte.</p>
        <p>Délai de réponse : {catalogue.meta.aChiffrer}</p>
      </Confirmation>
    );
  return (
    <form onSubmit={envoyer} noValidate className="space-y-4">
      <ProjetJoint />
      {champs}
      <Zone libelle="Votre message (facultatif)" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ex. : je souhaite être conseillé sur le choix du vitrage." />
      <Bouton type="submit" pleineLargeur icone="chat">
        Envoyer mon projet
      </Bouton>
    </form>
  );
}

type Mode = 'magasin' | 'telephone' | 'visio';

export function FormRdv({ onFermer, modeInitial = 'magasin' }: { onFermer: () => void; modeInitial?: Mode }) {
  const { ajouterDemande } = useProjet();
  const { champs, valide, setTente } = useCoordonnees(false, true);
  const [mode, setMode] = useState<Mode>(modeInitial);
  const [magasin, setMagasin] = useState(catalogue.rdv.magasins[0]);
  const jours = useMemo(() => {
    const res: Date[] = [];
    const d = new Date();
    while (res.length < catalogue.rdv.joursProposes) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) res.push(new Date(d));
    }
    return res;
  }, []);
  const [jour, setJour] = useState(0);
  const [creneau, setCreneau] = useState<string>();
  const [erreurCreneau, setErreurCreneau] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const fmt = (d: Date, long = false) => d.toLocaleDateString('fr-FR', long ? { weekday: 'long', day: 'numeric', month: 'long' } : { weekday: 'short', day: 'numeric', month: 'short' });
  const libelleMode = { magasin: 'en magasin', telephone: 'par téléphone', visio: 'en visio' }[mode];

  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    setTente(true);
    setErreurCreneau(!creneau);
    if (!valide || !creneau) return;
    ajouterDemande({ type: 'rdv', detail: `RDV Minute'pass ${libelleMode} le ${fmt(jours[jour], true)} à ${creneau}${mode === 'magasin' ? ` – ${magasin}` : ''}` });
    setEnvoye(true);
  };

  if (envoye)
    return (
      <Confirmation titre="Rendez-vous Minute'pass confirmé" onFermer={onFermer}>
        <p>
          Rendez-vous {libelleMode} le <strong>{fmt(jours[jour], true)}</strong> à <strong>{creneau}</strong>
          {mode === 'magasin' && <> – {magasin}</>}.
        </p>
        <p>Votre conseiller aura votre projet sous les yeux.</p>
      </Confirmation>
    );

  return (
    <form onSubmit={envoyer} noValidate className="space-y-5">
      <ChoixSegmente
        legende="Comment souhaitez-vous échanger avec le conseiller ?"
        nom="mode-rdv"
        valeur={mode}
        options={[
          { v: 'magasin', l: 'En magasin' },
          { v: 'telephone', l: 'Par téléphone' },
          { v: 'visio', l: 'En visio' },
        ]}
        onChange={setMode}
      />
      {mode === 'magasin' && (
        <Liste libelle="Magasin (liste fictive)" value={magasin} onChange={(e) => setMagasin(e.target.value)}>
          {catalogue.rdv.magasins.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </Liste>
      )}
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-marine">Choisissez un jour</legend>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {jours.map((d, i) => (
            <label key={d.toISOString()} className={`shrink-0 cursor-pointer rounded-xl border-2 px-3 py-2 text-center text-sm font-bold capitalize has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bleu ${jour === i ? 'border-bleu bg-bleu text-white' : 'border-bord bg-white text-marine'}`}>
              <input type="radio" name="jour" className="sr-only" checked={jour === i} onChange={() => setJour(i)} />
              {fmt(d)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-2 text-sm font-bold text-marine">Choisissez un créneau (créneaux fictifs)</legend>
        <div className="grid grid-cols-3 gap-2">
          {catalogue.rdv.creneaux.map((h) => (
            <label key={h} className={`cursor-pointer rounded-xl border-2 py-2 text-center font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-bleu ${creneau === h ? 'border-bleu bg-bleu text-white' : 'border-bord bg-white text-marine'}`}>
              <input type="radio" name="creneau" className="sr-only" checked={creneau === h} onChange={() => setCreneau(h)} />
              {h}
            </label>
          ))}
        </div>
        {erreurCreneau && !creneau && <p className="mt-1 text-sm font-bold text-red-700">Choisissez un créneau.</p>}
      </fieldset>
      <ProjetJoint />
      {champs}
      <Bouton type="submit" pleineLargeur icone="calendrier">
        Confirmer le rendez-vous
      </Bouton>
    </form>
  );
}

export function FormRappel({ onFermer }: { onFermer: () => void }) {
  const { ajouterDemande } = useProjet();
  const { champs, valide, setTente } = useCoordonnees(false, true);
  const [moment, setMoment] = useState<'vite' | 'matin' | 'aprem' | 'soir'>('vite');
  const [envoye, setEnvoye] = useState(false);
  const libelle = { vite: 'dès que possible', matin: 'le matin', aprem: "l'après-midi", soir: 'en fin de journée' }[moment];
  const envoyer = (e: FormEvent) => {
    e.preventDefault();
    setTente(true);
    if (!valide) return;
    ajouterDemande({ type: 'rappel', detail: `Rappel demandé ${libelle}` });
    setEnvoye(true);
  };
  if (envoye)
    return (
      <Confirmation titre="Demande de rappel enregistrée" onFermer={onFermer}>
        <p>Un conseiller menuiserie vous rappelle {libelle}.</p>
        <p>Même service qu'en magasin, où que vous soyez.</p>
      </Confirmation>
    );
  return (
    <form onSubmit={envoyer} noValidate className="space-y-4">
      <ChoixSegmente
        legende="Quand souhaitez-vous être rappelé ?"
        nom="moment"
        valeur={moment}
        options={[
          { v: 'vite', l: 'Dès que possible' },
          { v: 'matin', l: 'Le matin' },
          { v: 'aprem', l: "L'après-midi" },
          { v: 'soir', l: 'En fin de journée' },
        ]}
        onChange={setMoment}
      />
      <ProjetJoint />
      {champs}
      <Bouton type="submit" pleineLargeur icone="telephone">
        Être rappelé
      </Bouton>
    </form>
  );
}
