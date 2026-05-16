# Chronos iRadio — WordPress theme

Tema mínimo que reemplaza por completo la interfaz de WordPress y sirve el
sitio single-page de Chronos iRadio. Pensado para hostings donde solo se tiene
acceso al panel de WordPress (`wp-admin`) y no hay FTP/SSH/cPanel.

## Qué hace este tema

- La home (`/`) renderiza `front-page.php`, que es una copia 1:1 del
  `index.html` original con los paths de assets adaptados al directorio del
  tema.
- Expone vía rewrites cuatro rutas que normalmente vivirían en la raíz del
  document root pero que aquí están dentro del tema:

  | URL pública              | Servida desde                                   |
  |--------------------------|-------------------------------------------------|
  | `/sw.js`                 | `sw.js` (con header `Service-Worker-Allowed: /`)|
  | `/manifest.json`         | `manifest.json` (paths reescritos al tema)      |
  | `/player.html`           | `templates/player.php`                          |
  | `/humans.txt`            | `humans.txt`                                    |

- Limpia `wp_head()` del ruido por defecto (generator, oEmbed, REST API,
  emoji, feeds...) para que el HTML emitido sea casi idéntico al estático.

## Estructura

```
chronos-iradio/
├── style.css              ← header obligatorio de tema WP (sin CSS real)
├── functions.php          ← rewrites, headers, cleanup wp_head
├── front-page.php         ← home (clon adaptado de index.html)
├── index.php              ← fallback (incluye front-page.php)
├── templates/
│   └── player.php         ← clon adaptado de player.html
├── styles.css             ← CSS real del sitio
├── app.js                 ← JS del sitio
├── sw.js                  ← service worker (paths se reescriben al servir)
├── manifest.json          ← PWA manifest (paths se reescriben al servir)
├── humans.txt
└── assets/                ← imágenes (logo, hero, team, programas, ...)
```

## Instalación desde wp-admin

1. **Crear el ZIP**

   ```bash
   cd wp-theme
   zip -r chronos-iradio.zip chronos-iradio
   ```

   El ZIP debe contener una carpeta `chronos-iradio/` en la raíz, no los
   archivos sueltos.

2. **Subir y activar**

   - `wp-admin` → **Apariencia → Temas → Añadir nuevo → Subir tema**
   - Seleccionar `chronos-iradio.zip` → **Instalar ahora** → **Activar**

3. **Configurar permalinks** (crítico para los rewrites)

   - `wp-admin` → **Ajustes → Enlaces permanentes**
   - Elegir cualquier opción **distinta de "Sencillo / Plain"**
     (recomendado: **"Nombre de la entrada"**).
   - Guardar cambios. Esto reescribe `.htaccess` y aplica las reglas del tema.

4. **Asegurar que la home sea la del tema**

   - `wp-admin` → **Ajustes → Lectura**
   - En **"Tu portada muestra"** dejá **"Tus últimas entradas"** (con eso
     `front-page.php` ya gana). Si preferís una página estática, creá una
     página vacía llamada "Inicio" y seleccionala — el resultado es el mismo
     porque `front-page.php` siempre tiene prioridad.

5. **Verificar**

   Abrir en el navegador, una por una:

   - `https://tudominio.com/` → debe verse el sitio Chronos iRadio.
   - `https://tudominio.com/sw.js` → JavaScript del service worker.
   - `https://tudominio.com/manifest.json` → JSON del manifest.
   - `https://tudominio.com/player.html` → reproductor fullscreen.
   - `https://tudominio.com/humans.txt` → texto.

   En DevTools → **Application → Service Workers** debería figurar
   `chronos-iradio-v1.4.3` activo con scope `/`.

## Caveats y troubleshooting

- **El service worker no se registra (404 en `/sw.js`)**: re-guardar
  permalinks. Si persiste, vaciar caché del navegador y desregistrar SWs
  viejos en DevTools.
- **El manifest carga pero los iconos rompen**: confirmar que los `.png`
  existen dentro de `assets/logo/` del tema (este repo trae `.jpg` para
  favicons pero `.png` para iconos PWA — copiá los originales si no están).
- **Aparece la admin bar arriba del sitio cuando estás logueado**: es
  esperado. Cerrá sesión o usá `add_filter('show_admin_bar', '__return_false')`
  si querés ocultarla siempre.
- **Plugins inyectan `<style>` o `<script>` que no querés**: la opción menos
  invasiva es desactivar esos plugins. Si tienen que quedar, ajustar la lista
  de `remove_action` en `functions.php`.
- **Hostings con caché agresivo (LiteSpeed, WP Rocket, etc.)**: purgar caché
  después de cambios en `sw.js` o `manifest.json` para que los headers
  `no-cache` lleguen al cliente.

## Actualizar el tema

Cuando cambies el sitio fuente (raíz del repo), regenerá los archivos del
tema con los nuevos `styles.css`, `app.js`, `sw.js`, `manifest.json` y
`assets/`, y vuelve a subir el ZIP desde `wp-admin → Apariencia → Temas →
Añadir nuevo → Subir tema` (marcando "Reemplazar el tema actual con el
cargado"). Si hubo cambios en rutas servidas por rewrites, re-guardar
permalinks.
