# Roadmap — Chronos iRadio

Estado vivo de las fases del proyecto. Para detalle de cambios ya publicados ver `CHANGELOG.md`.

---

## ✅ Fase 1 — Quick wins (v1.2.0)

- `wp_enqueue` con `filemtime()` para cache-bust automático en cada deploy
- Limpieza de `wp_head` (generator, emoji, REST API, oEmbed, wlwmanifest, feeds)
- Resource hints (preconnect/dns-prefetch) + `defer` en `app.js`
- Helper `chronos_asset_url($path)` con cache-bust
- Cache-bust de iconos del `/manifest.json` (WebAPK Android se actualiza sin esperar 30 días)
- Admin notice si permalinks están en "Sencillo"
- `show_admin_bar` deshabilitada en front

## ✅ Fase 3 — SEO (v1.2.0)

- Detector de plugins SEO (Yoast/Rank Math/SEOPress/AIOSEO) → suprime meta tags propios si hay plugin activo
- Rank Math configurado en producción para home y `/player.html`
- Meta OG/Twitter/JSON-LD `RadioStation`
- `robots.txt` dinámico con bots de IA bloqueados
- Site Icon de WP (Ajustes → Generales) en lugar de favicons hardcodeados
- `og-banner-clean.jpeg` 1200×630 para previews de WhatsApp/Telegram
- ~~i18n~~ — descartado, no aplica

---

## 🚧 Fase 2 — Contenido editable desde wp-admin (próxima)

Objetivo: que la radio pueda actualizar grilla, equipo, banners y mensajes destacados sin tocar código ni pedir un deploy.

### Custom Post Types (CPT)

| CPT | Reemplaza a | Campos principales |
|---|---|---|
| `programa` | Hardcoded en `index.html` (Navegando entre Décadas, Chronos iCom, Top 5, Mundo Marino) | título, descripción, banner WebP 900×300, día(s), hora inicio/fin, locutor relacionado |
| `miembro_equipo` | `teamData` en `app.js` | nombre, rol, foto WebP 300×400, descripción larga, redes sociales (opcional) |
| `mensaje_destacado` | Sección aniversario hardcoded | título, descripción, imagen banner, link CTA, fecha inicio/fin de vigencia |
| `enlace_contacto` | Botones de Contacto hardcoded (WhatsApp, Instagram, Canal, Telegram) | label, URL, ícono (select), color accent, orden |

### Implementación técnica

- Registrar CPTs en `wp-theme/chronos-iradio/functions.php` con `register_post_type()`
- Meta fields con **ACF** o custom meta boxes (decidir según preferencia)
- `front-page.php` itera con `WP_Query` sobre cada CPT
- Imágenes via `wp_get_attachment_image_url()` con tamaño WebP optimizado
- Cache de `WP_Query` con `wp_cache_set/get` (Object Cache si lo hay)
- Migración inicial: seedear los CPTs con el contenido actual hardcodeado

### Módulo: configurador de notificaciones push

Página de ajustes propia del tema en `wp-admin → Chronos iRadio → Notificaciones` (o como subpágina de Ajustes):

- **Lista de notifs scheduled** con UI: título, mensaje, URL destino, fecha/hora, segmento, estado (enviada/pendiente/cancelada)
- **Botón "Nueva notificación"** abre un form con esos campos + opción "recurrente" (cada lunes a las X, asociada a un programa CPT)
- **Recurrencia automática**: si la notif está vinculada a un CPT `programa`, se programa con WP-Cron leyendo `dia` + `hora_inicio` del programa, recortando 5 min antes para avisar
- **Integración con OneSignal** vía REST API (ver Backlog para detalle)
- **Vista previa** del mensaje antes de programar
- **Log de envíos**: cuántos suscriptores recibieron, CTR si OneSignal lo expone

Dependencias: requiere primero el CPT `programa` (Fase 2) + integración OneSignal (Backlog → Fase 2.5).

---

## 📋 Backlog / Futuro

### Notificaciones push con OneSignal

**Por qué**: invitar oyentes a sintonizar cuando arranca su programa favorito ("Top 5 comienza en 5 minutos") sin depender de que tengan el sitio abierto. Web Push gratis hasta 10k subscribers.

**Plan técnico**:

1. **Integración inicial**
   - Plugin oficial OneSignal para WP, o integración manual con SDK
   - Service worker: import del SDK de OneSignal dentro de nuestro `sw.js` actual (vía `importScripts('OneSignalSDKWorker.js')`)
   - Opt-in prompt: aparece al cargar la home tras N segundos de engagement, no agresivo
   - Tags por programa: el oyente puede suscribirse a notificaciones específicas (ej. solo "Top 5") desde su perfil del player

2. **Scheduling recurrente** (sin plan paid de OneSignal)
   - WP-Cron job que llama al REST API de OneSignal cada semana
   - Hook `chronos_notify_programa` registrado con `wp_schedule_event(..., 'weekly', ...)` por cada programa activo
   - Lee el CPT `programa` para determinar día/hora; recalcula al guardar el programa
   - Payload: título, body, deep link a `https://chronosiradio.online/#player`, image_url del banner del programa

3. **Configurador desde wp-admin** (ver Fase 2)
   - UI propia del tema o reusar la del plugin OneSignal
   - Auto-creación de notifs recurrentes al crear un CPT `programa` con horario fijo
   - Test send a un user de prueba antes de hacer broadcast

**Trade-offs**:
- OneSignal plan gratuito: 10k subscribers, scheduling individual ok, recurrencia hace falta WP-Cron + REST API
- Plan paid (Journeys): recurrencia nativa, segmentos avanzados, mejor analytics. Evaluar cuando crezca la base
- Service worker conflict: hay que coordinar OneSignal SW con el nuestro (cache + offline) — probablemente importScripts es la mejor estrategia

### Otros candidatos (sin prioridad)

- **Analytics**: integrar Google Analytics 4 o Plausible para ver de dónde vienen oyentes, qué programas tienen más clicks
- **Chat en vivo durante el show**: integrar Discord widget o chat propio en `#player` cuando esté on-air
- **Histórico de canciones**: parser del feed de OnlineRadioBox + persistencia para mostrar "Último reproducido", "Top de la semana"
- **Newsletter por email**: integración con Mailchimp/ConvertKit para promos y aniversarios
- **App nativa (TWA)**: empaquetar la PWA con Bubblewrap para subirla a Google Play Store

---

## Convenciones

- Cada fase termina con tag semver (`vX.Y.0`) + entry en `CHANGELOG.md`
- Fixes sobre la fase suben minor patch (`vX.Y.Z`)
- Decisiones de arquitectura no obvias → notas en `CLAUDE.md`
