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

Dependencias: requiere primero el CPT `programa` (Fase 2) + integración OneSignal (Backlog).

---

## 📋 Backlog

### A. Notificaciones push con OneSignal

**Para qué sirve**: invitar oyentes a sintonizar cuando arranca su programa favorito ("Top 5 comienza en 5 minutos") sin depender de que tengan el sitio abierto. La gente vuelve más, sube el promedio de oyentes en vivo, y la radio puede comunicar cambios urgentes (corte de transmisión, programa especial) al instante.

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

---

### B. Analytics (Plausible recomendado, GA4 alternativa)

**Para qué sirve**:
- Saber **cuántos oyentes únicos** entran al sitio por día/mes (no solo cuántos sintonizan — eso lo da OnlineRadioBox — sino cuántos visitan la web)
- Saber **qué programa atrae más tráfico** (picos los sábados a las 8pm = Top 5 jala)
- **De dónde vienen** los oyentes (Instagram, WhatsApp directo, Google search, link del canal) → dice dónde invertir esfuerzo de promoción
- **Qué dispositivo** usan (mobile vs desktop) → priorizar UX en la plataforma dominante
- **Funnel**: cuántos llegan → cuántos clickean "Escuchar en vivo" → cuántos instalan la PWA

**Plausible vs GA4**:
- **Plausible** (~$9/mes): privacy-first, no requiere cookie banner, dashboard limpio, todo lo que necesitás. Recomendado.
- **GA4** (gratis): más completo pero invasivo, requiere cookie banner (feo, mata UX), dashboard complicado. Solo si el presupuesto es 0.

**Implementación**: 1 script en `<head>` (vía `wp_head` action) + listo. Plausible tiene plugin oficial para WP. Esfuerzo: ~1 hora.

---

### C. Histórico de canciones

**Para qué sirve**:
- **"¿Cuál era esa canción que sonó hace rato?"** — caso muy común que la gente busca por separado. Si lo tenés en el sitio, vuelven al sitio
- **Top de la semana / del mes** automático según frecuencia de reproducción
- **SEO bonus**: cada canción reproducida puede generar una página indexable ("Chronos iRadio reprodujo 'Hotel California' el 15 de mayo de 2026") — captura tráfico long-tail de Google
- **Compartir contexto**: link directo "Estoy escuchando X en Chronos iRadio"

**Plan técnico**:
- El widget de OnlineRadioBox ya expone el track actual + un endpoint con histórico (`/last_played` o similar)
- WP-Cron job cada 2-3 min parsea el endpoint y guarda en CPT `cancion_reproducida` (o tabla custom para no inflar wp_posts)
- Página dedicada `/canciones` con buscador + filtro por fecha/programa
- Widget en home: "Último reproducido" + "Top 10 de la semana"
- Considerar API rate limits de OnlineRadioBox; cachear agresivo

**Esfuerzo**: 1-2 días. Lo complejo es el cron job de parseo confiable y la persistencia eficiente; la UI es estándar.

---

### D. App nativa para Play Store / App Store (evaluar a futuro)

**Estado**: en pausa. La PWA actual ya cubre el caso "instalar en celular" con buen UX. Reevaluar si la radio quiere vidriera oficial en Play Store / App Store o si crece la audiencia iOS.

**Para qué serviría**:
- **Visibilidad en stores**: la gente busca "radio chronos" en Play Store / App Store y encuentra una app oficial. Más legitimidad y descubrimiento orgánico.
- **Mejor experiencia de instalación**: stores en lugar de "Agregar a inicio" del browser.
- **Mejor manejo de notificaciones push** en Android (las notifs de OneSignal llegan más confiables en app nativa que en PWA pura).
- **Reseñas y estrellas** en stores visibles en búsquedas — social proof.

**Alternativas técnicas** (de menos a más esfuerzo):

| Opción | Plataformas | Código actual | Costo | Esfuerzo |
|---|---|---|---|---|
| **TWA (Bubblewrap)** | Solo Android | 100% reuso de la PWA | $25 Play one-time | 4-6h |
| **Capacitor (Ionic)** | iOS + Android | 100% reuso de la PWA | + $99/año Apple Dev | 1-2 días |
| **Expo / React Native** | iOS + Android | ❌ reescribir todo en RN | + EAS opcional $19/mes | semanas |

**Notas**:
- **TWA**: PWA empaquetada en APK. Requiere Digital Asset Links (`/.well-known/assetlinks.json`) para que la app "posea" el dominio sin mostrar barra de browser. Sin iOS.
- **Capacitor**: empaqueta la misma PWA para iOS + Android con plugins nativos (OneSignal tiene plugin oficial). Sweet spot si interesa cobertura iOS.
- **Expo**: implica reescribir la app en React Native. Solo vale si se quieren features muy nativas (background audio avanzado, animaciones nativas). Sobrekill para una radio chica.

**Decisión actual**: priorizar A, B, C antes que esto. Volver a evaluar cuando la PWA esté madura o la audiencia iOS sea significativa.

---

## Prioridad sugerida (después de Fase 2)

| # | Item | Por qué |
|---|---|---|
| 1 | **Analytics (Plausible)** | Sin data no se pueden priorizar las otras. Esfuerzo bajo, retorno inmediato |
| 2 | **OneSignal + notificaciones** | Engagement automático, retiene oyentes en horarios de programas. Alto retorno por esfuerzo |
| 3 | **Histórico de canciones** | SEO long-tail + retiene oyentes que buscan canciones puntuales |
| — | **App nativa (D)** | En pausa. Reevaluar a futuro si interesa Play Store / App Store |

---

## Convenciones

- Cada fase termina con tag semver (`vX.Y.0`) + entry en `CHANGELOG.md`
- Fixes sobre la fase suben minor patch (`vX.Y.Z`)
- Decisiones de arquitectura no obvias → notas en `CLAUDE.md`
