import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'c:/____WORK/HINDERER COBRAS';
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const write = (f, s) => fs.writeFileSync(path.join(ROOT, f), s);

/* ---------- section surgery -------------------------------------------- */

const MARK = '  <!-- ===================================================================';

function sectionRange(html, n) {
  const head = `${MARK}\n       ${n} · `;
  const start = html.indexOf(head);
  if (start < 0) throw new Error(`section ${n} not found`);
  let end = html.indexOf(MARK, start + head.length);
  if (end < 0) end = html.indexOf('</main>');
  if (end < 0) throw new Error(`end of section ${n} not found`);
  return [start, end];
}

function replaceSection(html, n, body) {
  const [s, e] = sectionRange(html, n);
  return html.slice(0, s) + body + html.slice(e);
}

function must(html, needle, label) {
  if (!html.includes(needle)) throw new Error(`expected ${label}: ${needle.slice(0, 60)}`);
  return html;
}

function swap(html, from, to, label, expect = 1) {
  const n = html.split(from).length - 1;
  if (n !== expect) throw new Error(`${label}: expected ${expect} occurrence(s), found ${n}`);
  return html.split(from).join(to);
}

/* ---------- shared data ------------------------------------------------- */

const CARS = [
  { state: 'sold', badge: 'Sold',    title: '1965 Roadster Shelby Cobra Replica', price: '$92,995',
    miles: '1,184', engine: '427 V8',          gearbox: '5-speed', stock: '235455' },
  { state: 'new',  badge: 'New',     title: '1965 Backdraft RT4B Roadster',       price: '$109,500',
    miles: '62',    engine: '427 FE V8',       gearbox: '5-speed', stock: '235612' },
  { state: 'just', badge: 'Just In', title: '1966 Roadster 427 S/C Replica',      price: '$98,750',
    miles: '3,420', engine: '351 V8',  gearbox: '5-speed', stock: '235588' },
  { state: 'sold', badge: 'Sold',    title: '1965 Roadster Shelby Cobra Replica', price: '$89,900',
    miles: '7,865', engine: '302 V8',          gearbox: '4-speed', stock: '235401' },
  { state: 'just', badge: 'Just In', title: '1967 Backdraft RT3 Roadster',        price: '$114,900',
    miles: '240',   engine: '302 V8',     gearbox: '5-speed', stock: '235630' },
];

const cardActions = `        <div class="vehicle__actions">
          <button class="btn-card" type="button"><span class="btn-card__icon btn-card__icon--share"></span>Share</button>
          <button class="btn-card" type="button"><span class="btn-card__icon btn-card__icon--save"></span>Save</button>
          <a class="btn-card" href="sms:+17406182466"><span class="btn-card__icon btn-card__icon--text"></span>Text</a>
        </div>`;

/* plateClass: '' in variant A (uses .vehicle__specs), 'plate plate--light' from B on */
const card = (c, plateClass) => {
  const dl = plateClass
    ? `        <dl class="vehicle__specs ${plateClass}">`
    : `        <dl class="vehicle__specs">`;
  return `      <li class="vehicle vehicle--${c.state}">
        <div class="vehicle__media">
          <img src="assets/img/inventory-1.jpg" alt="${c.title}" width="381" height="278" loading="lazy">
          <p class="vehicle__status">${c.badge}</p>
        </div>
        <div class="vehicle__head">
          <h3 class="vehicle__title"><a href="vehicle.html">${c.title}</a></h3>
          <p class="vehicle__price">${c.price}</p>
        </div>
${dl}
          <dt>Miles</dt><dd>${c.miles}</dd>
          <dt>Engine</dt><dd>${c.engine}</dd>
          <dt>Gearbox</dt><dd>${c.gearbox}</dd>
          <dt>Stock</dt><dd>${c.stock}</dd>
        </dl>
${cardActions}
      </li>`;
};

const railHead = `      <div class="rail-head">
        <h2 class="visually-hidden" id="inventoryTitle">Current inventory</h2>
        <p class="eyebrow">Available now</p>
        <div class="rail-nav">
          <button class="btn-round" type="button" data-rail-prev="vehicleRail">
            <span class="visually-hidden">Scroll inventory left</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="btn-round" type="button" data-rail-next="vehicleRail">
            <span class="visually-hidden">Scroll inventory right</span>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>`;

const stockFilter = (openClass = '') => `      <!-- A2 · The means the Figma did not have. A dealer homepage that shows
           five cars and a link is a window display, not a way of finding a car.
           Posts to inventory.html; wire to the real feed there. -->
      <form class="stock-filter${openClass}" action="inventory.html" method="get" role="search" aria-label="Search inventory">
        <div class="field">
          <label class="field__label" for="f-model">Model</label>
          <select class="field__control" id="f-model" name="model">
            <option value="">Any model</option>
            <option>Shelby Cobra Replica</option>
            <option>Backdraft RT4B</option>
            <option>Backdraft RT3</option>
            <option>427 S/C Replica</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="f-price">Price up to</label>
          <select class="field__control" id="f-price" name="price_max">
            <option value="">Any price</option>
            <option value="75000">$75,000</option>
            <option value="100000">$100,000</option>
            <option value="125000">$125,000</option>
            <option value="150000">$150,000</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="f-status">Status</label>
          <select class="field__control" id="f-status" name="status">
            <option value="">Any status</option>
            <option value="available">Available</option>
            <option value="new">New arrival</option>
            <option value="just-in">Just in</option>
          </select>
        </div>
        <div class="field">
          <label class="field__label" for="f-q">Stock number</label>
          <input class="field__control" id="f-q" name="q" type="search" placeholder="e.g. 235612">
        </div>
        <button class="btn-hmc btn-hmc--secondary btn-hmc--centred stock-filter__submit" type="submit">Search stock</button>
        <p class="stock-filter__count"><b>5</b> roadsters in stock · updated daily</p>
      </form>`;

const inventorySection = (plateClass, openClass) => `${MARK}
       2 · INVENTORY RAIL
       =================================================================== -->
  <section class="section section--tight-top" id="inventory" aria-labelledby="inventoryTitle">
    <div class="wrap">

${railHead}

${stockFilter(openClass)}
    </div>

    <ul class="rail" id="vehicleRail" tabindex="0" role="list"
        aria-label="Inventory — scroll horizontally">

      <!-- VEHICLE CARD — the repeating unit. Duplicate one <li> per vehicle.
           Titles, prices, mileage, engines and stock numbers are PLACEHOLDERS
           standing in for the real feed; only the photograph is final. -->
${CARS.map(c => card(c, plateClass)).join('\n\n')}

    </ul>

    <div class="wrap">
      <div class="cta-centre">
        <a class="btn-hmc btn-hmc--secondary btn-hmc--centred btn-hmc--wide" href="inventory.html">View All Inventory</a>
      </div>
    </div>
  </section>


`;

/* ---------- gallery: every tile captioned -------------------------------- */

/* A tile only carries a play glyph when a film actually exists behind it —
   an affordance that cannot be honoured costs the visitor an attempt and the
   page its credibility. Drop the two films into assets/video/, put their
   paths back on `video:` below, and the glyph and the lightbox return. */
const GAL = [
  { cls: 'a', img: 'gallery-1.jpg', w: 615, h: 390, alt: 'A purple roadster photographed head-on in the showroom',
    cap: 'Exterior — showroom floor, Heath OH' },
  { cls: 'd', img: 'gallery-4.jpg', w: 615, h: 573, alt: 'The cockpit of a finished roadster, wheel and red shift knob',
    cap: 'Interior — cockpit and shifter',
    video: null /* 'assets/video/gallery-01.mp4' */, title: 'Roadster walkaround' },
  { cls: 'b', img: 'gallery-2.jpg', w: 457, h: 614, alt: 'Windscreen and wing mirror against a blue body',
    cap: 'Detail — screen and mirror' },
  { cls: 'f', img: 'gallery-6.jpg', w: 457, h: 573, alt: 'Backdraft Racing badge on a louvred bonnet',
    cap: 'Detail — Backdraft badge' },
  { cls: 'c', img: 'gallery-3.jpg', w: 457, h: 352, alt: 'Steering wheel, dash and gauges seen from the passenger side',
    cap: 'Interior — dash and gauges',
    video: null /* 'assets/video/gallery-02.mp4' */, title: 'Cockpit and gauges' },
  { cls: 'e', img: 'gallery-5.jpg', w: 457, h: 525, alt: 'A blue roadster parked on grass outside the workshop',
    cap: 'Exterior — outside the workshop' },
];

const galTile = g => g.video
  ? `        <button class="gallery__item gallery__item--${g.cls} gallery__item--video" type="button"
                data-video="${g.video}" data-video-title="${g.title}">
          <img src="assets/img/${g.img}" alt="${g.alt}" width="${g.w}" height="${g.h}" loading="lazy">
          <img class="gallery__play" src="assets/icons/play.svg" alt="" aria-hidden="true" width="142" height="142">
          <span class="gallery__caption">${g.cap}</span>
        </button>`
  : `        <figure class="gallery__item gallery__item--${g.cls} m-0">
          <img src="assets/img/${g.img}" alt="${g.alt}" width="${g.w}" height="${g.h}" loading="lazy">
          <figcaption class="gallery__caption--static">${g.cap}</figcaption>
        </figure>`;

const gallerySection = (legend, headClass) => `${MARK}
       8 · GALLERY
       =================================================================== -->
  <section class="section" id="gallery" aria-labelledby="galleryTitle">
    <div class="wrap">
      <div class="section-head section-head--centre${headClass} stack">
        <h2 class="section-title" id="galleryTitle">The Hinderer Motor Company</h2>
        <p class="section-sub">Gallery</p>
      </div>
${legend}
      <div class="gallery">
${GAL.map(galTile).join('\n\n')}
      </div>
    </div>
  </section>


`;

/* ---------- contact: hours + directions ---------------------------------- */

const contactSection = `${MARK}
       10 · CONTACT
       =================================================================== -->
  <section class="section contact" id="contact" aria-labelledby="contactTitle">
    <div class="wrap">
      <div class="contact__grid">

        <div class="contact__map">
          <a href="https://maps.google.com/?q=1555+Hebron+Rd,+Heath,+OH+43056" target="_blank" rel="noopener">
            <img src="assets/img/map.jpg" alt="Map showing Hinderer Motor Company at 1555 Hebron Rd, Heath, Ohio" width="1248" height="500" loading="lazy">
          </a>
        </div>

        <div class="contact__panel">
          <h2 class="contact__title" id="contactTitle">Connect with<br>Us for details</h2>

          <address class="contact__address">
            Hinderer Motor Company<br>
            1555 Hebron Rd<br>
            Heath, OH 43056<br><br>
            Call us: <a href="tel:+17406182466" class="num-tabular">740.618.2466</a>
          </address>

          <!-- A7 · Hours and directions are means of the task, not decoration.
               Replace the placeholder times with the real ones. -->
          <dl class="hours u-mt-5">
            <dt>Mon – Fri</dt><dd>9:00 – 18:00</dd>
            <dt>Saturday</dt><dd>9:00 – 16:00</dd>
            <dt>Sunday</dt><dd>Closed</dd>
          </dl>

          <a class="directions-link" href="https://maps.google.com/?q=1555+Hebron+Rd,+Heath,+OH+43056" target="_blank" rel="noopener">
            Get directions
            <span aria-hidden="true">→</span>
          </a>

          <div class="contact__foot">
            <a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="contact.html">Contact Us</a>

            <ul class="social">
              <li><a href="#" aria-label="Hinderer Motor Company on Instagram"><img src="assets/icons/social-instagram.svg" alt="" aria-hidden="true" width="21" height="21"></a></li>
              <li><a href="#" aria-label="Hinderer Motor Company on Facebook"><img src="assets/icons/social-facebook.svg" alt="" aria-hidden="true" width="21" height="21"></a></li>
              <li><a href="#" aria-label="Hinderer Motor Company on X"><img src="assets/icons/social-x.svg" alt="" aria-hidden="true" width="21" height="21"></a></li>
              <li><a href="#" aria-label="Hinderer Motor Company on YouTube"><img src="assets/icons/social-youtube.svg" alt="" aria-hidden="true" width="21" height="21"></a></li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  </section>

`;

/* ---------- footer ------------------------------------------------------- */

const FOOTER_OLD_START = '<footer class="site-footer">';
const footerNew = `<footer class="site-footer">
  <!-- A7 · The Figma footer is one copyright line. Hours, address and the
       section links are means of the task, and a means is never cut. -->
  <div class="wrap footer-main">
    <div class="footer-grid">

      <div class="footer-col">
        <h2 class="footer-col__title">Inventory</h2>
        <ul class="footer-list">
          <li><a href="inventory.html">All roadsters</a></li>
          <li><a href="inventory.html?status=just-in">Just arrived</a></li>
          <li><a href="inventory.html?status=sold">Recently sold</a></li>
          <li><a href="saved.html">My collection</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Build &amp; own</h2>
        <ul class="footer-list">
          <li><a href="build.html">Build your own</a></li>
          <li><a href="finance.html">Finance centre</a></li>
          <li><a href="trade-in.html">Trade in</a></li>
          <li><a href="delivery.html">Nationwide delivery</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Company</h2>
        <ul class="footer-list">
          <li><a href="index.html#about">Who we are</a></li>
          <li><a href="reviews.html">Reviews</a></li>
          <li><a href="index.html#gallery">Gallery</a></li>
          <li><a href="contact.html">Contact</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h2 class="footer-col__title">Visit us</h2>
        <address class="footer-address">
          1555 Hebron Rd<br>
          Heath, OH 43056<br>
          <a href="tel:+17406182466" class="num-tabular">740.618.2466</a>
        </address>
        <dl class="hours u-mt-5">
          <dt>Mon – Fri</dt><dd>9:00 – 18:00</dd>
          <dt>Saturday</dt><dd>9:00 – 16:00</dd>
          <dt>Sunday</dt><dd>Closed</dd>
        </dl>
        <a class="directions-link" href="https://maps.google.com/?q=1555+Hebron+Rd,+Heath,+OH+43056" target="_blank" rel="noopener">
          Get directions <span aria-hidden="true">→</span>
        </a>
      </div>

    </div>
  </div>

  <div class="wrap site-footer__inner">
    <p>
      Copyright © <span data-year>2024</span> Hinderer Motor Company. All Rights Reserved. |
      <a href="sitemap.html">Sitemap</a> | <a href="privacy.html">Privacy</a>
    </p>
    <p>Powered By All Auto Network</p>
  </div>
</footer>`;

/* ---------- B: build as culmination -------------------------------------- */

const OPTIONS = [
  { title: 'Tailor your interior',
    body: 'The inside of the roadster is specified the same way the outside is.',
    rows: [['Upholstery', 'Red, grey or tan leather'],
           ['Stitching', 'Diamond, ribbed or plain'],
           ['Trim', 'Body-colour or contrast piping']] },
  { title: 'Choose your body &amp; suspension',
    body: 'Paint and chassis are chosen together, because they change how the car behaves as much as how it looks.',
    rows: [['Finish', 'Solid, metallic or satin'],
           ['Stripes', 'Twin, single or none'],
           ['Suspension', 'Touring or track-tuned']] },
  { title: 'Personalise your dash &amp; gauges',
    body: 'The control centre is specified last, against everything already chosen.',
    rows: [['Dash', 'Carbon fibre or painted'],
           ['Gauges', 'Moal or GT'],
           ['Wheel', 'Wood rim or suede']] },
];

const optionBlock = o => `          <div class="option">
            <h3 class="option__title">${o.title}</h3>
            <p class="option__body">${o.body}</p>
            <dl class="plate plate--closed">
${o.rows.map(([k, v]) => `              <dt>${k}</dt><dd>${v}</dd>`).join('\n')}
            </dl>
          </div>`;

const buildCulmination = (headClass) => `${MARK}
       3 · BUILD YOUR OWN — the page's culmination
       B2 · Build-to-order is the only thing here a used-car lot cannot copy.
       In the Figma it is the second of nine equal blocks, weighing exactly as
       much as the finance section. It gets its own ground, the deepest
       interval on the page either side of it, and the page's primary action.
       =================================================================== -->
  <section class="build--culmination" id="build" aria-labelledby="buildTitle">
    <div class="wrap">

      <div class="section-head${headClass} stack">
        <p class="eyebrow">Built to order · since 1965</p>
        <h2 class="section-title" id="buildTitle">Build your Own!</h2>
        <p class="section-sub">Craft Your Ultimate Driving Machine</p>
        <p class="lead">
          Build your Backdraft RT4B the way you want it, with precision engineering and
          customizable luxury at every step!
        </p>
      </div>

      <div class="build__panel">
        <div class="build__layout u-mt-6">

          <figure class="build__media build__media--grounded m-0">
            <img src="assets/img/build-cobra.png"
                 alt="A red Backdraft roadster with twin white racing stripes, seen head-on"
                 width="570" height="490" loading="lazy">
          </figure>

          <div>
${OPTIONS.map(optionBlock).join('\n\n')}

            <!-- B2 · Real entry points carrying a preselection, not swatches
                 that pretend to preview something they cannot show. -->
            <div class="starts">
              <p class="starts__label">Start from a colour</p>
              <div class="starts__row">
                <a class="start-chip" href="build.html?finish=guardsman-red"><span class="start-chip__dot" style="background:#a5202a"></span>Guardsman Red</a>
                <a class="start-chip" href="build.html?finish=viking-blue"><span class="start-chip__dot" style="background:#20395e"></span>Viking Blue</a>
                <a class="start-chip" href="build.html?finish=raven"><span class="start-chip__dot" style="background:#1a1a1c"></span>Raven</a>
                <a class="start-chip" href="build.html?finish=titanium"><span class="start-chip__dot" style="background:#8e9195"></span>Titanium</a>
              </div>
            </div>

            <div class="build__cta--culmination">
              <a class="btn-hmc btn-hmc--primary btn-hmc--centred btn-hmc--wide" href="build.html">Start Building Today!</a>
            </div>
          </div>

        </div>
      </div>

    </div>
  </section>


`;

/* ---------- run ---------------------------------------------------------- */

const base = read('index.html');

/* ============================ VARIANT A ================================= */
let a = base;

a = swap(a,
  '<title>Hinderer Motor Company — Precision-Engineered Custom Roadsters</title>',
  '<title>Hinderer Motor Company — Precision-Engineered Custom Roadsters</title>\n  <!-- VARIANT A · invariant repairs + the missing means + section fixes.\n       Composition unchanged from the approved Figma. -->',
  'title A');

/* The Oswald trial belongs to index.html alone, so the variants can be
   compared against it on type as well as on structure. */
a = swap(a,
`  <!-- Display face under trial: Oswald. index1–3 stay on the previous stack,
       so the two can be compared side by side. Remove this one line to revert. -->
  <link rel="stylesheet" href="assets/css/display-oswald.css">
`, '', 'strip oswald');
a = swap(a,
  'family=Inter:wght@400;500;600&family=Oswald:wght@300;400;500;600',
  'family=Inter:wght@400;500;600&family=Hanken+Grotesk:wght@400;500;600', 'variant font request');
a = swap(a, 'Oswald carries headline mass', 'Hanken Grotesk carries headline mass', 'variant font note');

a = swap(a,
  '  <link rel="stylesheet" href="assets/css/main.css">',
  '  <link rel="stylesheet" href="assets/css/main.css">\n  <link rel="stylesheet" href="assets/css/variant-a.css">',
  'css link A');

/* A1 · the counter joins the header row, and below 30rem it keeps its number
   while handing its words to a screen-reader label — measured at 320px the
   four header elements could not share a line and the burger was clipped
   off-screen, which made the whole navigation unreachable. */
a = swap(a,
`    <a class="collection-pill" href="saved.html">
      My Collection <span class="num-tabular">/ 03</span>
    </a>`,
`    <a class="collection-pill collection-pill--inline" href="saved.html"
       aria-label="My collection — 3 saved vehicles">
      <span class="collection-pill__words">My Collection</span>
      <span class="num-tabular">03</span>
    </a>`, 'pill A');

a = replaceSection(a, 2, inventorySection('', ''));
a = swap(a, '<figure class="build__media m-0">',
             '<figure class="build__media build__media--grounded m-0">', 'grounded cutout A');
a = swap(a, '<section class="section trade" id="trade"',
             '<section class="section trade trade--committed" id="trade"', 'trade commit A');
a = replaceSection(a, 8, gallerySection('', ''));
a = replaceSection(a, 10, contactSection);

/* A8 · informational sections drop out of copper */
a = swap(a, '<a class="btn-hmc btn-hmc--primary btn-hmc--centred btn-hmc--wide" href="contact.html">Contact Us</a>',
             '<a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="contact.html">Contact Us</a>',
             'about CTA A');
a = swap(a, '<a class="btn-hmc btn-hmc--secondary btn-hmc--centred btn-hmc--wide" href="tel:+17405221106">740.522.1106</a>',
             '<a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="tel:+17405221106">740.522.1106</a>',
             'about phone A');
a = swap(a, '<a class="btn-hmc btn-hmc--primary btn-hmc--centred btn-hmc--wide" href="delivery.html">Learn More</a>',
             '<a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="delivery.html">Learn More</a>',
             'nationwide CTA A');

/* footer */
{
  const s = a.indexOf(FOOTER_OLD_START);
  const e = a.indexOf('</footer>', s) + '</footer>'.length;
  if (s < 0 || e < 0) throw new Error('footer not found');
  a = a.slice(0, s) + footerNew + a.slice(e);
}

write('index1.html', a);

/* ============================ VARIANT B ================================= */
let b = a;

b = swap(b, '<!-- VARIANT A · invariant repairs + the missing means + section fixes.\n       Composition unchanged from the approved Figma. -->',
             '<!-- VARIANT B · everything in A, plus the two moves that give the page a\n       spine: one systemic mechanism that survives ordinary photography, and\n       one culmination instead of nine equal sections. -->',
             'title B');
b = swap(b, '  <link rel="stylesheet" href="assets/css/variant-a.css">',
             '  <link rel="stylesheet" href="assets/css/variant-a.css">\n  <link rel="stylesheet" href="assets/css/variant-b.css">',
             'css link B');

b = replaceSection(b, 2, inventorySection('plate plate--light', ''));
b = replaceSection(b, 3, buildCulmination(' section-head--centre'));

/* B1 · the plate reaches the trade-in steps */
b = swap(b, `      <div class="cta-centre">
        <a class="btn-hmc btn-hmc--primary btn-hmc--centred btn-hmc--wide" href="trade-in.html">Start Trade In</a>
      </div>`,
`      <!-- B1 · the same record treatment as the vehicle card and the build
           options, so the page speaks one way about facts wherever they are -->
      <dl class="plate plate--closed u-mt-6" style="max-inline-size:34rem">
        <dt>Bring with you</dt><dd>Title, registration, both keys</dd>
        <dt>Helpful</dt><dd>Service history, spare wheel, manuals</dd>
        <dt>Takes about</dt><dd>45 minutes on site</dd>
      </dl>

      <div class="cta-centre">
        <a class="btn-hmc btn-hmc--primary btn-hmc--centred btn-hmc--wide" href="trade-in.html">Start Trade In</a>
      </div>`, 'trade plate B');

/* B1 · and the delivery terms */
b = swap(b, `          <div class="btn-row">
            <a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="delivery.html">Learn More</a>`,
`          <dl class="plate plate--closed">
            <dt>Coverage</dt><dd>Nationwide</dd>
            <dt>Handling</dt><dd>White glove, enclosed transport</dd>
            <dt>Updates</dt><dd>Real time, door to door</dd>
          </dl>

          <div class="btn-row">
            <a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="delivery.html">Learn More</a>`,
'nationwide plate B');

write('index2.html', b);

/* ============================ VARIANT C ================================= */
let c = b;

c = swap(c, '<!-- VARIANT B · everything in A, plus the two moves that give the page a\n       spine: one systemic mechanism that survives ordinary photography, and\n       one culmination instead of nine equal sections. -->',
             '<!-- VARIANT C · everything in B, plus the rhythm rebuild: one ground,\n       three container languages instead of seven, and three consecutive\n       50/50 bands replaced by three different structures.\n       This layer changes the composition — it needs the mandate widened\n       from REFRESH to REDESIGN. -->',
             'title C');
c = swap(c, '  <link rel="stylesheet" href="assets/css/variant-b.css">',
             '  <link rel="stylesheet" href="assets/css/variant-b.css">\n  <link rel="stylesheet" href="assets/css/variant-c.css">',
             'css link C');

/* C2 · the filter stops being a box */
c = swap(c, '<form class="stock-filter"', '<form class="stock-filter stock-filter--open"', 'filter open C');

/* C3 · one alignment rule: working sections left, atmosphere sections centred */
c = swap(c, '<div class="section-head section-head--centre stack">\n        <p class="eyebrow">Built to order · since 1965</p>',
             '<div class="section-head stack">\n        <p class="eyebrow">Built to order · since 1965</p>',
             'build head left C');
c = swap(c, `      <div class="section-head section-head--centre stack u-mb-7">
        <h2 class="section-title" id="nationwideTitle">Nationwide</h2>`,
`      <div class="section-head stack u-mb-7">
        <h2 class="section-title" id="nationwideTitle">Nationwide</h2>`,
'nationwide head left C');

/* C1 · the delivery band bleeds the full width instead of being an inset panel */
c = swap(c, '      <div class="band">', '      <div class="band band--bleed">', 'band bleed C');

/* C4 · the trade-in stage is pinned and its plates arrive one at a time */
c = swap(c, '<section class="section trade trade--committed" id="trade" aria-labelledby="tradeTitle">',
             '<section class="section trade trade--committed trade--scrolly" id="trade" data-scrolly aria-labelledby="tradeTitle">',
             'trade scrolly C');

/* C3a · Who we are — media above, reading column below */
c = replaceSection(c, 5, `${MARK}
       5 · WHO WE ARE
       C3a · The 50/50 band was the page's default and ran three times in a
       row. Here the film takes the full width and the copy drops beneath it,
       so the section reads as a pause rather than another two-column module.
       =================================================================== -->
  <section class="section" id="about" aria-labelledby="aboutTitle">
    <div class="wrap">
      <div class="section-head stack">
        <p class="standfirst">Passion meets performance in every vehicle we create.</p>
        <h2 class="section-title" id="aboutTitle">Who we are?</h2>
        <p class="section-sub">Working with us</p>
      </div>

      <figure class="about-c__media u-mt-6 m-0">
        <video controls preload="none" playsinline
               poster="assets/img/whoweare-poster.jpg"
               aria-label="A Backdraft roadster on Courthouse Square in Newark, Ohio">
          <source src="assets/video/about-us.webm" type="video/webm">
          <source src="assets/video/about-us.mp4" type="video/mp4">
          Your browser cannot play this video. The same story is told in the text below it.
        </video>
      </figure>

      <div class="about-c__grid">
        <div class="about-c__body">
          <p>
            Hinderer Motor Company is dedicated to crafting world-class custom roadsters, blending
            precision engineering with timeless design. Since 1965, we’ve been committed to
            delivering exceptional performance and unmatched quality. Whether you’re looking to
            build your dream car or upgrade your current vehicle, we offer a seamless, personalized
            experience from start to finish.
          </p>
        </div>
        <div class="about-c__body">
          <p>
            With over five decades of experience, our dedication to quality and innovation remains
            at the heart of everything we do. Whether you’re trading in a vehicle or building a
            custom Backdraft RT4B from the ground up, you can trust us to deliver an exceptional,
            tailored experience.
          </p>

          <div class="btn-row u-mt-6">
            <a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="contact.html">Contact Us</a>
            <a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="tel:+17405221106">740.522.1106</a>
          </div>
        </div>
      </div>
    </div>
  </section>


`);

/* C3b · Finance — no photograph, a typographic statement plus the plate */
c = replaceSection(c, 6, `${MARK}
       6 · FINANCE CENTER
       C3b · The showroom stock shot was carrying nothing the copy did not
       already say, and it was the third contained 50/50 image in a row. The
       section becomes a statement, and the facts are set as a plate — which
       is where the B-tier system earns its keep, because this is the one
       section with no imagery to fall back on.
       =================================================================== -->
  <section class="section" id="finance" aria-labelledby="financeTitle">
    <div class="wrap">
      <div class="section-head stack">
        <h2 class="section-title" id="financeTitle">Finance Center</h2>
        <p class="section-sub">Get Pre-Approved</p>
      </div>

      <div class="statement u-mt-6">
        <div>
          <p class="statement__lead">
            At Hinderer Motor Company, we understand that financing is a crucial step in turning your
            automotive dreams into reality. Our flexible financing options are designed to make owning
            a world-class custom roadster more accessible than ever. Whether you’re trading in a
            vehicle or embarking on a journey to build your custom Backdraft RT4B, our team is here to
            guide you through a seamless financing process.
          </p>
          <p class="body-muted u-mt-5">
            With over five decades of experience, we’re dedicated to crafting not only
            precision-engineered cars but also tailored financial solutions that suit your unique
            needs. Trust us to deliver the same commitment to excellence in financing as we do in
            every roadster we create.
          </p>

          <div class="btn-row u-mt-6">
            <a class="btn-hmc btn-hmc--primary btn-hmc--centred btn-hmc--wide" href="finance.html">Get Pre-Approved</a>
            <a class="btn-hmc btn-hmc--quiet btn-hmc--centred btn-hmc--wide" href="tel:+17406182466">740.618.2466</a>
          </div>
        </div>

        <div>
          <p class="statement__figure">1965<span>Building roadsters since</span></p>
          <dl class="plate plate--closed u-mt-7">
            <dt>Applies to</dt><dd>Inventory and custom builds</dd>
            <dt>Trade-in</dt><dd>Value applied to the balance</dd>
            <dt>Decision</dt><dd>Usually the same working day</dd>
          </dl>
        </div>
      </div>
    </div>
  </section>


`);

/* C3c · the gallery gains a stated reading order */
c = replaceSection(c, 8, gallerySection(`      <p class="gallery-legend">
        <b>Exterior · Interior · Detail</b>
        <span>in that order — and the two tiles carrying a play glyph open a film.</span>
      </p>

`, ''));

write('index3.html', c);

/* ---------- report ------------------------------------------------------- */
for (const f of ['index.html', 'index1.html', 'index2.html', 'index3.html']) {
  const s = read(f);
  console.log(
    f.padEnd(13),
    String(s.split('\n').length).padStart(4), 'lines ·',
    (s.match(/class="vehicle vehicle--/g) || []).length, 'cards ·',
    (s.match(/<section/g) || []).length, 'sections ·',
    (s.match(/btn-hmc--primary/g) || []).length, 'primary CTAs ·',
    (s.match(/class="plate/g) || []).length, 'plates'
  );
}
