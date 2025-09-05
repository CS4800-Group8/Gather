# CS4800-NVMATech

Recipe Finder — Next.js + TypeScript (Full-Stack)

A dead-simple full-stack recipe finder where people post recipes and rate others’ dishes. Built with React/Next.js (App Router) + TypeScript. Ship MVP first; no bikeshedding.

## Stack

Web: Next.js (TS) or React, Tailwind (optional shadcn/ui gives clean skeleton UI components)

Data: TBD


## Quick Start
- pnpm install
 cp .env.example .env   # set DATABASE_URL, NEXTAUTH_SECRET
- pnpx prisma migrate dev
- pnpm dev

## Layout Skeleton (TODO)
- Global: header (logo, search, auth), footer
- Pages: landing /, feed /app, sign-in/up, profile
- Recipes: create /recipes/new, view /recipes/[id]
- Data: Prisma schema + seed; basic search (title/ingredients)
