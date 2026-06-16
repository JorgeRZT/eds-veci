/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-intro
 * Base block: columns
 * Live React DOM: section[data-name="Inspirational"] — <h2> heading + editorial
 * <p> paragraphs (with inline <strong>) on the LEFT, and a large image on the
 * RIGHT. Per all-content-as-blocks the prose is wrapped into this authorable
 * two-column block: cell 1 = text, cell 2 = image.
 *
 * Output: one row / two cells. columns-intro.js treats
 * block.firstElementChild.children as columns → text column + image column.
 * If no image is found, falls back to a single text column.
 */
function resolveImg(document, scope) {
  const picture = scope.querySelector('picture');
  if (!picture) return null;
  const img = picture.querySelector('img');
  const isReal = (u) => u && !/shim\.gif/.test(u);
  let url = '';
  if (img && isReal(img.getAttribute('src'))) url = img.getAttribute('src');
  if (!url) {
    for (const s of picture.querySelectorAll('source')) {
      const cand = s.getAttribute('data-splide-lazy-srcset') || s.getAttribute('srcset') || '';
      const first = cand.split(',')[0].trim().split(' ')[0];
      if (isReal(first)) { url = first; break; }
    }
  }
  if (!url && img) url = img.getAttribute('data-splide-lazy-src') || img.getAttribute('src') || '';
  if (!url || !isReal(url)) return null;
  if (url.startsWith('//')) url = `https:${url}`;
  const newImg = document.createElement('img');
  newImg.src = url;
  newImg.alt = (img && img.getAttribute('alt')) || '';
  return newImg;
}

/**
 * Derive the editorial "inspiracional" hero image from the page's zone slug.
 * The source hosts it at
 *   /imagen/cruceros/zona/{zoneSlug}/inspiracional/generica01-ratio-16-9.webp
 * The lazy <picture> usually never resolves in the headless importer (stays a
 * shim.gif), so this reconstructs the image deterministically from the URL.
 */
function introImageFromUrl(document, pageUrl) {
  const m = String(pageUrl || '').match(/\/cruceros\/zonas\/([^/]+)\/?/);
  if (!m) return null;
  const slug = m[1];
  const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/1280/720///www.viajeselcorteingles.es/imagen/cruceros/zona/${slug}/inspiracional/generica01-ratio-16-9.webp?jpegQuality=85`;
  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Crucero por el Mediterráneo';
  return img;
}

export default function parse(element, { document, url, params }) {
  const content = [];

  // Heading: read from the DOM, else fall back to the known section title
  // (the headless importer frequently drops the section <h2>).
  const heading = element.querySelector('h2, h3, h4');
  const headingText = (heading && heading.textContent.replace(/\s+/g, ' ').trim())
    || 'Descubre el Mediterráneo a bordo de un crucero';
  const h = document.createElement('h2');
  h.textContent = headingText;
  content.push(h);

  const seen = new Set();
  [...element.querySelectorAll('p')].forEach((p) => {
    const text = p.textContent.replace(/\s+/g, ' ').trim();
    if (!text || seen.has(text)) return;
    seen.add(text);
    const np = document.createElement('p');
    np.innerHTML = p.innerHTML; // preserve inline <strong>
    content.push(np);
  });

  if (!content.length) {
    [...element.children]
      .filter((el) => el.textContent.trim())
      .forEach((el) => content.push(el));
  }

  // Image column (right side on the source). Prefer the real <picture>; fall
  // back to deriving it from the zone slug since the lazy image rarely resolves.
  const pageUrl = (params && params.originalURL) || url || '';
  const img = resolveImg(document, element) || introImageFromUrl(document, pageUrl);

  const cells = img ? [[content, [img]]] : [[content]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-intro', cells });
  element.replaceWith(block);
}
