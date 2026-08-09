// ═══ Mobilmeny ═══
(function () {
    const btn = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
        const open = nav.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
    });
    nav.addEventListener('click', e => {
        if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.classList.remove('open'); document.body.style.overflow = ''; }
    });
})();

// ═══ Scroll-reveal ═══
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
})();

// ═══ Lightbox (portfolio) ═══
(function () {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    const img = lb.querySelector('img');
    const items = [...document.querySelectorAll('.g-item')];
    let cur = 0;
    function show(i) { cur = (i + items.length) % items.length; img.src = items[cur].href; img.alt = items[cur].querySelector('img')?.alt || ''; }
    items.forEach((a, i) => a.addEventListener('click', e => {
        e.preventDefault(); show(i); lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
        lb.querySelector('.lb-close').focus();
    }));
    function close() { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); img.src = ''; }
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(cur - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(cur + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
        if (!lb.classList.contains('open')) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') show(cur - 1);
        if (e.key === 'ArrowRight') show(cur + 1);
    });
})();

// ═══ Kontaktformulär ═══
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const status = document.getElementById('formStatus');
    form.addEventListener('submit', async e => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const btn = form.querySelector('button[type=submit]');
        btn.disabled = true; status.textContent = 'Skickar…'; status.className = 'form-status';
        try {
            const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
            const j = await res.json();
            if (j.ok) {
                status.textContent = 'Tack för ditt meddelande! Vi återkommer inom 1–2 arbetsdagar.';
                status.classList.add('ok');
                form.reset();
            } else throw new Error(j.error || 'fel');
        } catch {
            status.textContent = 'Något gick fel — ring eller mejla oss direkt istället.';
            status.classList.add('err');
        }
        btn.disabled = false;
    });
})();

// Årtal i footern
const yEl = document.getElementById('year');
if (yEl) yEl.textContent = new Date().getFullYear();
