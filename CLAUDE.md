# CLAUDE.md

## Proyecto

Sitio web single-page para Chronos iRadio, radio online venezolana. Archivo unico `index.html` con CSS y JS inline (sin dependencias ni build).

## Stack

- HTML/CSS/JS vanilla, zero dependencias
- Google Fonts: Inter + Space Grotesk
- Widget OnlineRadioBox para el reproductor de radio

## Estructura

```
index.html   - Pagina completa (estilos + markup + scripts)
README.md    - Documentacion del proyecto
CLAUDE.md    - Contexto para Claude Code
```

## Notas importantes

- El widget OnlineRadioBox usa URLs protocol-relative (`//`). Hay un patch en JS que intercepta `src`, `setAttribute`, `XMLHttpRequest.open` y `fetch` para agregar `https:` cuando se abre via `file://`.
- Los estilos del widget se sobreescriben en dos lugares: el `<style id="..._settings">` inline (colores base) y los selectores `.player-bar .orbX` (tema oscuro).
- Las imagenes del equipo y programas se cargan directamente desde `chronosiradio.online`.
- El modal del equipo usa animacion de origen: nace desde la tarjeta clickeada y vuelve a ella al cerrar.
