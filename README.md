# Chronos iRadio - Sitio Web

Sitio web moderno y responsive para [Chronos iRadio](https://chronosiradio.online/), una radio online desde Venezuela.

## Características

- Diseño oscuro moderno con acentos en gradiente azul/púrpura/rosa
- Reproductor de radio integrado (OnlineRadioBox widget) fijo en el footer
- Sección de programación estilo cronograma
- Sección de equipo con modal animado y tarjetas siblings prev/next
- Totalmente responsive (desktop, tablet, móvil)
- Animaciones de scroll (fade-up con IntersectionObserver)
- Navbar con efecto glass/blur al hacer scroll
- Zero dependencias — HTML + CSS + JS vanilla
- SEO optimizado (Open Graph, Twitter Cards, JSON-LD, sitemap.xml, robots.txt, geo meta)
- Imágenes locales (`assets/`) en WebP con `width`/`height`/`decoding=async` y `preload`/`fetchpriority` para LCP
- Compatible con apertura directa vía `file://` (patch automático de protocol-relative URLs)

## Estructura del repo

```
index.html        — HTML principal
styles.css        — Estilos (extraídos del inline)
app.js            — Lógica cliente (defer)
manifest.json     — PWA manifest
robots.txt        — Reglas para crawlers
sitemap.xml       — Sitemap para motores de búsqueda
humans.txt        — Créditos del equipo
Caddyfile         — Configuración del servidor
CHANGELOG.md      — Historial de versiones
assets/
├── logo/         — Favicons y logo (32/180/192)
├── hero/         — Banner del hero
├── og/           — Imagen Open Graph
├── programas/    — Banners de programas (WebP)
├── team/         — Fotos del equipo (WebP)
└── aniversario/  — Banner del aniversario (WebP)
```

## Ejecutar localmente

### Opción 1: Caddy (recomendado)

Caddy trae compresión, security headers y cache policies listas en el `Caddyfile`.

```bash
# Instalar caddy (Ubuntu/Debian)
sudo apt install caddy
# o descargar el binario desde https://caddyserver.com/download

# Desde la raíz del repo:
caddy run --config Caddyfile --adapter caddyfile
```

El sitio queda expuesto en `http://0.0.0.0:8080/` — accesible desde:
- Localmente: `http://localhost:8080/`
- LAN: `http://<tu-IP>:8080/` (usa `hostname -I` para ver tu IP)

### Opción 2: Python http.server (fallback)

Sin instalar nada:

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Mismo puerto, sin compresión ni cache headers.

### Exponer a internet

Una vez el sitio escucha en `0.0.0.0:8080`, puedes usar cualquier túnel:

```bash
# Cloudflared (quick tunnel, URL temporal)
cloudflared tunnel --url http://localhost:8080

# ngrok
ngrok http 8080

# Tailscale Funnel (si ya usas tailnet)
tailscale funnel 8080
```

Si tu firewall local está activo (`ufw`), abre el puerto en LAN:

```bash
sudo ufw allow from 192.168.0.0/16 to any port 8080
```

## Deploy a GitHub Pages

Hay un workflow en `.github/workflows/deploy.yml` que publica el sitio automáticamente en cada push a `master`.

### Activación (una sola vez)

1. Push del repo a GitHub: `git remote add origin git@github.com:<usuario>/<repo>.git && git push -u origin master --tags`
2. En el repo en GitHub → **Settings → Pages**.
3. En **Build and deployment → Source**, elige **GitHub Actions** (no "Deploy from a branch").
4. El próximo push a `master` (o un `workflow_dispatch` manual desde la pestaña Actions) dispara el deploy.

La URL final aparece como output del job y en Settings → Pages una vez completado el primer deploy (normalmente `https://<usuario>.github.io/<repo>/`).

### Qué sube el workflow

El step **Prepare artifact directory** copia la raíz del repo a `_site/` excluyendo archivos que no deben servirse públicamente: `.git`, `.github`, `CLAUDE.md`, `CHANGELOG.md`, `Caddyfile`, `.claude`. Añade un `.nojekyll` para que Pages no intente procesar el sitio con Jekyll.

### Notas

- Las rutas del sitio son **relativas** (`styles.css`, `assets/...`) para que funcione tanto en user page (`usuario.github.io`) como en project page (`usuario.github.io/repo/`).
- Los canonical URLs y OG tags apuntan a `chronosiradio.online`. Si quieres que Google indexe la versión de GitHub Pages en vez del dominio principal, tendrás que editar `<link rel="canonical">`, `og:url` y el sitemap.
- GitHub Pages no soporta los security headers del `Caddyfile`. Para el deploy GH Pages sirve los headers por defecto; si necesitas CSP/HSTS custom, considera Cloudflare Pages o ponerle un Cloudflare proxy delante.

## Desarrollo

### Convenciones

- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) — `feat`, `fix`, `docs`, `chore`, `refactor`, `style`, con scope opcional (`feat(seo): ...`).
- **Versionado**: [Semantic Versioning](https://semver.org/lang/es/) con tags git (`vX.Y.Z`).
- **Changelog**: `CHANGELOG.md` en formato [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

### Release flow

1. Consolidar cambios en `master`.
2. Actualizar `CHANGELOG.md`: mover entradas de `[Unreleased]` a una nueva sección `[vX.Y.Z] - YYYY-MM-DD`.
3. Commit: `chore(release): vX.Y.Z`.
4. Tag anotado: `git tag -a vX.Y.Z -m "vX.Y.Z - título breve"`.
5. Push: `git push && git push --tags`.

## Secciones del sitio

- **Hero** — Banner principal con logo animado y CTAs
- **Programas** — Cronograma con 4 programas: Navegando entre Décadas, Chronos iCom, Top 5, Mundo Marino
- **Equipo** — Grid de 5 miembros con modal interactivo y navegación por teclado
- **Aniversario** — Banner del 1er aniversario
- **Contacto** — Enlaces a WhatsApp, Instagram, Canal WhatsApp, Telegram
- **Reproductor** — Widget OnlineRadioBox fixed en el footer

## Tecnologías

- HTML5, CSS3, JavaScript vanilla (sin build)
- Google Fonts (Inter, Space Grotesk)
- OnlineRadioBox Widget para streaming
- Caddy como servidor HTTP (opcional)
