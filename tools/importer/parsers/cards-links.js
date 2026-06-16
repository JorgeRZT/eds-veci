/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-links — "EL CRUCERO QUE BUSCAS" (section CruiseNiches).
 * Portrait image cards in a carousel: each card is a tall image with the
 * category name centred below it. The lazy <picture>s never resolve in the
 * headless importer, so the portrait images are captured per slug.
 *
 * Output rows consumed by blocks/cards-links/cards-links.js:
 *   - Row 1: lead heading + subheading.
 *   - Rows 2..N: [imageCell, [<a>label</a>]] per category.
 */

const CDN = 'https://cdn.viajeselcorteingles.es/wsimgresize';
const ORIGIN = 'www.viajeselcorteingles.es';

// Per niche slug → portrait image path (ratio 2:3). Captured from the source.
const NICHE_IMAGES = {
  'cruceros-especial-familias': 'imagen/cruceros/nichos/cruceros-especial-familias-ratio-2-3.webp',
  'cruceros-desde-espana': 'imagenes/cruceros/niche/211-card.webp',
  'cruceros-en-todo-incluido': 'imagen/cruceros/nichos/cruceros-en-todo-incluido-ratio-2-3.webp',
  'cruceros-para-novios': 'imagen/cruceros/nichos/cruceros-para-novios-ratio-2-3.webp',
  'minicruceros': 'imagen/cruceros/nichos/minicruceros-ratio-2-3.webp',
  'cruceros-fiordos-noruegos': 'imagen/cruceros/nichos/cruceros-fiordos-noruegos-ratio-2-3.webp',
  'los-barcos-mas-nuevos': 'imagen/cruceros/nichos/los-barcos-mas-nuevos-ratio-2-3.webp',
  'cruceros-con-gastronomia-gourmet': 'imagen/cruceros/nichos/cruceros-gastronomia-gourmet-ratio-2-3.webp',
  'cruceros-premium': 'imagen/cruceros/nichos/cruceros-premium-ratio-2-3.webp',
  'cruceros-solo-adultos': 'imagen/cruceros/nichos/cruceros-solo-adultos-ratio-2-3.webp',
  'msc-yacht-club-cabinas-y-suites-de-lujo': 'imagen/cruceros/nichos/cruceros-msc-yacht-club-cabinas-ratio-2-3.webp',
  'cruceros-eco-responsables': 'imagen/cruceros/nichos/cruceros-eco-responsables-ratio-2-3.webp',
  'cruceros-de-expedicion': 'imagen/cruceros/nichos/crucero-de-expedicion-ratio-2-3.webp',
  'cruceros-exoticos': 'imagen/cruceros/nichos/cruceros-exoticos-ratio-2-3.webp',
  'cruceros-islas-privadas': 'imagen/cruceros/nichos/cruceros-islas-privadas-ratio-2-3.webp',
  'cruceros-en-espanol': 'imagen/cruceros/nichos/cruceros-en-espanol-ratio-2-3.webp',
  'cruceros-de-lujo': 'imagen/cruceros/nichos/cruceros-de-lujo-ratio-2-3.webp',
  'cruceros-capitales-balticas': 'imagen/cruceros/nichos/cruceros-capitales-balticas-ratio-2-3.webp',
  'the-haven-by-ncl-suites-exclusivas': 'imagen/cruceros/nichos/the-haven-by-ncl-ratio-2-3.webp',
  'cruceros-para-mayores': 'imagen/cruceros/nichos/cruceros-mayores-ratio-2-3.webp',
};

function nicheImg(document, slug, alt) {
  const path = NICHE_IMAGES[slug];
  if (!path) return null;
  const img = document.createElement('img');
  img.src = `${CDN}/resize/crop/300/450///${ORIGIN}/${path}?jpegQuality=85`;
  img.alt = alt || '';
  return img;
}

export default function parse(element, { document }) {
  const cells = [];

  // Lead heading + subheading (inject known values when SSR drops the <h2>).
  const heading = element.querySelector('h2');
  const headingText = (heading && heading.textContent.replace(/\s+/g, ' ').trim())
    || 'EL CRUCERO QUE BUSCAS';
  let subText = '';
  if (heading && heading.parentElement) {
    const sub = [...heading.parentElement.querySelectorAll('p')]
      .find((p) => p.textContent.trim() && p.textContent.trim() !== headingText);
    if (sub) subText = sub.textContent.replace(/\s+/g, ' ').trim();
  }
  if (!subText) subText = 'Encuentra el Crucero que mejor se adapta a tus preferencias';
  const leadContent = [document.createElement('h2')];
  leadContent[0].textContent = headingText;
  const ps = document.createElement('p');
  ps.textContent = subText;
  leadContent.push(ps);
  cells.push([[], leadContent]);

  let links = [...element.querySelectorAll('li a[href]')];
  if (links.length === 0) links = [...element.querySelectorAll('a[href]')];

  const seen = new Set();
  links.forEach((link) => {
    let href = link.getAttribute('href') || '';
    if (href.startsWith('//')) href = `https:${href}`;
    const text = (link.getAttribute('title') || link.textContent).replace(/\s+/g, ' ').trim();
    if (!href || !text || seen.has(href)) return;
    seen.add(href);
    const slug = (href.match(/\/selecciones\/([^/]+)\/?/) || [])[1];
    const img = nicheImg(document, slug, text);
    const imageCell = img ? [img] : [];
    const cardLink = document.createElement('a');
    cardLink.href = href;
    cardLink.textContent = text;
    cells.push([imageCell, [cardLink]]);
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-links', cells });
  element.replaceWith(block);
}
