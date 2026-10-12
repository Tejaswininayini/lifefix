# LifeFix — Turn Problems Into Action Plans
A static website: no backend, database, login or API keys.

## Run locally
Service workers need http, so don't double-click the files. Install Python 3, open a terminal in this folder and run:
`python3 -m http.server 8000` (Windows: `python -m http.server 8000`), then open http://localhost:8000

## Structure
index/solve/library/about/404 .html · css/style.css · js/problems.js (data) · js/search.js (matching) · js/storage.js (localStorage) · js/app.js (UI) · sw.js + manifest.webmanifest (PWA)

## Add a problem
Copy one object in `js/problems.js`, give it a new `id`, `cat` (HOME/PERSONAL/WORK/MONEY), `keywords`, `steps` and save. It appears in search, library and results automatically.

## Keyword matching
`getProblemPlan(text)` in `js/search.js` scores each playbook: +2 per keyword hit (+3 for multi-word), +1 per title word. High confidence = clear winner; low = user picks from closest; none = generic framework.

## localStorage
Keys prefixed `lf_`: `theme`, `recent`, `prog_<problemId>`. Nothing sensitive is stored; invalid data is ignored.

## PWA
Already enabled: serve over HTTPS (or localhost) and the browser offers Install. When you change files, bump `V` in `sw.js`. Add PNG icons (192/512) for best installability on all devices.

## Deploy free
Push the folder to GitHub, then enable GitHub Pages, or drag the folder onto Netlify Drop or Cloudflare Pages. Replace YOUR-DOMAIN in robots.txt and sitemap.xml.

## Add an AI API later
Make `getProblemPlan` call your API and return `{confidence, problem, matches}` with the same shape as the problems in problems.js. The UI needs no other change. Never put API keys in front-end code; call your own small server instead.
