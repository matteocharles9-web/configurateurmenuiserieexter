# Fonctionnalités : réel, simulé, à acheter ou à intégrer

Ce tableau sert à l'arbitrage **make or buy** du configurateur.

- **Réellement fonctionnel** : fonctionne pour de vrai dans le prototype, sans serveur.
- **Simulé** : l'interface est complète, mais rien n'est envoyé ni calculé sur des données réelles.
- **À acheter ou à intégrer en production** : brique éditeur ou connexion au SI à prévoir.

| Fonctionnalité | Réellement fonctionnel | Simulé | À acheter ou à intégrer en production |
| --- | --- | --- | --- |
| Maison interactive (accueil) | Scène SVG avec les 10 familles, survol, zoom animé, panneau catégorie, ajout au projet en cours, maison qui reflète le projet | – | Visuels 3D ou photos de maisons types, contenus éditoriaux par catégorie |
| Solution standard ou sur mesure | Calcul de la taille standard (sens et tolérance de pose), schéma de l'écart, comparaison chiffrée, restriction matériaux et coloris en standard | Prix fictifs, délais « À chiffrer » | **Référentiel standard** : tailles réellement en stock par magasin, prix et disponibilités (PIM, stocks) |
| Types de pose et pose par le client | Types de pose par produit, choix installateur ou client, impact sur le devis | Prix de pose fictifs | Grille de prix des poseurs par zone, règles de faisabilité |
| Accessoires nécessaires à la pose | Liste calculée (produit, modèle, pose, solution, écart), quantités et prix par ligne | Prix fictifs | Nomenclatures fournisseurs, articles réels et ajout au panier |
| Double entrée produit / besoin | Questionnaire, règles de recommandation, préremplissage du parcours | – | Règles à valider par le métier ; enrichissement possible par les données de vente |
| Parcours en 5 étapes, progression, retour à toute étape | Oui, sur mobile et ordinateur | – | – |
| Catalogue (10 familles, 42 modèles, tous types de volets, portails et portillons), gammes, options | Moteur de règles (options par produit et modèle, cohérence matériau / coloris) | Contenu représentatif | **Référentiel produit (PIM)** et règles de faisabilité fournisseurs |
| Aide à la prise de mesures | Guide pas à pas avec schémas, message « métrage par le poseur » | – | Vidéos pédagogiques ; **mesure assistée par smartphone** (brique éditeur) |
| Alerte réglementaire | Règles copropriété, secteur protégé, changement d'aspect, démarches affichées | – | Validation juridique des textes ; éventuellement API cadastre / PLU / périmètres ABF |
| Projet maison entière | Plusieurs ouvertures, duplication, même coloris pour toutes, suppression | – | – |
| Performances en bénéfices | Niveaux qualitatifs calculés (matériau + gamme + options) | Niveaux indicatifs | Fiches techniques fournisseurs (Uw, Rw…) converties en niveaux |
| Choix de la pose, reprise, volets motorisés | Oui, avec impact sur l'estimation | – | Règles de pose par produit (fournisseur / poseurs) |
| Aperçu SVG selon matériau et coloris | Oui (rendu vectoriel généré) | – | Visuels ou 3D fournisseurs pour un rendu photoréaliste |
| Aperçu sur votre photo | Import photo, placement et redimensionnement manuels, transparence, sauvegarde locale | – | **Visualisation photo avancée** : détection automatique des ouvertures, perspective, réalité augmentée (brique éditeur) |
| Estimation indicative | Calcul de fourchette à partir de `catalogue.json` | **Prix fictifs** | **Prix réels** : grille tarifaire, promotions, frais de pose par zone |
| Délais, aides, économies, financement | Emplacements prévus dans le récapitulatif | « À chiffrer » | Données fournisseurs (délais), barèmes d'aides, simulateur de financement |
| Réalisations et avis | Filtrage sur les produits du projet | **Données fictives** | Plateforme d'avis clients, photothèque de chantiers géolocalisés |
| Commande d'échantillons | Liste d'échantillons, choix domicile / magasin | Commande | Logistique échantillons (commande, stock, envoi) |
| Sauvegarde sans compte | Sauvegarde automatique locale (localStorage), identifiant `CAS-XXXXXX` | – | **Identifiant projet partagé** entre web, magasin et hotline (socle commun) |
| QR code et lien de reprise | QR code généré localement ; le lien contient le projet et fonctionne sur un autre appareil | – | Lien court pointant vers l'identifiant projet stocké côté serveur |
| Partage pour décider à deux | Lien de partage réel (configuration dans l'URL), vue en lecture, copie modifiable | Envoi de l'avis | Stockage serveur du projet partagé, notifications |
| Envoyer à un conseiller | Formulaire avec validation | Envoi | **CRM** : création du lead, affectation, projet joint |
| Prendre RDV Minute'pass (magasin, téléphone, visio) | Choix du mode, du jour et du créneau, validation | Créneaux, magasins, confirmation | **Prise de RDV magasin** : agenda des conseillers, confirmations SMS / e-mail |
| Être rappelé | Formulaire avec validation | Envoi | Outil de centre d'appels / hotline, routage |
| Aide en direct | Bouton sur chaque étape, étape transmise | Chat, visio, co-navigation | Solution de chat / visio / co-browsing (éditeur) |
| Consentements | Case à cocher obligatoire avant tout envoi | Mention | **RGPD** : mentions validées par le DPO, gestion des consentements (CMP), durée de conservation |
| Mesure d'audience | – | – | Tracking des indicateurs de la slide « Pilotage » (configurations lancées ou terminées, projets sauvegardés ou transmis) |
