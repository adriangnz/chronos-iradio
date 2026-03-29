# Chronos iRadio - Sitio Web

Sitio web moderno y responsive para [Chronos iRadio](https://chronosiradio.online/), una radio online desde Venezuela.

## Caracteristicas

- Diseno oscuro moderno con acentos en gradiente azul/purpura/rosa
- Reproductor de radio integrado (OnlineRadioBox widget) fijo en el footer
- Seccion de programacion estilo cronograma
- Seccion de equipo con modal animado (animacion desde la tarjeta al centro)
- Totalmente responsive (desktop, tablet, movil)
- Animaciones de scroll (fade-up con IntersectionObserver)
- Navbar con efecto glass/blur al hacer scroll
- Zero dependencias - HTML + CSS + JS vanilla
- Compatible con apertura directa via `file://` (patch automatico de protocol-relative URLs)

## Secciones

- **Hero** - Banner principal con logo animado y CTAs
- **Programas** - Cronograma con los 4 programas: Navegando entre Decadas, Chronos iCom, Top 5, Mundo Marino
- **Equipo** - Grid de 5 miembros con modal interactivo
- **Aniversario** - Banner del 1er aniversario
- **Contacto** - Enlaces a WhatsApp, Instagram, Canal WhatsApp, Telegram
- **Reproductor** - Widget OnlineRadioBox fixed en el footer

## Uso

Abrir `index.html` en el navegador, o servir via HTTP:

```bash
python3 -m http.server 8080
```

## Tecnologias

- HTML5, CSS3, JavaScript vanilla
- Google Fonts (Inter, Space Grotesk)
- OnlineRadioBox Widget para streaming
