/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-cruise
 * Base block: cards (price-bearing product cards)
 * Two live-DOM shapes:
 *   1) section[data-name="TabsProductCarousel"] — cruise product cards (<article>).
 *      Card order (source): ship image, cruise-line logo (overlaid on the image
 *      bottom), "Crucero" label, route title (h3), ship name (h4), duration +
 *      departure port, a beige promo band (advantages), exact sailing date and
 *      "desde <price>".
 *   2) section[data-name="Zones"] — "MÁS DESTINOS" destination cards (<li><a>):
 *      square image with the destination name + cruise count overlaid on top and
 *      "desde <price>" overlaid at the bottom.
 *
 * The headless importer captures a partially-hydrated SSR DOM where the per-card
 * <h3>/<h4>/<p> structure is unreliable, and lazy <picture>s stay shim.gif. To
 * guarantee fidelity this parser is data-driven from per-slug maps for the data
 * that does not survive (ship image id, cruise-line logo id, duration, promo
 * advantages), while title/dates/price are read from the DOM with URL fallbacks.
 *
 * Output rows consumed by blocks/cards-cruise/cards-cruise.js. Markers used so
 * the structure survives the markdown round-trip:
 *   ### <title>   #### <ship>   then ordered <p> lines, a "‖ promo" line, and
 *   "desde <strong>price</strong>". A leading "¬<logoUrl>" line carries the logo.
 */

const CDN = 'https://cdn.viajeselcorteingles.es/wsimgresize';
const ORIGIN = 'www.viajeselcorteingles.es';

// Per cruise slug: ship photo id, cruise-line logo id, duration line, promo band.
const CRUISES = {
  'mediterraneo-y-sus-maravillas': { ship: '742', logo: '11_es', dur: '8 días desde Barcelona', promo: ['Hasta 300€ descuento inmediato', 'Cuota de servicio (propinas) incluida'] },
  'del-coliseo-a-la-provenza': { ship: '75', logo: '11_es', dur: '8 días desde Valencia', promo: ['Hasta 300€ descuento inmediato', 'Cuota de servicio (propinas) incluida'] },
  'la-musica-del-mar': { ship: '968', logo: '1', dur: '8 días desde Barcelona', promo: ['Niños gratis', 'Hasta 300€ descuento inmediato'] },
  'descubriendo-el-mediterraneo': { ship: '794', logo: '11_es', dur: '8 días desde Barcelona', promo: ['Hasta 300€ descuento inmediato', 'Cuota de servicio (propinas) incluida'] },
  'leyendas-del-mediterraneo-i': { ship: '1187', logo: '6', dur: '8 días desde Barcelona', promo: ['Hasta 300€ descuento inmediato', 'Hasta -730€'] },
  'perlas-del-mediterraneo': { ship: '999', logo: '11_es', dur: '8 días desde Barcelona', promo: ['Hasta 300€ descuento inmediato', 'Cuota de servicio (propinas) incluida'] },
  'mediterraneo-occidental-i': { ship: '735', logo: '6', dur: '8 días desde Barcelona', promo: ['Hasta 300€ descuento inmediato', 'Hasta -730€'] },
  'bellezas-del-mediterraneo': { ship: '870', logo: '11_es', dur: '8 días desde Barcelona', promo: ['Hasta 300€ descuento inmediato', 'Cuota de servicio (propinas) incluida'] },
  'historia-y-belleza-natural': { ship: '176', logo: '1', dur: '8 días desde Valencia', promo: ['Niños gratis', 'Hasta 300€ descuento inmediato'] },
  'bellezas-de-italia-y-francia': { ship: '216', logo: '7', dur: '10 días desde Civitavecchia (Roma)', promo: ['Desde 60% descuento 2º pasajero', 'Hasta 300€ descuento inmediato'] },
  'pequenas-sorpresas-junto-al-mar': { ship: '489', logo: '1', dur: '5 días desde Barcelona', promo: ['Niños gratis', 'Hasta 300€ descuento inmediato'] },
};

const shipImg = (id) => `${CDN}/resize/crop/285/143///cdn.viajeselcorteingles.es/contenidosShared/cruises/ship/${id}/generic.jpg?jpegQuality=85`;
const logoImg = (id) => `${CDN}/resize/85/34///cdn.viajeselcorteingles.es/comun/images/cruceros/logos/logo_${id}.png?jpegQuality=85`;

// MÁS DESTINOS zone images. The source does NOT use a single predictable path:
// some zones use /imagen/cruceros/zonas/<slug>-ratio-1-1.webp, others the
// singular /imagen/cruceros/zona/<slug>-ratio-1-1.webp, and most use a numeric
// /imagenes/cruceros/zone/<id>-card.webp. Captured per slug from the source so
// every card resolves to a real image (otherwise the slug-based guess 404s).
const ZONE_IMAGE_PATHS = {
  'islas-griegas-y-adriatico': 'imagen/cruceros/zonas/islas-griegas-y-adriatico-ratio-1-1.webp',
  'norte-de-europa-y-fiordos': 'imagen/cruceros/zonas/norte-de-europa-y-fiordos-ratio-1-1.webp',
  caribe: 'imagen/cruceros/zona/caribe-ratio-1-1.webp',
  'mediterraneo-y-atlantico': 'imagenes/cruceros/zone/41-card.webp',
  'vuelta-al-mundo': 'imagen/cruceros/zonas/vuelta-al-mundo-ratio-1-1.webp',
  'islas-canarias': 'imagen/cruceros/zonas/islas-canarias-ratio-1-1.webp',
  alaska: 'imagenes/cruceros/zone/8-card.webp',
  transatlanticos: 'imagen/cruceros/zona/transatlanticos-ratio-1-1.webp',
  sudamerica: 'imagenes/cruceros/zone/17-card.webp',
  'riviera-mexicana': 'imagenes/cruceros/zone/20-card.webp',
  'oceano-indico-mauricio': 'imagenes/cruceros/zone/23-card.webp',
  'canal-de-panama': 'imagenes/cruceros/zone/24-card.webp',
  'islas-galapagos': 'imagenes/cruceros/zone/25-card.webp',
  'norteamerica-y-canada': 'imagenes/cruceros/zone/29-card.webp',
  'australia-e-islas-del-pacifico': 'imagenes/cruceros/zone/140-card.webp',
  asia: 'imagenes/cruceros/zone/141-card.webp',
  'dubai-y-emiratos': 'imagen/cruceros/zona/dubai-y-emiratos-ratio-1-1.webp',
  africa: 'imagenes/cruceros/zone/200-card.webp',
  hawai: 'imagenes/cruceros/zone/201-card.webp',
  'entre-europa-y-oriente': 'imagenes/cruceros/zone/203-card.webp',
  'entre-europa-y-africa': 'imagenes/cruceros/zone/204-card.webp',
  transpacificos: 'imagenes/cruceros/zone/205-card.webp',
};

const zoneImg = (slug) => {
  const path = ZONE_IMAGE_PATHS[slug] || `imagen/cruceros/zonas/${slug}-ratio-1-1.webp`;
  return `${CDN}/resize/crop/360/360///${ORIGIN}/${path}?jpegQuality=85`;
};

const E = (s) => (s || '').replace(/\s+/g, ' ').trim();

function slugFromHref(href) {
  const m = String(href || '').match(/\/([a-z0-9-]+)-\d+\/?$/i);
  return m ? m[1] : '';
}

function zoneSlugFromHref(href) {
  const m = String(href || '').match(/\/zonas\/([a-z0-9-]+)\/?$/i);
  return m ? m[1] : '';
}

function shipNameFromHref(href) {
  const m = String(href || '').match(/\/([a-z0-9-]+)\/[a-z0-9-]+-\d+\/?$/i);
  if (!m) return '';
  return m[1].split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace(/^Msc /, 'MSC ');
}

function img(document, src, alt) {
  const i = document.createElement('img');
  i.src = src;
  i.alt = alt || '';
  return i;
}

export default function parse(element, { document }) {
  const cells = [];
  const isZones = !element.querySelector('article'); // Zones uses <li><a>

  // Lead row: section heading + subheading. The headless importer often drops
  // the section <h2>, so fall back to the known section titles (the two
  // cards-cruise instances on this template are TOP CRUCEROS and MÁS DESTINOS).
  const headingEl = element.querySelector('h2');
  let headingText = headingEl ? E(headingEl.textContent) : '';
  let subText = '';
  if (!headingText) {
    if (isZones) {
      headingText = 'MÁS DESTINOS PARA TU CRUCERO';
    } else {
      headingText = 'TOP CRUCEROS Mediterráneo Occidental';
      subText = 'La mejor selección de Cruceros por Mediterráneo Occidental';
    }
  } else {
    const candidates = [...element.querySelectorAll('p, div, span')]
      .filter((n) => !n.closest('article, li') && n.children.length === 0);
    subText = candidates.map((n) => E(n.textContent))
      .find((t) => t && t !== headingText && t.length > 8 && t.length < 120 && !/^\d/.test(t)) || '';
  }
  const leadCell = [];
  const h = document.createElement('h2');
  h.textContent = headingText;
  leadCell.push(h);
  if (subText) {
    const ps = document.createElement('p');
    ps.textContent = subText;
    leadCell.push(ps);
  }
  cells.push([[], leadCell]);

  const items = isZones
    ? [...element.querySelectorAll('li a[href]')]
    : [...element.querySelectorAll('article')];

  const seen = new Set();
  items.forEach((item) => {
    const link = item.tagName === 'A' ? item : item.querySelector('a[href]');
    if (!link) return;
    let href = link.getAttribute('href') || '';
    if (href.startsWith('//')) href = `https:${href}`;
    if (!href || seen.has(href)) return;
    seen.add(href);

    const a = document.createElement('a');
    a.href = href;

    if (isZones) {
      // MÁS DESTINOS card: square image + name + "N cruceros" + price.
      const slug = zoneSlugFromHref(href);
      const h3 = item.querySelector('h3');
      const name = h3 ? E(h3.textContent) : E(link.getAttribute('title'));
      const imageCell = slug ? [img(document, zoneImg(slug), name)] : [];
      if (name) { const t = document.createElement('h3'); t.textContent = name; a.append(t); }
      // cruise count "N cruceros"
      const cnt = [...item.querySelectorAll('p')].map((p) => E(p.textContent)).find((t) => /\bcruceros?\b/i.test(t) && /\d/.test(t));
      if (cnt) { const p = document.createElement('p'); p.textContent = cnt; a.append(p); }
      const strong = [...item.querySelectorAll('strong')].find((s) => /€/.test(s.textContent));
      if (strong) {
        const p = document.createElement('p');
        p.className = 'price';
        const b = document.createElement('strong');
        b.textContent = E(strong.textContent);
        p.append(document.createTextNode('desde '), b);
        a.append(p);
      }
      cells.push([imageCell, [a]]);
      return;
    }

    // Cruise product card -------------------------------------------------
    const slug = slugFromHref(href);
    const data = CRUISES[slug] || {};
    const h3 = item.querySelector('h3');
    let title = h3 ? E(h3.textContent) : E(link.getAttribute('title')).replace(/^Crucero\s+/i, '');
    const h4 = item.querySelector('h4');
    const ship = (h4 && E(h4.textContent)) || shipNameFromHref(href);

    // image: ship photo (data map first; DOM picture as fallback)
    const imageEl = data.ship
      ? img(document, shipImg(data.ship), `imagen de barco ${ship}`)
      : (item.querySelector('picture img') || null);
    const imageCell = imageEl ? [imageEl] : [];

    // logo carried as a "¬<url>" sentinel line (decorator overlays it on image)
    if (data.logo) {
      const lg = document.createElement('p');
      lg.textContent = `¬${logoImg(data.logo)}`;
      a.append(lg);
    }
    if (title) { const t = document.createElement('h3'); t.textContent = title; a.append(t); }
    if (ship) { const s = document.createElement('h4'); s.textContent = ship; a.append(s); }
    if (data.dur) { const p = document.createElement('p'); p.textContent = data.dur; a.append(p); }

    // sailing dates from the DOM
    const full = E(item.textContent);
    const sail = full.match(/Salidas?:\s*\d{1,2}\s+\w+\.?\s+\d{4}(?:\s+hasta\s+\d{1,2}\s+\w+\.?\s+\d{4})?(?:\s*\(Salidas los \w+\))?/i)
      || full.match(/Salida:\s*\d{1,2}\s+\w+\.?\s+\d{4}/i);
    if (sail) { const p = document.createElement('p'); p.textContent = E(sail[0]); a.append(p); }

    // promo advantages band
    const promo = (data.promo && data.promo.length) ? data.promo : null;
    if (promo) {
      const p = document.createElement('p');
      p.textContent = `‖ ${promo.join(' · ')}`;
      a.append(p);
    }

    // price
    const strong = [...item.querySelectorAll('strong')].find((s) => /€/.test(s.textContent));
    if (strong) {
      const p = document.createElement('p');
      p.className = 'price';
      const b = document.createElement('strong');
      b.textContent = E(strong.textContent);
      p.append(document.createTextNode('desde '), b);
      a.append(p);
    }

    cells.push([imageCell, [a]]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-cruise', cells });
  element.replaceWith(block);
}
