/* MM projekti — Načrt/Blueprint interactions */
(function () {
  'use strict';

  // Mark JS available → enables reveal/animation gating (no-JS shows everything)
  document.documentElement.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    var navbar   = document.getElementById('navbar');
    var navToggle = document.getElementById('navToggle');
    var navLinks  = document.getElementById('navLinks');

    /* --- Nav scroll state --- */
    var onScroll = function () {
      navbar.classList.toggle('scrolled', window.scrollY > 16);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* --- Mobile nav toggle (with aria-expanded) --- */
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Zapri meni' : 'Odpri meni');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Odpri meni');
      });
    });

    /* --- Scroll reveal with per-grid stagger --- */
    var groups = ['.areas-grid', '.about-values'];
    groups.forEach(function (sel) {
      var parent = document.querySelector(sel);
      if (!parent) return;
      var items = parent.querySelectorAll('.reveal');
      items.forEach(function (el, i) { el.style.setProperty('--d', (i * 70) + 'ms'); });
    });

    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* --- Hero blueprint draw-in --- */
    var plate = document.querySelector('.hero-plate');
    if (plate) {
      if (reduceMotion) {
        plate.classList.add('drawn');
      } else {
        requestAnimationFrame(function () {
          setTimeout(function () { plate.classList.add('drawn'); }, 350);
        });
      }
    }

    /* --- Scroll-spy active nav link --- */
    var sections = document.querySelectorAll('main section[id], header.hero');
    var linkFor = {};
    navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
      linkFor[a.getAttribute('href').slice(1)] = a;
    });
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var id = e.target.id;
          navLinks.querySelectorAll('a').forEach(function (a) { a.classList.remove('active'); });
          if (linkFor[id]) linkFor[id].classList.add('active');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { if (s.id) spy.observe(s); });
    }

    /* --- AJAX contact form (Formspree) with feedback + honeypot --- */
    var form = document.getElementById('contactForm');
    var status = document.getElementById('formStatus');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        status.className = 'form-status';
        status.textContent = '';

        // honeypot: if filled → silently drop
        if (form.querySelector('[name="_gotcha"]').value) { return; }

        if (!form.checkValidity()) {
          status.className = 'form-status err';
          status.textContent = 'Prosimo, izpolnite vsa polja in potrdite soglasje.';
          form.reportValidity();
          return;
        }

        var btn = form.querySelector('button[type="submit"]');
        var btnHTML = btn.innerHTML;
        btn.disabled = true;
        btn.textContent = 'Pošiljam…';

        fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        }).then(function (res) {
          if (res.ok) {
            form.reset();
            status.className = 'form-status ok';
            status.textContent = 'Hvala! Sporočilo je bilo poslano. Odgovorimo v najkrajšem času.';
          } else {
            return res.json().then(function (data) {
              throw new Error(data && data.errors ? data.errors.map(function (x) { return x.message; }).join(', ') : 'napaka');
            });
          }
        }).catch(function () {
          status.className = 'form-status err';
          status.textContent = 'Oddaja ni uspela. Pišite nam na matej.moharic@gmail.com ali pokličite +386 41 891 030.';
        }).finally(function () {
          btn.disabled = false;
          btn.innerHTML = btnHTML;
        });
      });
    }
  });
})();
