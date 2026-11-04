# Mosaic Engine · Instagram report

A static site (no build step) that shows the @mosaicengine Instagram report: reel stats, what's wrong and how to fix it, trending reels in the niche, next reel ideas and tips.

- `index.html`, `style.css`, `app.js`: the page
- `data/report.js`: all numbers and text, refreshed by Claude from Metricool (Instagram) and the YouTube Data API (trending Shorts)
- `img/reels/`: reel covers taken from the original MP4s

## Hosting (Hostinger)
hPanel > Websites > Advanced > Git: add `https://github.com/sanskarp661-sudo/insta.git`, branch `main`, install path empty (public_html). Turn on auto-deployment and add the webhook URL Hostinger shows to the repo's GitHub Settings > Webhooks, so every update deploys by itself.

The page has `noindex` and a `robots.txt` that blocks search engines. For a password, use hPanel > Advanced > Password Protect Directories on public_html.
