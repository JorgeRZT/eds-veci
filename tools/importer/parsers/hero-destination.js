/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-destination
 * Base block: hero
 * Handles two live-DOM shapes:
 *   1) Destination pages (egipto): .header-block with figure > picture > img,
 *      heading in .content-text h1, description in .content-text p.
 *   2) Cruise zone pages: section[data-name="MainBanner"] holds only the banner
 *      image (lazy-loaded); the page <h1> lives in a sibling section, so it is
 *      resolved from the document.
 *
 * Target block structure (standard hero):
 *   Row 1: Hero background image
 *   Row 2: Heading (+ description if present)
 */
function resolvePicture(document, picture, fallbackAlt) {
  if (!picture) return null;
  const img = picture.querySelector('img');
  const isReal = (u) => u && !/shim\.gif/.test(u);
  let url = '';
  if (img && isReal(img.getAttribute('src'))) url = img.getAttribute('src');
  if (!url) {
    for (const s of picture.querySelectorAll('source')) {
      const cand = s.getAttribute('srcset') || s.getAttribute('data-splide-lazy-srcset') || '';
      const first = cand.split(',')[0].trim().split(' ')[0];
      if (isReal(first)) { url = first; break; }
    }
  }
  if (!url && img) url = img.getAttribute('data-splide-lazy-src') || img.getAttribute('src') || '';
  if (!url) return null;
  if (url.startsWith('//')) url = `https:${url}`;
  const newImg = document.createElement('img');
  newImg.src = url;
  newImg.alt = (img && img.getAttribute('alt')) || fallbackAlt || '';
  return newImg;
}

/**
 * Derive the cruise-zone hero banner from the page's zone slug. The source
 * hosts it at /imagen/cruceros/zona/{slug}-ratio-5-2.webp. The MainBanner's
 * <picture> is lazy-loaded and usually stays a shim.gif in the headless
 * importer, so reconstruct it deterministically from the URL.
 */
function heroImageFromUrl(document, pageUrl, alt) {
  const m = String(pageUrl || '').match(/\/cruceros\/zonas\/([^/]+)\/?/);
  if (!m) return null;
  const slug = m[1];
  const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/1920/768///www.viajeselcorteingles.es/imagen/cruceros/zona/${slug}-ratio-5-2.webp?jpegQuality=85`;
  const img = document.createElement('img');
  img.src = url;
  img.alt = alt || 'Crucero por el Mediterráneo';
  return img;
}

export default function parse(element, { document, url, params }) {
  const cells = [];
  const pageUrl = (params && params.originalURL) || url || '';

  // Heading: in-element first (egipto), else the page-level h1 (cruise MainBanner
  // has none — the title lives in a sibling section).
  const inEl = element.querySelector('.content-text h1, .content-title-page h1, h1');
  const headingSource = inEl || document.querySelector('h1');
  const headingText = headingSource ? headingSource.textContent.trim() : '';

  // Image: resolve from picture (handles lazy sources), fall back to a direct
  // <img>, then to the slug-derived banner when nothing real was found.
  const picture = element.querySelector('figure picture, .mod-full-header figure picture, picture');
  let heroImage = picture
    ? resolvePicture(document, picture, headingText)
    : element.querySelector('figure picture img, .mod-full-header figure img, img');
  if (!heroImage) heroImage = heroImageFromUrl(document, pageUrl, headingText);
  if (heroImage) cells.push([heroImage]);

  const description = element.querySelector('.content-text p, .content-title-page p');

  const contentCell = [];
  if (headingText) {
    const h = document.createElement('h1');
    h.textContent = headingText;
    contentCell.push(h);
  }
  if (description && description.textContent.trim()) contentCell.push(description);
  if (contentCell.length > 0) cells.push(contentCell);

  // Remove the standalone title section (sibling of the banner) once its <h1>
  // has been absorbed into the block, so it doesn't remain as duplicate free
  // content outside the hero block.
  if (headingSource && !element.contains(headingSource)) {
    const titleSection = headingSource.closest('section') || headingSource.parentElement;
    if (titleSection && titleSection !== element) titleSection.remove();
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-destination', cells });
  element.replaceWith(block);
}
