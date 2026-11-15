<div align="center">

# 🏥 Feed Backs — Suggestion Box

**Plateforme moderne d'écoute, de bientraitance et de pilotage de la qualité des soins hospitaliers.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?style=for-the-badge&logo=drizzle)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-4169E1?style=for-the-badge&logo=postgresql)](https://neon.tech/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Resend](https://img.shields.io/badge/Resend-Emails-000000?style=for-the-badge&logo=resend)](https://resend.com/)
[![Package Manager](https://img.shields.io/badge/Bun-1.3-FBF0DF?style=for-the-badge&logo=bun)](https://bun.sh/)

[Fonctionnalités](#-fonctionnalités-clés) • [Architecture](#-architecture-du-projet) • [Installation](#-installation--démarrage-rapide) • [Base de Données](#-base-de-données--migrations) • [Sécurité](#-sécurité--conformité)

</div>

---

## 📖 Présentation du Projet

**Feed Backs** est une solution numérique hospitalière conçue pour recueillir, analyser et instruire les retours d'expérience et suggestions des usagers et professionnels de santé. 

Développée pour répondre aux exigences des comités de qualité, d'éthique et de bientraitance, elle offre une expérience fluide tant pour les patients en chambre que pour les équipes soignantes et la direction médicale.

### Cibles & Rôles
1. **Malades / Patients** : Évaluation de l'accueil, de la prise en charge de la douleur, de l'écoute et du confort.
2. **Parents & Proches accompagnants** : Évaluation de l'information médicale, de l'orientation et de la considération humaine.
3. **Personnel Soignant** : Retours sur l'organisation des soins, le matériel et la collaboration inter-services.
4. **Personnel Administratif & Logistique** : Retours sur l'accueil, l'admission, l'entretien et l'environnement technique.

---

## ✨ Fonctionnalités Clés

### 🌐 1. Espace Public & Usagers (Sans friction)
- **Design Bento & Animations fluides** : Interface responsive, accessible et contrastée avec support des thèmes Sombre / Clair (`next-themes`).
- **Questionnaire Public Guidé en 4 étapes** (`/survey` et `/[departmentId]/survey`) :
  - **Étape 1 : Profil & Confidentialité** — Choix parmi les 4 profils d'acteurs et sélection entre dépôt **100% Anonyme** (recommandé) ou **Nominatif** (avec coordonnées sécurisées).
  - **Étape 2 : Contexte & Service** — Sélection du service ou **verrouillage automatique** lors d'un accès par QR Code spécifique, date de passage (`DatePickerInput`).
  - **Étape 3 : Évaluation dynamique personnalisée** — Moteur de questions adaptées au profil actif, supportant **7 types d'inputs officiels** (Étoiles 1-5, Texte court, Commentaire libre, Nombre, Boutons radio, Liste déroulante, Sélecteur de date).
  - **Étape 4 : Synthèse & Verbatims** — Note globale (1 à 5 étoiles), recommandation de l'établissement, 3 verbatims libres (points forts, dysfonctionnements, suggestions constructives).
- **Sauvegarde automatique du brouillon** : Mémorisation continue dans `localStorage` (avec exclusion stricte des données nominatives privées) et **vidage immédiat dès validation**.
- **Protection Anti-Abus** : Piège invisible Honeypot anti-spam + limitation de débit glissante par adresse IP (5 dépôts / 10 min).
- **Récépissé & Ticket de suivi PDF A5** : Génération côté client avec `@react-pdf/renderer`, code unique `FB-YYYY-XXXX`, **téléchargement automatique instantané** et QR Code de suivi.
- **Suivi de dossier en temps réel** (`/follow-up?code=...`) : Consultation transparente de l'avancement du traitement, du statut (`nouveau`, `en_cours`, `traite`), de la priorité et des actions correctives engagées, avec masquage strict des données internes.

### 📊 2. Tableau de Bord Exécutif de Qualité (`/dashboard`)
- **Indicateurs Clés (KPIs)** : Score moyen de satisfaction, total des avis collectés, alertes prioritaires ouvertes, taux de recommandation net.
- **Data Visualisation Recharts** :
  - Évolution temporelle de la satisfaction et des volumes.
  - Répartition des avis par profil d'acteurs.
  - Distribution des notes de 1 à 5 étoiles.
  - Taux de satisfaction comparé par service hospitalier.
- **Alertes Prioritaires Automatisées** : Calcul temps réel côté serveur (`1 étoile -> Urgente`, `2 étoiles -> Haute`, `>= 3 -> Normale`).

### 🩺 3. Gestion Hospitalière & Affichage (`/hospital-management`)
- **Services de Soins (`/departments`)** : Gestion complète (CRUD) des départements hospitaliers, statut actif/inactif, ordonnancement personnalisé.
- **Moteur de Questionnaire (`/forms-builder`)** :
  - Création de sections thématiques ordonnées.
  - Configuration de critères d'évaluation dynamiques avec ciblage granulaire des profils d'acteurs et critères obligatoires/facultatifs.
- **Générateur de QR Codes & Affiches A4 (`/qr-codes`)** :
  - Génération de QR Codes dynamiques pour l'établissement global et par service de soins.
  - Export direct d'**affiches PDF A4 prêtes à l'impression** avec logo de l'hôpital, charte graphique et instructions claires pour les usagers.

### 🛡️ 4. Administration, Sécurité & RBAC (`/settings`)
- **Mon Établissement (`/settings/my-establishment`)** : Identité visuelle, logo hébergé sur UploadThing, coordonnées et informations institutionnelles.
- **Politiques d'accès granulaires (RBAC) (`/settings/access-rights`)** : Définition des permissions par module et par action (`create`, `read`, `update`, `delete`).
- **Gestion des Collaborateurs (`/settings/users`)** : Affectation des rôles, invitations et gestion des comptes soignants/gestionnaires.
- **Espace Profil Personnel (`/profile`)** :
  - Gestion de l'avatar avec UploadThing (nettoyage automatique des anciens fichiers).
  - Authentification à Deux Facteurs (**2FA TOTP**) avec QR Code et codes de récupération.
  - Gestion et révocation des sessions actives multi-appareils (détection OS/navigateur via `ua-parser-js`).
- **Emails Transactionnels Médicaux ([Resend](https://resend.com/) + [React Email](https://react.email/))** :
  - Envoi sécurisé des invitations de collaborateurs, activation de compte, vérification d'adresse email, réinitialisation de mot de passe et codes OTP 2FA.
  - Gabarits HTML responsifs aux couleurs de l'établissement avec fallback de simulation en mode développement.

---

## 🛠️ Stack Technique

| Domaine | Technologie | Usage |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) | Rendu hybride SSR / RSC, Server Actions, Turbopack, React Compiler |
| **Interface** | [React 19](https://react.dev/) | Composants modernes, Server Components, Hooks natifs |
| **Style & Design** | [Tailwind CSS v4](https://tailwindcss.com/) | Moteur CSS haute performance, Bento Grid, palettes OKLCH, Dark Mode |
| **Composants UI** | [Base UI](https://base-ui.com/) / Radix | Primitives accessibles sans style imposé, composants sur-mesure |
| **Base de Données** | [PostgreSQL](https://www.postgresql.org/) / [Neon](https://neon.tech/) | Base relationnelle serverless avec pools de connexion |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Requêtage typé de bout en bout, schéma déclaratif et migrations Kit |
| **Authentification** | [Better Auth](https://www.better-auth.com/) | Sessions chiffrées, cookies HTTP-only, 2FA TOTP, protection brute-force |
| **Emails** | [Resend](https://resend.com/) + React Email | Envoi transactionnel des invitations, réinitialisations de mot de passe et codes 2FA |
| **Validation** | [Zod](https://zod.dev/) + React Hook Form | Schémas stricts partagés client/serveur, formulaires dynamiques |
| **Génération PDF** | [@react-pdf/renderer](https://react-pdf.org/) | Récépissés A5 clients et affiches A4 d'établissement |
| **Graphiques** | [Recharts](https://recharts.org/) | Tableaux de bord analytiques et statistiques interactives |
| **Fichiers & Médias**| [UploadThing](https://uploadthing.com/) | Téléversement sécurisé de logos institutionnels et photos de profil |
| **Tableaux** | [TanStack Table](https://tanstack.com/table) + ExcelJS | Tri, pagination, filtres multicritères et export Excel XLSX |
| **Runtime / Packager**| [Bun](https://bun.sh/) | Exécution ultra-rapide des scripts et gestionnaire de paquets |

---

## 📁 Architecture du Projet

```text
suggestion-box/
├── src/
│   ├── app/
│   │   ├── (auth)/                  # Authentification (sign-in, 2fa, forgot-password, reset)
│   │   ├── (private)/               # Back-office d'administration & médical
│   │   │   ├── dashboard/           # Tableau de bord exécutif et KPI de qualité
│   │   │   ├── feedbacks/           # Traitement et instruction des avis reçus
│   │   │   ├── hospital-management/ # Départements, questionnaire dynamique, QR Codes
│   │   │   ├── profile/             # Gestion du compte, sécurité, 2FA et sessions
│   │   │   └── settings/            # Établissement, politiques RBAC, utilisateurs
│   │   ├── (public)/                # Pages publiques ouvertes aux usagers
│   │   │   ├── [departmentId]/      # Questionnaire dédié à un service spécifique
│   │   │   ├── follow-up/           # Consultation et suivi en direct d'un dossier
│   │   │   └── survey/              # Questionnaire d'évaluation universel
│   │   ├── api/                     # Points d'accès Better-Auth et UploadThing
│   │   ├── globals.css              # Thème Tailwind v4 et variables d'ambiance
│   │   ├── layout.tsx               # Layout racine avec Providers (Theme, Auth, Sonner)
│   │   └── page.tsx                 # Page d'accueil publique (Bento grid, QuickTracker)
│   ├── components/
│   │   ├── buttons/                 # Boutons d'action spécialisés
│   │   ├── data-table/              # Tableau TanStack générique avec pagination
│   │   ├── inputs/                  # Inputs officiels (Rating, DatePicker, Select, etc.)
│   │   ├── mails/                   # Modèles d'emails React Email & transporteur Resend
│   │   ├── pages/                   # Vues et composants modulaires par écran
│   │   ├── public/                  # Navbar et Footer des pages publiques
│   │   └── ui/                      # Composants atomiques (Card, Button, Dialog, etc.)
│   ├── hooks/                       # Hooks personnalisés (useAuth, usePermissions, etc.)
│   ├── lib/
│   │   ├── config/                  # Configuration des modules et droits (access.modules.ts)
│   │   ├── db/
│   │   │   ├── client.ts            # Connexion Neon / PostgreSQL via Drizzle
│   │   │   ├── schema.ts            # Schéma complet de la base de données
│   │   │   ├── queries/             # Couche métier, validateurs Zod et Server Actions
│   │   │   └── server/              # Façades "use server" isolées pour Next.js
│   │   ├── helper/                  # Utilitaires (Calcul KPI, standalone-action, Excel)
│   │   ├── auth.ts                  # Instance Better Auth
│   │   ├── constants.ts             # Constantes métier (Profils, Statuts, Priorités)
│   │   └── types.ts                 # Typages TypeScript stricts
│   └── seed/
│       ├── initial-data.ts          # Peuplement des services et questions par défaut
│       └── create-admin.ts          # Création du compte Super Administrateur initial
├── drizzle.config.ts                # Configuration Drizzle Kit
├── next.config.ts                   # Configuration Next.js (Images, Turbopack, Compiler)
└── package.json
```

---

## 🚀 Installation & Démarrage Rapide

### 1. Prérequis
- [Bun](https://bun.sh/) (version 1.1 ou supérieure recommandée) ou Node.js (version 20+).
- Une base de données PostgreSQL (locale ou instance [Neon Serverless](https://neon.tech/)).

### 2. Cloner le dépôt et installer les dépendances
```bash
git clone https://github.com/votre-compte/suggestion-box.git
cd suggestion-box
bun install
```

### 3. Configurer les variables d'environnement
Créez un fichier `.env` à la racine du projet en vous inspirant de l'exemple ci-dessous :

```env
# Environnement
IS_PROD=false
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Base de Données (PostgreSQL / Neon)
DATABASE_URL="postgresql://utilisateur:motdepasse@ep-nom-instance.neon.tech/suggestion_box?sslmode=require"

# Authentification (Better Auth)
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="votre_cle_secrete_aleatoire_de_au_moins_32_caracteres"

# Initialisation du Super Administrateur
ADMIN_NAME="Administrateur Qualité"
ADMIN_EMAIL="admin@etablissement.fr"
ADMIN_PASSWORD="VotreMotDePasseRobuste123!"

# Hébergement de Fichiers (UploadThing)
UPLOADTHING_TOKEN="votre_token_uploadthing"

# Service d'Emails Transactionnels (Resend + React Email)
RESEND_API_KEY="re_votre_cle_api_resend"
EMAIL_FROM="qualite@votre-domaine-hospitalier.fr" # Facultatif : "onboarding@resend.dev" par défaut en dev
```

### 4. Initialiser la base de données
Exécutez les migrations Drizzle et le peuplement des données médicales initiales :

```bash
# 1. Pousser le schéma vers la base de données
bun run db:push

# 2. Insérer les services de soins et le questionnaire initial
bun run db:init

# 3. Créer le compte Super Administrateur initial
bun run db:create-ad
```

### 5. Lancer le serveur de développement
```bash
bun dev
```

Accédez à l'application sur [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Base de Données & Migrations

Le schéma est géré de façon déclarative avec **Drizzle ORM** dans [src/lib/db/schema.ts](file:///c:/projet-nextjs/web-app/suggestion-box/src/lib/db/schema.ts) :

- `tenant` : Profil de l'établissement de santé (nom, coordonnées, logo).
- `departments` : Services hospitaliers de soins.
- `survey_section` & `survey_field` : Sections et critères dynamiques du questionnaire.
- `feedback` : Retours d'expérience, notes globales, verbatims et statut de traitement.
- `feedback_answer` : Réponses détaillées aux critères avec libellé figé (*snapshot*).
- `user`, `account`, `session`, `two_factors` : Tables de sécurité Better Auth.
- `access_policies` & `user_permission_exceptions` : Moteur de permissions RBAC.

### Commandes utiles Drizzle :
```bash
bun run db:push      # Synchronise le schéma directement avec la base
bun run db:generate  # Génère les fichiers de migration SQL
bun run db:migrate   # Applique les migrations SQL générées
bun run db:studio    # Ouvre l'interface visuelle Drizzle Studio
```

---

## 🔒 Sécurité & Conformité

- **Confidentialité et Anonymat Garanti** : Aucune coordonnée personnelle n'est enregistrée lors des dépôts anonymes. Les notes internes et coordonnées des avis nominatifs sont strictement masquées sur les interfaces publiques de suivi.
- **Protection Anti-Abus Multi-Couche** : Système de *honeypot* invisible piégeant les robots et limitation de débit glissante par adresse IP.
- **Contrôle d'accès granulaire (RBAC)** : Chaque action sensible de modification ou suppression est protégée par `safeAc` et vérifie les permissions de l'utilisateur connecté.
- **Sessions Sécurisées & 2FA** : Mots de passe hachés, détection des appareils suspects, révocation de sessions et double authentification TOTP (Google Authenticator, etc.).

---

## 📄 Licence

Ce projet est sous licence propriétaire / MIT. Consultez le fichier `LICENSE` pour plus de détails.
