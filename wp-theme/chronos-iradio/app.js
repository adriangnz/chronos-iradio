// Base path para los assets. En despliegues donde el sitio NO sirve desde la
// raiz del document root (p.ej. embebido en un tema WP bajo
// /wp-content/themes/<theme>/), el HTML define window.CHRONOS_ASSET_BASE con
// la URL absoluta del tema. En despliegues estaticos queda undefined y los
// paths quedan relativos como siempre.
const ASSET_BASE = (typeof window !== 'undefined' && window.CHRONOS_ASSET_BASE) || '';

// ===== TEAM DATA =====
const teamData = [
    {
        name: 'Km Rodriguez',
        role: 'Creador & Director',
        img: ASSET_BASE + 'assets/team/km-rodriguez.webp',
        desc: 'Creador de Chronos iRadio. Un sueno de su adolescencia, que comienza a hacerse realidad con esta aventura. Su vision y pasion por la radio lo llevaron a construir este proyecto desde cero.'
    },
    {
        name: 'Eryx Rodriguez',
        role: 'Produccion & Locutor',
        img: ASSET_BASE + 'assets/team/eryx-rodriguez.webp',
        desc: 'A pesar de su corta edad, es un amante y conocedor de la buena musica. Esta en la asistencia de produccion y en la conduccion del microprograma Chronos iCom.'
    },
    {
        name: 'Enrique Gonzalez',
        role: 'Voz & Imagen',
        img: ASSET_BASE + 'assets/team/enrique-gonzalez.webp',
        desc: 'Nuestra voz marca, con un talento increible es el que le imprime la personalidad y la imagen a Chronos iRadio. Ademas complice en esta aventura que conduce a un sueno.'
    },
    {
        name: 'Franmary Fernandez',
        role: 'Locutora',
        img: ASSET_BASE + 'assets/team/franmary-fernandez.webp',
        desc: 'Una de las voces que escuchas en Chronos iRadio. Una voz calida sobria con unos matices grandiosos. Licenciada en Comunicacion Social.'
    },
    {
        name: 'Victor Grinfelds',
        role: 'Ingeniero',
        img: ASSET_BASE + 'assets/team/victor-grinfelds.webp',
        desc: 'Nuestro Ingeniero colaborador principal de Chronos iRadio. El es una de las personas que creen en este proyecto y aporta su mejor esfuerzo en la construccion de esta aventura.'
    }
];

// ===== MODAL WITH ORIGIN ANIMATION =====
let activeCardIdx = null;

function getCardEl(idx) {
    return document.querySelectorAll('.team-card')[idx];
}

function updateSiblings(idx) {
    const prevIdx = (idx - 1 + teamData.length) % teamData.length;
    const nextIdx = (idx + 1) % teamData.length;
    const prev = teamData[prevIdx];
    const next = teamData[nextIdx];

    document.getElementById('siblingPrevImg').src = prev.img;
    document.getElementById('siblingPrevImg').alt = prev.name;
    document.getElementById('siblingPrevName').textContent = prev.name;
    document.getElementById('siblingPrevRole').textContent = prev.role;

    document.getElementById('siblingNextImg').src = next.img;
    document.getElementById('siblingNextImg').alt = next.name;
    document.getElementById('siblingNextName').textContent = next.name;
    document.getElementById('siblingNextRole').textContent = next.role;

    // Position siblings based on modal position
    const vw = window.innerWidth;
    const modalW = Math.min(700, vw * 0.9);
    const sideSpace = (vw - modalW) / 2;
    const siblingW = 240;
    const prevEl = document.getElementById('siblingPrev');
    const nextEl = document.getElementById('siblingNext');
    // Center each sibling in the available side space
    const offset = Math.max(10, (sideSpace - siblingW * 0.65) / 2);
    prevEl.style.left = offset + 'px';
    prevEl.style.right = '';
    nextEl.style.right = offset + 'px';
    nextEl.style.left = '';
}

function openModal(idx) {
    activeCardIdx = idx;
    const m = teamData[idx];
    const modal = document.getElementById('teamModal');

    // Set content
    document.getElementById('modalImg').src = m.img;
    document.getElementById('modalImg').alt = m.name;
    document.getElementById('modalName').textContent = m.name;
    document.getElementById('modalRole').textContent = m.role;
    document.getElementById('modalDesc').textContent = m.desc;
    updateSiblings(idx);

    // Activate (CSS handles the animation)
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e && e.target && !e.target.classList.contains('modal-backdrop') && e.type !== 'keydown') return;
    if (e && e.target && e.target.closest && e.target.closest('.modal-sibling')) return;
    const modal = document.getElementById('teamModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    activeCardIdx = null;
}

function navigateModal(dir) {
    if (activeCardIdx === null) return;
    const newIdx = (activeCardIdx + dir + teamData.length) % teamData.length;
    const m = teamData[newIdx];
    activeCardIdx = newIdx;

    const modalCard = document.querySelector('#teamModal .modal-card');
    const inner = modalCard.querySelector('.modal-img-wrap, .modal-body');

    // Slide content
    const slideDir = dir > 0 ? 1 : -1;
    const imgEl = document.getElementById('modalImg');
    const nameEl = document.getElementById('modalName');
    const roleEl = document.getElementById('modalRole');
    const descEl = document.getElementById('modalDesc');

    // Fade out
    const els = [imgEl.parentElement, nameEl, roleEl, descEl];
    els.forEach(el => {
        el.style.transition = 'opacity 0.18s ease, transform 0.18s ease';
        el.style.opacity = '0';
        el.style.transform = `translateX(${slideDir * -20}px)`;
    });

    setTimeout(() => {
        // Update content
        imgEl.src = m.img;
        imgEl.alt = m.name;
        nameEl.textContent = m.name;
        roleEl.textContent = m.role;
        descEl.textContent = m.desc;
        updateSiblings(newIdx);

        // Set start position for fade in
        els.forEach(el => {
            el.style.transition = 'none';
            el.style.transform = `translateX(${slideDir * 20}px)`;
        });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                els.forEach((el, i) => {
                    el.style.transition = `opacity 0.25s ease ${i * 0.04}s, transform 0.25s ease ${i * 0.04}s`;
                    el.style.opacity = '1';
                    el.style.transform = 'translateX(0)';
                });
            });
        });
    }, 180);
}

document.addEventListener('keydown', (e) => {
    if (activeCardIdx === null) return;
    if (e.key === 'Escape') closeModal(e);
    if (e.key === 'ArrowLeft') navigateModal(-1);
    if (e.key === 'ArrowRight') navigateModal(1);
});

// ===== SWIPE EN EL MODAL DEL EQUIPO =====
// - Horizontal: navega prev/next entre miembros
// - Vertical: cierra el modal
(function attachModalSwipe() {
    const modal = document.getElementById('teamModal');
    if (!modal) return;
    let startX = 0, startY = 0, tracking = false;
    const MIN_DX = 50;
    const MIN_DY = 70;

    modal.addEventListener('touchstart', (e) => {
        if (!modal.classList.contains('active')) return;
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        tracking = true;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
        if (!tracking || !modal.classList.contains('active')) return;
        tracking = false;
        const t = e.changedTouches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        const absDx = Math.abs(dx), absDy = Math.abs(dy);
        // Gesto predominantemente vertical → cerrar
        if (absDy > absDx && absDy > MIN_DY) {
            closeModal();
            return;
        }
        // Gesto predominantemente horizontal → navegar
        if (absDx >= MIN_DX && absDx > absDy) {
            if (dx < 0) navigateModal(1);   // swipe izquierda → siguiente
            else navigateModal(-1);          // swipe derecha → anterior
        }
    }, { passive: true });

    modal.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
})();

// ===== DYNAMIC YEAR =====
var _y = document.getElementById('year');
if (_y) _y.textContent = new Date().getFullYear();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ===== MOBILE NAV =====
function toggleMobileNav() {
    var nav = document.getElementById('mobileNav');
    var btn = document.getElementById('menuToggle');
    nav.classList.toggle('open');
    var isOpen = nav.classList.contains('open');
    if (btn) btn.setAttribute('aria-expanded', isOpen);
}

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 200;
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');
        const link = document.querySelector(`.nav-links a[href="#${id}"]`);
        if (link) link.classList.toggle('active', scrollY >= top && scrollY < top + height);
    });
});

// ===== FULLSCREEN PLAYER + ORB WIDGET BRIDGE =====
// Puentea los controles del widget OnlineRadioBox a nuestra UI propia.
// El widget vive dentro de #orb_player_145cb053ba408304 y expone:
//   - .orbPp (play) / .orbPs (stop) — el widget intercambia la clase según el estado
//   - #orb_player_145cb053ba408304_p — elemento <audio> real con el stream
//   - .orbPtt — texto del track actual (actualizado por el widget)

const ORB_ROOT_ID = 'orb_player_145cb053ba408304';
const ORB_AUDIO_ID = 'orb_player_145cb053ba408304_p';

function orbRoot() { return document.getElementById(ORB_ROOT_ID); }
function orbAudio() { return document.getElementById(ORB_AUDIO_ID); }
function orbPlayButton() {
    const root = orbRoot();
    if (!root) return null;
    return root.querySelector('.orbPp, .orbPs');
}
// Detección multi-señal: el widget a veces tarda en cambiar la clase del botón,
// a veces audio.paused no refleja la realidad. Priorizamos el flag actualizado
// por los eventos del <audio> y cruzamos con señales DOM.
let _audioIsPlaying = false;
let _audioIsLoading = false;

function isPlaying() {
    if (_audioIsPlaying) return true;
    const a = orbAudio();
    if (a && !a.paused && !a.ended && a.readyState >= 2) return true;
    const btn = orbPlayButton();
    if (btn && btn.classList.contains('orbPs')) return true;
    return false;
}
function isLoading() {
    if (_audioIsLoading) return true;
    const a = orbAudio();
    if (!a) return false;
    // El usuario apretó play pero aún no hay datos suficientes
    return !a.paused && a.readyState < 2;
}

const PLAY_ICON = '<polygon points="7 4 20 12 7 20 7 4"/>';
const PAUSE_ICON = '<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>';

function renderPlayIcon(playing) {
    const iconEl = document.getElementById('fspPlayIcon');
    if (!iconEl) return;
    iconEl.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
    iconEl.setAttribute('fill', 'currentColor');
}

function togglePlay() {
    const btn = orbPlayButton();
    if (btn) btn.click();
}

// El widget ORB ignora audio.muted/volume directos. Mute = volumen a 0
// vía setVolume() (que llama a la API videojs interna del widget); guarda
// el volumen previo para restaurarlo al unmute.
let _preMuteVolume = 0.8;

function isCurrentlyMuted() {
    const audio = orbAudio();
    if (!audio) return false;
    return audio.muted || audio.volume === 0;
}

function toggleMute() {
    const audio = orbAudio();
    if (!audio) return;
    const slider = document.getElementById('fspVolume');
    if (isCurrentlyMuted()) {
        // Unmute: restaurar
        const restore = _preMuteVolume > 0 ? _preMuteVolume : 0.8;
        audio.muted = false;
        setVolume(restore);
        if (slider) slider.value = Math.round(restore * 100);
    } else {
        // Mute: guardar volumen actual y bajar a 0
        if (audio.volume > 0) _preMuteVolume = audio.volume;
        audio.muted = true;
        setVolume(0);
        if (slider) slider.value = 0;
    }
    updateMuteIcon();
}

const SVG_VOL_ON = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
const SVG_VOL_OFF = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';

function updateMuteIcon() {
    const btn = document.getElementById('fspMute');
    const icon = document.getElementById('fspMuteIcon');
    if (!btn || !icon) return;
    const muted = isCurrentlyMuted();
    btn.classList.toggle('muted', muted);
    btn.setAttribute('aria-pressed', String(muted));
    icon.innerHTML = muted ? SVG_VOL_OFF : SVG_VOL_ON;
}

function playAndExpand() {
    openFullscreenPlayer();
    // Sólo disparar play si el stream NO está sonando actualmente.
    // Usa isPlaying() (multi-señal) para ser robusto.
    setTimeout(() => {
        if (isPlaying()) return;
        const btn = orbPlayButton();
        if (btn) btn.click();
    }, 150);
}

let fspSyncInterval = null;

function openFullscreenPlayer() {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    fsp.classList.add('active');
    fsp.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    syncFspUI();
    if (fspSyncInterval) clearInterval(fspSyncInterval);
    fspSyncInterval = setInterval(syncFspUI, 500);
    // Deep link en la URL
    if (location.hash !== '#player') {
        history.pushState({ fsp: true }, '', '#player');
    }
}

function closeFullscreenPlayer() {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    fsp.classList.remove('active');
    fsp.setAttribute('aria-hidden', 'true');
    if (fspSyncInterval) { clearInterval(fspSyncInterval); fspSyncInterval = null; }
    if (!document.querySelector('.modal-backdrop.active')) {
        document.body.style.overflow = '';
    }
    // Limpiar hash si venimos de ahí (sin agregar al history)
    if (location.hash === '#player') {
        history.replaceState(null, '', location.pathname + location.search);
    }
}

// Sync del fullscreen player con cambios de hash (navegación browser + deep link)
window.addEventListener('hashchange', () => {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    const shouldBeOpen = location.hash === '#player';
    const isOpen = fsp.classList.contains('active');
    if (shouldBeOpen && !isOpen) openFullscreenPlayer();
    else if (!shouldBeOpen && isOpen) {
        fsp.classList.remove('active');
        fsp.setAttribute('aria-hidden', 'true');
        if (fspSyncInterval) { clearInterval(fspSyncInterval); fspSyncInterval = null; }
        document.body.style.overflow = '';
    }
});
// Estado inicial: si llega con #player en la URL o se está ejecutando como
// PWA instalada (modo standalone/fullscreen), abrir el player automáticamente.
function isStandaloneMode() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
        || (window.matchMedia && window.matchMedia('(display-mode: fullscreen)').matches)
        || window.navigator.standalone === true
        || document.referrer.startsWith('android-app://');
}
document.addEventListener('DOMContentLoaded', () => {
    if (location.hash === '#player' || isStandaloneMode()) {
        setTimeout(openFullscreenPlayer, 300);
    }
});

function syncFspUI() {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    const playing = isPlaying();
    const loading = isLoading();
    fsp.classList.toggle('playing', playing && !loading);
    fsp.classList.toggle('loading', loading);
    fsp.classList.toggle('paused', !playing && !loading);
    renderPlayIcon(playing);

    const statusText = document.getElementById('fspStatusText');
    if (statusText) {
        if (loading) statusText.textContent = 'Cargando';
        else if (playing) statusText.textContent = 'En directo';
        else statusText.textContent = 'En pausa';
    }

    updateTrackText();
    updateMuteIcon();
    syncCoverFromWidget();
    if ('mediaSession' in navigator) {
        try { navigator.mediaSession.playbackState = playing ? 'playing' : 'paused'; } catch (e) {}
    }
}

// Cover del fullscreen player: el widget ORB hace fetch/XHR a su endpoint de
// track y la respuesta incluye iImg (portada). Interceptamos esos requests
// para extraer la portada aunque el widget no la ponga en el DOM.
const LOCAL_LOGO = ASSET_BASE + 'assets/logo/chronos-512.png';
let _trackImg = null;

function upgradeImgResolution(url) {
    if (!url) return url;
    // CDN Apple Music (mzstatic.com) expone múltiples tamaños en la URL
    return url.replace(/\/(\d+)x(\d+)bb\.(jpg|jpeg|png|webp)/i, '/600x600bb.$3');
}

let _trackArtist = null;
let _trackName = null;

function handleTrackPayload(data) {
    if (!data || typeof data !== 'object') return;
    // El payload de track tiene iImg/iArtist/iName/trackId/title
    if (!data.iImg && !data.trackId && !data.title) return;
    const img = typeof data.iImg === 'string' ? data.iImg : null;
    if (img && img !== _trackImg) {
        _trackImg = img;
        syncCoverFromWidget();
    }
    // Si el endpoint explícitamente dice que no hay track, volver al logo
    if (data.trackId === null || data.trackId === 0) {
        _trackImg = null;
        syncCoverFromWidget();
    }
    // Guarda artista/nombre para Media Session (lockscreen / notificación)
    if (typeof data.iArtist === 'string') _trackArtist = data.iArtist;
    if (typeof data.iName === 'string') _trackName = data.iName;
    updateMediaSession();
}

// ===== MEDIA SESSION API =====
// Sustituye el "adriangnz.github.io" de la notificación lockscreen por el
// nombre del track + artista + portada.
function updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const title = _trackName || 'Chronos iRadio';
    const artist = _trackArtist || 'Radio en directo desde Venezuela';
    const artworkUrl = _trackImg ? upgradeImgResolution(_trackImg) : null;
    const artwork = artworkUrl ? [
        { src: artworkUrl, sizes: '600x600', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '512x512', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '256x256', type: 'image/jpeg' },
        { src: artworkUrl, sizes: '128x128', type: 'image/jpeg' }
    ] : [
        { src: ASSET_BASE + 'assets/logo/chronos-512.png', sizes: '512x512', type: 'image/png' },
        { src: ASSET_BASE + 'assets/logo/chronos-192.png', sizes: '192x192', type: 'image/png' }
    ];
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title, artist, album: 'Chronos iRadio', artwork
        });
    } catch (e) {}
}

function setupMediaSessionHandlers() {
    if (!('mediaSession' in navigator)) return;
    try {
        navigator.mediaSession.setActionHandler('play', () => {
            if (!isPlaying()) { const b = orbPlayButton(); if (b) b.click(); }
        });
        navigator.mediaSession.setActionHandler('pause', () => {
            if (isPlaying()) { const b = orbPlayButton(); if (b) b.click(); }
        });
        navigator.mediaSession.setActionHandler('stop', () => {
            if (isPlaying()) { const b = orbPlayButton(); if (b) b.click(); }
        });
    } catch (e) {}
}
setupMediaSessionHandlers();
updateMediaSession();

function syncCoverFromWidget() {
    const cover = document.getElementById('fspCoverImg');
    if (!cover) return;
    const target = _trackImg
        ? upgradeImgResolution(_trackImg)
        : LOCAL_LOGO;
    const current = cover.getAttribute('src') || '';
    if (current.split('?')[0] !== target.split('?')[0]) {
        cover.src = target;
    }
}

// Interceptores para capturar la respuesta de track del widget.
// El widget hace requests a endpoints de onlineradiobox.com con el JSON que
// tiene iImg/title/trackId. No sabemos la URL exacta pero sí la forma del
// payload — filtramos por las claves.
(function patchTrackInterceptors() {
    // console.log — el widget emite "Track response:" con el objeto. Captura
    // confiable incluso si app.js se carga después de los primeros fetches.
    const origLog = console.log;
    console.log = function() {
        try {
            for (let i = 0; i < arguments.length; i++) {
                const arg = arguments[i];
                if (arg && typeof arg === 'object' && (arg.iImg || arg.trackId !== undefined || arg.title)) {
                    handleTrackPayload(arg);
                    break;
                }
            }
        } catch (e) {}
        return origLog.apply(this, arguments);
    };

    // fetch
    if (window.fetch) {
        const origFetch = window.fetch;
        window.fetch = function(input, init) {
            return origFetch.apply(this, arguments).then((res) => {
                try {
                    const url = typeof input === 'string' ? input : (input && input.url) || '';
                    if (/onlineradiobox\.com/i.test(url) && res && res.ok) {
                        const ct = res.headers.get('content-type') || '';
                        if (/json/i.test(ct)) {
                            res.clone().json().then(handleTrackPayload).catch(() => {});
                        }
                    }
                } catch (e) {}
                return res;
            });
        };
    }

    // XMLHttpRequest
    const XHR = window.XMLHttpRequest;
    if (XHR && XHR.prototype) {
        const origOpen = XHR.prototype.open;
        const origSend = XHR.prototype.send;
        XHR.prototype.open = function(method, url) {
            this.__orbUrl = url;
            return origOpen.apply(this, arguments);
        };
        XHR.prototype.send = function() {
            const xhr = this;
            xhr.addEventListener('load', function() {
                try {
                    if (!xhr.__orbUrl || !/onlineradiobox\.com/i.test(xhr.__orbUrl)) return;
                    const text = xhr.responseText || '';
                    if (!text) return;
                    // Intento directo JSON.parse
                    try {
                        handleTrackPayload(JSON.parse(text));
                    } catch (e) {
                        // JSONP u otro envoltorio: extrae el primer objeto que parezca un track
                        const m = text.match(/\{[^]*?"iImg"\s*:\s*"[^"]+"[^]*?\}/);
                        if (m) { try { handleTrackPayload(JSON.parse(m[0])); } catch (e2) {} }
                    }
                } catch (e) {}
            });
            return origSend.apply(this, arguments);
        };
    }
})();

function updateTrackText() {
    const track = document.getElementById('fspTrack');
    const t1 = document.getElementById('fspTrackText');
    const t2 = document.getElementById('fspTrackText2');
    if (!track || !t1) return;
    const root = orbRoot();
    const tt = root ? root.querySelector('.orbPtt') : null;
    const text = (tt ? (tt.textContent || '').trim() : '') || 'Los clásicos de siempre';
    if (t1.textContent === text) {
        // Mismo texto: solo re-evalúa scroll por si cambió el ancho
        refreshMarquee();
        return;
    }
    t1.textContent = text;
    if (t2) t2.textContent = text;
    // Defer al próximo frame para medir con el texto ya renderizado
    requestAnimationFrame(refreshMarquee);
}

function refreshMarquee() {
    const track = document.getElementById('fspTrack');
    const inner = track ? track.querySelector('.fsp-track-inner') : null;
    const t1 = document.getElementById('fspTrackText');
    if (!track || !inner || !t1) return;
    // Overflow = el texto es más ancho que el contenedor
    const overflow = t1.scrollWidth > track.clientWidth - 24;
    track.classList.toggle('scrolling', overflow);
}
window.addEventListener('resize', refreshMarquee);

// Observa cambios del widget y del audio para sincronizar UI y flags internos.
function attachOrbObservers() {
    const root = orbRoot();
    if (root) {
        const mo = new MutationObserver(syncFspUI);
        mo.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
    }
    const audio = orbAudio();
    if (audio) {
        audio.addEventListener('play',    () => { _audioIsLoading = true;  syncFspUI(); });
        audio.addEventListener('waiting', () => { _audioIsLoading = true;  syncFspUI(); });
        audio.addEventListener('playing', () => { _audioIsPlaying = true;  _audioIsLoading = false; syncFspUI(); });
        audio.addEventListener('pause',   () => { _audioIsPlaying = false; _audioIsLoading = false; syncFspUI(); });
        audio.addEventListener('ended',   () => { _audioIsPlaying = false; _audioIsLoading = false; syncFspUI(); });
        audio.addEventListener('error',   () => { _audioIsPlaying = false; _audioIsLoading = false; syncFspUI(); });
        audio.addEventListener('volumechange', syncFspUI);
        const volEl = document.getElementById('fspVolume');
        if (volEl) volEl.value = Math.round((audio.volume || 0.8) * 100);
    }
}

// Retry porque el widget carga asíncronamente
let orbAttempts = 0;
function waitForOrb() {
    if (orbAudio() && orbRoot()) {
        attachOrbObservers();
        syncFspUI();
        return;
    }
    if (orbAttempts++ < 40) setTimeout(waitForOrb, 250);
}
waitForOrb();

// ===== VOLUMEN =====
// El widget OnlineRadioBox crea DOS players videojs:
//   - orb_player_..._p → el <audio> real, donde vive el control de volumen
//   - orb_player_...   → el wrapper UI (volume() en este NO afecta el sonido)
// Aplicamos a AMBOS por seguridad; el _p es el que realmente cambia el sonido.
const ORB_PLAYER_IDS = [
    'orb_player_145cb053ba408304_p',
    'orb_player_145cb053ba408304'
];

function getOrbPlayers() {
    const w = window.orbp_w;
    if (!w || !w.videojs) return [];
    const results = [];
    for (const id of ORB_PLAYER_IDS) {
        let p = null;
        // SOLO lectura — videojs(id) crearía un player nuevo si no existe
        // (rompe el widget original con un skin default "Video Player loading…")
        try {
            if (w.videojs.players && w.videojs.players[id]) p = w.videojs.players[id];
            if (!p && typeof w.videojs.getPlayer === 'function') p = w.videojs.getPlayer(id);
        } catch (e) {}
        if (p && typeof p.volume === 'function') results.push(p);
    }
    return results;
}

function setVolumeViaApi(v) {
    const players = getOrbPlayers();
    if (!players.length) return false;
    let ok = false;
    for (const p of players) {
        try {
            p.volume(v);
            if (typeof p.muted === 'function') p.muted(v === 0);
            ok = true;
        } catch (e) {}
    }
    return ok;
}

function setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    const audio = orbAudio();
    if (audio) {
        audio.volume = v;
        audio.muted = v === 0;
    }
    setVolumeViaApi(v);
}

const fspVol = document.getElementById('fspVolume');
if (fspVol) {
    fspVol.addEventListener('input', (e) => {
        setVolume(parseFloat(e.target.value) / 100);
    });
    fspVol.addEventListener('change', (e) => {
        setVolume(parseFloat(e.target.value) / 100);
    });
}

// Elimina el branding ORB del DOM (el CSS display:none es sobrescrito por el
// widget vía estilos inline después de cargar, así que removemos el nodo).
function killOrbBranding() {
    const root = orbRoot();
    if (!root) return false;
    const brand = root.querySelector('.orbPh');
    if (brand) { brand.remove(); return true; }
    return false;
}
let killAttempts = 0;
(function waitKillBranding() {
    if (killOrbBranding() || killAttempts++ > 40) return;
    setTimeout(waitKillBranding, 250);
})();
// Re-kill periódicamente por si el widget lo restaura
setInterval(killOrbBranding, 2000);

// Tap en el título del widget (.orbPt) → abrir fullscreen en lugar de navegar a OnlineRadioBox
document.addEventListener('click', (e) => {
    const link = e.target.closest ? e.target.closest('.player-bar .orbPt') : null;
    if (link) {
        e.preventDefault();
        e.stopPropagation();
        openFullscreenPlayer();
    }
}, true);

// ESC cierra el fullscreen player
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const fsp = document.getElementById('fullscreenPlayer');
    if (fsp && fsp.classList.contains('active')) closeFullscreenPlayer();
});

// ===== PWA: Service Worker + install prompt =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // updateViaCache: 'none' fuerza al browser a siempre chequear updates
        // del script del SW (no cachearlo por HTTP).
        navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
            .then((reg) => {
                // Cuando un nuevo SW toma control, recarga la página una vez
                // para que use los assets nuevos (CSS/JS). Evita loops con un flag.
                let reloaded = false;
                navigator.serviceWorker.addEventListener('controllerchange', () => {
                    if (reloaded) return;
                    reloaded = true;
                    location.reload();
                });
                // Busca updates al arrancar
                reg.update().catch(() => {});
            })
            .catch(() => {});
    });
}

let _deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredInstallPrompt = e;
    const btn = document.getElementById('installApp');
    if (btn) btn.hidden = false;
});
window.addEventListener('appinstalled', () => {
    _deferredInstallPrompt = null;
    const btn = document.getElementById('installApp');
    if (btn) btn.hidden = true;
});

function installApp() {
    if (!_deferredInstallPrompt) return;
    _deferredInstallPrompt.prompt();
    _deferredInstallPrompt.userChoice.finally(() => {
        _deferredInstallPrompt = null;
        const btn = document.getElementById('installApp');
        if (btn) btn.hidden = true;
    });
}

// ===== SHARE (Web Share API + fallback clipboard) =====
function _showToast(msg) {
    let toast = document.getElementById('shareToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'shareToast';
        toast.className = 'share-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('visible');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('visible'), 2500);
}

async function shareApp() {
    const data = {
        title: 'Chronos iRadio',
        text: 'Escuchá Chronos iRadio en vivo:',
        url: 'https://chronosiradio.online/player.html'
    };
    if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
        try { await navigator.share(data); } catch (e) { /* cancelado */ }
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(data.url);
            _showToast('Link copiado al portapapeles');
            return;
        } catch (e) { /* sigue al fallback final */ }
    }
    _showToast('No se pudo compartir');
}

// ===== WHATSAPP CHOICE MODAL =====
function openWhatsAppChoice() {
    const el = document.getElementById('waChoice');
    if (!el) return;
    el.classList.add('active');
    el.setAttribute('aria-hidden', 'false');
}
function closeWhatsAppChoice(event) {
    if (event && event.target && !event.target.matches('.wa-choice, .wa-choice-backdrop, .wa-choice-close')) return;
    const el = document.getElementById('waChoice');
    if (!el) return;
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
}
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWhatsAppChoice({ target: document.querySelector('.wa-choice') });
});
