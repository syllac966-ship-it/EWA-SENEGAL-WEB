# EWA Senegal

MVP d'une plateforme d'accès au salaire à la demande (*Earned Wage Access*) pour le marché sénégalais.

## Stack technique

- **Frontend** : React + TypeScript + Tailwind CSS (Vite)
- **Backend** : Node.js + Express + TypeScript
- **Base de données** : PostgreSQL
- **Paiements** : simulation Wave / Orange Money (mock, aucun appel réseau réel)

## Fonctionnalités du MVP

- Authentification salarié / admin RH (JWT, mots de passe hashés avec bcrypt)
- Calcul du salaire déjà gagné = jours travaillés × taux journalier (taux journalier = salaire mensuel / jours ouvrés configurés)
- Demande d'avance plafonnée (par défaut 50 % du salaire déjà gagné, paramétrable)
- Simulation de paiement vers Wave / Orange Money déclenchée à l'approbation d'une demande
- Tableau de bord admin : gestion des employés, pointage des jours travaillés, paramètres de paie, revue des demandes d'avance

## Structure du projet

```
ewa-senegal/
├── backend/     API Express + TypeScript
├── frontend/    Application React + TypeScript + Tailwind
└── docker-compose.yml   PostgreSQL pour le développement local
```

Voir `backend/README.md` et `frontend/README.md` (sections ci-dessous) pour le détail de chaque application.

## Démarrage rapide

### 1. Base de données

```bash
docker compose up -d
```

Démarre PostgreSQL sur `localhost:5432` (utilisateur `ewa_user`, base `ewa_senegal`).
Sans Docker, utilisez n'importe quelle instance PostgreSQL 14+ et adaptez `DATABASE_URL`.

### 2. Backend

```bash
cd backend
cp .env.example .env   # ajustez JWT_SECRET et DATABASE_URL si besoin
npm install
npm run db:migrate     # crée les tables
npm run db:seed        # crée un compte admin + un employé de démonstration
npm run dev             # démarre l'API sur http://localhost:4000
```

Comptes de démonstration créés par `npm run db:seed` :

| Rôle    | Email                          | Mot de passe   |
|---------|---------------------------------|----------------|
| Admin   | admin@ewa-senegal.sn            | Admin@2024!    |
| Salarié | aissatou.diop@ewa-senegal.sn    | Salarie@2024!  |

**Changez ces identifiants avant tout déploiement au-delà d'un usage local.**

### 3. Frontend

```bash
cd frontend
cp .env.example .env   # VITE_API_URL doit pointer vers l'API backend
npm install
npm run dev              # démarre l'app sur http://localhost:5173
```

## Sécurité mise en place dès le départ

- Mots de passe hashés avec **bcrypt** (jamais stockés en clair)
- Authentification par **JWT** signé, vérifié sur chaque route protégée
- Contrôle d'accès par rôle (`employee` / `admin`) au niveau des middlewares de route
- Toutes les requêtes SQL sont **paramétrées** (`pg`), aucune concaténation de chaînes → pas d'injection SQL
- Validation stricte des entrées avec **Zod** sur chaque endpoint
- En-têtes de sécurité HTTP via **helmet**, CORS restreint à l'origine du frontend
- **Rate limiting** renforcé sur `/auth/login` (anti brute-force) et global sur l'API
- Le plafond d'avance (50 % par défaut) est **revalidé côté serveur** à chaque demande, jamais fait confiance au client
- Les montants déjà demandés sur la période en cours sont pris en compte pour empêcher le contournement du plafond via plusieurs demandes
- Les erreurs internes ne fuient jamais de détails techniques au client en production
- Variables sensibles (secrets JWT, identifiants DB) exclusivement via variables d'environnement (`.env`, jamais commité)

## Note sur les paiements Wave / Orange Money

`backend/src/services/payment.service.ts` contient une **simulation** : elle génère un identifiant de
transaction factice et un statut aléatoire (~95 % de succès) après un court délai, sans aucun appel
réseau réel. C'est le point d'intégration à remplacer par les SDK/API officiels Wave et Orange Money
Sénégal lors du passage en production.

## Prochaines étapes suggérées (hors MVP)

- Intégration réelle des API Wave / Orange Money (webhooks de confirmation de paiement)
- Rafraîchissement de token / déconnexion multi-appareils
- Import de paie en masse (CSV) et pointage automatisé (badgeuse, biométrie)
- Notifications SMS/email sur les changements de statut de demande
- Tests automatisés (unitaires + intégration) et pipeline CI
