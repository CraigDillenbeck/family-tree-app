# MyNamesake

A consumer web app for building beautiful family trees and preserving family memories.

## Stack

SvelteKit, TypeScript, Supabase (Postgres + Auth + Storage), deployed on Vercel.

## Setup

Copy environment variables into `.env.local` (see `claude.md` for required keys):

```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
```

Install dependencies:

```sh
npm install
```

## Developing

```sh
npm run dev

# or open the app in a new browser tab
npm run dev -- --open
```

## Building

```sh
npm run build
npm run preview
```

## Other commands

```sh
npm run check   # TypeScript / Svelte check
npm run lint    # ESLint + Prettier
```

Project conventions and schema details live in `claude.md`.
