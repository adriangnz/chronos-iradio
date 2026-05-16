# Changelog

Todos los cambios relevantes de este proyecto se documentan en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/)
y el proyecto sigue [Semantic Versioning](https://semver.org/lang/es/).

## [Unreleased]

## [1.3.4] - 2026-05-16

### Eliminado

- **Botón "Instalar app" del hero** removido. La detección de standalone vía `display-mode` resultó poco confiable en Chrome (el botón seguía apareciendo dentro de la PWA instalada incluso después de cubrir `minimal-ui` y `window-controls-overlay`). El smart banner inferior + el botón install del fullscreen player son suficientes para invitar a instalar.
- Estilo `.btn-ghost` eliminado del CSS (solo lo usaba este botón).

## [1.3.3] - 2026-05-16

### Corregido

- **Botón "Instalar app" del hero seguía visible dentro de la PWA instalada**: la detección de standalone (`_isStandalone()`) solo cubría `display-mode: standalone` y `fullscreen`. Faltaban `minimal-ui` y `window-controls-overlay` (que Chrome desktop usa según el OS). Además:
  - `beforeinstallprompt` ahora ignora el evento si ya estamos en standalone (defensa por si Chrome dispara el evento dentro de una PWA instalada).
  - `appinstalled` ahora persiste un flag en `localStorage` (`chronos_pwa_installed`) — esto cubre el caso "instalada en este browser pero estoy en una tab normal sin display-mode standalone".
  - `beforeinstallprompt` limpia ese flag cuando dispara — si el usuario desinstala la PWA, el siguiente prompt restaura los CTAs.
- Aplica al botón hero, al botón install del fullscreen player y al smart banner inferior.

## [1.3.2] - 2026-05-16

### Corregido

- **Fullscreen player con fondo transparente**: el `.fsp-backdrop` usaba `rgba(8,8,14,0.96)` + `backdrop-filter: blur(40px)`, pero la transición de `opacity` sobre `.fsp` rompía el stacking context del backdrop-filter, dejando ver el sitio detrás. Ahora el fondo es sólido (`var(--bg-primary)` = `#0a0a0f`) con los radial-gradient encima, y se quitó la transición de opacity (solo queda el `transform: translateY` para el slide-up). Sigue viéndose limpio y sin ningún hint de transparencia.

## [1.3.1] - 2026-05-16

### Cambiado

- **Apertura/cierre del fullscreen player (#player)** vuelve a una animación CSS simple: slide-up de abajo hacia arriba (`transform: translateY(100%) → 0` con `cubic-bezier(0.22, 1, 0.36, 1)` 450 ms + crossfade de opacity). Más predecible y compatible con todos los browsers sin depender de View Transition API.
- **Sección Equipo** restaurada al diseño anterior: grid de 4 cards con hover de zoom + modal con siblings prev/next (y swipe horizontal/vertical en móvil). Eliminado el layout "estilo HTTP 203" (preview + thumbs).

### Eliminado

- View Transition API (`document.startViewTransition`) removida del player y del switch del equipo (`_withViewTransition`, `_assignFspVTNames`, `_clearFspVTNames`, `showTeamMember`, `hideTeamMember`, `setActiveTeamMember`).
- Estilos `.team-stage`, `.team-detail`, `.team-preview*`, `.team-thumbs`, `.team-thumb*`, `.team-back` y `::view-transition-*` removidos.

## [1.3.0] - 2026-05-16

### Añadido

- **CTA "Instalar app" en la home** con 3 puntos de entrada coordinados:
  - **Botón hero** (`.btn-ghost` azul) junto a "Escuchar en Vivo" y "Ver Programas". Aparece solo si la PWA es instalable y no está ya instalada.
  - **Smart banner inferior** glass-dark + acento azul (encima de la player-bar, debajo del fullscreen player). Aparece a los 6s con CTA "Instalar" + cierre `×`. Persiste el dismiss en `localStorage` por **14 días**. Se oculta automáticamente al evento `appinstalled` o cuando el fullscreen player está activo.
  - **Botón install en fullscreen player** (ya existente) ahora sincronizado con la misma lógica vía `data-install-cta`.
- **Modal "iOS Install Hint"** para Safari en iPhone/iPad (que no soporta `beforeinstallprompt`): cualquiera de los 3 CTAs anteriores abre un mini-modal con instrucciones de 3 pasos ("Toca Compartir → Agregar a inicio → Agregar").
- **Refactor de install logic** en `app.js`: helpers `_isIOSSafari()`, `_isStandalone()`, `_canInstall()`, `_refreshInstallUI()`, `tryShowInstallBanner()`, `dismissInstallBanner()`, `showIosInstallHint()`. El selector `[data-install-cta]` permite agregar más botones en el futuro sin tocar JS.
- **Estilo `.btn-ghost`** — variante de botón hero con fondo azul translúcido + borde, para CTAs secundarios sutiles.

### Cambiado

- **PWA `start_url`** ahora apunta a `./#player` en vez de `./player.html`. Al abrir la app instalada se monta la home completa con el reproductor desplegado por defecto, dando acceso al resto del contenido (programas, equipo, contacto) sin salir de la PWA.
- **`shortcuts[0].url`** del manifest también pasa a `./#player` por consistencia.
- **Sección Equipo con 2 estados (estilo "HTTP 203")**:
  - **Estado A (default)**: grid de 4 cards como antes (Km, Eryx, Enrique, Victor).
  - **Estado B (detail)**: click en una card → la card "crece" a un layout preview grande izquierda + lista vertical de thumbnails derecha, con botón "Volver" arriba. Cambio entre miembros con thumbs sin salir del detail. ESC desde un thumb vuelve al grid.
  - El modal viejo fue eliminado.
  - Mobile: grid 2×2; en detail el preview va arriba y los thumbs se vuelven scroll horizontal circular.
  - Navegación teclado: Tab por cards, Enter abre detail; en detail ↑↓←→ navega entre thumbs, Home/End, ESC vuelve al grid.
- **Apertura/cierre del fullscreen player (#player)** usa ahora **View Transition API** (`document.startViewTransition`) con el **botón `.player-expand` del player bar inferior** como origen visual. El chevron-up "crece" hasta convertirse en el fullscreen player; al cerrar se "encoge" de vuelta al bar. Fallback graceful: en Safari/Firefox sin soporte cae al comportamiento anterior (slide-up + crossfade CSS).
- **Switch entre cards/thumbs del equipo** también usa View Transition: la card o thumb clickeado "vuela" a la posición del preview. El `view-transition-name: team-hero` se asigna al **contenedor `.team-preview-photo`** (con el gradient overlay incluido) en vez del `<img>`, evitando un flash sin overlay al final de la animación.

### Corregido

- El fullscreen player (`#player`) ya no se cierra al hacer clic en cualquier zona del fondo. El cierre queda restringido al botón chevron-down (`.fsp-close`) en el header y a la tecla `ESC` en desktop. Antes un clic accidental en el backdrop bajaba el reproductor y mostraba la home detrás.
- **Modal "WhatsApp Choice"**: al hacer clic en una de las opciones (Cabina virtual o Canal de WhatsApp) ahora también cierra el modal. Antes quedaba abierto encima del fullscreen player tras abrir la opción en una nueva pestaña. Aplica a `index.html`, `player.html`, `front-page.php` y `templates/player.php`.

### Eliminado

- **Modal del equipo** (`.modal-backdrop` + `.modal-card` + `.modal-sibling`) eliminado completamente. Reemplazado por el nuevo layout `.team-stage`. Se removieron también las funciones `openModal()`, `closeModal()`, `navigateModal()` y el handler de swipe (`attachModalSwipe()`) en `app.js`, junto con los handlers de keydown ↔/Escape específicos del modal. Total: ~80 líneas de JS + ~165 líneas de CSS eliminadas.
- **Estilos `.team-card*`** (overlay, hint, border, hover) eliminados — los thumbnails del nuevo layout usan `.team-thumb`.
- **Franmary Fernandez** removida completamente del proyecto: `teamData` en `app.js` (raíz + tema), markup de `index.html` y `front-page.php`, `JSON-LD` `RadioStation.employee` en `index.html` y `functions.php`, y el asset `assets/team/franmary-fernandez.webp` borrado de raíz y del tema. Tras la eliminación, Victor Grinfelds pasa al índice `3` del modal y a `stagger-4`.

## [1.2.0] - 2026-05-15

### Añadido

- **Tema WordPress** completo en `wp-theme/chronos-iradio/`. Empaqueta el sitio como tema instalable desde `wp-admin → Apariencia → Temas → Subir tema`. Es lo que corre en producción en `https://chronosiradio.online/`.
  - `functions.php` registra rewrites para servir `/sw.js`, `/manifest.json`, `/player.html` y `/humans.txt` desde la raíz del dominio, aunque vivan dentro del tema.
  - `Service-Worker-Allowed: /` header en `/sw.js` para mantener scope completo de la PWA.
  - Filter `redirect_canonical` que evita el 301 a `/sw.js/` (trailing slash) que rompía las rules.
  - Filter `chronos_iradio_seo_plugin_active()` que detecta Yoast / Rank Math / SEOPress / AIOSEO y silencia los meta SEO del tema para evitar duplicación.
  - Helper `chronos_asset_url($path)` con cache-bust por `filemtime()`. Cualquier cambio a una imagen invalida el cache de browser y Cloudflare automáticamente en el próximo deploy.
  - Cache-bust automático en los iconos del `/manifest.json` con `?v=<filemtime>` → fuerza a Android a regenerar el WebAPK con el icono nuevo sin esperar el ciclo de ~30 días de Google Play Services.
  - `wp_enqueue_style`/`script` para `styles.css` y `app.js` con versión `filemtime()`. Compatible con plugins de cache.
  - `script_loader_tag` filter aplica `defer` a `app.js`.
  - `wp_resource_hints` filter agrega preconnect a Google Fonts + dns-prefetch a OnlineRadioBox.
  - `robots_txt` filter agrega User-agent blocks para bots de IA (GPTBot, ChatGPT-User, ClaudeBot, Google-Extended, PerplexityBot, etc.).
  - `show_admin_bar` deshabilitada en front.
  - Admin notice rojo si permalinks están en "Sencillo".
  - `screenshot.jpg` (1200×900) como preview del tema en `Apariencia → Temas`.
- **Modal "WhatsApp Choice"** en el botón verde del fullscreen player: muestra 2 opciones — "Cabina virtual" (grupo) y "Canal de WhatsApp" (broadcast).
- **Botón Share** en el header del player (`.fsp-share`): Web Share API con sheet nativo del SO (WhatsApp/Telegram/Twitter/mail) + fallback a clipboard con toast "Link copiado al portapapeles". URL compartida: `https://chronosiradio.online/player.html`.
- **Wrapper `.fsp-actions`** agrupa share + install en el header con `gap` (antes quedaban distribuidos por el `space-between`).
- **`chronos-1024.png`** (1024×1024 PNG transparente) para que el splash de la PWA muestre el ícono sobre el `background_color: #0a0a0f` del manifest, sin recuadro blanco.
- **`chronos-maskable-1024.png`** (1024×1024, fondo blanco, safe area 70%) para alta resolución del launcher icon en Android Adaptive Icons.
- **`og-banner-clean.jpeg`** (1200×630, fondo blanco con logo Chronos + texto centrado) para el preview de WhatsApp/Telegram del `/player.html`. Mejora notable vs el banner neón (que perdía el logo).
- **Meta `og:*` y `twitter:*`** en `/player.html` (template del tema y `player.html` upstream). Antes WhatsApp caía al favicon escalado y se veía pixelado.
- `chronos-logo-full.png` (logo + texto) como asset de reserva para futuros usos (redes sociales, share image, etc.).

### Cambiado

- **Nuevo ícono de Chronos** (regenerado desde el archivo fuente colorido). Los 6 logos (32, 180, 192 JPG; 192, 512, maskable PNG) se regeneraron con ImageMagick filtro Lanczos para mejor calidad de downscaling.
- **`chronos-512.png`** ahora con fondo blanco (antes transparente). Se usa como cover del fullscreen player.
- **`chronos-maskable.png`** con fondo blanco + safe area 70% (antes 80% sobre fondo oscuro). Android Adaptive Icon estándar.
- **`chronos-512.png`** reemplazó a `chronos-192.jpg` en los `<img>` del logo del navbar, hero y cover del player → más nítido y sin fondo blanco pixelado sobre dark.
- `app.js` adaptado para multi-target: nueva constante `ASSET_BASE = window.CHRONOS_ASSET_BASE || ''` que prefija paths de assets. En modo estático queda `''` (sin cambios); en WP, el template inyecta la URL del tema antes de cargar el script.
- `app.js`: `LOCAL_LOGO` apunta a `chronos-512.png` (antes `chronos-192.jpg`); las entries de `mediaSession.metadata.artwork` también usan `ASSET_BASE`.
- Botón WhatsApp del player ahora es `<button>` con `onclick="openWhatsAppChoice()"` en vez de `<a href>` directo al canal.
- `og-banner-chronos.jpeg` (1080×359 neón) queda como banner alternativo para el home; el `/player.html` y otros previews usan el `og-banner-clean.jpeg` (1200×630 fondo blanco) más limpio.
- `front-page.php` simplificado: meta SEO, JSON-LD, preload, resource hints y stylesheets ahora los emite `wp_head()` desde `functions.php` (no inline en el template). El template queda enfocado al markup del body.

### Corregido

- WordPress hacía 301 a `/sw.js/` antes de que el rewrite del tema pudiera servir el archivo. Filter `redirect_canonical` específico para nuestras 4 URLs lo evita.
- Cuando WP detecta una página estática como home y un plugin SEO está activo, los meta tags se duplicaban con basura como `article:published_time` y `twitter:label1: Escrito por`. Ahora con la home en "Tus últimas entradas" + el detector del tema, no hay duplicación.
- Service Worker vieja cacheaba el HTML/JS antes de que llegara la versión nueva. `const VERSION` del SW bumpeado a `chronos-iradio-v1.5.0` (era `v1.4.3`) → al activarse purga todas las caches anteriores.
- Botón WhatsApp del fullscreen player no funcionaba en `/player.html` por falta de cache-bust en el `<script src="app.js">` directo del template. Ahora usa `chronos_asset_url('app.js')` con `?v=<filemtime>`.

### Eliminado

- En producción WP: plugins innecesarios desinstalados (Elementor + addons, MetaSlider, Mosaic Gallery, Radio Player, Akismet, Kirki). Solo quedan **Limit Login Attempts Reloaded** + **Rank Math SEO**.

### Infraestructura / Producción

- Migrado de hosting estático a WordPress (cliente solo tenía acceso a wp-admin). Tema completo reemplaza el sitio anterior, sin perder funcionalidad (PWA, SEO, share, etc.).
- **Rank Math SEO** instalado y configurado en wp-admin para manejar title/description/OG/sitemap del home y `/player.html`.
- Site Icon (Ajustes → Generales → Icono del sitio) configurado con el ícono nuevo → WP genera crops automáticos.

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

[Unreleased]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.3.4...HEAD
[1.3.4]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.3.3...v1.3.4
[1.3.3]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.3.2...v1.3.3
[1.3.2]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v1.0.0...v1.2.0
[1.0.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/chronos-iradio/chronos-iradio/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/chronos-iradio/chronos-iradio/releases/tag/v0.1.0
