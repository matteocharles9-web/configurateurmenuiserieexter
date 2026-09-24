import { FilAriane } from '../components/layout/EnTete';
import { Bouton } from '../components/ui/Bouton';
import { naviguer } from '../router';

export function ProjetIntrouvable({ id }: { id?: string }) {
  return (
    <>
      <FilAriane elements={[{ libelle: 'Accueil', lien: '#/' }, { libelle: 'Projet introuvable' }]} />
      <div className="mx-auto max-w-xl px-4 pt-8 text-center">
        <h1 className="text-2xl font-semibold">Projet introuvable sur cet appareil</h1>
        <p className="mt-3">
          {id ? <>Le projet <strong>{id}</strong> n'est pas enregistré dans ce navigateur. </> : null}
          Pour le reprendre sur un autre appareil, utilisez le QR code ou le lien de reprise affichés dans le récapitulatif.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Bouton onClick={() => naviguer('/')}>Nouveau projet</Bouton>
          <Bouton variante="secondaire" onClick={() => naviguer('/reprendre')}>
            Reprendre un projet
          </Bouton>
        </div>
      </div>
    </>
  );
}
