# 🎓 Frontend Specification — Portail Département Informatique

> **Stack:** React 18+ (Vite) · React Router v6 · Axios · CSS Modules / Vanilla CSS  
> **Design System:** "Academic Logic" — Terracotta & Minimalist  
> **Backend:** Symfony REST API at `http://localhost:8000/api`  
> **Language:** French (UI labels)

---

## Table of Contents

1. [Design System Tokens](#1-design-system-tokens)
2. [Project File Structure](#2-project-file-structure)
3. [Routing Map](#3-routing-map)
4. [Shared Layout & Components](#4-shared-layout--components)
5. [Page-by-Page Specification](#5-page-by-page-specification)
   - 5.1 [Accueil (Home)](#51-accueil-home)
   - 5.2 [Le Département (About)](#52-le-département-about)
   - 5.3 [Formations (Programs)](#53-formations-programs)
   - 5.4 [Équipe Pédagogique (Team)](#54-équipe-pédagogique-team)
   - 5.5 [Événements & Conférences (Events)](#55-événements--conférences-events)
   - 5.6 [Détail Événement (Event Detail)](#56-détail-événement-event-detail)
   - 5.7 [Contact & Accès](#57-contact--accès)
   - 5.8 [Connexion (Login)](#58-connexion-login)
   - 5.9 [Tableau de Bord Admin (Dashboard)](#59-tableau-de-bord-admin-dashboard)
6. [Authentication & State Management](#6-authentication--state-management)
7. [Complete API Integration Reference](#7-complete-api-integration-reference)
8. [Responsive Breakpoints](#8-responsive-breakpoints)

---

## 1. Design System Tokens

### 1.1 Color Palette

| Token Name | Hex Value | Usage |
|---|---|---|
| `--color-primary` | `#87452f` | Brand, active nav links, primary buttons |
| `--color-primary-container` | `#a45d45` | Hover states, accents, terracotta highlights |
| `--color-primary-light` | `#ffdbd0` | Light badges, chip backgrounds |
| `--color-primary-inverse` | `#ffb59d` | Inverse surfaces, dark mode accents |
| `--color-on-primary` | `#ffffff` | Text on primary-colored backgrounds |
| `--color-surface` | `#f7f9fb` | Global page background |
| `--color-surface-container` | `#eceef0` | Section backgrounds, alternating rows |
| `--color-surface-white` | `#ffffff` | Cards, modals, elevated surfaces |
| `--color-on-surface` | `#191c1e` | Primary heading text |
| `--color-on-surface-variant` | `#53433e` | Secondary/body text |
| `--color-outline` | `#86736d` | Standard borders |
| `--color-outline-variant` | `#d9c2bb` | Subtle borders, dividers |
| `--color-tertiary` | `#4b596d` | Tertiary labels, slate elements |
| `--color-error` | `#ba1a1a` | Error messages, destructive actions |
| `--color-success` | `#006359` | Published badge, success states |

### 1.2 Typography

| Style | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Display | Inter | 48px | 700 | 56px | -0.02em |
| Headline LG | Inter | 32px | 600 | 40px | -0.01em |
| Headline LG (mobile) | Inter | 28px | 600 | 36px | — |
| Headline MD | Inter | 24px | 600 | 32px | — |
| Body LG | Inter | 18px | 400 | 28px | — |
| Body MD | Inter | 16px | 400 | 24px | — |
| Label MD | Inter | 14px | 500 | 20px | 0.01em |
| Label SM | Inter | 12px | 600 | 16px | — |
| Mono Label | JetBrains Mono | 14px | 500 | 1 | 0.02em |
| Mono SM | JetBrains Mono | 12px | 500 | 1 | 0.02em |

> **Google Fonts import:** `Inter:wght@400;500;600;700;800` and `JetBrains+Mono:wght@400;500`

### 1.3 Spacing

| Token | Value |
|---|---|
| `--space-unit` | `8px` |
| `--space-xs` | `4px` |
| `--space-sm` | `8px` |
| `--space-md` | `16px` |
| `--space-lg` | `24px` |
| `--space-xl` | `32px` |
| `--space-2xl` | `48px` |
| `--space-3xl` | `64px` |
| `--space-section` | `80px` (vertical section gaps) |
| `--container-max` | `1280px` |
| `--gutter` | `24px` |

### 1.4 Elevation & Shadows

| Level | Background | Shadow | Border |
|---|---|---|---|
| L0 (Base) | `#f7f9fb` | none | none |
| L1 (Cards) | `#ffffff` | `0 4px 20px rgba(0,0,0,0.04)` | `1px solid #d9c2bb` |
| L2 (Hover) | `#ffffff` | `0 10px 30px rgba(0,0,0,0.08)` | `1px solid #86736d` |

### 1.5 Border Radius

| Token | Value |
|---|---|
| `--radius-sm` | `4px` |
| `--radius-default` | `8px` |
| `--radius-md` | `12px` |
| `--radius-lg` | `16px` |
| `--radius-xl` | `24px` |
| `--radius-full` | `9999px` |

### 1.6 Accent Borders (Structural)

Used instead of shadows for emphasis on key sections:

| Type | Value |
|---|---|
| Left accent (thick) | `8px solid var(--color-primary-container)` |
| Left accent (medium) | `4px solid var(--color-primary-container)` |
| Top accent (section) | `4px solid var(--color-primary-container)` |

---

## 2. Project File Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── main.jsx                          # Entry point, ReactDOM.createRoot
│   ├── App.jsx                           # Router setup, AuthProvider wrapper
│   ├── index.css                         # Global CSS: reset, tokens, fonts
│   │
│   ├── api/
│   │   ├── axiosClient.js                # Axios instance, base URL, JWT interceptor
│   │   ├── authApi.js                    # login(), getMe()
│   │   ├── publicApi.js                  # getFilieres(), getEnseignants(), getLaboratoires(), getActualites(), getActualiteBySlug(), getFiliereBySlug()
│   │   ├── enseignantApi.js              # getProfile(), updateProfile(), submitPublication()
│   │   ├── secretaireApi.js              # createActualite(), getMyActualites(), updateRefusedActualite()
│   │   ├── adminApi.js                   # CRUD filieres, enseignants, laboratoires, axes, actualites, getHistorique()
│   │   └── superAdminApi.js              # getUtilisateurs(), toggleActive(), updateRole(), getPending(), valider(), refuser()
│   │
│   ├── auth/
│   │   ├── AuthContext.jsx               # React Context: user, token, login(), logout(), isAuthenticated
│   │   ├── AuthProvider.jsx              # Provider component, auto-fetch /api/me on mount
│   │   ├── ProtectedRoute.jsx            # Wrapper: redirects to /login if not authenticated
│   │   └── RoleRoute.jsx                 # Wrapper: checks user role array, redirects if unauthorized
│   │
│   ├── hooks/
│   │   ├── useAuth.js                    # Custom hook for AuthContext
│   │   ├── useFetch.js                   # Generic data fetching hook with loading/error states
│   │   └── usePagination.js              # Pagination state hook (page, perPage, total)
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx              # Navbar + Footer wrapper for public pages
│   │   ├── PublicLayout.module.css
│   │   ├── AuthLayout.jsx                # Minimal layout for login page (logo + back link)
│   │   ├── AuthLayout.module.css
│   │   ├── DashboardLayout.jsx           # Sidebar + Top bar + Main content area
│   │   └── DashboardLayout.module.css
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx                # Top navigation bar
│   │   │   ├── Navbar.module.css
│   │   │   ├── Footer.jsx                # Site footer (3-column)
│   │   │   ├── Footer.module.css
│   │   │   ├── Button.jsx                # Primary / Secondary / Ghost variants
│   │   │   ├── Button.module.css
│   │   │   ├── Badge.jsx                 # Status badges (Publié, Brouillon, En Attente, Refusée)
│   │   │   ├── Badge.module.css
│   │   │   ├── Card.jsx                  # Generic card container (elevation L1)
│   │   │   ├── Card.module.css
│   │   │   ├── Input.jsx                 # Styled form input with label
│   │   │   ├── Input.module.css
│   │   │   ├── SearchBar.jsx             # Search input + year filter + button
│   │   │   ├── SearchBar.module.css
│   │   │   ├── Pagination.jsx            # Page navigation with numbered buttons
│   │   │   ├── Pagination.module.css
│   │   │   ├── StatCard.jsx              # Big number + label (e.g., 850 ÉTUDIANTS)
│   │   │   ├── StatCard.module.css
│   │   │   ├── SectionTitle.jsx          # H2 with left accent border
│   │   │   ├── SectionTitle.module.css
│   │   │   ├── Breadcrumb.jsx            # Breadcrumb navigation
│   │   │   ├── Breadcrumb.module.css
│   │   │   ├── Loader.jsx               # Loading spinner
│   │   │   ├── Loader.module.css
│   │   │   ├── Modal.jsx                 # Generic modal overlay
│   │   │   └── Modal.module.css
│   │   │
│   │   ├── home/
│   │   │   ├── HeroSection.jsx           # Hero banner with title + image + CTAs
│   │   │   ├── HeroSection.module.css
│   │   │   ├── StatsBar.jsx              # Row of 4 stat cards
│   │   │   ├── StatsBar.module.css
│   │   │   ├── NewsSection.jsx           # "À La Une" section with 3 news cards
│   │   │   ├── NewsSection.module.css
│   │   │   ├── NewsCard.jsx              # Individual news card
│   │   │   ├── NewsCard.module.css
│   │   │   ├── ProgramsSection.jsx       # Programs overview (text + 4 program cards)
│   │   │   ├── ProgramsSection.module.css
│   │   │   ├── ProgramCard.jsx           # Individual program card
│   │   │   ├── ProgramCard.module.css
│   │   │   ├── AdminSection.jsx          # Administration & Direction cards
│   │   │   └── AdminSection.module.css
│   │   │
│   │   ├── department/
│   │   │   ├── DirectorQuote.jsx         # Photo + quote block
│   │   │   ├── DirectorQuote.module.css
│   │   │   ├── HistorySection.jsx        # 2-column text + stats row
│   │   │   ├── HistorySection.module.css
│   │   │   ├── QuickNav.jsx              # Right sidebar navigation card
│   │   │   ├── QuickNav.module.css
│   │   │   ├── LocationCard.jsx          # Location & secretariat info
│   │   │   ├── LocationCard.module.css
│   │   │   ├── EventsSidebar.jsx         # Upcoming events mini-list
│   │   │   └── EventsSidebar.module.css
│   │   │
│   │   ├── formations/
│   │   │   ├── CycleSection.jsx          # Licence or Master section header + grid
│   │   │   ├── CycleSection.module.css
│   │   │   ├── LicenceCard.jsx           # L1/L2/L3 card with code, title, description, ECTS
│   │   │   ├── LicenceCard.module.css
│   │   │   ├── MasterCard.jsx            # Master specialization card with icon
│   │   │   └── MasterCard.module.css
│   │   │
│   │   ├── team/
│   │   │   ├── FilterBar.jsx             # Pole/Department filter tabs
│   │   │   ├── FilterBar.module.css
│   │   │   ├── TeamMemberCard.jsx        # Circular photo + name + role + email + office
│   │   │   ├── TeamMemberCard.module.css
│   │   │   ├── TeamGrid.jsx              # 4-column responsive grid
│   │   │   └── TeamGrid.module.css
│   │   │
│   │   ├── events/
│   │   │   ├── EventListCard.jsx         # Horizontal event card with date block
│   │   │   ├── EventListCard.module.css
│   │   │   ├── FeaturedEvent.jsx         # 2-column featured event banner
│   │   │   ├── FeaturedEvent.module.css
│   │   │   ├── EventSchedule.jsx         # Timeline-style programme du colloque
│   │   │   ├── EventSchedule.module.css
│   │   │   ├── EventInfoSidebar.jsx      # "Informations Pratiques" card
│   │   │   └── EventInfoSidebar.module.css
│   │   │
│   │   ├── contact/
│   │   │   ├── ContactInfoCard.jsx       # Address, email, hours card
│   │   │   ├── ContactInfoCard.module.css
│   │   │   ├── MapCard.jsx               # Map embed placeholder
│   │   │   ├── MapCard.module.css
│   │   │   ├── StudentBanner.jsx         # "Vous êtes étudiant?" callout
│   │   │   └── StudentBanner.module.css
│   │   │
│   │   └── dashboard/
│   │       ├── Sidebar.jsx               # Admin sidebar navigation
│   │       ├── Sidebar.module.css
│   │       ├── KPICards.jsx              # 4 metric cards row
│   │       ├── KPICards.module.css
│   │       ├── DataTable.jsx             # Reusable data table with search, pagination
│   │       ├── DataTable.module.css
│   │       ├── ActivityFeed.jsx          # Recent activity list
│   │       ├── ActivityFeed.module.css
│   │       ├── EngagementChart.jsx       # Progress bar widget
│   │       ├── EngagementChart.module.css
│   │       ├── UserManagement.jsx        # User list table with toggle/role actions
│   │       ├── UserManagement.module.css
│   │       ├── ActualiteForm.jsx         # Create/edit actualité form
│   │       ├── ActualiteForm.module.css
│   │       ├── FiliereManagement.jsx     # Filière CRUD table
│   │       ├── FiliereManagement.module.css
│   │       ├── EnseignantManagement.jsx  # Enseignant CRUD table
│   │       ├── EnseignantManagement.module.css
│   │       ├── LaboManagement.jsx        # Laboratoire & Axes CRUD
│   │       ├── LaboManagement.module.css
│   │       ├── PendingValidation.jsx     # Pending actualités approve/reject
│   │       ├── PendingValidation.module.css
│   │       ├── HistoriqueLog.jsx         # Audit trail table
│   │       └── HistoriqueLog.module.css
│   │
│   └── pages/
│       ├── public/
│       │   ├── HomePage.jsx
│       │   ├── DepartmentPage.jsx
│       │   ├── FormationsPage.jsx
│       │   ├── TeamPage.jsx
│       │   ├── EventsPage.jsx
│       │   ├── EventDetailPage.jsx
│       │   └── ContactPage.jsx
│       │
│       ├── auth/
│       │   └── LoginPage.jsx
│       │
│       └── dashboard/
│           ├── DashboardPage.jsx          # Main dashboard (KPIs + events table)
│           ├── AdminActualitesPage.jsx    # Actualités management
│           ├── AdminFilieresPage.jsx      # Filières management
│           ├── AdminEnseignantsPage.jsx   # Enseignants management
│           ├── AdminLabosPage.jsx         # Laboratoires management
│           ├── AdminUsersPage.jsx         # Super admin user management
│           ├── AdminPendingPage.jsx       # Pending validation
│           ├── AdminHistoriquePage.jsx    # Audit logs
│           └── ProfilePage.jsx           # Enseignant profile edit
│
├── package.json
├── vite.config.js
└── .env
```

---

## 3. Routing Map

### 3.1 Public Routes (no auth required)

| Path | Page Component | Layout | API Calls |
|---|---|---|---|
| `/` | `HomePage` | `PublicLayout` | `GET /api/public/actualites`, `GET /api/public/filieres`, `GET /api/public/enseignants` |
| `/departement` | `DepartmentPage` | `PublicLayout` | `GET /api/public/laboratoires`, `GET /api/public/enseignants` |
| `/formations` | `FormationsPage` | `PublicLayout` | `GET /api/public/filieres` |
| `/equipe` | `TeamPage` | `PublicLayout` | `GET /api/public/enseignants` |
| `/evenements` | `EventsPage` | `PublicLayout` | `GET /api/public/actualites?type=...&keyword=...&year=...` |
| `/evenements/:slug` | `EventDetailPage` | `PublicLayout` | `GET /api/public/actualites/:slug` |
| `/contact` | `ContactPage` | `PublicLayout` | — (static content) |

### 3.2 Auth Routes

| Path | Page Component | Layout |
|---|---|---|
| `/login` | `LoginPage` | `AuthLayout` |

### 3.3 Protected Dashboard Routes

| Path | Page Component | Layout | Required Role | API Calls |
|---|---|---|---|---|
| `/dashboard` | `DashboardPage` | `DashboardLayout` | Any authenticated | Varies by role |
| `/dashboard/actualites` | `AdminActualitesPage` | `DashboardLayout` | `ROLE_ADMIN` | `GET/POST/PUT/DELETE /api/admin/actualites` |
| `/dashboard/filieres` | `AdminFilieresPage` | `DashboardLayout` | `ROLE_ADMIN` | `GET/POST/PUT/DELETE /api/admin/filieres` |
| `/dashboard/enseignants` | `AdminEnseignantsPage` | `DashboardLayout` | `ROLE_ADMIN` | `GET/POST/PUT/DELETE /api/admin/enseignants` |
| `/dashboard/laboratoires` | `AdminLabosPage` | `DashboardLayout` | `ROLE_ADMIN` | `GET/POST/PUT/DELETE /api/admin/laboratoires`, `POST/PUT/DELETE axes` |
| `/dashboard/utilisateurs` | `AdminUsersPage` | `DashboardLayout` | `ROLE_SUPER_ADMIN` | `GET /api/super-admin/utilisateurs`, `PATCH activer/role` |
| `/dashboard/validation` | `AdminPendingPage` | `DashboardLayout` | `ROLE_SUPER_ADMIN` | `GET /api/super-admin/actualites/pending`, `PATCH valider/refuser` |
| `/dashboard/historique` | `AdminHistoriquePage` | `DashboardLayout` | `ROLE_ADMIN` | `GET /api/admin/historique` |
| `/dashboard/profil` | `ProfilePage` | `DashboardLayout` | `ROLE_PROF` | `GET/PUT /api/enseignant/profile` |

---

## 4. Shared Layout & Components

### 4.1 Navbar (`components/common/Navbar.jsx`)

**Design reference:** Top of every public page screenshot.

| Element | Detail |
|---|---|
| **Logo** | Text: "DÉPARTEMENT INFORMATIQUE" in bold uppercase, font-weight 700, `--color-on-surface` |
| **Nav Links** | ACCUEIL · DÉPARTEMENT · FORMATIONS · RECHERCHE · ACTUALITÉS |
| **Link Style** | `label-md` (14px, 500), `--color-on-surface`. Active link has terracotta color + 2px bottom border |
| **Hover** | Terracotta underline animation (slide from left) |
| **Right section** | "ESPACE INTERNE" outlined button → `/login` · "CONTACT" primary filled button → `/contact` · Lock icon |
| **Scroll behavior** | Transparent → white background with subtle shadow on scroll |
| **Mobile** | Hamburger icon → slide-in drawer with all links |

```
┌──────────────────────────────────────────────────────────────────────┐
│ DÉPARTEMENT          ACCUEIL  DÉPARTEMENT  FORMATIONS  ...  [ESPACE] [CONTACT] 🔒 │
│ INFORMATIQUE                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Footer (`components/common/Footer.jsx`)

**Design reference:** Bottom of every public page screenshot.

**Layout:** Dark gray/charcoal background (`#2d3133`) with 3 columns:

| Column 1 | Column 2 | Column 3 |
|---|---|---|
| **DÉPARTEMENT INFORMATIQUE** | **INFO DÉPARTEMENT** | **LIENS RAPIDES** |
| Institut des Sciences du Numérique | Organigramme | Bibliothèque |
| 25 Avenue de l'Innovation | Taxe d'apprentissage | ENT Étudiants |
| 75000 Paris, France | Recrutement | Plan du Campus |

- Text: `label-sm` white with 60% opacity
- Link hover: 100% opacity
- Bottom bar: `© 2024 DÉPARTEMENT INFORMATIQUE. TOUS DROITS RÉSERVÉS.`

### 4.3 Button (`components/common/Button.jsx`)

**Props:** `variant` (`primary` | `secondary` | `ghost`), `size` (`sm` | `md` | `lg`), `icon`, `fullWidth`, `disabled`

| Variant | Background | Text | Border | Hover |
|---|---|---|---|---|
| Primary | `--color-primary-container` (#a45d45) | White | none | Darken 10%, subtle lift `translateY(-1px)` |
| Secondary | Transparent | `--color-primary-container` | 1px solid `--color-primary-container` | Light fill at 10% opacity |
| Ghost | Transparent | `--color-on-surface` | none | Background `rgba(0,0,0,0.04)` |

- Border radius: `--radius-default` (8px)
- Padding: `12px 24px` (md), `8px 16px` (sm), `16px 32px` (lg)
- Font: `label-md`
- Transition: `all 0.2s ease`

### 4.4 StatCard (`components/common/StatCard.jsx`)

**Props:** `number`, `label`

```
┌──────────────┐
│     850      │  ← Display font, 48px, 700, terracotta color
│  ÉTUDIANTS   │  ← label-sm, uppercase, --color-on-surface-variant
└──────────────┘
```

- Separated by vertical `1px solid --color-outline-variant` dividers
- Arranged horizontally in a 4-column equal-width grid

### 4.5 Badge (`components/common/Badge.jsx`)

**Props:** `status` (`Publiee` | `En_Attente` | `Refusee` | `Brouillon`)

| Status | Background | Text Color | Label |
|---|---|---|---|
| `Publiee` | `#006359` | White | PUBLIÉ |
| `En_Attente` | `#f59e0b` (amber) | `#78350f` | EN ATTENTE |
| `Refusee` | `#ba1a1a` | White | REFUSÉE |
| `Brouillon` | `#d97706` | White | BROUILLON |

- Padding: `4px 12px`
- Border-radius: `4px`
- Font: `mono-sm` (JetBrains Mono 12px uppercase)

---

## 5. Page-by-Page Specification

---

### 5.1 Accueil (Home)

**Route:** `/`  
**Page file:** `pages/public/HomePage.jsx`  
**API calls on mount:**
- `GET /api/public/actualites` → latest 3 published news
- `GET /api/public/filieres` → all active filières for Programs section
- `GET /api/public/enseignants` → for Administration section

#### Section 1: Hero Banner

**Component:** `components/home/HeroSection.jsx`

**Layout:** 2-column (60% text / 40% image), dark gradient overlay on left portion of the background.

| Element | Detail |
|---|---|
| **Title line 1** | "L'EXCELLENCE EN" — Display font, 48px, 700, white |
| **Title line 2** | "SCIENCES DU NUMÉRIQUE" — Display font, 48px, 700, **terracotta** color |
| **Description** | Body-lg (18px), white with 80% opacity. "Le département forme les futurs ingénieurs et chercheurs aux défis technologiques de demain : intelligence artificielle, cybersécurité, et systèmes distribués." |
| **Left accent** | 4px vertical terracotta border to the left of description text |
| **CTA Buttons** | `DÉCOUVRIR LE CURSUS` (Primary) → `/formations` · `RAPPORT ANNUEL 2023` (Secondary, with download icon) |
| **Right image** | Full-height building photograph, slight rounded corners (16px), with caption below: "FACULTÉ DES SCIENCES — CAMPUS CENTRAL — BÂTIMENT ADA LOVELACE" |

**Background:** Dark charcoal (#2d3133) for the entire hero section  
**Padding:** 80px vertical, content centered in `--container-max`

#### Section 2: Statistics Bar

**Component:** `components/home/StatsBar.jsx`

4 `StatCard` components in a horizontal row:
1. **850** — ÉTUDIANTS  
2. **42** — CHERCHEURS  
3. **12** — LABORATOIRES  
4. **98%** — INSERTION  

Background: White, separated by thin vertical dividers.

#### Section 3: À La Une (News)

**Component:** `components/home/NewsSection.jsx`

**Header row:** 
- Left: "À LA UNE" — Headline-lg uppercase, with 4px bottom border on section  
- Right: "VOIR TOUTES LES ACTUALITÉS" — Label-md, terracotta link → `/evenements`

**Content:** 3 `NewsCard` components in a 3-column grid (gap: 24px)

**NewsCard structure:**
```
┌────────────────────────┐
│ [Image — 16:9 ratio]   │  ← rounded-lg corners, object-fit: cover
├────────────────────────┤
│ 12 MAI 2024            │  ← label-sm, terracotta
│ CONFÉRENCE INTERNAT…   │  ← headline-md, uppercase, bold
│                        │
│ Le département acc…    │  ← body-md, --color-on-surface-variant
│                        │
│ ┌──────────┐           │
│ │RECHERCHE │           │  ← Chip/Tag: label-sm, outlined, 0px radius
│ └──────────┘           │
└────────────────────────┘
```

**API mapping:** Each card maps to an `Actualite` object:
- `imageCoverUrl` → card image
- `dateCreation` → formatted date
- `titre` → card title
- `contenu` → truncated to ~120 characters
- `type` → chip/tag
- Click → `/evenements/{slug}`

#### Section 4: Programmes d'Études

**Component:** `components/home/ProgramsSection.jsx`

**Layout:** 2-column (30% text / 70% cards grid)

**Left column:**
- Title: "PROGRAMMES D'ÉTUDES" — Headline-lg
- Description: Body-md text
- `TÉLÉCHARGER LE GUIDE` (Secondary button with download icon)

**Right column:** 2×2 grid of `ProgramCard`:

| Card | Level | Title | Description |
|---|---|---|---|
| 1 | BAC +3 | LICENCE INFORMATIQUE | Fondamentaux de la programmation… |
| 2 | BAC +5 | MASTER IA & DATA | Apprentissage machine, vision par… |
| 3 | BAC +5 | MASTER CYBERSÉCURITÉ | Sécurité des réseaux, cryptographie… |
| 4 | BAC +8 | DOCTORAT / PH.D. | Recherche fondamentale et appliquée… |

**ProgramCard structure:**
```
┌────────────────────────┐
│ BAC +3                 │  ← label-sm, terracotta
│ LICENCE INFORMATIQUE   │  ← headline-md, bold
│                        │
│ Fondamentaux de la…   │  ← body-md
└────────────────────────┘
```
- Border: 1px solid `--color-outline-variant`
- Hover: elevation L2 transition

**API mapping:** Use data from `GET /api/public/filieres` — map `type` to the level badge, `nom` to title, `description` to body.

#### Section 5: Administration & Direction

**Component:** `components/home/AdminSection.jsx`

- Title: "ADMINISTRATION & DIRECTION" — Headline-lg, with terracotta top accent
- 2×2 grid of admin contact cards:

```
┌────────────────────────────────────────┐
│ [Avatar]  PR. JEAN-LUC BERNARD    ✉   │
│           Directeur du Département     │
└────────────────────────────────────────┘
```

- Avatar: 40px circle placeholder (gray bg with user icon)
- Name: label-md, bold
- Role: label-sm, `--color-on-surface-variant`
- Mail icon: clickable `mailto:` link

---

### 5.2 Le Département (About)

**Route:** `/departement`  
**Page file:** `pages/public/DepartmentPage.jsx`  
**API calls on mount:**
- `GET /api/public/laboratoires` → for Labs section
- `GET /api/public/enseignants` → for stats
- `GET /api/public/actualites?type=conference` → for events sidebar

#### Layout

2-column layout: **Main content (65%)** | **Right sidebar (35%)**

#### Main Content Column

**Page Title:**
- "LE DÉPARTEMENT" — Display font, 48px, 800, uppercase
- Subtitle: Body-lg, "À la pointe de l'innovation technologique et de l'excellence académique…"

**Section A: Mot du Chef de Département** (`DirectorQuote`)

```
┌────────────────────────────────────────────────────────┐
│ [Photo 120px]    MOT DU CHEF DE DÉPARTEMENT            │
│  round           "Bienvenue au sein du Département…    │
│  grayscale       Notre mission est d'allier la rigueur │
│                  mathématique à la créativité…"         │
│                                                        │
│                  PROF. JEAN-PIERRE DURAND — HDR, PHD   │
└────────────────────────────────────────────────────────┘
```

- Photo: 120×120px, circular, grayscale filter
- Quote: Body-lg, *italic*, `--color-on-surface-variant`
- Name: Label-md, bold
- Card border: 1px solid `--color-outline-variant`
- 4px terracotta accent at left of the card

**Section B: Historique & Objectifs** (`HistorySection`)

- Title: "HISTORIQUE & OBJECTIFS" — Headline-lg, terracotta top border (4px)
- Content: 2-column text flow (body-md), 4 paragraphs covering founding, evolution, pedagogy, international
- Bottom: 4 stat cards in a row:
  - **1200+** ÉTUDIANTS · **45** ENSEIGNANTS · **12** LABORATOIRES · **98%** INSERTION

#### Right Sidebar Column

**Card 1: Navigation Rapide** (`QuickNav`)
```
┌─────────────────────────────────────┐
│ NAVIGATION RAPIDE                   │  ← headline-md, bg: --color-surface-container
│                                     │
│ STRUCTURE DU DÉPARTEMENT       →    │  ← label-md, row with arrow
│ ─────────────────────────────       │
│ CONSEIL DE DIRECTION           →    │
│ ─────────────────────────────       │
│ LABORATOIRES RATTACHÉS         →    │
│ ─────────────────────────────       │
│ ALUMNI & RÉSEAU                →    │
│ ─────────────────────────────       │
│ TÉLÉCHARGER LA BROCHURE        ↓    │  ← download icon
└─────────────────────────────────────┘
```

**Card 2: Location** (`LocationCard`)
```
│ LOCALISATION                        │  ← label-sm, terracotta
│ Bâtiment Turing, Campus Central     │
│ 4ème Étage                          │
│                                     │
│ SECRÉTARIAT                         │  ← label-sm, terracotta
│ Lun – Ven: 08:30 — 17:30           │
│ +33 (0) 1 23 45 67 89              │
```

**Card 3: Événements** (`EventsSidebar`)
```
│ ÉVÉNEMENTS                          │  ← headline-md
│                                     │
│ 15 OCT 2024                         │  ← label-sm, terracotta
│ Séminaire IA & Éthique              │  ← body-md, bold
│ ─────────────────────               │
│ 22 OCT 2024                         │
│ Hackathon Cybersécurité             │
```

---

### 5.3 Formations (Programs)

**Route:** `/formations`  
**Page file:** `pages/public/FormationsPage.jsx`  
**API calls on mount:**
- `GET /api/public/filieres` → all active filières

#### Page Header
- "OFFRE DE FORMATION" — Display font, uppercase
- Subtitle: Body-lg text about LMD standards

#### Section: Cycle Licence

**Component:** `CycleSection` + 3 × `LicenceCard`

**Section header:**
```
[L1-L3]  CYCLE LICENCE
         FONDAMENTAUX DE L'INFORMATIQUE ET MATHÉMATIQUES APPLIQUÉES
```
- Badge "L1-L3" in terracotta bg, white text
- Title: Headline-lg
- Subtitle: Label-md uppercase

**LicenceCard (3-column grid):**
```
┌────────────────────────────┐
│ CODE: INF-101              │  ← mono label, terracotta
│ L1 : INFORMATIQUE         │  ← headline-md, bold
│ GÉNÉRALE                   │
│                            │
│ Introduction à             │  ← body-md
│ l'algorithmique…           │
│                            │
│ 60 ECTS     PROGRAMME →    │  ← label-sm + terracotta link
│             DÉTAILLÉ       │
└────────────────────────────┘
```
- Border: 1px solid `--color-outline-variant`
- Code: JetBrains Mono

#### Section: Cycle Master

**Component:** `CycleSection` + 4 × `MasterCard`

**Section header:** Badge "M1-M2" + "CYCLE MASTER" + "SPÉCIALISATION ET RECHERCHE AVANCÉE"

**MasterCard (4-column grid):**
```
┌────────────────────────────┐
│ [Icon — 32px terracotta]   │  ← specialty icon
│                            │
│ IA & DATA SCIENCE          │  ← headline-md, bold
│                            │
│ Machine Learning, Deep     │  ← body-md
│ Learning, Big Data…        │
│                            │
│ ┌──────────────────────┐   │
│ │ PROGRAMME DÉTAILLÉ   │   │  ← secondary button
│ └──────────────────────┘   │
└────────────────────────────┘
```

#### Bottom Stats
Same `StatsBar` as homepage (850 / 42 / 15 / 98%)

**API mapping:** `GET /api/public/filieres` returns objects with `type` field. Filter by `type === 'Licence'` and `type === 'Master'` to populate each section. Use `nom` for title, `description` for body, `slug` for "PROGRAMME DÉTAILLÉ" link → `/formations/{slug}`.

---

### 5.4 Équipe Pédagogique (Team)

**Route:** `/equipe`  
**Page file:** `pages/public/TeamPage.jsx`  
**API calls on mount:**
- `GET /api/public/enseignants` → all active teachers with filières

#### Page Header
- Breadcrumb: `ACCUEIL / DÉPARTEMENT / ÉQUIPE PÉDAGOGIQUE`
- Title: "ÉQUIPE PÉDAGOGIQUE" — Display, with 4px terracotta bottom border
- Intro: Body-lg, "Notre département réunit des enseignants-chercheurs de haut niveau…"

#### Filter Bar

**Component:** `FilterBar`

Horizontal tab buttons:
- **TOUS LES PÔLES** (active by default)
- **INTELLIGENCE ARTIFICIELLE**
- **SYSTÈMES & RÉSEAUX**
- **GÉNIE LOGICIEL**

Right side: "AFFICHAGE : 12 MEMBRES" — Label-sm

Active tab: terracotta bottom border. Inactive: gray outline.

**Logic:** Filter the `enseignants` array by their associated `filieres[].nom` field.

#### Team Grid

**Component:** `TeamGrid` containing `TeamMemberCard` items

**Layout:** 4-column grid (gap: 0 — cards share borders)

**TeamMemberCard:**
```
┌──────────────────────────┐
│     [Photo 120px]        │  ← Circular, centered, grayscale
│      rounded-full        │    object-fit: cover
│                          │
│   DR. JEAN DUPONT        │  ← headline-md, centered
│   DIRECTEUR DU           │  ← label-sm, terracotta, centered
│   DÉPARTEMENT            │
│ ─────────────────────    │
│ ✉ j.dupont@univ-info.fr │  ← label-sm, icon + text
│ 📍 Bureau 402 - Bât. C  │  ← label-sm, icon + text
└──────────────────────────┘
```

- Card: White bg, 1px border, no radius (brutalist variant) OR 16px radius (soft variant)
- Photo: 120px circular, `border: 3px solid --color-outline-variant`
- Name: headline-md
- Role: label-sm, **terracotta**, uppercase
- Contact: label-sm, `--color-on-surface-variant`

**API mapping:** Each `Enseignant` has: `nom`, `prenom`, `email`, `telephone`, `photo`, `grade`, `filieres[]`, `laboratoires[]`.
- Display name: `grade + " " + prenom + " " + nom` (e.g., "DR. JEAN DUPONT")
- Display role: Use `grade` or first `filiere.nom` context
- Email: `email`
- Office: Map from `laboratoires[0].nom` or use a static "Bureau" field if present

#### "Charger Plus" Button
Centered: `CHARGER PLUS DE MEMBRES` — Primary button, full width (max 400px)

**Logic:** Show 8 cards initially, load 8 more on click. Use `usePagination` hook.

---

### 5.5 Événements & Conférences (Events)

**Route:** `/evenements`  
**Page file:** `pages/public/EventsPage.jsx`  
**API calls on mount:**
- `GET /api/public/actualites` → with optional query params `?keyword=...&year=...&type=...`

#### Page Header
- Left accent: 4px terracotta left border
- "ÉVÉNEMENTS & CONFÉRENCES" — Headline-lg
- Subtitle: Body-md

#### Search & Filter Bar

**Component:** `SearchBar`

```
┌──────────────────────────────┐ ┌──────────┐ ┌─────────┐
│ 🔍 Rechercher par mot-clé…   │ │ ANNÉE ▼  │ │ FILTRER │
└──────────────────────────────┘ └──────────┘ └─────────┘
```

- Search input: Full width, 1px border, placeholder in mono
- Year dropdown: Select element with years (2024, 2025, 2026)
- Filter button: Primary button

**API mapping:** On click "FILTRER", call `GET /api/public/actualites?keyword={search}&year={year}`. Re-render the event list.

#### Event List

**Component:** `EventListCard` (repeated)

```
┌──────────┬──────────────────────────────────────────────────────────┐
│   14     │  CONFÉRENCE INTERNATIONALE                              │
│   MARS   │  Symposium sur l'Intelligence Artificielle Distribuée   │
│   2026   │                                                         │
│          │  Une réunion annuelle des principaux chercheurs…         │
│(dark bg) │                                                         │
│          │  📍 AMPHITHÉÂTRE TURING, BÂTIMENT TURING-B         →    │
└──────────┴──────────────────────────────────────────────────────────┘
```

- Left date block: 180px wide, dark charcoal bg (`#2d3133`), white text
  - Day: 48px bold
  - Month: label-md uppercase
  - Year: label-md
- Right content: White bg, padded
  - Type: label-sm, terracotta, uppercase (e.g., "CONFÉRENCE INTERNATIONALE")
  - Title: headline-md, bold
  - Description: body-md, truncated 2 lines
  - Location: label-sm, mono, uppercase, with pin icon
  - Arrow: `→` chevron at far right, clickable
- Border: 1px solid `--color-outline-variant`
- Click entire card → `/evenements/{slug}`

**API mapping:**
- `type` → type label
- `titre` → title
- `contenu` → truncated description
- `dateEvenement` → date block (parsed into day/month/year)
- `slug` → navigation target

#### Featured Event Section

**Component:** `FeaturedEvent`

Below the event list, separated by a terracotta horizontal rule:

**Layout:** 2-column (40% text / 60% image)

```
Left:                              Right:
CONFÉRENCE VEDETTE : CS-FUTURE     [Large conference image]
2026

Description text...

✓ Plus de 50 sessions
✓ Keynotes
✓ Village recrutement

[DÉCOUVRIR LE PROGRAMME]
```

- Checkmarks: terracotta color, `--color-success`
- Button: Primary
- Static or pulled from first actualité with type "Conférence"

---

### 5.6 Détail Événement (Event Detail)

**Route:** `/evenements/:slug`  
**Page file:** `pages/public/EventDetailPage.jsx`  
**API calls on mount:**
- `GET /api/public/actualites/:slug`

#### Breadcrumb
`ACCUEIL > ÉVÉNEMENTS > {EVENT TITLE}`

#### Hero Section
- Tags: 2 badges ("COLLOQUE SCIENTIFIQUE" terracotta bg, "OUVERT AU PUBLIC" green bg)
- Title: Display font, "L'INTELLIGENCE ARTIFICIELLE AU SERVICE DE L'OPTIMISATION DES SYSTÈMES COMPLEXES"
- Hero image: Full width, 400px height, `object-fit: cover`

#### Content Layout: 2-column (60% main / 40% sidebar)

**Main column:**
- **Lead paragraph:** Body-lg, bold/italic intro
- **Body content:** Body-md, multi-paragraph (`contenu` field, rendered with line breaks)
- **Quote block:** 
  ```
  │ "L'enjeu n'est plus seulement de trouver une solution…" │
  │                                                          │
  │ — Pr. Jean Dupont, Directeur de Recherche                │
  ```
  Left: 4px terracotta border. Quote: italic body-lg. Attribution: label-md.
- **Inline image:** Second image within content area with caption below (label-sm, mono, uppercase)
- **Programme du Colloque:**
  Timeline list:
  ```
  14:00   OUVERTURE & KEYNOTE
          Introduction par la direction du département…

  15:30   TABLE RONDE : DÉFIS INDUSTRIELS
          Discussion croisée entre chercheurs…

  17:00   SESSION POSTER & NETWORKING
          Présentation des travaux doctoraux…
  ```
  - Time: terracotta, mono, bold
  - Title: headline-md
  - Desc: body-md

**Sidebar:**

**Info card:** `EventInfoSidebar`
```
┌─────────────────────────────────┐
│ INFORMATIONS PRATIQUES          │  ← headline-md
│                                 │
│ 📅 DATE                        │  ← label-sm, terracotta
│    Jeudi 12 Octobre 2026        │  ← body-md, bold
│                                 │
│ 🕐 HORAIRES                    │
│    14h00 – 18h00                │
│                                 │
│ 📍 LIEU                        │
│    Amphithéâtre Al Khawarizmi   │
│    Bâtiment Turing, 2ème étage  │
│                                 │
│ 👤 INTERVENANT PRINCIPAL        │
│    Pr. Jean Dupont              │
│                                 │
│ [S'INSCRIRE À L'ÉVÉNEMENT]     │  ← Primary button, full width
│ [AJOUTER À L'AGENDA]           │  ← Secondary button, full width
└─────────────────────────────────┘
```

**Map placeholder:**  
Gray box with pin icon centered (300×200px)

**API mapping:** All data from `GET /api/public/actualites/{slug}` response:
- `titre` → page title
- `contenu` → main body (parse for structured content)
- `dateEvenement` → info card date/time
- `imageCoverUrl` → hero image
- `type` → tags
- `auteur` → speaker attribution

#### Back link
`← RETOUR À LA LISTE DES ÉVÉNEMENTS` — Terracotta text, links to `/evenements`

---

### 5.7 Contact & Accès

**Route:** `/contact`  
**Page file:** `pages/public/ContactPage.jsx`  
**API calls:** None (static content)

#### Page Title
- "Contact & Accès" — Display font, with 4px terracotta bottom border

#### Layout: 2-column (45% / 55%)

**Left column:**

**Contact card:** `ContactInfoCard`
```
┌──────────────────────────────────┐
│ Nous Contacter                   │  ← headline-md, terracotta
│                                  │
│ (📍) ADRESSE POSTALE             │  ← icon in circle (pink bg)
│      Département Informatique    │    label-sm terracotta for label
│      123 Avenue des Algorithmes  │    body-md for details
│      Bâtiment Turing, Campus Nord│
│      75005 Paris, France         │
│                                  │
│ (✉)  E-MAIL                     │
│      contact@cs.univ.fr         │
│                                  │
│ (🕐) HORAIRES D'ACCUEIL         │
│      Lundi — Vendredi :         │
│      09h00 - 18h00              │
└──────────────────────────────────┘
```

- Icons: 48px circles with `--color-primary-light` background, terracotta icon
- Labels: label-sm, terracotta, uppercase
- Values: body-md

**Student banner:** `StudentBanner`
```
┌──────────────────────────────────┐
│ Vous êtes étudiant ?             │  ← White text on terracotta bg
│                                  │
│ Pour toute question relative…    │
│                                  │
│ [Accéder au portail]             │  ← White outlined button
└──────────────────────────────────┘
```

**Right column:**

**Map card:** `MapCard`
```
┌──────────────────────────────────────┐
│ ┌──────────────────┐                 │
│ │ EMPLACEMENT       │                │
│ │ Campus Turing —   │                │
│ │ Aile Ouest        │                │
│ └──────────────────┘                 │
│                                      │
│ [Google Maps / OpenStreetMap embed]   │
│                                      │
│                          [🔍+] [🔍-] │
└──────────────────────────────────────┘
```

- Embed an `<iframe>` with OpenStreetMap or Google Maps
- Location tag: floating card overlay at top-left
- Zoom controls at bottom-right

---

### 5.8 Connexion (Login)

**Route:** `/login`  
**Page file:** `pages/auth/LoginPage.jsx`  
**API calls:**
- `POST /api/login` (on form submit)
- `GET /api/me` (after successful login to fetch user details)

#### Layout: `AuthLayout` — Minimal header with logo + "← Retour au site"

**Background:** Light gray `--color-surface`

#### Login Card (centered, 520px max-width)

```
┌──────────────────────────────────────┐
│                                      │
│       AUTHENTIFICATION               │  ← headline-lg, centered
│                                      │
│ Accès strictement réservé au         │  ← body-md, centered, muted
│ personnel et aux étudiants du        │
│ département informatique.            │
│                                      │
│ IDENTIFIANT / EMAIL                  │  ← label-md
│ ┌──────────────────────────────────┐ │
│ │ u_name@univ.fr                   │ │  ← input, mono placeholder
│ └──────────────────────────────────┘ │
│                                      │
│ MOT DE PASSE               Oublié ? │  ← label-md + terracotta link
│ ┌──────────────────────────────────┐ │
│ │ ••••••••••••                     │ │
│ └──────────────────────────────────┘ │
│                                      │
│ ☐ Rester connecté                    │  ← checkbox, label-md
│                                      │
│ ┌──────────────────────────────────┐ │
│ │      SE CONNECTER  →]            │ │  ← Primary button, full width
│ └──────────────────────────────────┘ │
│                                      │
└──────────────────────────────────────┘
```

**Below the card — Info box:**
```
│ ℹ INFORMATION SYSTÈME                │
│                                       │
│ Toute tentative de connexion non      │
│ autorisée est enregistrée. L'adresse  │
│ IP de votre machine 192.168.1.1 fait  │
│ l'objet d'un audit de sécurité.       │
```
- 4px terracotta left border
- Gray background

#### Form Behavior

1. **On submit:** Call `POST /api/login` with `{ email, password }`
2. **Success:** Store JWT token in `localStorage`. Call `GET /api/me` to fetch user profile. Redirect based on role:
   - `ROLE_SUPER_ADMIN` or `ROLE_ADMIN` → `/dashboard`
   - `ROLE_SECRETAIRE` → `/dashboard`
   - `ROLE_PROF` → `/dashboard/profil`
3. **Error:** Show red error message below the form: "Identifiants invalides. Veuillez réessayer."
4. **Input styling:** Focus state: `border-color: --color-primary-container`, `box-shadow: 0 0 0 2px rgba(164, 93, 69, 0.2)`

---

### 5.9 Tableau de Bord Admin (Dashboard)

**Route:** `/dashboard` (and sub-routes)  
**Page file:** `pages/dashboard/DashboardPage.jsx`  
**Layout:** `DashboardLayout` — Sidebar + Main area

#### DashboardLayout Structure

```
┌───────────────┬──────────────────────────────────────────────┐
│               │                                              │
│  ADMIN        │  GESTION DES ÉVÉNEMENTS          [+ AJOUTER]│
│  CONSOLE      │  ADMIN / EVENTS MANAGEMENT                   │
│               │                                              │
│ ┌───────────┐ │  ┌───────┐ ┌────────┐ ┌───────┐ ┌────────┐ │
│ │ DASHBOARD │ │  │ TOTAL │ │ PUBLIÉS│ │DRAFTS │ │UPCOMING│ │
│ ├───────────┤ │  │  142  │ │   98   │ │  44   │ │   12   │ │
│ │ EVENTS    │ │  └───────┘ └────────┘ └───────┘ └────────┘ │
│ │ MGMT      │ │                                              │
│ ├───────────┤ │  ┌─────────────────────────────────────────┐ │
│ │ USER      │ │  │ LISTE DES ÉVÉNEMENTS    🔍 RECHERCHER  │ │
│ │ ACCOUNTS  │ │  ├─────────────────────────────────────────┤ │
│ ├───────────┤ │  │ ID  TITLE      DATE      STATUS  ACTION│ │
│ │ PEDAGOGY  │ │  │ #102 Sympo…  OCT 12  [PUBLIÉ]  ✏️ 🗑   │ │
│ │           │ │  │ #101 Ethics  SEP 28  [BROUILL] ✏️ 🗑   │ │
│ └───────────┘ │  │ ...                                     │ │
│               │  ├─────────────────────────────────────────┤ │
│ [+ NEW ACT.]  │  │ SHOWING 5 OF 142       < 1  2  3  >    │ │
│               │  └─────────────────────────────────────────┘ │
│ ⚙ SETTINGS   │                                              │
│ ↪ LOGOUT      │  ┌──────────────┐ ┌──────────────────────┐  │
│               │  │RECENT ACTIVITY│ │EVENT ENGAGEMENT      │  │
│ [Avatar]      │  │ Event #102…   │ │ Symposium Att. 85%   │  │
│ Admin User    │  │ New regist…   │ │ Workshop Cap. 42%    │  │
│ DEPT HEAD     │  └──────────────┘ └──────────────────────┘  │
└───────────────┴──────────────────────────────────────────────┘
```

#### Sidebar (`components/dashboard/Sidebar.jsx`)

| Element | Detail |
|---|---|
| **Header** | "ADMIN CONSOLE" — headline-md, white · "SYSTEM LEVEL ACCESS" — label-sm, muted |
| **Background** | White, right border `1px solid --color-outline-variant` |
| **Width** | 240px fixed |
| **Nav items** | Icon + label-md, vertical stack. Active: terracotta bg (`--color-primary-light`), bold |
| **Items** | 📊 DASHBOARD · 📄 EVENTS MGMT · 👥 USER ACCOUNTS · 📚 PEDAGOGY |
| **Conditional** | Show "USER ACCOUNTS" only for `ROLE_SUPER_ADMIN`. Show "PEDAGOGY" for `ROLE_ADMIN+` |
| **Bottom** | `+ NEW ACTION` (Primary button, full width) · ⚙ Settings · ↪ Logout (terracotta) |
| **User card** | Avatar circle (48px) + name + role |

**Sidebar nav items mapped to routes:**

| Sidebar Label | Route | Role |
|---|---|---|
| DASHBOARD | `/dashboard` | All |
| EVENTS MGMT | `/dashboard/actualites` | `ROLE_ADMIN+` |
| USER ACCOUNTS | `/dashboard/utilisateurs` | `ROLE_SUPER_ADMIN` |
| PEDAGOGY | `/dashboard/filieres` | `ROLE_ADMIN` |
| VALIDATION | `/dashboard/validation` | `ROLE_SUPER_ADMIN` |
| HISTORIQUE | `/dashboard/historique` | `ROLE_ADMIN` |
| MON PROFIL | `/dashboard/profil` | `ROLE_PROF` |

#### Main Dashboard Content (KPIs + Table + Widgets)

**KPI Cards** (`KPICards`):
- 4 metric boxes in a row
- Each: large number (display font), label underneath (label-sm uppercase)
- Colors: First uses default text, others use terracotta / green / amber for emphasis
- Data from: Count of `GET /api/admin/actualites` grouped by `statut`

**Events Table** (`DataTable`):
| Column | Width | Content |
|---|---|---|
| ID | 80px | `#102` — mono font |
| TITLE | flex | Event title — body-md |
| DATE | 120px | `OCT 12, 2024` — label-md, mono |
| STATUS | 100px | `Badge` component |
| ACTION | 80px | ✏️ edit icon + 🗑 delete icon |

- Search bar at top-right of the table header
- Pagination at bottom: "SHOWING 5 OF 142 EVENTS" + numbered page buttons
- Row hover: light gray background

**Widgets row (2-column):**

**Recent Activity** (`ActivityFeed`):
- List of action items with colored bullet, description, and timestamp
- Data from: `GET /api/admin/historique` (latest 5)

**Event Engagement** (`EngagementChart`):
- Horizontal progress bars with percentage labels
- Static/computed data

---

#### Sub-pages for Dashboard

##### `/dashboard/actualites` — Actualités Management

**Components:** `DataTable` + `ActualiteForm` (modal)

- Table columns: ID, Titre, Type, Statut (Badge), Date Création, Actions (edit/delete)
- `+ AJOUTER` button opens `ActualiteForm` modal
- **Form fields:** Titre (text), Contenu (textarea), Type (select: Actualité/Conférence/Séminaire), Date Événement (date picker), Image Cover URL (text)
- **Create:** `POST /api/admin/actualites`
- **Edit:** `PUT /api/admin/actualites/{id}`
- **Delete:** `DELETE /api/admin/actualites/{id}` (with confirmation modal)

##### `/dashboard/filieres` — Filières Management

**Components:** `FiliereManagement` table

- Table columns: ID, Nom, Type, Active (toggle), Actions
- CRUD: `GET/POST/PUT/DELETE /api/admin/filieres`
- Form fields: Nom, Type (select: Licence/Master/Doctorat), Description (textarea), Objectifs (textarea), Active (checkbox)

##### `/dashboard/enseignants` — Enseignants Management

**Components:** `EnseignantManagement` table

- Table columns: ID, Nom Complet, Email, Grade, Actif, Actions
- CRUD: `GET/POST/PUT/DELETE /api/admin/enseignants`
- Form: email, password (create only), nom, prenom, grade, telephone, photo (URL)

##### `/dashboard/laboratoires` — Laboratoires & Axes

**Components:** `LaboManagement`

- **Laboratoires table:** ID, Nom, Acronyme, Nb Axes, Actions
- **Nested:** Click a labo row → expand to show its Axes de Recherche
- **Axes sub-table:** ID, Titre, Description, Actions
- CRUD Labs: `GET/POST/PUT/DELETE /api/admin/laboratoires`
- CRUD Axes: `POST /api/admin/laboratoires/{labId}/axes`, `PUT/DELETE /api/admin/axes/{id}`

##### `/dashboard/utilisateurs` — User Management (Super Admin)

**Components:** `UserManagement`

- **API:** `GET /api/super-admin/utilisateurs`
- Table columns: ID, Email, Type, Roles, Actif, Actions
- **Toggle Active:** `PATCH /api/super-admin/utilisateurs/{id}/activer` — switch button
- **Change Role:** `PATCH /api/super-admin/utilisateurs/{id}/role` — dropdown/modal with checkbox roles

##### `/dashboard/validation` — Pending Validation (Super Admin)

**Components:** `PendingValidation`

- **API:** `GET /api/super-admin/actualites/pending`
- Table: ID, Titre, Type, Date Création, Auteur, Actions
- **Approve:** `PATCH /api/super-admin/actualites/{id}/valider` — green check button
- **Reject:** `PATCH /api/super-admin/actualites/{id}/refuser` — red X button → opens modal asking for `motifRefus` (textarea)

##### `/dashboard/historique` — Audit Log

**Components:** `HistoriqueLog`

- **API:** `GET /api/admin/historique`
- Table: ID, Action, Entité, Entité ID, Détails, Date, Utilisateur
- Read-only, no actions. Mono font for technical columns.

##### `/dashboard/profil` — Teacher Profile (Enseignant)

**Components:** Profile edit form

- **API:** `GET /api/enseignant/profile` → pre-fill form
- **Fields:** Nom (read-only), Prénom (read-only), Email (read-only), Téléphone (editable), Photo URL (editable), Grade (editable)
- **Submit:** `PUT /api/enseignant/profile`
- **Submit Publication:** Separate form with Titre + Contenu + Image URL → `POST /api/enseignant/publications`

---

## 6. Authentication & State Management

### 6.1 AuthContext

```
AuthContext = {
  user: Object | null,       // { id, email, roles, isActive, nom?, prenom?, grade? }
  token: string | null,      // JWT token
  isAuthenticated: boolean,
  isLoading: boolean,        // true while checking auth on mount
  login: (email, password) => Promise,
  logout: () => void,
  hasRole: (role) => boolean
}
```

### 6.2 Auth Flow

```
1. User visits /login
2. Submits email + password
3. Frontend calls POST /api/login → { token }
4. Store token in localStorage("jwt_token")
5. Set Axios default header: Authorization: Bearer {token}
6. Call GET /api/me → user object
7. Store user in AuthContext
8. Redirect based on role
```

### 6.3 Axios Client Configuration (`api/axiosClient.js`)

```javascript
// Configuration blueprint:
const axiosClient = axios.create({
  baseURL: 'http://localhost:8000',  // Backend URL
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor: attach JWT from localStorage
// Response interceptor: on 401, clear token + redirect to /login
```

### 6.4 Token Refresh

The JWT has a `token_ttl` of 86400 seconds (24h). No refresh token mechanism is implemented on the backend. On 401 response, clear state and redirect to login.

### 6.5 ProtectedRoute & RoleRoute

```jsx
// ProtectedRoute: wraps routes requiring authentication
// If !isAuthenticated → Navigate to /login

// RoleRoute: wraps routes requiring specific roles
// Props: allowedRoles = ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN']
// If !user.roles includes any allowedRole → Navigate to /dashboard (or /403)
```

---

## 7. Complete API Integration Reference

### 7.1 Public Endpoints (No Auth)

| Endpoint | Method | Purpose | Used On Pages |
|---|---|---|---|
| `/api/login` | POST | Login | LoginPage |
| `/api/public/filieres` | GET | All active filières | HomePage, FormationsPage |
| `/api/public/filieres/{slug}` | GET | Single filière detail | FormationsPage (detail) |
| `/api/public/enseignants` | GET | All active teachers | HomePage, TeamPage, DepartmentPage |
| `/api/public/laboratoires` | GET | All labs + axes + teachers | DepartmentPage |
| `/api/public/actualites` | GET | Published news (supports `?keyword=`, `?year=`, `?type=`) | HomePage, EventsPage |
| `/api/public/actualites/{slug}` | GET | Single event/news detail | EventDetailPage |

### 7.2 Authenticated Endpoints

| Endpoint | Method | Purpose | Role | Used On Pages |
|---|---|---|---|---|
| `/api/me` | GET | Current user profile | Any | After login, AuthProvider |
| `/api/enseignant/profile` | GET | Teacher's own profile | ROLE_PROF | ProfilePage |
| `/api/enseignant/profile` | PUT | Update teacher profile | ROLE_PROF | ProfilePage |
| `/api/enseignant/publications` | POST | Submit publication | ROLE_PROF | ProfilePage |
| `/api/secretaire/actualites` | POST | Create news item | ROLE_SECRETAIRE | DashboardPage |
| `/api/secretaire/actualites` | GET | My submitted news | ROLE_SECRETAIRE | DashboardPage |
| `/api/secretaire/actualites/{id}` | PUT | Resubmit refused item | ROLE_SECRETAIRE | DashboardPage |

### 7.3 Admin Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/admin/filieres` | GET | List all filières |
| `/api/admin/filieres` | POST | Create filière |
| `/api/admin/filieres/{id}` | PUT | Update filière |
| `/api/admin/filieres/{id}` | DELETE | Delete filière |
| `/api/admin/enseignants` | GET | List all teachers |
| `/api/admin/enseignants` | POST | Create teacher account |
| `/api/admin/enseignants/{id}` | PUT | Update teacher |
| `/api/admin/enseignants/{id}` | DELETE | Delete teacher |
| `/api/admin/laboratoires` | GET | List all labs |
| `/api/admin/laboratoires` | POST | Create lab |
| `/api/admin/laboratoires/{id}` | PUT | Update lab |
| `/api/admin/laboratoires/{id}` | DELETE | Delete lab |
| `/api/admin/laboratoires/{labId}/axes` | POST | Add research axis |
| `/api/admin/axes/{id}` | PUT | Update axis |
| `/api/admin/axes/{id}` | DELETE | Delete axis |
| `/api/admin/actualites` | GET | List all actualités |
| `/api/admin/actualites` | POST | Create (auto-publish) |
| `/api/admin/actualites/{id}` | PUT | Update actualité |
| `/api/admin/actualites/{id}` | DELETE | Delete actualité |
| `/api/admin/historique` | GET | Audit trail |

### 7.4 Super Admin Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/super-admin/utilisateurs` | GET | List all users |
| `/api/super-admin/utilisateurs/{id}/activer` | PATCH | Toggle active |
| `/api/super-admin/utilisateurs/{id}/role` | PATCH | Update roles |
| `/api/super-admin/actualites/pending` | GET | Pending items |
| `/api/super-admin/actualites/{id}/valider` | PATCH | Approve |
| `/api/super-admin/actualites/{id}/refuser` | PATCH | Reject (body: `{ motifRefus }`) |

---

## 8. Responsive Breakpoints

| Breakpoint | Name | Columns | Margins | Behavior |
|---|---|---|---|---|
| `≥ 1280px` | Desktop | 12 | 48px | Full layout |
| `1024px – 1279px` | Tablet Landscape | 12 | 32px | Slightly compressed |
| `768px – 1023px` | Tablet | 8 | 32px | 2-column → stacked, sidebar collapses |
| `< 768px` | Mobile | 4 | 16px | Single column, hamburger nav, full-width cards |

### Dashboard-specific:
- `≥ 1024px`: Sidebar visible (240px) + Main content
- `< 1024px`: Sidebar collapsed into hamburger overlay
- KPI cards: 4-across → 2×2 → 1-column stack
- Tables: Horizontal scroll on mobile

---

> **This document is the complete frontend specification.** It maps every design screenshot to its corresponding React components, provides the exact API endpoints for data fetching, defines the full project structure, and details every UI element down to colors, typography, spacing, and interaction states.
