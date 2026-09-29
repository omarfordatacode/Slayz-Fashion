# Slay'z — demo storefront (pitch, not a delivered site)

Prospect: SLAY'Z FASHION STORE (instagram.com/slayz.fashionstore), Moroccan women's boutique, Instagram-first.
She asked for "vos références en site e-commerce". Omar has no delivered e-commerce reference and refused to
pass off someone else's site as ours. This repo is a **demo built for her**, labelled as such everywhere.

Stakes low, scale low: optimise for speed. The honesty rules below are the one thing not to relax.

## Honesty rules (hard line)
- Ribbon + `#/demo` page say: made by Omar for Slay'z, no real order, Unsplash photos, example prices.
- Anything that describes Slay'z policy (delivery fees, delays, phone confirmation, sizes) is labelled
  "exemple" / "étape proposée" / "fonctionnalité proposée". Don't add unlabelled claims.
- No fake scarcity, no fake reviews, no "vu sur Instagram" for products that never appeared there.

## Stack
Static HTML/CSS/vanilla JS, no build step. `index.html`, `css/style.css`, `js/data.js` (all demo content +
`config.expires`), `js/app.js` (hash router, cart, sheets, stories, owner queue). State is per-viewer
`localStorage` only. Images: Unsplash (licence allows use), WebP in `img/`, `-s` = small.

- Run locally: `python -m http.server 5173` in this folder.
- Deploy: private GitHub repo → Vercel import, framework "Other", no build command, output dir `.`.
- `vercel.json` sends `X-Robots-Tag: noindex`; `robots.txt` disallows all.
- Expiry: `config.expires` in `js/data.js` (currently 2026-11-15). After it, the site shows "démo expirée".
- Rollback: `git revert` / redeploy previous commit from the Vercel dashboard.

## Deliberately not built (this is what the paid project sells)
Real order storage, owner login/back-office, stock management, delivery-company integration, real WhatsApp
Business link, analytics, her real catalogue/photos, domain.

Relay log: `company-os/boardroom/relay/2026-09-29_slayz-demo-*`.
