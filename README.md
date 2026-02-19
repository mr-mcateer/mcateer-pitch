# McAteer CTE Pitch — CSD 509J

Static single-page site for Andy McAteer's CTE program expansion proposal at Crescent Valley High School.

## Deployment

Push to GitHub and enable GitHub Pages from the `main` branch root.

## Local Preview

```bash
python3 -m http.server 9090
# Open http://localhost:9090
```

## Structure

- `index.html` — Single-page narrative site
- `css/style.css` — All styles, CSS variables, responsive breakpoints
- `js/main.js` — Intersection Observer animations, Chart.js, counter animations
- `img/` — Photo placeholders (replace with real images before presenting)

## Dependencies (CDN)

- Google Fonts (Playfair Display, DM Sans, JetBrains Mono)
- Chart.js 4.4.1
