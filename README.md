# Configurateur menuiserie extérieure – prototype cliquable

Prototype du **configurateur en ligne** décrit dans la proposition web « Menuiserie extérieure » (brique 2 · Aider à choisir, et pistes complémentaires des slides 13 à 15).

Il sert à rendre l'idée concrète pour une démonstration et à **arbitrer le « make or buy »**. Ce n'est pas un site de production : il n'y a pas de backend, tout tourne dans le navigateur, et **tous les prix et toutes les données sont fictifs**.

> Aucun chiffre réel n'apparaît sans source. Les prix sont fictifs et signalés « Prix fictifs – prototype ». Les délais, aides, économies d'énergie et financements affichent « À chiffrer ».

## Lancer le prototype

Prérequis : [Node.js](https://nodejs.org) 20 ou plus récent.

```bash
npm install
npm run dev
```

Ouvrez ensuite l'adresse affichée (par défaut http://localhost:5173).

Pour l'ouvrir depuis un smartphone sur le même réseau Wi-Fi : `npm run dev -- --host`, puis utilisez l'adresse « Network » affichée.

Autres commandes :

| Commande | Rôle |
| --- | --- |
| `npm run build` | Vérifie les types et produit la version statique dans `dist/` |
| `npm run preview` | Sert la version construite localement |

## Mettre le prototype en ligne (accessible depuis n'importe quel appareil)

Le dépôt contient un déploiement automatique vers **GitHub Pages** (`.github/workflows/deploy-pages.yml`).

1. Sur GitHub : **Settings › Pages › Build and deployment › Source : « GitHub Actions »** (à faire une seule fois).
2. Fusionnez la branche dans `main` (ou lancez le workflow « Déploiement GitHub Pages » à la main depuis l'onglet **Actions**).
3. Le prototype est publié sur `https://<compte>.github.io/configurateurmenuiserieexter/`.

Le site est statique et utilise un routage par `#`. Les liens de reprise, les QR codes et les liens de partage fonctionnent donc aussi en ligne. Une balise `noindex` évite le référencement, et un bandeau permanent rappelle qu'il s'agit d'une maquette.

## Brancher les vraies données

**Toutes les valeurs métier sont dans un seul fichier : [`src/data/catalogue.json`](src/data/catalogue.json).**

| Bloc | Contenu | État actuel |
| --- | --- | --- |
| `prix` | Base, prix au m², coefficients matériau / gamme / modèle, pose, reprise, largeur de la fourchette. `modePrix: "masque"` affiche « XXX € TTC posé » partout. | Fictif |
| `aChiffrer` | Délais de fabrication et de pose, aides, économies d'énergie, financement | « À chiffrer » |
| `familles`, `modeles`, `materiaux`, `coloris`, `gammes` | Catalogue produit (7 familles, 31 modèles, dont tous les types de volets) | Représentatif, à valider |
| `optionsGroupes` | Options par produit (vitrage, sécurité, volet intégré, motorisation, domotique…) | Représentatif, prix fictifs |
| `performances` | Niveaux qualitatifs (Correct / Bon / Excellent) et phrases « bénéfice client » | À valider avec les fiches fournisseurs |
| `reglementaire` | Règles et démarches (copropriété, secteur protégé, changement d'aspect) | Textes à faire valider (juridique) |
| `besoins` | Questionnaire « Je pars de mon besoin » et règles de recommandation | À valider par le métier |
| `rdv` | Magasins et créneaux Minute'pass | Fictif |
| `realisations`, `avis` | Chantiers et avis | Fictif |

## Parcours et fonctionnalités

- **Accueil** : double entrée « Je sais ce que je veux » (7 familles de produits) ou « Je pars de mon besoin » (4 questions, puis une recommandation argumentée de produit, gamme, matériau et options).
- **5 étapes** : Produit › Dimensions › Matériau › Coloris › Options, puis Récapitulatif. La barre de progression est cliquable pour revenir à n'importe quelle étape. Sur mobile, une barre d'action fixe affiche l'estimation et le bouton « Suivant ».
- **Dimensions** : guide de mesure pas à pas en 4 schémas, avec rappel que le métrage définitif est fait par le poseur, et un emplacement réservé pour la mesure par smartphone.
- **Matériau et options** : performances traduites en bénéfices (confort d'hiver, calme, économies d'énergie, sécurité, entretien), en niveaux qualitatifs qui changent selon la gamme et les options.
- **Coloris** : nuancier, commande d'échantillon, application du coloris à toutes les ouvertures, questions sur le logement et alertes réglementaires avec la démarche à suivre.
- **Options** : vitrage, sécurité, volet roulant intégré (manuel ou motorisé filaire, radio, solaire), domotique, pose en rénovation ou dépose totale, reprise des anciennes menuiseries.
- **Aperçu** : rendu SVG qui suit le produit, le modèle, le matériau, le coloris et certaines options. L'onglet « Sur votre photo » permet d'importer une photo et d'y placer le rendu à la main (glisser, poignée, curseurs, clavier).
- **Récapitulatif** : ouvertures (modifier, dupliquer, supprimer, ajouter, harmoniser les coloris), fourchette de prix, lignes « À chiffrer » (délais, aides, économies, financement), démarches, échantillons, identifiant projet et QR code, lien de partage, et les boutons « Envoyer à un conseiller », « Prendre RDV Minute'pass » et « Être rappelé ».
- **Aide en direct** sur chaque écran : chat, rappel, ou visio avec co-navigation, tous simulés. L'étape en cours est transmise au conseiller.
- **Réalisations et avis** filtrés sur les produits du projet (données fictives).
- Page interne `#/galerie` : tous les rendus du catalogue, pour relecture.

## Ce qui est réel, simulé ou à acheter

Voir [`docs/FONCTIONNALITES.md`](docs/FONCTIONNALITES.md).

## Organisation du code

```
src/
  data/catalogue.json        toutes les valeurs (prix fictifs, textes, règles)
  data/types.ts              types du catalogue et modèle du projet
  lib/                       logique pure : prix, performances, réglementaire,
                             recommandation, partage (encodage des liens), stockage
  state/                     état du projet (contexte React + sauvegarde automatique)
  router.ts                  routage par hash (#/projet/CAS-XXXXXX/coloris…)
  pages/                     un écran par fichier (accueil, besoin, configurateur, récap…)
  components/
    etapes/                  un composant par étape du parcours
    apercu/                  rendu SVG, aperçu sur photo
    mesure/                  guide de prise de mesures
    projet/                  récapitulatif : ouvertures, estimation, alertes, avis…
    contact/                 conseiller, Minute'pass, rappel, aide en direct
    partage/                 sauvegarde, QR code, lien de partage
    layout/ ui/              en-tête, barre de progression, boutons, modales, champs
```

Stack : React 19, TypeScript, Vite, Tailwind CSS 4, et `qrcode` pour générer les QR codes en local.

Accessibilité de base : vrais boutons radio et cases à cocher sous les cartes de choix, navigation au clavier, focus visible, modales natives (`<dialog>`), libellés sur tous les champs, contrastes AA sur la palette du deck, et respect de `prefers-reduced-motion`.
