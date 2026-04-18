# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [1.0.0] - 2026-04-18

### Añadido

- Assets locales en `assets/` (logo, hero, equipo, programas, aniversario, og). Imágenes convertidas a WebP donde aplica; redujo ~2.8 MB a ~416 KB.
- `robots.txt`, `sitemap.xml` y `humans.txt` para SEO e infraestructura web estándar.
- Meta tags de geolocalización (`geo.region`, `geo.placename`, `geo.position`, `ICBM`) orientados a SEO local en Venezuela.
- JSON-LD ampliado: `@graph` con `RadioStation` + `WebSite`, `address.addressCountry: VE`, `inLanguage: es`.
- Atributos `width`, `height`, `decoding="async"` en todas las `<img>`.
- `fetchpriority="high"` y `preload as="image"` para el hero y el logo (mejora LCP).
- `rel="me"` en el link a Instagram para verificación social/Fediverso.
- `Caddyfile` con cache headers agresivos para `assets/`, compresión `zstd`/`gzip`, security headers (HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP).
- Sección "Desarrollo" y "Ejecutar localmente" en `README.md` con flujo de release y hosting.
- `CHANGELOG.md` (este archivo).

### Cambiado

- CSS extraído de `<style>` inline a `styles.css` (~20 KB, cacheable).
- JavaScript principal extraído a `app.js` con `defer` (~7.5 KB, cacheable).
- Manifest cargado estáticamente (`<link rel="manifest">`) en lugar del patch condicional previo.
- Todas las referencias de imágenes apuntan ahora a `/assets/**` local en lugar de `chronosiradio.online/wp-content/...`.
- `manifest.json` con rutas locales.
- Año del copyright dinámico (renderiza `new Date().getFullYear()`).

### Corregido

- Alt text dinámico en imágenes del modal del equipo (antes vacío).
- `aria-labelledby="modalName"` en el modal (antes solo `aria-label` genérico).
- `aria-label` descriptivo en el botón play del widget OnlineRadioBox.
- `aria-hidden="true"` en el SVG del botón cerrar del modal.

## [0.3.0] - 2026-03-28

### Añadido

- Tarjetas siblings (prev/next) en el modal del equipo con preview desenfocado que se enfoca al hover.
- Ajustes en el widget OnlineRadioBox: `min-height` en `orbPtn`/`orbPtt`/`orbPp` para evitar saltos de layout.

### Cambiado

- `crossorigin="anonymous"` en el `<audio>` del widget (antes `"true"`).
- Manifest cargado condicionalmente para evitar errores al abrir vía `file://`.

## [0.2.0] - 2026-03-28

### Añadido

- Base de SEO: meta description, robots, author, theme-color, canonical.
- Open Graph y Twitter Card completos.
- JSON-LD schema.org `RadioStation` con founder, employees, genres, sameAs.
- Accesibilidad: skip link, `aria-label` en controles, `role="dialog"` en modales, navegación por teclado en tarjetas del equipo, `aria-expanded` en menú móvil.
- Performance hints: `preconnect` a Google Fonts, `dns-prefetch` a OnlineRadioBox, `loading="lazy"` en imágenes below-the-fold.
- `manifest.json` para PWA.
- Favicon (32, 180, 192) y apple-touch-icon.

## [0.1.0] - 2026-03-28

### Añadido

- Sitio web inicial single-page para Chronos iRadio.
- Hero con banner animado y CTAs al reproductor.
- Sección de programas (Navegando entre Décadas, Chronos iCom, Top 5, Mundo Marino) con cronograma.
- Sección de equipo con grid de 5 miembros y modal animado con origen desde la tarjeta.
- Sección de aniversario, contacto (WhatsApp, Instagram, Canal WhatsApp, Telegram).
- Reproductor OnlineRadioBox fijo en el footer.
- Diseño responsive (desktop, tablet, móvil).
- Animaciones fade-up con IntersectionObserver.
- Patch de URLs protocol-relative para compatibilidad con `file://`.

[Unreleased]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/chronos-iradio/chronos-iradio/releases/tag/v0.1.0
