// ===== TEAM DATA =====
const teamData = [
    {
        name: 'Km Rodriguez',
        role: 'Creador & Director',
        img: 'assets/team/km-rodriguez.webp',
        desc: 'Creador de Chronos iRadio. Un sueno de su adolescencia, que comienza a hacerse realidad con esta aventura. Su vision y pasion por la radio lo llevaron a construir este proyecto desde cero.'
    },
    {
        name: 'Eryx Rodriguez',
        role: 'Produccion & Locutor',
        img: 'assets/team/eryx-rodriguez.webp',
        desc: 'A pesar de su corta edad, es un amante y conocedor de la buena musica. Esta en la asistencia de produccion y en la conduccion del microprograma Chronos iCom.'
    },
    {
        name: 'Enrique Gonzalez',
        role: 'Voz & Imagen',
        img: 'assets/team/enrique-gonzalez.webp',
        desc: 'Nuestra voz marca, con un talento increible es el que le imprime la personalidad y la imagen a Chronos iRadio. Ademas complice en esta aventura que conduce a un sueno.'
    },
    {
        name: 'Franmary Fernandez',
        role: 'Locutora',
        img: 'assets/team/franmary-fernandez.webp',
        desc: 'Una de las voces que escuchas en Chronos iRadio. Una voz calida sobria con unos matices grandiosos. Licenciada en Comunicacion Social.'
    },
    {
        name: 'Victor Grinfelds',
        role: 'Ingeniero',
        img: 'assets/team/victor-grinfelds.webp',
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

// ===== DYNAMIC YEAR =====
var _y = document.getElementById('year');
if (_y) _y.textContent = new Date().getFullYear();

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

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
function isPlaying() {
    const a = orbAudio();
    if (!a) return false;
    return !a.paused && !a.ended && a.readyState > 2;
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

function playAndExpand() {
    openFullscreenPlayer();
    // Si no está sonando, disparar play. Si ya suena, solo expandir.
    setTimeout(() => {
        if (!isPlaying()) {
            const btn = orbPlayButton();
            if (btn) btn.click();
        }
    }, 150);
}

function openFullscreenPlayer() {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    fsp.classList.add('active');
    fsp.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    syncFspUI();
}

function closeFullscreenPlayer() {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    fsp.classList.remove('active');
    fsp.setAttribute('aria-hidden', 'true');
    // Solo restaurar overflow si no hay otro modal abierto
    if (!document.querySelector('.modal-backdrop.active')) {
        document.body.style.overflow = '';
    }
}

function syncFspUI() {
    const fsp = document.getElementById('fullscreenPlayer');
    if (!fsp) return;
    const audio = orbAudio();
    const playing = isPlaying();
    const loading = audio && !audio.paused && audio.readyState <= 2;
    fsp.classList.toggle('playing', playing);
    fsp.classList.toggle('loading', !!loading && !playing);
    renderPlayIcon(playing);

    const statusText = document.getElementById('fspStatusText');
    if (statusText) {
        if (loading) statusText.textContent = 'Cargando…';
        else if (playing) statusText.textContent = 'En directo';
        else statusText.textContent = 'Pausado';
    }

    const track = document.getElementById('fspTrack');
    if (track) {
        const root = orbRoot();
        const tt = root ? root.querySelector('.orbPtt') : null;
        const text = tt ? (tt.textContent || '').trim() : '';
        track.textContent = text || 'Los clásicos de siempre';
    }
}

// Observa cambios del widget y del audio para sincronizar UI
function attachOrbObservers() {
    const root = orbRoot();
    if (root) {
        const mo = new MutationObserver(syncFspUI);
        mo.observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
    }
    const audio = orbAudio();
    if (audio) {
        ['play', 'pause', 'playing', 'waiting', 'ended', 'error', 'volumechange'].forEach(ev => {
            audio.addEventListener(ev, syncFspUI);
        });
        // Inicializar volumen UI desde el audio
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

// Volumen slider
const fspVol = document.getElementById('fspVolume');
if (fspVol) {
    fspVol.addEventListener('input', (e) => {
        const audio = orbAudio();
        if (audio) audio.volume = parseFloat(e.target.value) / 100;
    });
}

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
