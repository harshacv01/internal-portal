# Internal Portal

A small internal portal: login required, with one section — a team **announcements
feed** you can read and post to. I picked announcements because it makes the auth
work visible: an announcement has an author, so the session decides what gets
written and who may write it.

Next.js 15 (App Router), TypeScript, Postgres with Drizzle, Tailwind with
shadcn/ui, zod, Vitest. Sessions are signed JWTs in an httpOnly cookie via `jose`.

## Setup

```bash
npm install
cp .env.example .env.local   # DATABASE_URL + SESSION_SECRET
npm run db:migrate
npm run db:seed
npm run dev
```

`DATABASE_URL` is any Postgres (I used [Neon](https://neon.tech)); `SESSION_SECRET`
is 32+ chars from `openssl rand -base64 32`. Both are validated on boot in
`src/lib/env.ts`.

Seeded accounts, password `portal1234`:

| Email | Role | Can |
| --- | --- | --- |
| `admin@example.com` | admin | read the feed, post announcements |
| `member@example.com` | member | read only |

Signing in as the member account shows the authorization split: the compose form
disappears, and `POST /api/announcements` returns 403 if called directly.

Also: `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Decisions

**Reads and writes take different paths.** The feed page is a server component
calling the repository directly — no HTTP hop from the server to its own API, no
list in client state. The compose form POSTs to `/api/announcements`, then
`router.refresh()` re-runs the server component. The client never holds a copy of
the list, so there is nothing to keep in sync. This is also why there is no
`GET /api/announcements`: nothing would call it.

**Sessions by hand, not Auth.js.** Auth is being evaluated, and a credentials-only
login is where a library hides the interesting parts. JWT signed with `jose`,
httpOnly SameSite=Lax cookie, scrypt password hashing. At work I would use Auth.js;
here it shows more than it risks.

**Middleware is UX, not security.** It bounces signed-out traffic early, but it
matches on URL patterns. Every protected page and route handler re-checks via
`lib/auth/guards.ts`. Delete the middleware and the app is still secure.

**Authorization, not just authentication.** Admins post, members read, enforced in
the handler — hiding the form is a courtesy, not a control.

**One zod schema per shape**, shared by form and handler so rules cannot drift, and
one error envelope so field errors render the same either way. Route handlers over
Server Actions because the brief specifies API routes. Category filter lives in the
URL, not `useState`, so it is shareable and the back button works. CSRF is
SameSite=Lax plus an `Origin` check; login returns one message for unknown email
and wrong password.

## Scope

Unit tests cover the two places a silent bug would be worst: password hashing and
session verification, including forged, wrong-secret and expired tokens. I did not
write tests around zod schemas or response helpers — those would mostly be testing
the libraries. No e2e tests either; Playwright plus a test database was more than
the time budget allowed.

Left out on purpose: edit/delete and pagination (the brief asks for create and
view; at volume I would use keyset pagination on `created_at`, and the index is
already there), password reset and registration (need email), and login rate
limiting — which belongs at the edge and is the first thing I would add before
real users.

## Deploy

Import the repo on Vercel, provision Postgres (Neon injects `DATABASE_URL` from
the Storage tab), set `SESSION_SECRET`, then run `db:migrate` and `db:seed`.
