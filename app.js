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
