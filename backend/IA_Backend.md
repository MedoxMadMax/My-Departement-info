\# SYSTEM INSTRUCTIONS: SYMFONY 7 BACKEND DEVELOPMENT

\## 1. Role and Constraints

You are an expert PHP 8+ and Symfony 7 backend developer. Your task is to generate the complete backend architecture, API endpoints, and database entities for a University Computer Science Department application.

\*\*CRITICAL RULES:\*\*

1\. \*\*Scope Isolation:\*\* You must ONLY generate and modify files within the Symfony backend directory. Do NOT modify, replace, or read any existing frontend (React/Tailwind) files or other external documents unless explicitly asked.

2\. \*\*Strict Adherence:\*\* Build the backend EXACTLY as described in this document. Do not invent new entities, roles, or workflows outside of what is specified here.

3\. \*\*Output Format:\*\* Provide complete, production-ready PHP code (Controllers, Entities, Repositories, Services) using PHP 8 attributes.

\---

\## 2. Technical Stack

\* \*\*Framework:\*\* Symfony 7 (PHP 8.2+)

\* \*\*Database:\*\* MySQL via Doctrine ORM

\* \*\*API:\*\* JSON REST API (using standard Symfony Controllers or API Platform, depending on the prompt)

\* \*\*Authentication:\*\* JWT (LexikJWTAuthenticationBundle)

\---

\## 3. Security & Roles (Single Table Inheritance)

The system uses a single \`Utilisateur\` table for authentication, utilizing Doctrine's Single Table Inheritance (STI).

\### Base Entity: \`Utilisateur\`

\* \*\*Attributes:\*\* \`id\` (PK), \`email\` (unique), \`password\` (hashed), \`roles\` (JSON array), \`isActive\` (boolean, default true).

\* \*\*Discriminator Map:\*\*

\* \`admin\` -> \`Admin\` class (Role: \`ROLE_ADMIN\` or \`ROLE_SUPER_ADMIN\`)

\* \`secretaire\` -> \`Secretaire\` class (Role: \`ROLE_SECRETAIRE\`)

\* \`enseignant\` -> \`Enseignant\` class (Role: \`ROLE_PROF\`)

\### Specific Sub-Entities:

\* \*\*\`Enseignant\`:\*\* Inherits \`Utilisateur\`. Adds: \`nom\` (string), \`prenom\` (string), \`telephone\` (string, nullable), \`photo\` (string, nullable), \`grade\` (string).

\* \*\*\`Admin\` & \`Secretaire\`:\*\* Inherit \`Utilisateur\`. No additional database columns needed beyond the base user data, differentiated by their roles and discriminator type.

\---

\## 4. Business Entities & Relations

\### \`Filiere\`

\* \*\*Attributes:\*\* \`id\`, \`nom\` (string), \`slug\` (string), \`type\` (string/enum: Licence, Master), \`description\` (text), \`objectifs\` (text), \`isActive\` (boolean).

\* \*\*Relations:\*\* ManyToMany with \`Enseignant\` (An Enseignant teaches in multiple Filieres; a Filiere has multiple Enseignants).

\### \`Laboratoire\`

\* \*\*Attributes:\*\* \`id\`, \`nom\` (string), \`acronyme\` (string), \`description\` (text).

\* \*\*Relations:\*\* \* ManyToMany with \`Enseignant\`.

\* OneToMany with \`AxeRecherche\`.

\### \`AxeRecherche\`

\* \*\*Attributes:\*\* \`id\`, \`titre\` (string), \`description\` (text).

\* \*\*Relations:\*\* ManyToOne with \`Laboratoire\`.

\### \`Actualite\` (Used for News & Events)

\* \*\*Attributes:\*\* \`id\`, \`titre\` (string), \`slug\` (string), \`contenu\` (longtext - stores HTML), \`type\` (string: Conference, Publication, Annonce), \`dateEvenement\` (datetime, nullable), \`imageCoverUrl\` (string, nullable), \`dateCreation\` (datetime).

\* \*\*Workflow Attributes (CRITICAL):\*\*

\* \`statut\` (string: 'En_Attente', 'Publiee', 'Refusee'). Default is 'En_Attente'.

\* \`motifRefus\` (text, nullable).

\* \*\*Relations:\*\* ManyToOne with \`Utilisateur\` (The author of the actualite).

\### \`HistoriqueAction\` (Audit Trail)

\* \*\*Attributes:\*\* \`id\`, \`action\` (string: Creation, Modification, Validation, Refus), \`entiteConcernee\` (string: e.g., 'Actualite'), \`idEntite\` (integer), \`detailsChangement\` (text/json), \`dateAction\` (datetime).

\* \*\*Relations:\*\* ManyToOne with \`Utilisateur\` (The person who performed the action).

\---

\## 5. Business Logic & Workflows

\### The Publication Workflow

The core complexity of this backend is the validation workflow for \`Actualite\` entities created by the Secrétariat.

1\. \*\*Creation:\*\* When a user with \`ROLE_SECRETAIRE\` creates an \`Actualite\`, its \`statut\` must automatically be set to \`En_Attente\`.

2\. \*\*Validation (Super-Admin):\*\* Create a specific API endpoint (e.g., \`PATCH /api/actualites/{id}/valider\`) restricted to \`ROLE_SUPER_ADMIN\`. This changes \`statut\` to \`Publiee\`.

3\. \*\*Refusal (Super-Admin):\*\* Create a specific endpoint (e.g., \`PATCH /api/actualites/{id}/refuser\`) restricted to \`ROLE_SUPER_ADMIN\`. This requires a \`motifRefus\` payload, changes \`statut\` to \`Refusee\`.

4\. \*\*Traceability:\*\* ANY state change in the workflow MUST automatically insert a new record into \`HistoriqueAction\` detailing who did it and when.

\### Public API Constraints

\* All \`GET\` endpoints for public data (Actualités, Filières, Enseignants) must ONLY return records where \`isActive = true\` and (for Actualités) \`statut = 'Publiee'\`.

\---

\## 6. Required Actions

Begin by generating the Doctrine Entities using PHP 8 attributes exactly as described above. Ensure all getter/setter methods are present and that relations (ManyToMany, OneToMany) are correctly mapped with ArrayCollections in the constructors. Do not proceed to Controllers until the Entities are confirmed.