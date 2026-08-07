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
     Nav disclosure — "Who We Are" and anything added beside it later.

     The stylesheet already opens this on hover and on focus-within, so the menu
     works before this runs and without it. What script adds is the two things
     CSS cannot do: a TOUCH target that toggles rather than requiring a hover
     that touch does not have, and closing — on Escape, and on a click landing
     anywhere else. Below 62rem it does nothing at all: there the submenu is a
     nested list inside the burger and has nothing to toggle.
     ----------------------------------------------------------------------- */
  var disclosures = [].slice.call(document.querySelectorAll('[data-nav-menu]'));

  if (disclosures.length) {
    var wide = window.matchMedia('(min-width: 62rem)');

    var closeAll = function (except) {
      disclosures.forEach(function (d) {
        if (d !== except) d.setAttribute('aria-expanded', 'false');
      });
    };

    disclosures.forEach(function (d) {
      d.addEventListener('click', function () {
        if (!wide.matches) return;
        var open = d.getAttribute('aria-expanded') === 'true';
        closeAll(d);
        d.setAttribute('aria-expanded', String(!open));
      });
    });

    /* Pointer-down rather than click: a click that opens another control would
       otherwise land before this one closed, and two panels would be open at
       once for a frame. */
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest || !e.target.closest('.site-nav__item--menu')) closeAll(null);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var open = disclosures.filter(function (d) {
        return d.getAttribute('aria-expanded') === 'true';
      })[0];
      if (!open) return;
      open.setAttribute('aria-expanded', 'false');
      open.focus();
    });

    /* Crossing the breakpoint leaves a panel open that is now a nested list. */
    wide.addEventListener('change', function () { closeAll(null); });
  }

  /* -----------------------------------------------------------------------
     Video facade — the player arrives on request, not on load.

     Until this runs the block is a poster and a button, so nothing third-party
     has been fetched and no cookie has been set. The iframe replaces the poster
     only once someone presses play, and it uses the -nocookie host. autoplay is
     honest here rather than rude: the visitor asked for the film by pressing a
     button, so the frame starts where the press expects it to.
     ----------------------------------------------------------------------- */
  [].slice.call(document.querySelectorAll('[data-yt]')).forEach(function (box) {
    var play = box.querySelector('[data-yt-play]');
    if (!play) return;

    play.addEventListener('click', function () {
      var id = box.getAttribute('data-yt');
      if (!id) return;
      var frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) +
                  '?autoplay=1&rel=0&modestbranding=1';
      frame.title = box.getAttribute('data-yt-title') || 'Video';
      frame.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('loading', 'lazy');
      box.replaceChildren(frame);
      /* The press moved focus into a thing that no longer exists, so it is
         handed to the frame rather than left on the document. */
      frame.focus();
    });
  });

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

     The hook is data-current-year, not data-year. The generic name was a
     global selector owning one of the commonest words in the document: the
     moment the inventory cards started carrying the car's model year, every
     one of them had its entire contents replaced with 2026.
     ----------------------------------------------------------------------- */
  document.querySelectorAll('[data-current-year]').forEach(function (el) {
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

  /* -----------------------------------------------------------------------
     Search results (inventory.html)

     Facets and sort run over the DOM rather than over a data model, because
     the cards ARE the data here: the twelve <li> carry data-status, -price,
     -year, -miles, -make and -model, so a filter reads what the page already
     says instead of a second copy that can disagree with it.

     Everything is progressive: with JS off the twelve cards render, the
     selects are ordinary selects, and the form falls back to a GET the server
     can answer. Nothing is hidden by markup.
     ----------------------------------------------------------------------- */
  var facetForm = document.querySelector('[data-facets]');
  var resultList = document.querySelector('[data-results]');

  if (facetForm && resultList) {
    var cards = [].slice.call(resultList.querySelectorAll('.vehicle'));
    var emptyEl = document.querySelector('[data-results-empty]');
    var pagerEl = document.querySelector('.pager__state');
    var sortEl = document.querySelector('[data-sort]');
    var clearBtns = [].slice.call(document.querySelectorAll('[data-facets-clear]'));
    var facetsPanel = document.getElementById('facets');
    var num = function (el, attr) { return parseInt(el.getAttribute(attr), 10) || 0; };

    /* A range endpoint left blank is not a filter. Reading it as 0 is what
       makes an empty "price from" field quietly exclude every car. */
    var bound = function (name, fallback) {
      var el = facetForm.elements[name];
      if (!el || el.value === '') return fallback;
      var v = parseInt(el.value, 10);
      return isNaN(v) ? fallback : v;
    };

    var matches = function (card) {
      var wanted = [].slice.call(facetForm.querySelectorAll('[data-facet="condition"]:checked'))
                     .map(function (i) { return i.value; });
      if (wanted.indexOf(card.getAttribute('data-condition')) === -1) return false;

      var year = num(card, 'data-year');
      if (year < bound('yearFrom', -Infinity) || year > bound('yearTo', Infinity)) return false;

      /* Advanced. These read the same way whether the disclosure is open or
         shut, which is deliberate: a filter the visitor set and then collapsed
         is still a filter they set. */
      var price = num(card, 'data-price');
      if (price < bound('priceFrom', -Infinity) || price > bound('priceTo', Infinity)) return false;

      var milesCap = bound('milesTo', Infinity);
      if (num(card, 'data-miles') > milesCap) return false;

      var hideSold = facetForm.querySelector('[data-facet="hide-sold"]');
      if (hideSold && hideSold.checked && card.getAttribute('data-status') === 'sold') return false;

      var make = facetForm.elements.make ? facetForm.elements.make.value : '';
      if (make && card.getAttribute('data-make') !== make) return false;

      var model = facetForm.elements.model ? facetForm.elements.model.value : '';
      if (model && card.getAttribute('data-model') !== model) return false;

      return true;
    };

    /* True when the query is anything other than "show me everything", which
       is the only condition under which Clear has work to do. */
    var isFiltered = function () {
      if (facetForm.querySelectorAll('[data-facet="condition"]:not(:checked)').length) return true;
      var hs = facetForm.querySelector('[data-facet="hide-sold"]');
      if (hs && hs.checked) return true;
      var names = ['yearFrom', 'yearTo', 'priceFrom', 'priceTo', 'milesTo', 'make', 'model'];
      for (var i = 0; i < names.length; i++) {
        var el = facetForm.elements[names[i]];
        if (el && el.value !== '') return true;
      }
      return false;
    };

    var sortCards = function () {
      if (!sortEl) return;
      var mode = sortEl.value;
      var by = {
        'price-asc':  function (a, b) { return num(a, 'data-price') - num(b, 'data-price'); },
        'price-desc': function (a, b) { return num(b, 'data-price') - num(a, 'data-price'); },
        'year-desc':  function (a, b) { return num(b, 'data-year') - num(a, 'data-year'); },
        'miles-asc':  function (a, b) { return num(a, 'data-miles') - num(b, 'data-miles'); }
      }[mode];
      if (!by) return;
      /* One fragment, one reflow — appending twelve nodes one at a time makes
         the whole grid jump while it re-lays out. */
      var frag = document.createDocumentFragment();
      cards.slice().sort(by).forEach(function (c) { frag.appendChild(c); });
      resultList.appendChild(frag);
    };

    var apply = function () {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = matches(c);
        c.hidden = !ok;
        if (ok) shown++;
      });

      /* The count above the grid is gone; the pager under it is now the only
         place the number is stated, which is where a visitor looks for it
         after reading rather than before. */
      if (pagerEl) {
        pagerEl.innerHTML = '<span class="num-tabular">' + shown + '</span> of ' +
                            '<span class="num-tabular">' + cards.length + '</span> shown';
        pagerEl.parentNode.hidden = shown === 0;
      }
      if (emptyEl) emptyEl.hidden = shown !== 0;
      clearBtns.forEach(function (b) {
        if (b.classList.contains('facets__clear')) b.hidden = !isFiltered();
      });
    };

    /* Range sliders ↔ the From/To fields. One value, two ways in: dragging a
       handle writes the number into the field, typing a number moves the
       handle. The two handles cannot cross — a "from" above its "to" is a
       query that can never match anything, and the control should refuse it
       rather than quietly return nothing. */
    [].slice.call(facetForm.querySelectorAll('[data-range]')).forEach(function (group) {
      var lo = group.querySelector('[data-range-min]');
      var hi = group.querySelector('[data-range-max]');
      var loField = facetForm.elements[lo.getAttribute('data-target')];
      var hiField = facetForm.elements[hi.getAttribute('data-target')];

      var push = function () {
        if (+lo.value > +hi.value) {
          /* Whichever handle moved is the one that stops. */
          if (document.activeElement === lo) lo.value = hi.value;
          else hi.value = lo.value;
        }
        /* An endpoint sitting on the extreme is NOT a filter — writing it into
           the field would turn "no preference" into a bound and start
           excluding rows the visitor never excluded. */
        loField.value = (lo.value === lo.min) ? '' : lo.value;
        hiField.value = (hi.value === hi.max) ? '' : hi.value;
        apply();
      };

      lo.addEventListener('input', push);
      hi.addEventListener('input', push);

      var pull = function () {
        if (loField.value !== '') lo.value = loField.value;
        if (hiField.value !== '') hi.value = hiField.value;
      };
      loField.addEventListener('input', pull);
      hiField.addEventListener('input', pull);

      /* reset() restores the inputs but not this pairing. */
      facetForm.addEventListener('reset', function () {
        setTimeout(function () { lo.value = lo.min; hi.value = hi.max; }, 0);
      });
    });

    facetForm.addEventListener('change', apply);
    facetForm.addEventListener('input', apply);

    /* There is no submit button any more, but Enter inside a text field still
       submits a form — and a page reload would throw away every filter the
       visitor had set. On one column it also closes the panel, because Enter
       there means "I am done", and the results are underneath it. */
    facetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      apply();
      if (facetsPanel && window.matchMedia('(max-width: 61.99rem)').matches) {
        facetsPanel.open = false;
      }
    });

    clearBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        facetForm.reset();
        /* reset() restores the checked ATTRIBUTE, which is what we want, but it
           lands after this handler — so apply runs on the next tick. */
        setTimeout(function () {
          apply();
          /* Nothing is set any more, so the advanced panel has nothing to show
             for being open. */
          var adv = document.getElementById('advanced');
          if (adv) adv.open = false;
        }, 0);
      });
    });

    if (sortEl) {
      sortEl.addEventListener('change', function () { sortCards(); apply(); });
    }

    /* The panel is open in the markup so a no-JS visitor sees every filter.
       Only once the script has run — and only where it overlays the results —
       does it start closed. */
    if (facetsPanel && window.matchMedia('(max-width: 61.99rem)').matches) {
      facetsPanel.open = false;
    }

    sortCards();
    apply();
  }

  /* -----------------------------------------------------------------------
     Vehicle gallery (vehicle.html)

     The thumbnails are real buttons carrying the full-size source, so with JS
     off the strip is still six labelled controls and every photograph is still
     in the document — nothing here is the only way to see an image.
     ----------------------------------------------------------------------- */
  var stage = document.querySelector('[data-stage]');

  if (stage) {
    var stageImg = stage.querySelector('[data-stage-img]');
    var thumbs = [].slice.call(stage.querySelectorAll('[data-thumb]'));
    var indexEl = stage.querySelector('[data-stage-index]');
    var at = 0;

    var show = function (i) {
      at = (i + thumbs.length) % thumbs.length;
      var t = thumbs[at];
      stageImg.src = t.getAttribute('data-src');
      stageImg.alt = t.getAttribute('data-alt') || '';
      thumbs.forEach(function (b, n) {
        b.setAttribute('aria-current', n === at ? 'true' : 'false');
      });
      if (indexEl) indexEl.textContent = (at + 1) + ' / ' + thumbs.length;
      /* Keep the selected thumbnail in view — otherwise the arrows walk the
         selection off the end of a strip that never scrolls. */
      t.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'nearest', inline: 'nearest' });
    };

    thumbs.forEach(function (b, n) {
      b.addEventListener('click', function () { show(n); });
    });

    var prev = stage.querySelector('[data-stage-prev]');
    var next = stage.querySelector('[data-stage-next]');
    if (prev) prev.addEventListener('click', function () { show(at - 1); });
    if (next) next.addEventListener('click', function () { show(at + 1); });

    /* Arrow keys, but only once the gallery itself has focus — hijacking them
       for the whole document would break scrolling everywhere else. */
    stage.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(at - 1); e.preventDefault(); }
      if (e.key === 'ArrowRight') { show(at + 1); e.preventDefault(); }
    });
  }

  /* Save on the detail page shares the header counter with the listing. */
  var vdpSave = document.querySelector('[data-vdp-save]');
  if (vdpSave) {
    vdpSave.addEventListener('click', function () {
      var on = vdpSave.getAttribute('aria-pressed') === 'true';
      vdpSave.setAttribute('aria-pressed', on ? 'false' : 'true');
      var c = document.querySelector('[data-saved-count]');
      if (c) {
        var n = Math.max(0, (parseInt(c.textContent, 10) || 0) + (on ? -1 : 1));
        c.textContent = n < 10 ? '0' + n : String(n);
      }
    });
  }

  /* -----------------------------------------------------------------------
     Tabs (vehicle.html)

     Progressive by construction: the panels are all in the document and all
     visible until this runs. Script is what hides three of them, which is the
     only honest way to ship a control that hides content — with JS off or a
     crawler reading the page, nothing is behind a click.
     ----------------------------------------------------------------------- */
  var tabsRoot = document.querySelector('[data-tabs]');

  if (tabsRoot) {
    var tabs = [].slice.call(tabsRoot.querySelectorAll('[role="tab"]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

    var select = function (i, moveFocus) {
      tabs.forEach(function (t, n) {
        var on = n === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        /* Roving tabindex: one stop for the whole bar, then arrows inside it.
           Six tabs each taking a tab stop is six presses to get past a control
           the visitor may not want at all. */
        t.tabIndex = on ? 0 : -1;
        if (panels[n]) panels[n].hidden = !on;
      });
      if (moveFocus) tabs[i].focus();
    };

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i); });
      t.addEventListener('keydown', function (e) {
        var last = tabs.length - 1;
        if (e.key === 'ArrowRight') { select(i === last ? 0 : i + 1, true); e.preventDefault(); }
        if (e.key === 'ArrowLeft')  { select(i === 0 ? last : i - 1, true); e.preventDefault(); }
        if (e.key === 'Home')       { select(0, true); e.preventDefault(); }
        if (e.key === 'End')        { select(last, true); e.preventDefault(); }
      });
    });

    /* A link to a panel's own id must open that panel, or the anchor lands on
       something display:none and the page appears not to have moved. */
    var openFromHash = function () {
      var id = location.hash.replace('#', '');
      if (!id) return;
      var n = panels.findIndex ? panels.findIndex(function (p) { return p && p.id === 'panel-' + id; }) : -1;
      if (n > -1) select(n);
    };
    window.addEventListener('hashchange', openFromHash);

    select(0);
    openFromHash();

    /* The Photos grid sends its choice to the stage above rather than opening a
       lightbox: the stage is already the large view, and a second one would be
       a second answer to the same question. */
    [].slice.call(tabsRoot.querySelectorAll('[data-photo]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var src = btn.getAttribute('data-photo');
        var thumb = document.querySelector('[data-thumb][data-src="' + src + '"]');
        if (thumb) thumb.click();
        var stageEl = document.querySelector('[data-stage]');
        if (stageEl) stageEl.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'center' });
      });
    });
  }

  /* -----------------------------------------------------------------------
     Configurator (build.html)

     Runs over the DOM: the price of an option lives on the input that selects
     it, so the summary reads what the page already says rather than a second
     copy of the price list that can disagree with it.

     Nothing here is required for the page to work. With JS off every group is
     open, every option is a real radio or checkbox inside a form, and the
     summary shows the base price — which is the honest state of a page that
     cannot add up.
     ----------------------------------------------------------------------- */
  var buildRoot = document.querySelector('.build');

  if (buildRoot) {
    var BASE = 51900;
    var groups = [].slice.call(buildRoot.querySelectorAll('[data-group]'));
    var totalEl = buildRoot.querySelector('[data-total]');
    var labelEl = buildRoot.querySelector('[data-total-label]');
    var remainEl = buildRoot.querySelector('[data-remaining]');
    var configField = buildRoot.querySelector('[data-config-field]');
    var progressBox = buildRoot.querySelector('[data-progress]');
    var progressFill = buildRoot.querySelector('[data-progress-fill]');
    var progressDone = buildRoot.querySelector('[data-progress-done]');
    var progressTotal = buildRoot.querySelector('[data-progress-total]');
    var submitEl = buildRoot.querySelector('[data-submit]');
    var attachedEl = buildRoot.querySelector('[data-attached]');
    var bar = document.querySelector('[data-build-bar]');
    var barTotal = bar && bar.querySelector('[data-bar-total]');
    var barCount = bar && bar.querySelector('[data-bar-count]');

    var money = function (n) {
      return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
    };

    var read = function (group) {
      var chosen = [].slice.call(group.querySelectorAll('input:checked'));
      return chosen.map(function (i) {
        return { label: i.value, price: parseInt(i.getAttribute('data-price'), 10) || 0 };
      });
    };

    var paint = function () {
      /* `answered` and `missing` are different counts and both are needed:
         `missing` is about REQUIRED groups still open, which is what gates the
         estimate; `answered` is every group with a decision in it, which is what
         the progress bar reports. Two of the nine are optional, so one number
         cannot do both jobs. */
      var total = BASE, chosenCount = 0, missing = 0, answered = 0, lines = [];

      groups.forEach(function (group) {
        var id = group.getAttribute('data-group');
        var picks = read(group);
        var sum = picks.reduce(function (a, p) { return a + p.price; }, 0);
        total += sum;

        /* "Standard" is an answer, so it counts as one — but it is not an
           upgrade, so it does not count toward what has been added. */
        var upgrades = picks.filter(function (p) { return p.price > 0; });
        chosenCount += upgrades.length;

        var required = group.hasAttribute('data-required');
        if (required && !picks.length) missing++;
        if (picks.length) answered++;

        var head = group.querySelector('[data-chosen] strong');
        var row = buildRoot.querySelector('[data-row="' + id + '"]');
        var text = picks.length ? picks.map(function (p) { return p.label; }).join(', ') : 'Not selected';

        /* The whole answered state hangs off this one attribute: the mark at the
           head of the row and the ink of the value both read it, so the two can
           never disagree about whether a group is done. */
        if (picks.length) group.setAttribute('data-answered', '');
        else group.removeAttribute('data-answered');

        if (head) head.textContent = text;
        var headPrice = group.querySelector('[data-chosen] .num-tabular');
        if (headPrice) headPrice.remove();
        if (sum > 0) {
          var span = document.createElement('span');
          span.className = 'num-tabular';
          span.textContent = money(sum);
          group.querySelector('[data-chosen]').appendChild(span);
        }

        if (row) {
          row.querySelector('[data-value]').textContent = text;
          /* Three states, three words, and each one is the truth about the row:
             an em dash where nothing has been answered, "Included" where the
             answer costs nothing — the word the option card itself uses, so one
             fact is not printed two ways — and the figure where there is one. */
          row.querySelector('[data-cost]').textContent =
            !picks.length ? '—' : (sum > 0 ? money(sum) : 'Included');
          row.classList.toggle('spec-pairs__row--empty', !picks.length);
        }

        if (picks.length) lines.push(group.querySelector('.optgroup__name').textContent + ': ' + text +
                                     (sum ? ' (' + money(sum) + ')' : ''));
      });

      if (totalEl) totalEl.textContent = money(total);
      /* The label is the truth about the number above it. A partial sum called
         a total is the mockup's own mistake. */
      if (labelEl) labelEl.textContent = missing ? 'Configured so far' : 'Estimated price';
      if (remainEl) {
        remainEl.textContent = missing
          ? missing + (missing === 1 ? ' group still needs an answer.' : ' groups still need an answer.')
          : 'Every group has an answer. This estimate excludes tax, title and delivery.';
      }
      if (progressDone) progressDone.textContent = answered;
      if (progressTotal) progressTotal.textContent = groups.length;
      if (progressFill) progressFill.style.inlineSize = (answered / groups.length * 100) + '%';
      if (progressBox) {
        progressBox.setAttribute('aria-valuemax', groups.length);
        progressBox.setAttribute('aria-valuenow', answered);
        /* The bar is a picture; the words are the fact. Screen readers get the
           sentence, not a percentage they have to translate. */
        progressBox.setAttribute('aria-valuetext', answered + ' of ' + groups.length + ' chosen');
      }

      /* The control tells the truth about what it sends. Nothing is disabled —
         a half-specified car is still a real enquiry and the dealer wants it —
         but "Send my estimate" is a claim, and at 2 of 9 there is no estimate
         yet, only a starting point. The word changes; the action does not. */
      if (submitEl) {
        submitEl.textContent = missing ? 'Send this configuration' : 'Send my estimate';
      }
      if (attachedEl) {
        attachedEl.textContent = missing
          ? 'Your ' + answered + ' of ' + groups.length +
            ' choices travel with this message. We will price the rest with you.'
          : 'All ' + groups.length + ' choices travel with this message, so you do not have to ' +
            'list them again.';
      }

      if (barTotal) barTotal.textContent = money(total);
      if (barCount) {
        barCount.textContent = chosenCount
          ? chosenCount + (chosenCount === 1 ? ' option added' : ' options added')
          : 'Base only';
      }
      if (configField) configField.value = 'Backdraft RT4 — ' + money(total) + '\n' + lines.join('\n');
    };

    buildRoot.addEventListener('change', paint);

    /* ONE GROUP OPEN AT A TIME.
       The mechanism is the `name` attribute the markup carries: <details> with a
       shared name is a native exclusive accordion, so it works with no script at
       all and the browser owns the semantics. Everything below is what the native
       behaviour does NOT give you.

       First, the fallback for browsers that predate `name` — feature-detected,
       not sniffed. */
    var exclusiveIsNative = 'name' in document.createElement('details');
    if (!exclusiveIsNative) {
      groups.forEach(function (g) {
        g.addEventListener('toggle', function () {
          if (!g.open) return;
          groups.forEach(function (other) { if (other !== g) other.open = false; });
        });
      });
    }

    /* Second, and this one bites in every browser: when the group you open sits
       BELOW the one that closes, the page collapses upward under your cursor and
       the heading you just clicked is somewhere else — on a nine-group list the
       jump is most of a screen. So the heading's position is measured before the
       toggle and restored after it, which keeps the thing you touched under the
       point you touched it. behavior:'auto' is explicit because the page sets
       scroll-behavior: smooth, and a correction that animates is a second jump. */
    groups.forEach(function (g) {
      var head = g.querySelector('.optgroup__head');
      if (!head) return;
      head.addEventListener('click', function () {
        var before = head.getBoundingClientRect().top;
        requestAnimationFrame(function () {
          var delta = head.getBoundingClientRect().top - before;
          if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: 'auto' });
        });
      });
    });

    /* A radio cannot be unset by clicking it again — the browser will not do it,
       and there is no longer a "Standard" card to switch to now that the groups
       carry exactly the options the workshop offers. So a second click on the
       chosen card clears the group: without it a visitor who opens Upholstery
       out of curiosity is holding a $950 option they never wanted and has no way
       to put it back. */
    buildRoot.addEventListener('mousedown', function (e) {
      var input = e.target.closest ? e.target.closest('.optcard') : null;
      if (!input) return;
      var field = input.querySelector('input[type="radio"]');
      if (field && field.checked) {
        /* mousedown fires before the click that would re-check it. */
        setTimeout(function () { field.checked = false; paint(); }, 0);
      }
    });
    /* And from the keyboard, where the same problem exists. */
    buildRoot.addEventListener('keydown', function (e) {
      if (e.key !== 'Backspace' && e.key !== 'Delete') return;
      var f = document.activeElement;
      if (f && f.type === 'radio' && f.checked) { f.checked = false; paint(); e.preventDefault(); }
    });

    /* The phone bar carries the number; the list it belongs to is one tap away. */
    if (bar) {
      bar.hidden = false;
      var open = bar.querySelector('[data-bar-open]');
      if (open) {
        open.addEventListener('click', function () {
          var panel = buildRoot.querySelector('.build__summary');
          if (panel) panel.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' });
        });
      }
    }

    /* Which groups start open is a fact of the DOCUMENT, not a thing script
       does to it: the `open` attribute is on the first three in the markup, so
       they are open in the first paint, open with no JS at all, and the page no
       longer arrives shut and then snaps. Nine open accordions is not a form,
       it is a wall — hence three and not nine. */

    paint();
  }

  /* -----------------------------------------------------------------------
     FAQ — a soft disclosure

     <details> opens in one frame and no stylesheet changes that: the browser
     hides the closed content outright, so there is no height to transition
     FROM. ::details-content fixes it natively but only in the newest Chrome,
     which would leave most visitors with the hard cut and a few with the soft
     one — a worse outcome than either. So the animation is driven here.

     The element stays a real <details> the whole time. Script gone, motion
     suppressed, or the browser mid-update: the native open/close runs and the
     answers are still reachable. Nothing below hides content.

     Height is the one layout property this page animates. There is no
     transform equivalent for a panel of unknown height that does not distort
     the type, so the cost is paid deliberately: short durations, only while a
     row is actually moving, and never more than one row at a time.
     ----------------------------------------------------------------------- */
  var faqItems = document.querySelectorAll('.faq__item');

  if (faqItems.length && motionOK) {
    var css = getComputedStyle(document.documentElement);
    var seconds = function (name, fallback) {
      var v = parseFloat(css.getPropertyValue(name));
      return (v ? v : fallback) * 1000;
    };
    /* Straight from the token scale, so a change there moves this with it.
       Entering decelerates, leaving accelerates, and the exit is one step
       quicker than the entrance — a disclosure that closes slower than it
       opens feels stuck. */
    var OPEN_MS  = seconds('--dur-3', 0.4);
    var CLOSE_MS = seconds('--dur-2', 0.25);
    var EASE_IN_ANIM  = css.getPropertyValue('--ease-out').trim() || 'ease-out';
    var EASE_OUT_ANIM = css.getPropertyValue('--ease-in').trim()  || 'ease-in';

    /* ONE ANSWER OPEN AT A TIME.
       The mechanism is the `name` attribute in the markup: <details> sharing a
       name is a native exclusive accordion, so with no script at all — and
       under reduced motion, where none of this binds — the browser owns the
       behaviour and opening one shuts the rest. Everything below is only what
       native does NOT give: the closing answer collapses instead of vanishing
       in a frame, which is the whole point of having softened the opening. */
    var faqState = new WeakMap();   /* item → running animation */

    var animatePanel = function (item, opening, done) {
      var panel = item.querySelector('.faq__a');
      if (!panel) return null;

      var prev = faqState.get(item);
      if (prev) prev.cancel();      /* interruptible, never queued */

      var settle = function () {
        panel.style.removeProperty('height');
        panel.style.removeProperty('overflow');
        panel.style.removeProperty('opacity');
        faqState.delete(item);
      };

      /* The panel has to be in the document to be measured, so the attribute
         goes on first and the travel is animated afterwards. */
      if (opening) item.open = true;

      var full = panel.scrollHeight;
      panel.style.overflow = 'hidden';

      var anim = panel.animate(
        opening
          ? [{ height: '0px', opacity: 0 }, { height: full + 'px', opacity: 1 }]
          : [{ height: full + 'px', opacity: 1 }, { height: '0px', opacity: 0 }],
        {
          duration: opening ? OPEN_MS : CLOSE_MS,
          easing: opening ? EASE_IN_ANIM : EASE_OUT_ANIM
        }
      );

      anim.onfinish = function () {
        if (!opening) item.open = false;
        settle();
        if (done) done();
      };
      /* A cancelled animation must not leave an inline height behind, or the
         next open measures the wrong number. */
      anim.oncancel = settle;

      faqState.set(item, anim);
      return anim;
    };

    faqItems.forEach(function (item) {
      var summary = item.querySelector('.faq__q');
      if (!summary || !item.querySelector('.faq__a')) return;

      summary.addEventListener('click', function (e) {
        e.preventDefault();

        if (item.open) { animatePanel(item, false); return; }

        /* Whoever has to give way. Collected before anything moves. */
        var leaving = [];
        faqItems.forEach(function (other) { if (other !== item && other.open) leaving.push(other); });

        if (!leaving.length) { animatePanel(item, true); return; }

        /* THE NATIVE EXCLUSIVITY HAS TO STAND ASIDE FOR THE LENGTH OF THE
           TRANSITION. Setting `open` on a named <details> makes the browser
           shut its siblings in the same frame — measured: the outgoing answer
           vanished instantly while the incoming one animated, which is the
           hard cut moved rather than removed. So `name` comes off for the
           handover and goes back on once the outgoing row has actually
           closed, at which point exactly one is open and restoring it changes
           nothing. Anyone without JS still gets the native group. */
        var names = [];
        faqItems.forEach(function (d, i) { names[i] = d.getAttribute('name'); d.removeAttribute('name'); });
        var restoreNames = function () {
          faqItems.forEach(function (d, i) { if (names[i] != null) d.setAttribute('name', names[i]); });
        };

        /* WHEN WHAT CLOSES SITS ABOVE WHAT OPENS, the page pulls up by the
           height it gives back and the question you just clicked slides out
           from under the cursor — on a five-row list, most of a screen.

           Pinning the clicked ROW rather than tracking the closing panel is
           both simpler and exactly right: it holds whatever the transition
           does above it, however many rows collapse and whatever easing they
           use. Scrolling is instant here on purpose — the page sets
           scroll-behavior: smooth, and a correction that animates is a second
           movement rather than the cancellation of the first. */
        var anchor = summary.getBoundingClientRect().top;
        var pinned = true;
        var release = function () { pinned = false; };

        /* A visitor who scrolls mid-handover outranks the correction. */
        window.addEventListener('wheel', release, { once: true, passive: true });
        window.addEventListener('touchmove', release, { once: true, passive: true });

        var hold = function () {
          if (!pinned) return;
          var drift = summary.getBoundingClientRect().top - anchor;
          /* `behavior: instant` is not decoration. The page sets
             scroll-behavior: smooth globally, so a plain scrollBy here gets
             SMOOTHED — every frame's correction started easing toward a target
             the next frame had already moved, and the row still drifted 24px.
             The correction has to land in the frame that asks for it. */
          if (Math.abs(drift) > 0.5) window.scrollBy({ top: drift, behavior: 'instant' });
          window.requestAnimationFrame(hold);
        };
        window.requestAnimationFrame(hold);

        var pendingCloses = leaving.length;
        leaving.forEach(function (other) {
          animatePanel(other, false, function () {
            if (--pendingCloses) return;
            restoreNames();
            /* The last layout change is `open = false` removing the panel from
               flow, and it happens in this callback — so the pin is held for
               two more frames to catch it, then let go. */
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(release);
            });
          });
        });
        animatePanel(item, true);
      });
    });
  }

})();
