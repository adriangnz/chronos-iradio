# CLAUDE.md

## Proyecto

Sitio web single-page para Chronos iRadio, radio online venezolana. Diseñado como HTML + CSS + JS vanilla sin build, **portable a dos targets**:

1. **Estático** — el repo raíz se sirve tal cual (Caddy, Python http.server, GitHub Pages).
2. **Tema WordPress** — `wp-theme/chronos-iradio/` empaqueta el sitio como un tema instalable desde `wp-admin → Apariencia → Temas → Subir tema`. **Es lo que corre en producción** (`https://chronosiradio.online/`).

El código fuente del sitio vive en la raíz (`index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.json`, `player.html`, `assets/`). Esos archivos se **copian dentro del tema** cuando se regenera el ZIP de deploy. El tema añade su propia capa PHP (`functions.php`, `front-page.php`, `templates/player.php`) que reusa esos mismos assets adaptando paths a `wp-content/themes/chronos-iradio/`.

## Stack

- HTML/CSS/JS vanilla, zero dependencias en runtime.
- Google Fonts: Inter + Space Grotesk.
- Widget OnlineRadioBox para el stream.
- PWA: `sw.js` (cache, offline) + `manifest.json` (install, splash, icons).
- Caddy opcional para servir estático con compresión y cache headers.
- En producción: WordPress + plugin Rank Math (SEO) + Cloudflare (CDN).

## Estructura

```
index.html              — Markup home (head + body + widget inline)
player.html             — Reproductor fullscreen como PWA standalone
styles.css              — Estilos
app.js                  — Lógica cliente (incluye ASSET_BASE para WP)
sw.js                   — Service worker (cache + offline)
manifest.json           — PWA manifest (icons, splash, scope)
robots.txt              — Crawlers + opt-out IA
sitemap.xml             — Sitemap con image extension
humans.txt              — Créditos del equipo
Caddyfile               — Servidor estático (puerto 8080, security headers)
CHANGELOG.md            — Historial Keep a Changelog
ROADMAP.md              — Fases del proyecto, backlog, decisiones pendientes
README.md               — Documentación
CLAUDE.md               — Este archivo
.gitignore              — Excluye _backup-pre-relogo/ y wp-theme/*.zip

assets/
├── logo/               — chronos-{32,180,192}.jpg (favicons, fondo blanco)
│                         chronos-{192,512,1024}.png (PWA, 192 transparente, resto blanco)
│                         chronos-maskable.png + chronos-maskable-1024.png (Android Adaptive)
│                         chronos-logo-full.png (logo + texto, reserva)
├── hero/               — banner-chronos.jpeg
├── og/                 — og-banner-chronos.jpeg (neón) + og-banner-clean.jpeg (fondo blanco)
├── programas/          — 4 banners WebP 900×300
├── team/               — 5 fotos equipo WebP 300×400
└── aniversario/        — banner WebP 1024×346

wp-theme/chronos-iradio/    ← el TEMA. Esto se zipea y se sube a WP.
├── style.css               — header obligatorio WP + Version: X.Y.Z
├── functions.php           — rewrites PWA, SEO meta, cache-bust, helper chronos_asset_url()
├── front-page.php          — home (copia de index.html con paths PHP + wp_head/wp_footer)
├── index.php               — fallback (incluye front-page)
├── templates/player.php    — render de /player.html (copia de player.html upstream)
├── styles.css, app.js, sw.js, manifest.json, humans.txt    ← copias del raíz del repo
├── assets/                 ← copia del assets/ raíz
├── screenshot.jpg          — preview del tema en wp-admin
└── README.md               — instrucciones de deploy
```

## Cómo funciona el tema WP

### Rewrites
`functions.php` registra rewrites para servir desde la raíz del dominio cuatro recursos que viven dentro del tema:

| URL pública | Servida por |
|---|---|
| `/sw.js` | endpoint PHP que lee `sw.js` del tema y reescribe paths relativos (`./`, `./assets/...`) a URLs absolutas del tema. Envía header `Service-Worker-Allowed: /` para que el SW tenga scope completo |
| `/manifest.json` | endpoint PHP que lee `manifest.json` y reescribe paths + agrega `?v=<filemtime>` a cada ícono (cache-bust automático para que Android regenere el WebAPK) |
| `/player.html` | renderiza `templates/player.php` con header `Cache-Control: no-cache` |
| `/humans.txt` | sirve el archivo del tema directo |

Requiere **permalinks NO en "Sencillo/Plain"** (recomendado "Nombre de la entrada"). Si están en Plain, el tema muestra un admin notice rojo avisando.

`redirect_canonical` está filtrado para que WP no haga 301 a `/sw.js/` (trailing slash) que rompía las rules.

### Carga de assets
- **`wp_enqueue_style`/`script`** para `styles.css` y `app.js` (no `<link>`/`<script>` directos). Versión = `filemtime()` → cada deploy invalida cache solo.
- **`script_loader_tag` filter** agrega `defer` a `app.js`.
- **`wp_resource_hints` filter** agrega preconnect a Google Fonts + dns-prefetch a OnlineRadioBox.
- **Helper `chronos_asset_url($path)`** devuelve URL absoluta + `?v=<filemtime>`. Se usa para los `<img>` del logo en `front-page.php` y `templates/player.php`. Cualquier cambio al PNG invalida cache del browser y Cloudflare automáticamente.

### SEO
- Meta `description`/`og:*`/`twitter:*` + JSON-LD `RadioStation` los emite `functions.php` via `wp_head`.
- **Detector `chronos_iradio_seo_plugin_active()`** suprime esos meta tags si Yoast/Rank Math/SEOPress/AIOSEO está activo → en prod Rank Math los maneja, el tema no duplica.
- `pre_get_document_title` filter para el title de la home.
- `robots_txt` filter agrega User-agent: GPTBot/ClaudeBot/etc. + no agrega Sitemap (lo hace el plugin SEO).

### app.js — multi-target
`app.js` tiene al inicio:
```js
const ASSET_BASE = (typeof window !== 'undefined' && window.CHRONOS_ASSET_BASE) || '';
```
Todos los paths a `assets/...` (5 imágenes del equipo, LOCAL_LOGO del cover, 2 entries de mediaSession artwork) se construyen con `ASSET_BASE + 'assets/...'`. En modo estático queda `''` y los paths son relativos como antes; en WP el template inyecta `<script>window.CHRONOS_ASSET_BASE = "<theme_uri>";</script>` antes de cargar app.js, y los paths resuelven al directorio del tema.

### Service Worker
- Cache-key versionado con `const VERSION = 'chronos-iradio-vX.X.X';`. Al activar una versión nueva borra caches anteriores.
- Estrategias: HTML/CSS/JS → network-first (deploys nuevos al instante). `/assets/**` → stale-while-revalidate. Cross-origin (stream, widget, fonts) → passthrough.
- `manifest.json` → siempre network (crítico para que Android tome cambios al manifest sin esperar).

## UI features clave

- **Modal del equipo**: animación de origen (nace desde la tarjeta clickeada, vuelve a ella al cerrar). Tarjetas siblings prev/next con preview desenfocado.
- **Modal "WhatsApp Choice"**: el botón verde del fullscreen player abre un modal con 2 opciones — "Cabina virtual" (`https://chat.whatsapp.com/CCTr7y6eyP7IVUtVrClcWu?mode=hq1tcla`) y "Canal de WhatsApp" (broadcast).
- **Botón Share** (`.fsp-share`): en el header del fullscreen player. Usa Web Share API (sheet nativo del SO con WhatsApp/Telegram/etc.) con fallback a clipboard + toast. URL compartida: `https://chronosiradio.online/player.html`.
- **Botón Install**: aparece cuando hay `beforeinstallprompt` disponible. Junto al share, agrupados en `.fsp-actions` (flex con gap).
- **Splash PWA**: usa `chronos-1024.png` (transparente) sobre `background_color: #0a0a0f` → ícono colorido sin recuadro blanco.
- **Launcher icon**: usa el maskable (fondo blanco + safe area 70%) — Android aplica máscara circular/squircle.

## Notas importantes

- El widget OnlineRadioBox usa URLs protocol-relative (`//`). Hay un patch inline en `index.html` que intercepta `src`, `setAttribute`, `XMLHttpRequest.open` y `fetch` para agregar `https:` cuando se abre vía `file://`. Debe permanecer síncrono y antes del script del widget.
- Estilos del widget sobrescritos en dos lugares: `<style id="..._settings">` inline (colores base) y selectores `.player-bar .orbX` en `styles.css` (tema oscuro).
- Imágenes 100% locales en `assets/`. **No usar URLs remotas** a `chronosiradio.online/wp-content/...` para imágenes del código fuente — el tema reescribe paths solo.
- Las copias dentro de `wp-theme/chronos-iradio/` deben mantenerse sincronizadas con la raíz cada vez que se modifique `styles.css`, `app.js`, `sw.js`, `manifest.json`, `index.html`, `player.html` o `assets/`. El comando es: `cp styles.css app.js sw.js manifest.json humans.txt wp-theme/chronos-iradio/ && cp -r assets wp-theme/chronos-iradio/` (o solo los archivos cambiados).
- Versionado del **tema**: header `Version: X.Y.Z` en `wp-theme/chronos-iradio/style.css`. Bumpea con cada deploy a WP (WordPress usa eso para detectar upgrade).
- Versionado del **SW**: `const VERSION = 'chronos-iradio-vX.X.X';` en `wp-theme/chronos-iradio/sw.js`. Bumpea solo cuando hay cambios estructurales en cache strategy o SHELL list.
- Versionado del **proyecto / git**: tags semver (`vX.Y.Z`) + `CHANGELOG.md` Keep a Changelog. Commits Conventional Commits.

## Regenerar logos / iconos PWA

Los assets se generan con ImageMagick (`convert`) desde los archivos fuente en `~/Descargas/chronos-iradio-{ico,logo}-{transparente,blanco}.png` (2362×2362). Usar siempre **`-filter Lanczos`** para downscale (mejor calidad que el default). Specs actuales:

| Archivo | Tamaño | Fondo | Comando base |
|---|---|---|---|
| `chronos-32.jpg` | 32×32 | blanco (JPG) | desde ico-blanco, `-resize 32x32` |
| `chronos-180.jpg` | 180×180 | blanco | desde ico-blanco, `-resize 180x180` |
| `chronos-192.jpg` | 192×192 | blanco | desde ico-blanco, `-resize 192x192` |
| `chronos-192.png` | 192×192 | transparente | desde ico-transparente, `-resize 192x192` |
| `chronos-512.png` | 512×512 | **blanco** | desde ico-blanco, `-resize 512 -background white -alpha remove`. Usado también como cover del player |
| `chronos-1024.png` | 1024×1024 | **transparente** | desde ico-transparente, `-resize 1024x1024`. Usado para splash PWA |
| `chronos-maskable.png` | 512×512 | blanco + safe area 70% | `convert SRC -resize 358x358 -background white -gravity center -extent 512x512` |
| `chronos-maskable-1024.png` | 1024×1024 | blanco + safe area 70% | `convert SRC -resize 716x716 -background white -gravity center -extent 1024x1024` |

Backup antes de regenerar: `cp -r assets/logo assets/logo/_backup-pre-relogo/` (ya gitignored).

## Deploy

### Estático local
`caddy run --config Caddyfile --adapter caddyfile` → `http://0.0.0.0:8080`. Fallback: `python3 -m http.server 8080 --bind 0.0.0.0`.

### Estático a GitHub Pages
Workflow en `.github/workflows/deploy.yml` publica en cada push a `master`. Excluye `wp-theme/`, `CLAUDE.md`, `CHANGELOG.md`, `Caddyfile`, `.claude/`.

### WordPress (producción `https://chronosiradio.online/`)

1. **Sincronizar** los archivos del repo raíz al tema (si cambiaron):
   ```bash
   cp styles.css app.js sw.js manifest.json humans.txt wp-theme/chronos-iradio/
   cp -r assets wp-theme/chronos-iradio/
   ```
2. **Bumpear** `Version:` en `wp-theme/chronos-iradio/style.css` (sino WP no detecta el upgrade).
3. **Generar ZIP**:
   ```bash
   cd wp-theme && rm -f chronos-iradio-*.zip && zip -r chronos-iradio-X.Y.Z.zip chronos-iradio -x "*.DS_Store" "*/.git/*" "*/_backup-pre-relogo/*"
   ```
4. **wp-admin** → Apariencia → Temas → **Subir tema** → seleccionar ZIP → **"Reemplazar el actual"**.
5. **Cloudflare** dashboard → Caching → Configuration → **Purge Everything** (no hay plugin de CF en wp-admin, se hace desde cloudflare.com).
6. Si cambió código JS / SW: limpiar caché del browser. Para PWA instalada en celular: desinstalar → clear cache del browser → reinstalar.

### Verificación post-deploy
```bash
# El server debe responder estos 5 endpoints con status 200:
curl -sI https://chronosiradio.online/                 # text/html
curl -sI https://chronosiradio.online/sw.js            # application/javascript + Service-Worker-Allowed: /
curl -sI https://chronosiradio.online/manifest.json    # application/manifest+json
curl -sI https://chronosiradio.online/player.html      # text/html + Cache-Control: no-cache
curl -sI https://chronosiradio.online/humans.txt       # text/plain
```

## Producción: plugins WP activos

Estado actual de plugins en prod (validado tras la limpieza):

- **Limit Login Attempts Reloaded** — protección brute force a `/wp-login.php`. Mantener activo.
- **Rank Math SEO** — maneja title/description/OG/sitemap/JSON-LD del home y `/player.html`. El tema lo detecta y se silencia automáticamente. **Configurar en wp-admin → Rank Math → Titles & Meta → Homepage**: title, description, social meta image (`og-banner-clean.jpeg`).
- (Opcional) Cloudflare plugin: NO instalado (no es necesario; el proxy CF funciona a nivel DNS).
- Plugins eliminados: Elementor + addons, MetaSlider, Mosaic Gallery, Radio Player, Akismet, Kirki, All-in-One WP Migration (usar solo para backup puntual, no permanente).

## Settings críticos en wp-admin

- **Ajustes → Lectura → Tu portada muestra**: "Tus últimas entradas" (no página estática, sino `front-page.php` toma prioridad sin contaminar SEO con autor/fecha).
- **Ajustes → Enlaces permanentes**: "Nombre de la entrada" (NO "Sencillo" — rompe las rewrites del tema).
- **Ajustes → Generales → Icono del sitio**: subir `chronos-iradio-ico-transparente.png` (WP genera crops automáticos). Esto reemplaza los favicons del tema vía `wp_head()`.
