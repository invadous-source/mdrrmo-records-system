# TechLink — Phase 2 API + Public Guestbook

This package keeps the current V4-style frontend and adds the first real application layer.

## What was added

- `guestbook.html` — public message stream; visitors do NOT need an account.
- `/api/health` — API health endpoint.
- `/api/github` — meaningful external GitHub REST API integration.
- `/api/messages` — REST API for reading/posting guestbook messages.
- `supabase/schema.sql` — persistent message table.
- GitHub live repository cards on each professional profile.
- Navigation and Connect section updated for the guestbook.
- Professional Login remains a future Phase 4 feature.

## Architecture

Browser → Vercel serverless REST API → Supabase PostgreSQL
                              ↘ GitHub REST API

The GitHub endpoint fetches public profile/repository data, validates it, selects useful fields, and returns a TechLink-specific JSON response. This demonstrates external API request/response and data transformation.

## Step-by-step setup

### 1. Create the Supabase project

Create a Supabase project and open **SQL Editor**.

Run everything in:

`supabase/schema.sql`

### 2. Get the Supabase project values

From Supabase project settings, copy:

- Project URL → `SUPABASE_URL`
- Service role key → `SUPABASE_SERVICE_ROLE_KEY`

IMPORTANT: the service-role key is a secret. Never paste it into HTML, JavaScript running in the browser, GitHub, or a screenshot.

### 3. Connect the project to Vercel

Keep this folder/repository connected to your existing Vercel project.

Vercel automatically detects the `/api` directory as serverless API routes.

### 4. Add Vercel environment variables

In Vercel → Project → Settings → Environment Variables, add:

`SUPABASE_URL` = your Supabase Project URL

`SUPABASE_SERVICE_ROLE_KEY` = your Supabase service-role key

Apply them to the environments you use (Preview and/or Production).

Then redeploy.

### 5. Test the API

After deployment, open:

`/api/health`

It should return JSON with `"success": true`.

Then open:

`/api/github?username=invadous-source`

It should return GitHub profile/repository JSON if that GitHub account is public.

Finally open:

`guestbook.html`

Post a test note. Refresh the page. The note should remain because it is stored in Supabase.

## Important security rule

The service-role key must only exist as a Vercel server-side environment variable. It must NOT appear in `index.html`, `guestbook.html`, browser JavaScript, or the GitHub repository.

## What comes next

Phase 3:
- expand the database for professionals/users
- connect professional profile data to Supabase
- add stronger database rules and relationships

Phase 4:
- professional authentication
- separate Wilan / Arman / Sherlyn / Madelain accounts
- admin account
- role-based access

Phase 5+:
- professional dashboard
- professional-specific inbox/replies
- optional private messaging if the final project needs it

Visitor registration is intentionally NOT required for the public guestbook.
