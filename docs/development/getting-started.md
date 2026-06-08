# Getting Started

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10 — `npm install -g pnpm`

## Setup

### 1. Clone the Repo

**Option A — VS Code**

1. Open VS Code and open the Command Palette (`Cmd+Shift+P`)
2. Type **Git: Clone** and select it
3. Paste `https://github.com/kad-products/rezept-core.git` and press Enter
4. Choose a folder to clone into — VS Code will open the project automatically when it's done

**Option B — Terminal**

```bash
git clone https://github.com/kad-products/rezept-core.git
cd rezept-core
```

### 2. Install Dependencies

To install all the packages, register automation hooks, and get things rolling.

```bash
pnpm install
```

### 3. Environment variables

Generate a secret key, copy the example file, and fill in values.  In the vscode terminal run these two commands:

```bash
openssl rand -base64 32
cp .dev.vars.example .dev.vars
```

Copy the random string from the first command and use it as the `SESSION_SECRET_KEY` in the `.dev.vars` that should now be in the projec root after the second command.

`.dev.vars` is gitignored and must never be committed. See [Environment variables](#environment-variables) below for a full reference.

### 4. Generate types

```bash
pnpm generate
```

This runs `wrangler types` and produces `worker-configuration.d.ts` from `wrangler.jsonc`. TypeScript and your editor need this file — without it type checking will fail.

### 5. Set up the local database

Apply migrations to create the local D1 database:

```bash
pnpm db:migrate:dev
```

The local database file is created automatically by Wrangler in `.wrangler/state/v3/d1/`. To start fresh at any point, delete that file (or run `pnpm db:reset-local`) and re-run migrations.

Optionally, seed the database with generated test data:

```bash
pnpm db:seed
```

See [Seed data](#seed-data) below for what this generates.

### 6. Start the dev server

```bash
pnpm dev
```

The app runs at `http://rezept.localhost:5173`.

---

## Environment variables

### `.dev.vars` — local secrets

These are Cloudflare Worker secrets for local development. The file is gitignored.

| Variable             | Required | Description                                                         |
| -------------------- | -------- | ------------------------------------------------------------------- |
| `SESSION_SECRET_KEY` | Yes      | Signs session cookies. Any random string (32+ chars) works locally. |

### `.env` — Vite client-side variables

| Variable        | Default                        | Description                             |
| --------------- | ------------------------------ | --------------------------------------- |
| `VITE_BASE_URL` | `http://rezept.localhost:5173` | Base URL used by the Vite client build. |

### `wrangler.jsonc` — non-secret worker vars

These are set directly in `wrangler.jsonc` and do not need to be in `.dev.vars`:

| Variable            | Local value   | Description                                              |
| ------------------- | ------------- | -------------------------------------------------------- |
| `WEBAUTHN_APP_NAME` | `rezept`      | Display name used in WebAuthn/passkey prompts.           |
| `REZEPT_ENV`        | `development` | Runtime environment name, used for conditional behavior. |

---

## Seed data

Running `pnpm db:seed` resets the local database and populates it with generated data using [drizzle-seed](https://orm.drizzle.team/docs/seed-overview) and [Faker](https://fakerjs.dev/). It covers all tables with enough relational data to exercise the app without manual entry.

The seed script lives in `scripts/seeding/`. Run it any time to reset the DB to a known state.

---

## Editor setup

The project ships `.vscode/` settings that configure format-on-save using Biome (JS/TS/JSON) and Prettier (CSS). Install the recommended extensions when VS Code prompts, or install them manually:

- **Biome** (`biomejs.biome`) — linting and formatting for JS/TS
- **Prettier** (`esbenp.prettier-vscode`) — formatting for CSS/LESS

---

## Key commands

| Command               | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `pnpm dev`            | Start dev server (clears Vite cache first)                   |
| `pnpm generate`       | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` |
| `pnpm type-check`     | TypeScript type check (no emit)                              |
| `pnpm test:run`       | Run all tests once with coverage                             |
| `pnpm biome:fix`      | Auto-fix lint and formatting                                 |
| `pnpm db:migrate:new` | Generate a new migration from model changes                  |
| `pnpm db:migrate:dev` | Apply migrations to local DB                                 |
| `pnpm db:seed`        | Reset and seed the local DB                                  |
| `pnpm db:reset-local` | Delete the local DB file (re-run migrations after)           |
