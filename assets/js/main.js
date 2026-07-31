/* =========================================================================
   HINDERER MOTOR COMPANY — behaviour
   Progressive: every feature below is an enhancement. With this file absent
   or broken the page is still complete, readable and navigable.
   ========================================================================= */

(function () {
  'use strict';

  var motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -----------------------------------------------------------------------
     Header — the persistent mass stops being an overlay after the hero, so
     nav contrast no longer depends on whatever photograph is underneath.
     ----------------------------------------------------------------------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var setHeaderState = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    setHeaderState();
    window.addEventListener('scroll', setHeaderState, { passive: true });
  }

  /* -----------------------------------------------------------------------
     Mobile navigation
     ----------------------------------------------------------------------- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.getElementById('siteNav');

  if (navToggle && nav) {
    var mq = window.matchMedia('(min-width: 62rem)');

    /* Open/closed is expressed only through aria-expanded; the stylesheet
       reads it. One source of truth, and no state that CSS and JS can
       disagree about. */
    var setOpen = function (open) { navToggle.setAttribute('aria-expanded', String(open)); };

    navToggle.addEventListener('click', function () {
      setOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });

    nav.addEventListener('click', function (e) {
      if (!mq.matches && e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        navToggle.focus();
      }
    });

    mq.addEventListener('change', function () { setOpen(false); });
    setOpen(false);
  }

  /* -----------------------------------------------------------------------
     Inventory rail — the arrows are a convenience on top of native
     scrolling, keyboard access and touch, never the only way through.
     ----------------------------------------------------------------------- */
  var scrollRail = function (rail, direction) {
    var card = rail.querySelector('li');
    var step = card
      ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 24)
      : rail.clientWidth * 0.8;
    rail.scrollBy({ left: step * direction, behavior: motionOK ? 'smooth' : 'auto' });
  };

  document.querySelectorAll('[data-rail-prev], [data-rail-next]').forEach(function (btn) {
    var id = btn.getAttribute('data-rail-prev') || btn.getAttribute('data-rail-next');
    var dir = btn.hasAttribute('data-rail-prev') ? -1 : 1;
    var rail = document.getElementById(id);
    if (!rail) { btn.hidden = true; return; }
    btn.addEventListener('click', function () { scrollRail(rail, dir); });
  });

  /* Disable an arrow that can no longer do anything, so the control never
     lies about what it will do. */
  document.querySelectorAll('.rail').forEach(function (rail) {
    var prev = document.querySelector('[data-rail-prev="' + rail.id + '"]');
    var next = document.querySelector('[data-rail-next="' + rail.id + '"]');
    if (!prev && !next) return;

    var sync = function () {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
    };
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* -----------------------------------------------------------------------
     Reviews — a control that cannot do anything must not be offered.
     With one page of reviews the arrows are removed; add a second
     .carousel-item and they return on their own.
     ----------------------------------------------------------------------- */
  var reviewsCarousel = document.getElementById('reviewsCarousel');
  if (reviewsCarousel) {
    var slides = reviewsCarousel.querySelectorAll('.carousel-item').length;
    var reviewsNav = document.querySelector('.reviews__nav');
    if (reviewsNav && slides < 2) reviewsNav.hidden = true;
  }

  /* -----------------------------------------------------------------------
     Gallery video lightbox — only bound to controls that actually carry a
     source, so no element offers an affordance it cannot honour.
     ----------------------------------------------------------------------- */
  var modalEl = document.getElementById('videoModal');
  var player = document.getElementById('videoModalPlayer');

  if (modalEl && player && window.bootstrap) {
    var modal = new window.bootstrap.Modal(modalEl);

    document.querySelectorAll('[data-video]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        player.src = trigger.getAttribute('data-video');
        document.getElementById('videoModalTitle').textContent =
          trigger.getAttribute('data-video-title') || 'Video';
        modal.show();
      });
    });

    modalEl.addEventListener('hidden.bs.modal', function () {
      player.pause();
      player.removeAttribute('src');
      player.load();
    });
  }

  /* -----------------------------------------------------------------------
     Pinned trade-in sequence (variant C only)

     The four steps are a sequence in the content itself, so the choreography
     has a subject: it moves the visitor through the process one stage at a
     time. Everything here is opt-in — the class that switches the CSS on is
     added only when motion is allowed, the viewport has the room, and this
     script actually ran. Without it the section is the ordinary stacked one.
     ----------------------------------------------------------------------- */
  var scrolly = document.querySelector('[data-scrolly]');

  if (scrolly) {
    /* The frame needs room in BOTH axes: a 100vh stage on a short window
       clips its own heading, and clipping content is never an acceptable
       price for an effect. Short or narrow windows get the stacked section. */
    var wide = window.matchMedia('(min-width: 62rem) and (min-height: 780px)');
    var steps = Array.prototype.slice.call(scrolly.querySelectorAll('.step'));

    /* One rect read and four class toggles — cheap enough to run straight off
       the passive scroll event. Deferring it to requestAnimationFrame added a
       dependency on the compositor producing frames, which is not something a
       reveal should be able to lose. */
    var paint = function () {
      if (!document.documentElement.classList.contains('scrolly')) return;

      var travel = scrolly.offsetHeight - window.innerHeight;
      var p = travel > 0
        ? Math.min(1, Math.max(0, -scrolly.getBoundingClientRect().top / travel))
        : 1;

      /* Four beats inside the first half of the travel; the rest of the pin is
         the pause before the next section rides over it. */
      steps.forEach(function (el, i) {
        el.classList.toggle('is-in', p >= 0.06 + (i * 0.11));
      });
      scrolly.classList.toggle('is-complete', p >= 0.52);
    };

    var sync = function () {
      var on = motionOK && wide.matches;
      document.documentElement.classList.toggle('scrolly', on);
      if (on) {
        paint();
      } else {
        /* Leaving the mode must leave the content complete, not mid-reveal. */
        steps.forEach(function (el) { el.classList.remove('is-in'); });
        scrolly.classList.remove('is-complete');
      }
    };

    /* Two drivers, on purpose. The scroll event gives per-frame precision
       where it is delivered; an IntersectionObserver with a dense threshold
       list fires on position change whether or not a scroll event arrives,
       which is what makes the reveal survive environments that never
       dispatch one. Both call the same idempotent paint. */
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('load', paint);
    window.addEventListener('resize', sync);
    wide.addEventListener('change', sync);

    if ('IntersectionObserver' in window) {
      var thresholds = [];
      for (var t = 0; t <= 100; t++) thresholds.push(t / 100);
      new IntersectionObserver(paint, { threshold: thresholds }).observe(scrolly);
    }

    sync();
  }

  /* -----------------------------------------------------------------------
     Reveal-on-scroll — the hook the animation pass extends.
     Content is hidden ONLY by script and ONLY when motion is allowed, so a
     reduced-motion request or a JS failure both leave the page complete.
     ----------------------------------------------------------------------- */
  if (motionOK && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ok');

    var targets = document.querySelectorAll('[data-reveal]');
    targets.forEach(function (el) { el.setAttribute('data-reveal', 'pending'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.setAttribute('data-reveal', 'in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.05 });

    targets.forEach(function (el) { io.observe(el); });
  }

  /* -----------------------------------------------------------------------
     Footer year
     ----------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

})();
