\# Document de Conception Système : Site Web du Département Informatique

\## 1. Présentation Générale du Projet

Ce projet consiste à développer une application Web full-stack pour le Département Informatique d'une université. Le système comprend une partie publique (vitrine institutionnelle) et un back-office sécurisé (intranet) intégrant un workflow de validation strict et une traçabilité complète.

\### 1.1. Stack Technologique

\* \*\*Backend (API) :\*\* PHP 8+, Symfony 7 (avec API Platform ou contrôleurs API classiques), Doctrine ORM.

\* \*\*Base de données :\*\* MySQL.

\* \*\*Frontend (Client) :\*\* React.js (via Vite), React Router Dom.

\* \*\*Styling :\*\* Tailwind CSS.

\* \*\*Design System (UI/UX) :\*\* Style "Institutionnel/Académique". Formes géométriques strictes (bords carrés \`rounded-none\`), typographie imposante (souvent en majuscules \`uppercase\`), contraste fort.

\* \*\*Couleur Principale (Accent) :\*\* Terracotta/Rouille (Hex: \`#a45d45\`). Couleur de fond principale : Blanc (\`#ffffff\`) et Gris très clair (\`#f9fafb\`).

\---

\## 2. Les Acteurs du Système (Use Cases)

Le système gère 5 types d'acteurs distincts. La sécurité est gérée via Symfony Security (JWT Tokens pour l'API).

\### 2.1. Le Visiteur (Public / Non authentifié)

\* \*\*Accès :\*\* Interface publique (Frontend).

\* \*\*Fonctionnalités :\*\*

\* Consulter la page d'accueil (Mot du chef, actualités à la une).

\* Consulter l'historique et les objectifs du département.

\* Lister et filtrer les filières (Licences et Masters).

\* Consulter l'annuaire de l'équipe pédagogique (profs, contacts).

\* Consulter les laboratoires et leurs axes de recherche.

\* Consulter les actualités et événements (avec filtres par mot-clé et année).

\* Accéder à la page de contact (Google Maps, adresse).

\### 2.2. L'Enseignant (Authentifié - \`ROLE_PROF\`)

\* \*\*Accès :\*\* Dashboard Back-office.

\* \*\*Fonctionnalités :\*\*

\* Gérer son profil personnel (Mettre à jour téléphone, photo, bureau).

\* Ajouter ses publications scientifiques récentes (crée une \`Actualite\` de type "Publication").

\### 2.3. Le Secrétariat (Authentifié - \`ROLE_SECRETAIRE\`)

\* \*\*Accès :\*\* Dashboard Back-office (Vue restreinte).

\* \*\*Fonctionnalités :\*\*

\* Proposer la création ou la modification de contenus (Actualités, Événements, Filières).

\* \*\*Contrainte de Workflow :\*\* Le secrétariat ne publie pas directement en production. Toute action génère une entité avec le statut \`En_Attente\`.

\* Consulter les propositions refusées, lire le \`motifRefus\` laissé par l'administrateur, et corriger la proposition pour la soumettre à nouveau.

\### 2.4. Le Sous-Administrateur / Gestionnaire (Authentifié - \`ROLE_ADMIN\`)

\* \*\*Accès :\*\* Dashboard Back-office complet (sauf gestion des privilèges).

\* \*\*Fonctionnalités :\*\*

\* Effectuer le CRUD complet et direct (sans validation) sur toutes les entités métier (Filières, Enseignants, Laboratoires, Actualités).

\* Consulter le journal de traçabilité (\`HistoriqueAction\`).

\### 2.5. Le Super-Administrateur / Chef IT (Authentifié - \`ROLE_SUPER_ADMIN\`)

\* \*\*Accès :\*\* Dashboard Back-office complet + Module de sécurité.

\* \*\*Fonctionnalités :\*\*

\* Hérite de tous les droits du Sous-Administrateur.

\* \*\*Gestion des privilèges :\*\* Activer les comptes et assigner les rôles aux utilisateurs.

\* \*\*Validation du Workflow :\*\* Accepter (passe en \`Publiee\`) ou Refuser (passe en \`Refusee\` avec obligation de saisir un \`motifRefus\`) les propositions soumises par le Secrétariat.

\---

\## 3. Modèle de Données et Entités (Doctrine)

\### 3.1. Héritage des Utilisateurs (Single Table Inheritance)

L'entité abstraite \`Utilisateur\` gère l'authentification.

\* \*\*Propriétés communes :\*\* \`id\`, \`email\`, \`password\` (hashé), \`roles\` (JSON), \`isActive\` (boolean), \`createdAt\`, \`updatedAt\`.

\* Les classes enfants (\`Admin\`, \`Secretaire\`, \`Enseignant\`) en héritent. L'entité \`Enseignant\` possède des attributs supplémentaires : \`nom\`, \`prenom\`, \`telephone\`, \`photo\`, \`grade\`.

\### 3.2. Les Entités Métier Principales

\* \*\*\`Filiere\` :\*\* \`id\`, \`nom\`, \`slug\`, \`type\` (Enum: Licence, Master), \`description\`, \`objectifs\`, \`isActive\` (boolean).

\* \*\*\`Laboratoire\` :\*\* \`id\`, \`nom\`, \`acronyme\`, \`description\`, \`logoUrl\`.

\* \*\*\`AxeRecherche\` :\*\* \`id\`, \`titre\`, \`description\`.

\* \*\*\`Actualite\` / \`Evenement\` :\*\* \`id\`, \`titre\`, \`slug\`, \`contenu\` (Texte riche/HTML), \`type\` (Enum: Conférence, Publication, Annonce), \`dateEvenement\` (datetime), \`imageCoverUrl\`.

\* \*Attributs de Workflow :\* \`statut\` (Enum: En_Attente, Publiee, Refusee), \`motifRefus\` (text, nullable).

\### 3.3. L'Entité de Traçabilité (Logs)

\* \*\*\`HistoriqueAction\` :\*\* Sert de journal d'audit inaltérable.

\* \`id\` (int)

\* \`action\` (string : Création, Modification, Validation, Refus)

\* \`entiteConcernee\` (string : Nom de la table/entité modifiée)

\* \`idEntite\` (int : ID de l'enregistrement modifié)

\* \`detailsChangement\` (json/text : Données modifiées)

\* \`dateAction\` (datetime)

\---

\## 4. Relations entre les Tables (MCD / Mapping ORM)

Instruction stricte pour la configuration Doctrine :

1\. \*\*Enseignant &lt;-&gt; Filiere (ManyToMany) :\*\*

\* Un enseignant intervient dans 1 ou plusieurs filières.

\* Une filière possède 1 ou plusieurs enseignants.

\* \*Table de jointure : \`enseignant_filiere\`.\*

2\. \*\*Enseignant &lt;-&gt; Laboratoire (ManyToMany) :\*\*

\* Un enseignant appartient à 1 ou plusieurs laboratoires.

\* Un laboratoire affilie 1 ou plusieurs enseignants.

\* \*Table de jointure : \`enseignant_laboratoire\`.\*

3\. \*\*Laboratoire &lt;-&gt; AxeRecherche (OneToMany / ManyToOne) :\*\*

\* Un laboratoire possède plusieurs axes de recherche (\`OneToMany\`).

\* Un axe de recherche est rattaché à un seul laboratoire (\`ManyToOne\`).

4\. \*\*Utilisateur &lt;-&gt; HistoriqueAction (OneToMany / ManyToOne) :\*\*

\* Un utilisateur (Admin, Secrétaire...) génère plusieurs lignes d'historique (\`OneToMany\`).

\* Une action de l'historique est effectuée par un seul utilisateur (\`ManyToOne\`).

5\. \*\*Utilisateur (Secrétaire/Admin/Enseignant) &lt;-&gt; Actualite (OneToMany / ManyToOne) :\*\*

\* Un utilisateur est l'auteur d'une ou plusieurs actualités/événements (\`OneToMany\`).

\* Une actualité appartient à un seul auteur (\`ManyToOne\`).

\---

\## 5. Directives Spécifiques pour la Génération de Code (React & Symfony)

\* \*\*Design React :\*\* Ne pas utiliser de classes CSS impliquant des ombres douces (\`shadow-lg\`, \`shadow-xl\`) ou de grands arrondis (\`rounded-2xl\`, \`rounded-full\` sauf pour les avatars). Privilégier les bordures épaisses (\`border-l-4\`, \`border-t-4\`), les angles droits (\`rounded-none\` ou \`rounded-sm\`) et la rigueur visuelle.

\* \*\*Composants UI :\*\* Utiliser la librairie d'icônes \`lucide-react\`.

\* \*\*API Symfony :\*\* Tous les endpoints exposant des données publiques doivent filtrer les entités pour ne retourner que celles ayant \`isActive = true\` et \`statut = 'Publiee'\`.

\* \*\*Contrôleur de Validation :\*\* Prévoir un endpoint spécifique pour l'action du Super-Admin : \`PATCH /api/actualites/{id}/valider\` ou \`PATCH /api/actualites/{id}/refuser\` qui mettra à jour le statut, le \`motifRefus\` et générera automatiquement une entrée dans \`HistoriqueAction\`.