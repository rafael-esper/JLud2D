# Phantasy Cloud — setup

Opt-in accounts for the Phantasy Star demo: a player signs in with an email
address, confirms it with a 6-digit code, and their save slots are mirrored to a
server. Play statistics (playtime, battles, deaths, level, furthest place) are
reported for signed-in players only.

The game works exactly as before without any of this. When the
`VITE_SUPABASE_*` variables are missing, `PSCloudClient.isConfigured()` is false
and the menu entry simply reports that the service is unavailable.

## 1. Create the Supabase project

Free tier is enough. From **Settings → API**, copy:

- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

The anon key is meant to ship in browser code. Row-level security on the tables
is what protects player data. **Never** put the `service_role` key in the app —
it bypasses RLS.

## 2. Switch the email from a link to a code

**Auth → Email Templates → Magic Link**: replace `{{ .ConfirmationURL }}` with
`{{ .Token }}`.

This step is not optional. Out of the box Supabase mails a clickable link, and
`verifyOtp` then has no code to accept — sign-in fails every time. A magic link
is also the wrong shape for this game: on a phone it usually opens a different
browser or an in-app webview, which is a different `localStorage`, so the player
loses the running game and lands on a fresh boot.

Suggested body:

```
<h2>Phantasy Cloud</h2>
<p>Your sign-in code is:</p>
<p style="font-size:28px;letter-spacing:6px;"><b>{{ .Token }}</b></p>
<p>It expires in one hour. If you didn't ask for it, ignore this message.</p>
```

## 3. Configure SMTP

**Auth → SMTP Settings.** Supabase's built-in sender is limited to a couple of
messages per hour across the whole project and is only usable for your own
testing — with real players it silently rate-limits and codes stop arriving.

Point it at a real provider with a verified sender domain:

- [Resend](https://resend.com) — 3 000 emails/month free
- [Brevo](https://brevo.com) — 300 emails/day free

Also raise **Auth → Rate Limits → Email sent** once real SMTP is in place.

## 4. Run the schema

SQL editor, once:

```sql
create table ps_cloud_saves (
  user_id    uuid not null references auth.users on delete cascade,
  slot       smallint not null check (slot between 0 and 14),
  meta       jsonb not null,          -- SaveSlotMeta
  data       jsonb not null,          -- GameData.serialize()
  updated_at timestamptz not null default now(),
  primary key (user_id, slot)
);
alter table ps_cloud_saves enable row level security;
create policy own_saves on ps_cloud_saves for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table ps_players (
  user_id          uuid primary key references auth.users on delete cascade,
  email            text,             -- filled by trigger, never by the client
  created_at       timestamptz not null default now(),
  last_seen_at     timestamptz,
  locale           text,
  platform         text,             -- 'mobile' | 'desktop'
  playtime_seconds int not null default 0,
  max_level        int not null default 0,
  furthest_place   text,
  battles_won      int not null default 0,
  deaths           int not null default 0,
  game_completed   boolean not null default false
);
alter table ps_players enable row level security;
create policy own_profile_read on ps_players for select using (auth.uid() = user_id);

-- The email comes from the auth record, so a client can never claim someone
-- else's address. There is deliberately no UPDATE policy: every write goes
-- through report_stats() below, which is security definer and only touches the
-- caller's own row.
create function handle_new_user() returns trigger language plpgsql security definer as $$
begin
  insert into ps_players (user_id, email) values (new.id, new.email)
  on conflict (user_id) do nothing;
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

-- Monotonic merge: playtime/battles/deaths accumulate, bests only ever rise.
-- That makes a retried or out-of-order flush harmless.
create function report_stats(p jsonb) returns void language plpgsql security definer as $$
begin
  update ps_players set
    last_seen_at     = now(),
    locale           = coalesce(p->>'locale', locale),
    platform         = coalesce(p->>'platform', platform),
    playtime_seconds = playtime_seconds + coalesce((p->>'playtime_seconds')::int, 0),
    battles_won      = battles_won      + coalesce((p->>'battles_won')::int, 0),
    deaths           = deaths           + coalesce((p->>'deaths')::int, 0),
    max_level        = greatest(max_level, coalesce((p->>'max_level')::int, 0)),
    furthest_place   = coalesce(p->>'furthest_place', furthest_place),
    game_completed   = game_completed or coalesce((p->>'game_completed')::boolean, false)
  where user_id = auth.uid();
end $$;
```

## 5. Set the environment variables

**Vercel → Project → Settings → Environment Variables**, for all environments:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Locally, copy `.env.example` to `.env.local` and fill in the same two values.
`.env.local` is git-ignored. Vite inlines `VITE_*` variables **at build time**,
so changing them in Vercel requires a redeploy.

## Seeing who is playing

Supabase dashboard → **Table editor → ps_players**, or the SQL editor:

```sql
select email, last_seen_at, playtime_seconds / 60 as minutes,
       max_level, furthest_place, battles_won, deaths, platform, locale
from ps_players
order by last_seen_at desc nulls last;
```

## Code map

| File | Role |
| --- | --- |
| `src/demos/ps/cloud/PSCloudClient.ts` | Supabase wrapper. Lazy SDK import, `{ok, error}` results, error→i18n mapping |
| `src/demos/ps/cloud/PSCloudForm.ts` | DOM email/code overlay — the only text input in the game |
| `src/demos/ps/cloud/PSCloudMenu.ts` | In-canvas menu (sign in / upload / download / account / sign out) |
| `src/demos/ps/cloud/PSCloudStats.ts` | Session counters and flushing |

Entry points: title screen (`TitleScene`) and the in-game pause menu
(`PSMenuMain`). `PSGame.saveGame()` also mirrors the written slot when signed in.

Two behaviours worth knowing before changing anything here:

- **Local storage stays authoritative.** `SaveManager` is untouched on the read
  path; the cloud is a mirror. A dead network can never delay or fail a save.
- **The Supabase SDK is a lazy chunk.** `PSCloudClient.sdk()` uses a dynamic
  import so players who never open the menu never download it. Keep it that way —
  a static import would add ~220 kB to first load.
