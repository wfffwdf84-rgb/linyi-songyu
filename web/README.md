# Linyi Songyu — songyuheavyparts.com

B2B catalogue for Linyi Songyu International Trade Co., Ltd: heavy machinery
spare parts in 13 locales. Next.js 16 (App Router), next-intl, Tailwind v4,
deployed to Vercel as project `linyi-songyu` (team `gcjx`).

## Commands

```bash
npm run dev                 # local dev
npm run build               # production build
npx tsc --noEmit            # type check
npx vercel deploy --prod --archive=tgz --yes --scope gcjx
```

## Environment variables

`.env*` is gitignored, so this table is the tracked record — keep it in sync.

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used by metadata, JSON-LD and the sitemap |
| `NEXT_PUBLIC_WHATSAPP` | WhatsApp deep link |
| `NEXT_PUBLIC_FACEBOOK_URL` / `NEXT_PUBLIC_TIKTOK_URL` / `NEXT_PUBLIC_INSTAGRAM_URL` / `NEXT_PUBLIC_YOUTUBE_URL` | Social links |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob: factory videos and captured inquiries |
| `FACTORY_VIDEO_PASSWORD` | Password for the factory uploader **and** the inquiry desk. Also the fallback encryption key for inquiries |
| `NEXT_PUBLIC_GA_ID` | GA4 measurement ID. While empty the site loads no analytics script and sets no analytics cookie |
| `INQUIRY_ENCRYPTION_KEY` | Optional. Set it to keep stored inquiries readable if the factory password is ever rotated |

## Operations panel

`/admin` is a separate, non-localized tool for staff. It is not part of the
public catalogue and is disallowed in `robots.txt`.

- **Sign in.** Username `admin`, password `ADMIN_PASSWORD` (falls back to
  `FACTORY_VIDEO_PASSWORD`). The first successful sign-in creates the owner
  account, so nobody has to seed one by hand.
- **Roles.** `owner` manages everything including accounts; `editor` also
  handles products, copy and banners (later phases) plus inquiries; `sales`
  only sees inquiries, statistics and the CSV export.
- **Accounts are encrypted at rest.** The Blob store is public, so the account
  document is AES-256-GCM encrypted with a key derived from
  `ADMIN_SESSION_SECRET`. Set that variable to a long random value; do not rely
  on the factory password fallback.
- **Rotating `ADMIN_SESSION_SECRET` makes the existing accounts unreadable.** To
  recover, delete `admin/users.json` and the `admin/users/` snapshots, then sign
  in again with the bootstrap password; every account has to be recreated.
- **Sessions** last 12 hours, are HttpOnly, and re-check the account on every
  request, so disabling a user or changing a role takes effect immediately.
- **No online payments.** Payment stays off-site: terms are agreed on the quote
  and settled by bank transfer, which is why the panel records prices
  internally and never renders them on the public site.

## Workflows

### Adding OEM cross-reference numbers

Buyers search by OEM part number, so every number we can list is another way to
be found. Numbers are never invented — only supplier or OEM-documented values go in.

1. Open `scripts/oem-cross-reference-template.csv` (all live products, one row
   each, `oem_1`…`oem_4` columns empty).
2. Fill in whatever numbers are known. Any column may stay empty.
   **Save as CSV UTF-8**, or Excel will mangle the Chinese product names.
3. Import and deploy:

```bash
node scripts/import-oem-cross-reference.mjs scripts/oem-cross-reference-template.csv
npm run build && npx vercel deploy --prod --archive=tgz --yes --scope gcjx
```

The numbers then appear under the OEM Part label on the product page, become
searchable (case-insensitively), and are emitted as `additionalProperty` in the
Product JSON-LD. `sku` stays our own part number so nothing reads as a claim to
be genuine OEM.

### Reading captured inquiries

Every contact-form submission is stored server-side before WhatsApp opens, so a
blocked popup or a buyer without WhatsApp does not lose the lead.

Open `https://songyuheavyparts.com/zh/inquiry-desk` and sign in with
`FACTORY_VIDEO_PASSWORD`. The page is `noindex` and disallowed in `robots.txt`.

Leads are AES-256-GCM encrypted before they reach Blob. The Blob store is
public, so without the key an object URL reveals nothing. Set
`INQUIRY_ENCRYPTION_KEY` to decouple the key from the factory password —
rotating the factory password otherwise makes older inquiries unreadable.

### Product images

- Photos live in `public/images/products/`, WebP, longest side ≤ 1200px.
  The rest of `public/images` is WebP too (factory shots ≤ 1024, heroes ≤ 1600).
- **Every product image needs a matching JPEG social card** at
  `public/og/<same file name>.jpg`, 600×315. WhatsApp, Facebook and LinkedIn
  ignore WebP for `og:image`, so `lib/social-card.ts` points `og:image` at the
  card while the page itself serves WebP. Regenerate them with Pillow if product
  photos change.
- Cut-out product shots keep a transparent background, so preserve the alpha
  channel when converting.

## Gotchas

- **A JSON file imported by the app must not carry a UTF-8 BOM.**
  PowerShell's `Set-Content -Encoding UTF8` adds one and the build fails with a
  parse error at `1:1`. The import script writes plain UTF-8; follow it.
- `og:image` must stay JPEG or PNG. This is the reason the `og/` cards exist.
- `middleware` is deprecated in Next 16 (renamed `proxy`); the build prints a
  deprecation notice until the file is renamed.
- Google Fonts are loaded from the network in `<head>`; self-hosting them is an
  open optimisation.
