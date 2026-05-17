# Chronos iRadio - Sitio Web

Sitio web moderno y responsive para [Chronos iRadio](https://chronosiradio.online/), una radio online desde Venezuela.

El proyecto está diseñado para **dos targets de despliegue** desde la misma fuente:

1. **Estático** — el repo raíz se sirve tal cual (Caddy, GitHub Pages, cualquier servidor de archivos).
2. **Tema WordPress** — `wp-theme/chronos-iradio/` empaqueta el sitio como tema instalable desde `wp-admin`. **Es lo que corre en producción.**

## Características

- Diseño oscuro moderno con acentos en gradiente azul/púrpura/rosa.
- Reproductor de radio integrado (OnlineRadioBox widget) fijo en el footer + fullscreen player con cover dinámico (lee el `iImg` del widget).
- PWA instalable: manifest, service worker con cache offline, página standalone `/player.html`, splash con ícono colorido sobre fondo oscuro.
- Modal "WhatsApp Choice" en el botón verde del player: opción "Cabina virtual" (grupo) vs "Canal" (broadcast).
- Botón **Share** en el header del player: Web Share API nativa (WhatsApp/Telegram/etc.) con fallback a clipboard + toast.
- Sección de programación tipo cronograma.
- Sección de equipo con modal animado (origen desde la tarjeta) y tarjetas siblings prev/next con preview desenfocado.
- Totalmente responsive (desktop, tablet, móvil).
- Animaciones de scroll (fade-up con IntersectionObserver).
- Navbar con efecto glass/blur al hacer scroll.
- Zero dependencias en runtime — HTML + CSS + JS vanilla.
- SEO optimizado (Open Graph, Twitter Cards, JSON-LD `RadioStation`, sitemap, robots con opt-out de bots IA, geo meta).
- Imágenes locales en WebP/PNG/JPG según corresponda, con `width`/`height`/`decoding="async"` y `preload`/`fetchpriority="high"` en el LCP.
- Compatible con apertura directa vía `file://` (patch automático de protocol-relative URLs del widget).

## Estructura del repo

```
index.html              — HTML principal (home)
player.html             — Reproductor PWA standalone (/player.html)
styles.css              — Estilos
app.js                  — Lógica cliente (incluye ASSET_BASE para compatibilidad con WP)
sw.js                   — Service worker (cache + offline)
manifest.json           — PWA manifest
robots.txt              — Reglas para crawlers + opt-out IA
sitemap.xml             — Sitemap con image extension
humans.txt              — Créditos del equipo
Caddyfile               — Servidor estático local
CHANGELOG.md            — Historial de versiones
ROADMAP.md              — Fases del proyecto y backlog
README.md               — Este archivo
CLAUDE.md               — Contexto persistente para Claude Code
.gitignore              — Excluye backups locales y artifacts del tema

assets/
├── logo/               — Favicons (JPG) + PWA icons (PNG, varios tamaños)
├── hero/               — Banner del hero
├── og/                 — Open Graph images (clean = fondo blanco con logo, banner = neón)
├── programas/          — Banners de programas (WebP)
├── team/               — Fotos del equipo (WebP)
└── aniversario/        — Banner del aniversario (WebP)

wp-theme/chronos-iradio/    — Tema WordPress (lo que se zipea y sube a wp-admin)
├── style.css               — Header de tema WP + versión
├── functions.php           — Rewrites PWA, SEO meta, cache-bust filemtime, helpers
├── front-page.php          — Home (clon adaptado de index.html)
├── templates/player.php    — Render de /player.html
├── README.md               — Instrucciones específicas del tema
└── (copia sincronizada de styles.css, app.js, sw.js, manifest.json, assets/)
```

## Ejecutar localmente (estático)

### Opción 1: Caddy (recomendado)

Caddy trae compresión, security headers y cache policies en el `Caddyfile`.

```bash
sudo apt install caddy  # Ubuntu/Debian
caddy run --config Caddyfile --adapter caddyfile
```

Expuesto en `http://0.0.0.0:8080/`.

### Opción 2: Python http.server

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

### Probar el tema WP en local

Si tenés [Local by Flywheel](https://localwp.com/) u otro stack WP, podés symlinkear el tema:

```bash
ln -s "$(pwd)/wp-theme/chronos-iradio" "/path/to/Local Sites/<sitio>/app/public/wp-content/themes/chronos-iradio"
```

Después en wp-admin del sitio Local → Apariencia → Temas → activar "Chronos iRadio" + Ajustes → Enlaces permanentes → "Nombre de la entrada" → Guardar.

## Deploy a WordPress (producción)

Producción corre en `https://chronosiradio.online/` con hosting que solo da acceso a `wp-admin` (sin FTP/SSH). El flujo es:

1. **Sincronizar** los archivos del repo raíz al tema (si cambiaron):
   ```bash
   cp styles.css app.js sw.js manifest.json humans.txt wp-theme/chronos-iradio/
   cp -r assets wp-theme/chronos-iradio/
   ```
2. **Bumpear** `Version:` en `wp-theme/chronos-iradio/style.css`.
3. **Generar ZIP** desde `wp-theme/`:
   ```bash
   cd wp-theme && rm -f chronos-iradio-*.zip
   zip -r chronos-iradio-X.Y.Z.zip chronos-iradio \
     -x "*.DS_Store" "*/.git/*" "*/_backup-pre-relogo/*"
   ```
4. **wp-admin → Apariencia → Temas → Subir tema** → ZIP → **Reemplazar el actual**.
5. **Cloudflare** dashboard (`dash.cloudflare.com`) → Caching → **Purge Everything**.
6. (Si cambió código JS / SW) → limpiar cache del browser; para PWA en celular: desinstalar + clear cache del browser + reinstalar.

Para más detalle, ver `wp-theme/chronos-iradio/README.md`.

## Deploy a GitHub Pages (estático)

Workflow en `.github/workflows/deploy.yml` publica en cada push a `master`. Excluye `wp-theme/`, `CLAUDE.md`, `CHANGELOG.md`, `Caddyfile`, `.claude/`.

### Activación (una sola vez)

1. Repo en GitHub → **Settings → Pages → Build and deployment → Source**: **GitHub Actions**.
2. Próximo push a `master` dispara el deploy. La URL queda en Settings → Pages.

## Desarrollo

### Convenciones

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) — `feat`, `fix`, `docs`, `chore`, `refactor`, con scope opcional (`feat(player): ...`).
- **Versionado**: [Semantic Versioning](https://semver.org/) con tags git (`vX.Y.Z`).
- **Changelog**: `CHANGELOG.md` en formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).
- **Tema WP**: además del semver de proyecto, el header `Version:` de `style.css` se bumpea **cada deploy** a WP (caso contrario WP no detecta el upgrade).
- **Service Worker**: `const VERSION` se bumpea **solo cuando hay cambios estructurales** en la cache strategy o el SHELL.

### Release flow

1. Consolidar cambios en `master`.
2. Actualizar `CHANGELOG.md`: mover entradas de `[Unreleased]` a `[vX.Y.Z] - YYYY-MM-DD`.
3. Commit: `chore(release): vX.Y.Z`.
4. Tag anotado: `git tag -a vX.Y.Z -m "vX.Y.Z - título breve"`.
5. Push: `git push && git push --tags`.

### Regenerar logos / iconos PWA

Los logos se generan con ImageMagick desde los archivos fuente en `~/Descargas/chronos-iradio-{ico,logo}-{transparente,blanco}.png` (2362×2362). Ver `CLAUDE.md` → sección "Regenerar logos" para la tabla con specs y comandos exactos. Usar siempre `-filter Lanczos` para mejor calidad de downscaling.

### Sincronización con el tema

Cuando edites cualquier archivo de la raíz (`app.js`, `styles.css`, `sw.js`, `manifest.json`, `index.html`, `player.html`, `assets/`), el cambio NO se refleja automáticamente en el tema. Tenés que copiar al `wp-theme/chronos-iradio/` antes del próximo deploy.

## Secciones del sitio

- **Hero** — Banner principal con logo animado y CTAs.
- **Programas** — Cronograma con 4 programas: Navegando entre Décadas, Chronos iCom, Top 5, Mundo Marino.
- **Equipo** — Grid de 5 miembros con modal interactivo y navegación por teclado.
- **Aniversario** — Banner del 1er aniversario.
- **Contacto** — Enlaces a WhatsApp directo, Instagram, Canal WhatsApp, Telegram.
- **Reproductor barra fija** — Widget OnlineRadioBox en el footer (siempre visible).
- **Fullscreen player** — Modal con cover dinámico, controles grandes, share, install PWA, modal WhatsApp Choice.
- **`/player.html`** — Misma experiencia que el fullscreen player pero como página standalone (PWA `start_url`).

## Tecnologías

- HTML5, CSS3, JavaScript vanilla (sin build).
- Google Fonts (Inter, Space Grotesk).
- OnlineRadioBox Widget para streaming.
- Service Worker para PWA / offline.
- WordPress + Rank Math (en producción).
- Cloudflare como CDN/proxy.
