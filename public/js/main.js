/* =================================================================
   SAIYAN FOOD — Interactions
   ================================================================= */

/* --- Préférence de mouvement réduit --- */
const MOUVEMENT_REDUIT = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --- Écran de chargement --- */
(function () {
  const ecran = document.getElementById('chargement');
  const barre = document.getElementById('chargement-barre');
  if (!ecran) return;

  // Déjà vu cette session -> masquer immédiatement
  if (sessionStorage.getItem('saiyan-charge')) {
    ecran.style.display = 'none';
    return;
  }

  let animFinie = MOUVEMENT_REDUIT;
  let ressourcesPretes = false;

  function tenter() {
    if (animFinie && ressourcesPretes) {
      ecran.classList.add('chargement--cache');
      sessionStorage.setItem('saiyan-charge', '1');
    }
  }

  if (barre && !MOUVEMENT_REDUIT) {
    barre.addEventListener('animationend', function () { animFinie = true; tenter(); });
  }

  Promise.all([
    new Promise(function (r) { window.addEventListener('load', r, { once: true }); }),
    document.fonts ? document.fonts.ready : Promise.resolve()
  ]).then(function () {
    ressourcesPretes = true;
    // Filet de sécurité si l'animation ne se déclenche pas
    setTimeout(function () { animFinie = true; tenter(); }, MOUVEMENT_REDUIT ? 0 : 200);
    tenter();
  });

  // Garde-fou absolu : jamais bloqué plus de 3,5 s
  setTimeout(function () {
    ecran.classList.add('chargement--cache');
    sessionStorage.setItem('saiyan-charge', '1');
  }, 3500);
})();

/* --- Navbar : état au défilement --- */
(function () {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  function maj() {
    if (window.scrollY > 24) navbar.classList.add('navbar--defile');
    else navbar.classList.remove('navbar--defile');
  }
  maj();
  window.addEventListener('scroll', maj, { passive: true });
})();

/* --- Tiroir de navigation (mobile) --- */
(function () {
  const burger = document.getElementById('nav-burger');
  const tiroir = document.getElementById('nav-tiroir');
  const fond   = document.getElementById('nav-tiroir-fond');
  const fermer = document.getElementById('nav-tiroir-fermer');
  if (!burger || !tiroir) return;

  function ouvrir() {
    tiroir.classList.add('ouvert');
    burger.classList.add('ouvert');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function fermerT() {
    tiroir.classList.remove('ouvert');
    burger.classList.remove('ouvert');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', ouvrir);
  if (fermer) fermer.addEventListener('click', fermerT);
  if (fond) fond.addEventListener('click', fermerT);
  tiroir.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', fermerT); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && tiroir.classList.contains('ouvert')) fermerT();
  });
})();

/* --- Parallaxe légère du hero --- */
(function () {
  if (MOUVEMENT_REDUIT) return;
  const img = document.querySelector('.hero__bg-img');
  if (!img) return;
  let cible = 0, courant = 0, raf = null;
  function boucle() {
    courant += (cible - courant) * 0.08;
    img.style.transform = 'translate3d(0,' + courant.toFixed(2) + 'px,0)';
    if (Math.abs(cible - courant) > 0.1) { raf = requestAnimationFrame(boucle); }
    else { raf = null; }
  }
  window.addEventListener('scroll', function () {
    cible = Math.min(window.scrollY * 0.18, 160);
    if (!raf) raf = requestAnimationFrame(boucle);
  }, { passive: true });
})();

/* --- Bandeaux défilants : duplication pour boucle continue --- */
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.bandeau__piste, .footer__ticker-piste').forEach(function (piste) {
    if (piste.dataset.dup === '1') return;
    Array.from(piste.children).forEach(function (el) {
      const clone = el.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      piste.appendChild(clone);
    });
    piste.dataset.dup = '1';
  });

  /* --- Révélation au scroll --- */
  const cibles = document.querySelectorAll('.reveal');
  if (!cibles.length) return;

  // Affichage immédiat si mouvement réduit ou pas d'IntersectionObserver
  if (MOUVEMENT_REDUIT || !('IntersectionObserver' in window)) {
    cibles.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  const obs = new IntersectionObserver(function (entrees) {
    entrees.forEach(function (entree) {
      if (entree.isIntersecting) {
        entree.target.classList.add('visible');
        obs.unobserve(entree.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  cibles.forEach(function (el) { obs.observe(el); });
});
