# Configurateur menuiserie extérieure – prototype cliquable

Prototype du **configurateur en ligne** décrit dans la proposition web « Menuiserie extérieure » (brique 2 · Aider à choisir, et pistes complémentaires des slides 13 à 15), élargi à **toute la menuiserie extérieure, en standard comme en sur mesure** : fenêtres, portes-fenêtres, baies coulissantes, fenêtres de toit, portes d'entrée et de service, portes de garage, volets, portails et portillons.

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
| `prix` | Coefficients matériau / gamme / modèle, coefficient standard, reprise, largeur de la fourchette. `modePrix: "masque"` affiche « XXX € » partout. | Fictif |
| `familles[].prixFictif`, `familles[].standard` | Prix de base et au m² ; tailles, matériaux et coloris de l'offre standard | Fictif / représentatif |
| `pose` | Types de pose par produit (tolérance d'écart pour le standard, sens de pose, prix de pose), pose par un installateur ou par le client | Prix fictifs, tolérances à valider |
| `accessoires` | Accessoires nécessaires à la pose, filtrés par produit, modèle, type de pose et solution (standard avec écart à combler) | Prix fictifs, liste à valider |
| `solutions` | Textes des solutions standard et sur mesure, délais | Délais « À chiffrer » |
| `aChiffrer` | Délais de fabrication et de pose, aides, économies d'énergie, financement | « À chiffrer » |
| `familles`, `modeles`, `materiaux`, `coloris`, `gammes` | Catalogue produit (10 familles, 42 modèles, dont tous les types de volets) | Représentatif, à valider |
| `optionsGroupes` | Options par produit (vitrage, sécurité, volet intégré, motorisation, domotique…) | Représentatif, prix fictifs |
| `performances` | Niveaux qualitatifs (Correct / Bon / Excellent) et phrases « bénéfice client » | À valider avec les fiches fournisseurs |
| `reglementaire` | Règles et démarches (copropriété, secteur protégé, changement d'aspect) | Textes à faire valider (juridique) |
| `besoins` | Questionnaire « Je pars de mon besoin » et règles de recommandation | À valider par le métier |
| `rdv` | Magasins et créneaux Minute'pass | Fictif |
| `realisations`, `avis` | Chantiers et avis | Fictif |

## Parcours et fonctionnalités

- **Accueil : la maison interactive.** Une maison type réunit toutes les menuiseries extérieures. Au survol, l'élément est mis en évidence. Au clic (ou avec Entrée au clavier), une animation zoome sur l'élément, puis un panneau présente la catégorie : modèles, offre standard et sur mesure, types de pose. De là, on configure le produit ou on l'ajoute au projet en cours. La maison reprend les choix du projet (coches, modèles, coloris). Une liste accessible double la maison. L'entrée « Je pars de mon besoin » (4 questions, puis une recommandation argumentée) reste disponible.
- **6 étapes** : Produit › Dimensions et pose › Standard ou sur mesure › Matériau › Coloris › Options, puis Récapitulatif. La barre de progression est cliquable. Sur mobile, une barre d'action fixe affiche l'estimation et le bouton « Suivant ».
- **Dimensions et pose** : dimensions, guide de mesure en schémas (avec des conseils propres à chaque produit), type de pose propre au produit (rénovation, dépose totale, neuf, fenêtre de toit à remplacer ou à créer, porte de garage en applique ou en tableau, volet en façade ou en tableau, portail entre piliers existants ou neufs), pose par un installateur ou par le client, reprise des anciennes menuiseries.
- **Standard ou sur mesure** : deux solutions chiffrées côte à côte. Chacune détaille le produit, les options, la pose, la reprise et les accessoires de pose (quantités et prix), avec la fourchette totale et le délai. La taille standard retenue est la plus proche qui respecte le sens et la tolérance de la pose. L'écart à combler est montré sur un schéma et entraîne les accessoires de compensation. Si aucune taille standard ne convient, la raison est affichée. En standard, les étapes Matériau et Coloris se limitent à l'offre standard, avec un bouton pour repasser en sur mesure.
- **Matériau et options** : performances traduites en bénéfices (confort d'hiver, calme, économies d'énergie, sécurité, entretien), en niveaux qualitatifs qui changent selon la gamme et les options.
- **Coloris** : nuancier, commande d'échantillon, application du coloris à toutes les ouvertures, questions sur le logement et alertes réglementaires avec la démarche à suivre.
- **Options** : vitrage, sécurité, volet roulant intégré (manuel ou motorisé filaire, radio, solaire), occultation et motorisation des fenêtres de toit, motorisation de portail, visiophone, boîte aux lettres, gâche électrique, domotique.
- **Aperçu** : rendu SVG qui suit le produit, le modèle, le matériau, le coloris et certaines options. L'onglet « Sur votre photo » permet d'importer une photo et d'y placer le rendu à la main (glisser, poignée, curseurs, clavier).
- **Récapitulatif** : répartition produits / pose / accessoires, ouvertures (modifier, dupliquer, supprimer, ajouter, harmoniser les coloris), fourchette de prix, lignes « À chiffrer » (délais, aides, économies, financement), démarches, échantillons, identifiant projet et QR code, lien de partage, et les boutons « Envoyer à un conseiller », « Prendre RDV Minute'pass » et « Être rappelé ».
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
  lib/                       logique pure : prix et devis, solution standard, performances, réglementaire,
                             recommandation, partage (encodage des liens), stockage
  state/                     état du projet (contexte React + sauvegarde automatique)
  router.ts                  routage par hash (#/projet/CAS-XXXXXX/coloris…)
  pages/                     un écran par fichier (accueil, besoin, configurateur, récap…)
  components/
    maison/                  maison interactive de l'accueil (scène, zoom, panneau catégorie)
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
