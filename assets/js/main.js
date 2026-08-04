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

    /* When the row fits, there is nothing to page through and the arrows are
       decoration claiming to be controls — so the whole group leaves rather
       than sitting there greyed out. It is recomputed on resize because the
       same four cards do overflow on a narrower screen. */
    var group = (prev || next).closest('.rail-nav');

    var sync = function () {
      var max = rail.scrollWidth - rail.clientWidth - 2;
      var scrollable = max > 0;
      if (group) group.hidden = !scrollable;
      if (prev) prev.disabled = !scrollable || rail.scrollLeft <= 2;
      if (next) next.disabled = !scrollable || rail.scrollLeft >= max;
    };
    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  });

  /* -----------------------------------------------------------------------
     Gallery video lightbox — native <dialog>.

     showModal() gives the top layer, the backdrop, Esc-to-close and the
     focus trap for free, and returns focus to the trigger on close. That is
     the whole reason this is not a div: those four behaviours are the ones
     hand-rolled modals get wrong, and the browser cannot get them wrong.

     Only controls that actually carry a source are bound, so no element
     offers an affordance it cannot honour.
     ----------------------------------------------------------------------- */
  var dialogEl = document.getElementById('videoModal');
  var player = document.getElementById('videoModalPlayer');

  if (dialogEl && player && typeof dialogEl.showModal === 'function') {
    var title = document.getElementById('videoModalTitle');

    document.querySelectorAll('[data-video]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        player.src = trigger.getAttribute('data-video');
        if (title) title.textContent = trigger.getAttribute('data-video-title') || 'Video';
        dialogEl.showModal();
      });
    });

    dialogEl.querySelectorAll('[data-dialog-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { dialogEl.close(); });
    });

    /* Click outside the panel closes it. The dialog element itself fills the
       backdrop area, so a click landing on the element rather than on its
       contents is a click on the backdrop. */
    dialogEl.addEventListener('click', function (e) {
      if (e.target === dialogEl) dialogEl.close();
    });

    /* One teardown for every route out — button, Esc, backdrop — so the
       video can never keep playing behind a closed dialog. */
    dialogEl.addEventListener('close', function () {
      player.pause();
      player.removeAttribute('src');
      player.load();
    });
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
     Staged reveals.

     Any [data-scene] plays its [data-rise] children in document order, one
     after another. Two roles: "left" slides in from the side, "up" rises from
     below. Used by the trade-in scene and by the build panel.

     Written in CSS first, on a view-timeline — and that only ran in Chrome and
     Safari 26, so everywhere else the @supports test fell through and the
     motion did not exist at all. An observer plus a transition runs in every
     browser that ships IntersectionObserver.
     ----------------------------------------------------------------------- */
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrow = window.matchMedia('(max-width: 61.99rem)');

  if ('IntersectionObserver' in window) {
    var run = function () {
      // Reduced motion shows everything at once. CSS has already neutralised
      // the start state; this only keeps the two paths in agreement.
      if (reduced.matches) {
        document.querySelectorAll('[data-rise]')
          .forEach(function (el) { el.classList.add('is-in'); });
        return;
      }

      /* Every [data-scene] reveals its own [data-rise] children in document
         order, each 170ms behind the last. The order in the markup IS the
         order on screen, so adding a row or a plate needs no change here.

         Observe the scene wrapper, never the section and never the sticky
         stage: the trade section is three viewports tall, so its visible
         fraction tops out near 0.33 and a higher threshold could never be met;
         and a position:sticky target reports intersection unreliably — one was
         observed here and never fired at all. */
      [].slice.call(document.querySelectorAll('[data-scene]')).forEach(function (scene) {
        var items = [].slice.call(scene.querySelectorAll('[data-rise]'));
        if (!items.length) return;

        /* Default cadence is 170ms. A scene may ask for a slower one — the
           gallery does, because six photographs arriving at conversational
           speed read as a flicker rather than as an unveiling. */
        var stagger = parseInt(scene.getAttribute('data-stagger'), 10) || 170;
        var play = function () {
          items.forEach(function (el, i) {
            setTimeout(function () { el.classList.add('is-in'); }, i * stagger);
          });
        };

        var io = new IntersectionObserver(function (entries, self) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            play();
            self.disconnect();       // one-way: it plays once, then stays
          });
        }, { threshold: 0.25 });
        io.observe(scene);

        /* Belt and braces: if the scene is already on screen at load — a reload
           part-way down, or a jump to #trade — the observer's first callback is
           the only one that will ever arrive, and a missed reveal leaves the
           section permanently blank. Blank content is a far worse failure than
           an un-animated one. */
        requestAnimationFrame(function () {
          var r = scene.getBoundingClientRect();
          var vis = Math.max(0, Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0));
          if (r.height && vis / r.height >= 0.25) { play(); io.disconnect(); }
        });
      });
    };

    run();
    // A width change can cross the release boundary in either direction.
    if (narrow.addEventListener) narrow.addEventListener('change', run);
  }

  /* -----------------------------------------------------------------------
     Trade-in hand-off — the scene sinks as the next section climbs over it.

     The photograph is sticky and stays; its CONTENT sinks a little, softens and
     fades while the following section rides up on top. Reading the overlap off
     the incoming section's own position means the effect is tied to what the
     visitor can actually see, not to a scroll distance guessed in advance.

     A scroll handler rather than scroll-driven CSS, for the same reason as the
     reveal above: animation-timeline only ships in two engines, and this has to
     work in all of them. Work is confined to one rAF per frame and to two
     compositor properties.
     ----------------------------------------------------------------------- */
  /* Every held scene hands off to whatever climbs over it: find each scene and
     pair it with the next overlapping section. Two on the page now — trade-in
     and nationwide — and a third would need no code, only the two classes. */
  var handoffs = [].slice.call(document.querySelectorAll('.scene')).map(function (scene) {
    var next = scene.nextElementSibling;
    while (next && !next.classList.contains('section--overlap')) next = next.nextElementSibling;
    var content = scene.querySelector('.scene__content');
    return {
      next: next,
      items: content ? [].slice.call(content.querySelectorAll('[data-rise]')) : []
    };
  }).filter(function (h) { return h.next && h.items.length; });

  if (handoffs.length && !reduced.matches) {
    var RISE = 130;     // px each element travels upward as it leaves
    var BLUR = 12;      // px of blur at the end of its own travel
    var SPAN = 0.55;    // how much of the hand-off one element's exit occupies
    var ticking = false;

    var clear = function (h) {
      h.items.forEach(function (el) {
        el.style.transform = '';
        el.style.filter = '';
        el.style.opacity = '';
      });
      h.active = false;
    };

    var paint = function () {
      ticking = false;
      var vh = window.innerHeight;

      handoffs.forEach(function (h) {
        if (narrow.matches) { if (h.active) clear(h); return; }

        var top = h.next.getBoundingClientRect().top;
        // 0 while the next section is still below the fold, 1 once it has
        // covered the screen; clamped so overscroll cannot pass either end.
        var p = Math.min(1, Math.max(0, (vh - top) / vh));

        /* At rest the inline styles are REMOVED rather than zeroed. The same
           elements are driven by the CSS reveal transition on the way in, and
           an inline transform would outrank it — leaving them stuck wherever
           the exit last put them. */
        if (p === 0) { if (h.active) clear(h); return; }
        h.active = true;

        /* The scene comes apart in the order it assembled: each element starts
           its own exit a little after the one before, so the head leaves first
           and the last plate last — the assembly running backwards, not the
           whole block sliding off as one slab. */
        var step = h.items.length > 1 ? (1 - SPAN) / (h.items.length - 1) : 0;
        h.items.forEach(function (el, i) {
          var local = Math.min(1, Math.max(0, (p - i * step) / SPAN));
          el.style.transform = 'translate3d(0,' + (-RISE * local).toFixed(1) + 'px,0)';
          el.style.filter = 'blur(' + (BLUR * local).toFixed(2) + 'px)';
          el.style.opacity = String(1 - local);
        });
      });
    };

    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(paint);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    paint();
  }

  /* -----------------------------------------------------------------------
     Footer year
     ----------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* -----------------------------------------------------------------------
     PARALLAX DRIFT
     The car moves against the scroll so the panel reads as depth rather than
     a flat cut-out pasted on a box. The drift is applied to the <img>, not to
     the figure: the figure's own transform belongs to the reveal above, and
     two systems writing one transform would fight.
     ----------------------------------------------------------------------- */
  var floaters = [].slice.call(document.querySelectorAll('[data-parallax]'))
    .map(function (el) {
      return {
        el: el,
        img: el.querySelector('img'),
        amt: parseFloat(el.getAttribute('data-parallax')) || 6
      };
    })
    .filter(function (f) { return f.img; });

  if (floaters.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var driftTicking = false;

    var drift = function () {
      driftTicking = false;
      var vh = window.innerHeight;
      floaters.forEach(function (f) {
        var r = f.el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        /* +1 when the element sits at the bottom edge, -1 at the top */
        var mid = r.top + r.height / 2;
        var p = (mid - vh / 2) / (vh / 2 + r.height / 2);
        f.img.style.transform = 'translate3d(0,' + (p * f.amt).toFixed(2) + '%,0)';
      });
    };

    window.addEventListener('scroll', function () {
      if (!driftTicking) { driftTicking = true; requestAnimationFrame(drift); }
    }, { passive: true });
    window.addEventListener('resize', drift);
    drift();
  }

  /* -----------------------------------------------------------------------
     REVIEWS — an endless rail the active quote is centred on
     Three quotes, so a plain rail leaves the outer two with a neighbour on one
     side and nothing on the other. The set is cloned front and back and the
     rail parks in the middle copy, so every quote has company on both sides.
     Cards never trade places and the track never re-orders; only its offset
     changes. When the selection walks off the middle copy, the offset is reset
     to the identical position in the middle copy WITH THE TRANSITION OFF —
     same pixels, no movement to see.
     ----------------------------------------------------------------------- */
  var reviewTrack = document.querySelector('[data-reviews]');

  if (reviewTrack) {
    var viewport = reviewTrack.parentElement;
    var stage = reviewTrack.closest('.reviews__stage');
    var originals = [].slice.call(reviewTrack.children);
    var count = originals.length;

    /* Clone a copy before and a copy after. Clones are decoration for the eye,
       so they are hidden from assistive tech — the real three still read once. */
    if (count > 1) {
      var head = document.createDocumentFragment();
      var tail = document.createDocumentFragment();
      originals.forEach(function (card) {
        var a = card.cloneNode(true), b = card.cloneNode(true);
        a.setAttribute('aria-hidden', 'true');
        b.setAttribute('aria-hidden', 'true');
        a.classList.add('is-clone');
        b.classList.add('is-clone');
        head.appendChild(a);
        tail.appendChild(b);
      });
      reviewTrack.insertBefore(head, reviewTrack.firstChild);
      reviewTrack.appendChild(tail);
    }

    var slides = [].slice.call(reviewTrack.children);
    var active = count + Math.floor(count / 2);   /* middle copy, middle card */

    var offsetFor = function (i) {
      var slide = slides[i];
      return viewport.clientWidth / 2 - (slide.offsetLeft + slide.offsetWidth / 2);
    };

    var place = function (extra, animate) {
      reviewTrack.classList.toggle('is-dragging', !animate);
      reviewTrack.style.transform =
        'translate3d(' + (offsetFor(active) + (extra || 0)) + 'px, 0, 0)';
    };

    var paintReviews = function (animate) {
      slides.forEach(function (s, i) { s.classList.toggle('is-selected', i === active); });
      place(0, animate !== false);
    };

    /* Snap back into the middle copy once the eye has stopped following. */
    var normalise = function () {
      if (count < 2) return;
      var wrapped = active;
      if (active < count) wrapped = active + count;
      else if (active >= count * 2) wrapped = active - count;
      if (wrapped === active) return;
      active = wrapped;
      slides.forEach(function (s, i) { s.classList.toggle('is-selected', i === active); });
      reviewTrack.style.transition = 'none';
      place(0, false);
      reviewTrack.offsetHeight;                    /* force the style to land */
      reviewTrack.style.transition = '';
      reviewTrack.classList.remove('is-dragging');
    };
    reviewTrack.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'transform') normalise();
    });

    var go = function (i) { active = i; paintReviews(true); };

    var prev = stage && stage.querySelector('.reviews__arrow--prev');
    var next = stage && stage.querySelector('.reviews__arrow--next');
    if (prev) prev.addEventListener('click', function () { go(active - 1); });
    if (next) next.addEventListener('click', function () { go(active + 1); });

    /* Drag: the rail tracks the pointer, then commits only past a third of a
       card — under that it returns, so a stray nudge changes nothing. */
    var startX = 0, dragging = false, moved = 0, wasDrag = 0;

    viewport.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      dragging = true; moved = 0; startX = e.clientX;
      reviewTrack.classList.add('is-dragging');
      viewport.classList.add('is-dragging');
      viewport.setPointerCapture(e.pointerId);
    });

    viewport.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      moved = e.clientX - startX;
      place(moved, false);
    });

    var endDrag = function () {
      if (!dragging) return;
      dragging = false;
      wasDrag = moved;
      viewport.classList.remove('is-dragging');
      reviewTrack.classList.remove('is-dragging');
      var threshold = slides[active].offsetWidth * 0.33;
      if (moved <= -threshold) go(active + 1);
      else if (moved >= threshold) go(active - 1);
      else paintReviews(true);
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    slides.forEach(function (s, i) {
      s.addEventListener('click', function () {
        if (Math.abs(wasDrag) > 6) { wasDrag = 0; return; }
        if (i !== active) go(i);
      });
    });

    window.addEventListener('resize', function () { paintReviews(false); });
    paintReviews(false);
  }

  /* -----------------------------------------------------------------------
     INVENTORY FILTERS
     Real filtering, not a row of decorative pills: each button hides the cards
     that do not match. The rail is re-measured afterwards, because hiding cards
     changes whether there is anything left to scroll — otherwise the arrows
     would keep offering a move the shortened row cannot make.
     ----------------------------------------------------------------------- */
  var filterBar = document.querySelector('[data-filters]');

  if (filterBar) {
    var filterBtns = [].slice.call(filterBar.querySelectorAll('.filter'));
    var vehicles = [].slice.call(document.querySelectorAll('.vehicle[data-status]'));
    var status = document.querySelector('[data-filter-status]');
    var filterRail = document.getElementById('vehicleRail');

    var applyFilter = function (want) {
      var shown = 0;
      vehicles.forEach(function (v) {
        var match = want === 'all' || v.getAttribute('data-status') === want;
        v.hidden = !match;
        if (match) shown++;
      });
      filterBtns.forEach(function (b) {
        var on = b.getAttribute('data-filter') === want;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      /* Announced, because a filter that only changes pixels changes nothing
         for someone not looking at them. */
      if (status) {
        status.textContent = shown + (shown === 1 ? ' vehicle' : ' vehicles') + ' shown';
      }
      if (filterRail) {
        filterRail.scrollLeft = 0;
        window.dispatchEvent(new Event('resize'));   /* re-sync the arrows */
      }
    };

    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyFilter(btn.getAttribute('data-filter'));
      });
    });
  }

  /* -----------------------------------------------------------------------
     SAVE — the control on the photograph
     It has to change something, or it is a bookmark-shaped decoration. The
     header counter is that something: press the control, the number moves.
     State lives on aria-pressed, so the styling and the announcement read from
     one source rather than drifting apart.
     ----------------------------------------------------------------------- */
  var saveBtns = [].slice.call(document.querySelectorAll('.vehicle__save'));
  var savedCount = document.querySelector('[data-saved-count]');

  if (saveBtns.length && savedCount) {
    var total = parseInt(savedCount.textContent, 10) || 0;

    var paintCount = function () {
      /* Two digits, because the header reads "/ 03" — a bare "3" there would
         look like a different control. */
      savedCount.textContent = total < 10 ? '0' + total : String(total);
    };

    saveBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var on = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', on ? 'false' : 'true');
        total = Math.max(0, total + (on ? -1 : 1));
        paintCount();
      });
    });
  }

})();
