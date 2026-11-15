-- ============================================================================
-- Songyu storage schema
--
-- Run this once per project in the Supabase dashboard: SQL Editor -> New query
-- -> paste this whole file -> Run. It is idempotent, so running it again after
-- a partial failure or on an existing project is safe.
--
-- The site talks to both objects below with the service_role key only:
--   * public.songyu_documents - every JSON document the admin panel writes
--     (encrypted account list, encrypted product overlay, inquiries, ...),
--     addressed by the pathname it had in the old Vercel Blob store.
--   * storage bucket songyu-media - product photos and factory videos,
--     readable by anyone, written by the server (and by the browser through a
--     server-issued signed upload URL).
-- ============================================================================

-- ---------------------------------------------------------------- documents
-- `key` is the old Blob pathname verbatim, e.g. admin/users.json,
-- content/products.json, inquiry-state/read.json, inquiries/<ISO>-<uuid>.json.
-- `body` is text: encrypted documents are base64(iv | auth tag | ciphertext) and
-- the plain documents are JSON. Nothing here is readable without the deployment
-- secrets, so the table needs no column-level protection of its own.
create table if not exists public.songyu_documents (
  key text primary key,
  body text not null,
  updated_at timestamptz not null default now()
);

comment on table public.songyu_documents is
  'Document store for songyuheavyparts.com. Key = former Vercel Blob pathname; body = ciphertext (base64) or JSON.';

-- Inquiry listing asks for `key like 'inquiries/%'`, which is a range scan when
-- the index uses text_pattern_ops (a plain btree would need C collation first).
create index if not exists songyu_documents_key_prefix_idx
  on public.songyu_documents (key text_pattern_ops);

-- Useful when inspecting rows by hand; the app never orders by it.
create index if not exists songyu_documents_updated_at_idx
  on public.songyu_documents (updated_at desc);

-- Row level security is on, and deliberately has NO policies.
--
-- Every read and write comes from the site server using the service_role key,
-- which bypasses RLS entirely. With RLS enabled and no policy, the anon and
-- authenticated roles can read nothing: if the key ever leaks into a browser
-- bundle or a public URL, the table is still not exposed. Do not add a public
-- policy "to make it work" - if the app cannot read it, the key is missing.
alter table public.songyu_documents enable row level security;

-- -------------------------------------------------------------- media bucket
-- Public bucket: product photos and factory videos are served from
-- <project>/storage/v1/object/public/songyu-media/... so the site can render
-- them without an extra authenticated request.
insert into storage.buckets (id, name, public)
values ('songyu-media', 'songyu-media', true)
on conflict (id) do nothing;

-- If the bucket already existed as private, make it public.
update storage.buckets set public = true where id = 'songyu-media';

-- No policies on storage.objects either. Uploads and deletes go through the
-- service_role key (RLS bypassed), and reads of a public bucket are served
-- without touching RLS. Browser uploads use a signed upload URL minted by the
-- server; that token is the authorization, not a policy.
--
-- Writes are therefore impossible for anon/authenticated: someone holding only
-- the public URL can read a photo, never replace or delete it.
