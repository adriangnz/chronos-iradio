# Chronos iRadio — WordPress theme

Tema mínimo que reemplaza por completo la interfaz de WordPress y sirve el sitio single-page de Chronos iRadio. Pensado para hostings donde solo se tiene acceso al panel de WordPress (`wp-admin`) y no hay FTP/SSH/cPanel.

**Versión actual: 1.3.2** · **SW: `chronos-iradio-v1.5.0`**

## Qué hace este tema

- La home (`/`) renderiza `front-page.php`, que es una copia adaptada de `index.html` con paths de assets resueltos al directorio del tema.
- Expone vía rewrites cuatro rutas desde la raíz del dominio:

  | URL pública | Servida desde |
  |---|---|
  | `/sw.js` | endpoint PHP que reescribe paths del SW + envía `Service-Worker-Allowed: /` |
  | `/manifest.json` | endpoint PHP que reescribe paths + agrega `?v=<filemtime>` a cada icon (cache-bust) |
  | `/player.html` | renderiza `templates/player.php` con `Cache-Control: no-cache` |
  | `/humans.txt` | el archivo del tema directo |

- **Limpia `wp_head()`** del ruido por defecto (generator, oEmbed, REST API, emoji, feeds, wlwmanifest).
- **Carga styles/scripts vía `wp_enqueue`** con `filemtime()` como versión → cada cambio invalida cache automáticamente.
- **SEO inline + bypass automático**: emite meta description / OG / Twitter / JSON-LD `RadioStation` en `wp_head`. Si detecta un plugin SEO activo (Yoast / Rank Math / SEOPress / AIOSEO) se silencia para evitar duplicación. En prod corre Rank Math.
- **Helper `chronos_asset_url($path)`** devuelve URL absoluta del tema + `?v=<filemtime>` para que cambios a imágenes se reflejen sin esperar caches.
- **`robots.txt` dinámico** con User-agent blocks para bots de entrenamiento IA (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, etc.).
- **`show_admin_bar` = false** en front (la admin bar no se superpone al hero).
- **Admin notice** si los permalinks están en "Sencillo" (rompería las rewrites).

## Estructura

```
chronos-iradio/
├── style.css              ← header obligatorio WP + Version: X.Y.Z (sin CSS real)
├── functions.php          ← rewrites, SEO, enqueue, helper chronos_asset_url
├── front-page.php         ← home (clon adaptado de index.html)
├── index.php              ← fallback (incluye front-page)
├── templates/
│   └── player.php         ← clon adaptado de player.html (/player.html)
├── styles.css             ← CSS real del sitio (copia sincronizada del upstream)
├── app.js                 ← JS del sitio (copia sincronizada)
├── sw.js                  ← service worker (paths se reescriben al servir)
├── manifest.json          ← PWA manifest (paths se reescriben al servir + cache-bust)
├── humans.txt
├── screenshot.jpg         ← preview del tema en Apariencia → Temas
└── assets/                ← copia de assets/ del upstream (logo, hero, og, programas, team, ...)
```

## Instalación / re-deploy desde wp-admin

1. **Sincronizar** archivos del upstream al tema (si cambiaron en la raíz del repo):
   ```bash
   cp ../../styles.css ../../app.js ../../sw.js ../../manifest.json ../../humans.txt .
   cp -r ../../assets .
   ```

2. **Bumpear** `Version: X.Y.Z` en `style.css` (sino WP no detecta el upgrade).

3. **Crear el ZIP** desde `wp-theme/`:
   ```bash
   cd wp-theme && rm -f chronos-iradio-*.zip
   zip -r chronos-iradio-X.Y.Z.zip chronos-iradio \
     -x "*.DS_Store" "*/.git/*" "*/_backup-pre-relogo/*"
   ```
   El ZIP debe contener una carpeta `chronos-iradio/` en la raíz.

4. **Subir y activar**: `wp-admin` → **Apariencia → Temas → Subir tema** → seleccionar ZIP → **Reemplazar el actual** (o Instalar + Activar si es la primera vez).

5. **Configurar permalinks** (crítico para los rewrites, una sola vez):
   - `wp-admin` → **Ajustes → Enlaces permanentes** → "Nombre de la entrada" → **Guardar cambios**.

6. **Configurar la home** (una sola vez):
   - `wp-admin` → **Ajustes → Lectura → Tu portada muestra** → **"Tus últimas entradas"** (NO "Página estática" para evitar contaminar SEO).

7. **Purgar caché de Cloudflare** (si está activo): dashboard de Cloudflare → Caching → Configuration → **Purge Everything**.

8. **Verificar**:
   ```bash
   curl -sI https://tudominio.com/                 # 200 text/html
   curl -sI https://tudominio.com/sw.js            # 200 application/javascript + Service-Worker-Allowed: /
   curl -sI https://tudominio.com/manifest.json    # 200 application/manifest+json
   curl -sI https://tudominio.com/player.html      # 200 text/html
   curl -sI https://tudominio.com/humans.txt       # 200 text/plain
   ```

## Configuración recomendada del plugin SEO (Rank Math)

Si instalás Rank Math, el tema detecta automáticamente y se silencia. Configurar entonces en `wp-admin → Rank Math → Titles & Meta → Homepage`:

- **Title**: `Chronos iRadio - Radio Online en Vivo`
- **Description**: `Los clasicos de la musica de todos los tiempos. Radio online desde Venezuela con rock, pop, soul, jazz y musica latina de los ultimos 50 anos.`
- **Social Meta Image**: subir `og-banner-clean.jpeg` (1200×630, fondo blanco con logo) o `og-banner-chronos.jpeg` (1080×359, fondo neón).

Para el `/player.html`, los meta OG están definidos directamente en `templates/player.php` (Rank Math no los toca porque es una URL custom, no una WP page).

## Configuración del icono del sitio

En vez de hardcodear favicons en el tema, se usan los que genera `wp_head()` a partir de **`wp-admin → Ajustes → Generales → Icono del sitio`**. Subir ahí `chronos-iradio-ico-transparente.png` (idealmente 512×512 o mayor) y WP genera automáticamente los crops 32, 192, 180, 270 (msapplication tile) e los inyecta en el HTML.

## Cache-busting automático

A diferencia de versionar a mano cada asset, el tema usa **`filemtime()`** para versionar:

- `wp_enqueue_style('chronos-iradio-main', ..., filemtime(...))` → `styles.css?ver=<timestamp>`.
- `wp_enqueue_script('chronos-iradio-app', ..., filemtime(...))` → `app.js?ver=<timestamp>`.
- `chronos_asset_url('assets/logo/chronos-X.png')` → URL absoluta + `?v=<filemtime>`. Se usa para los `<img>` del logo en `front-page.php` y `templates/player.php`.
- El endpoint `/manifest.json` reescribe cada icon con `?v=<filemtime>` → Android detecta cambio y regenera el WebAPK sin esperar el ciclo de Google Play Services.

Resultado: cuando subís un ZIP nuevo, los browsers y Cloudflare detectan que las URLs cambiaron y bajan los assets nuevos automáticamente. **No necesitás Ctrl+Shift+R manual ni purge selectivo en cada deploy** (salvo casos de bug del SW).

## Caveats y troubleshooting

- **404 nativo de Apache en `/sw.js` o `/manifest.json`**: permalinks están en "Sencillo". Cambiar a "Nombre de la entrada" + Guardar. Si persiste, verificar que `.htaccess` exista y tenga las reglas estándar de WP.
- **301 a `/sw.js/` con trailing slash**: WP `redirect_canonical` está haciéndolo. El tema ya tiene un filter para suprimirlo solo en esas 4 URLs.
- **WebAPK del celular muestra ícono viejo**: Android cachea el WebAPK ~30 días. Para forzar update: desinstalar PWA → Configuración → Apps → Brave/Chrome → Almacenamiento → Borrar caché → reinstalar PWA desde el browser. Si persiste, también borrar caché de Google Play Services + reiniciar el celular.
- **Preview de WhatsApp/Telegram cacheado**: WhatsApp cachea previews por días. Compartir el link en un chat distinto, o usar [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) → Scrape Again para invalidar el cache de Meta.
- **Plugins de cache (LiteSpeed, WP Rocket, etc.)**: purgar caché del plugin después de subir ZIP nuevo.
- **Service Worker viejo cacheado**: el `VERSION` del SW (`const VERSION` en `sw.js`) tiene que bumpear cuando hay cambios estructurales. Bumpear → al activarse, borra todas las caches anteriores.
- **`window.CHRONOS_ASSET_BASE` undefined**: significa que `app.js` se cargó sin el inline script que lo define. Confirmar que `front-page.php` / `templates/player.php` tengan el `<script>window.CHRONOS_ASSET_BASE = ...;</script>` ANTES del `wp_footer()` (en el caso del front-page) o del `<script src="app.js">` (en el player).

## Helper API de PHP (referencia interna)

```php
chronos_asset_url( 'assets/logo/chronos-512.png' )
// → "https://chronosiradio.online/wp-content/themes/chronos-iradio/assets/logo/chronos-512.png?ver=1778893841"

chronos_iradio_seo_plugin_active()
// → true si Yoast / Rank Math / SEOPress / AIOSEO están activos
```

## Versiones

Ver `CHANGELOG.md` en la raíz del repo. Las versiones del tema (header `Version:` en `style.css`) y las del proyecto pueden divergir: el tema bumpea con cada deploy a WP, el proyecto en cambios funcionales.
