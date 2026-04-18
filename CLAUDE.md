# CLAUDE.md

## Proyecto

Sitio web single-page para Chronos iRadio, radio online venezolana. HTML + CSS + JS vanilla, sin build, sin dependencias npm.

## Stack

- HTML/CSS/JS vanilla, zero dependencias
- Google Fonts: Inter + Space Grotesk
- Widget OnlineRadioBox para el reproductor de radio
- Caddy (opcional) para servir con compresión, security headers y cache policies

## Estructura

```
index.html      - Markup principal (head + body + widget inline)
styles.css      - Estilos (extraído del inline)
app.js          - Lógica cliente (defer)
manifest.json   - PWA manifest (referencia assets locales)
robots.txt      - Crawlers + opt-out de entrenamiento IA (GPTBot, ClaudeBot, etc.)
sitemap.xml     - Sitemap con image extension
humans.txt      - Créditos del equipo
Caddyfile       - Config de servidor (puerto 8080, 0.0.0.0, security headers, cache)
CHANGELOG.md    - Historial en Keep a Changelog
README.md       - Documentación
CLAUDE.md       - Contexto para Claude Code
assets/
├── logo/       - Favicons/logo (JPG)
├── hero/       - Banner hero (JPEG)
├── og/         - Open Graph image (JPEG)
├── programas/  - Banners programas (WebP, 900x300)
├── team/       - Fotos equipo (WebP, 300x400)
└── aniversario/ - Banner aniversario (WebP, 1024x346)
```

## Notas importantes

- El widget OnlineRadioBox usa URLs protocol-relative (`//`). Hay un patch inline en `index.html` (dentro del bloque del widget) que intercepta `src`, `setAttribute`, `XMLHttpRequest.open` y `fetch` para agregar `https:` cuando se abre vía `file://`. Este patch debe permanecer síncrono y antes del script del widget.
- Los estilos del widget se sobrescriben en dos lugares: el `<style id="..._settings">` inline dentro del widget (colores base) y los selectores `.player-bar .orbX` en `styles.css` (tema oscuro).
- Imágenes 100 % locales desde `assets/`. No usar URLs remotas a `chronosiradio.online/wp-content/...` para imágenes.
- El modal del equipo usa animación de origen: nace desde la tarjeta clickeada y vuelve a ella al cerrar. Tiene tarjetas siblings prev/next con preview desenfocado.
- `<script src="/app.js" defer>` carga el JS principal con defer. El script del widget OnlineRadioBox permanece inline por requerimientos del widget.
- Versionado: tags semver (`vX.Y.Z`) + `CHANGELOG.md` en formato Keep a Changelog. Commits estilo Conventional Commits.
- Hosting local: `caddy run --config Caddyfile --adapter caddyfile` expone en `0.0.0.0:8080`. Fallback: `python3 -m http.server 8080 --bind 0.0.0.0`.
