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
