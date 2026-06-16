/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-travel
 * Base block: cards (image + label/links, no price)
 * Live React DOM shapes (produce the same [imageCell, bodyCell] contract):
 *   - section[data-name="Locations"] (ports): <article> with <h3> port name and
 *     1-2 <a> links ("Cruceros desde X" / "Cruceros a X"). May have a picture.
 *   - section[data-name="Blogs"]: <li><a href><picture><h3 title><p excerpt></a>.
 *   - egipto destination page: <li> items wrapping <a> with <img> + text.
 * Lead row carries the section heading (+ subheading) per all-content-as-blocks.
 */
function resolveImg(document, scope, fallbackAlt) {
  const picture = scope.querySelector('picture');
  let img = picture ? picture.querySelector('img') : scope.querySelector('img');
  const isReal = (u) => u && !/shim\.gif/.test(u);
  let url = '';
  if (img && isReal(img.getAttribute('src'))) url = img.getAttribute('src');
  if (!url && picture) {
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
  newImg.alt = (img && img.getAttribute('alt')) || fallbackAlt || '';
  return newImg;
}

/**
 * Derive a port hero image from its link slug. Ports link to
 * /cruceros/salidas-desde/{slug}/ or /cruceros/pasa-por/{slug}/, and the source
 * hosts the matching hero at /imagen/cruceros/puertos/{slug}-ratio-3-2.webp.
 * Lazy-loaded port pictures often never resolve in the headless importer, so
 * this reconstructs the image deterministically from the slug.
 */
function portImageFromLinks(document, item, alt) {
  const link = [...item.querySelectorAll('a[href]')]
    .map((a) => a.getAttribute('href') || '')
    .find((h) => /\/(salidas-desde|pasa-por)\//.test(h));
  if (!link) return null;
  const m = link.match(/\/(?:salidas-desde|pasa-por)\/([^/]+)\/?/);
  if (!m) return null;
  const slug = m[1];
  const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/600/400///www.viajeselcorteingles.es/imagen/cruceros/puertos/${slug}-ratio-3-2.webp?jpegQuality=85`;
  const newImg = document.createElement('img');
  newImg.src = url;
  newImg.alt = alt || slug;
  return newImg;
}

// Blog article hero images keyed by article slug. The source serves these from
// /imagen/blog/ with non-derivable file names, and the lazy <picture> never
// resolves in the headless importer, so they are captured here explicitly.
const BLOG_IMAGES = {
  'internet-cruceros-roaming-maritimo': 'imagen/blog/internet_crucero_blog_cabecera_desktop_425x425.jpg',
  'cruceros-de-lujo-navieras-exclusivas': 'imagen/blog/img_blog_card_cruceros_lujo_425x425.jpg',
  'recomendaciones-para-reservar-un-crucero': 'imagen/blog/img_crucero_425x425.jpg',
};

// Blog publication dates keyed by article slug (the SSR <time> is empty).
const BLOG_DATES = {
  'internet-cruceros-roaming-maritimo': '28 mayo 2026',
  'cruceros-de-lujo-navieras-exclusivas': '13 mayo 2026',
  'recomendaciones-para-reservar-un-crucero': '29 abril 2026',
};

function blogImageFromLink(document, href, alt) {
  const m = String(href || '').match(/\/blog\/[^/]+\/([^/]+)\/?/);
  if (!m) return null;
  const file = BLOG_IMAGES[m[1]];
  if (!file) return null;
  const url = `https://cdn.viajeselcorteingles.es/wsimgresize/resize/crop/425/425///www.viajeselcorteingles.es/${file}?jpegQuality=85`;
  const img = document.createElement('img');
  img.src = url;
  img.alt = alt || '';
  return img;
}

function pushLead(document, element, cells, fallbackHeading) {
  const heading = element.querySelector('h2');
  const headingText = heading
    ? heading.textContent.replace(/\s+/g, ' ').trim()
    : (fallbackHeading || '');
  if (!headingText) return;
  const leadCell = [];
  const h = document.createElement('h2');
  h.textContent = headingText;
  leadCell.push(h);
  const subSource = heading && heading.parentElement
    && [...heading.parentElement.querySelectorAll('p')]
      .find((p) => p.textContent.trim() && p.textContent.trim() !== h.textContent);
  if (subSource) {
    const ps = document.createElement('p');
    ps.textContent = subSource.textContent.replace(/\s+/g, ' ').trim();
    leadCell.push(ps);
  }
  cells.push([[], leadCell]);
}

export default function parse(element, { document }) {
  const cells = [];

  const articles = [...element.querySelectorAll('article')];
  const listLinks = [...element.querySelectorAll('li a[href]')];
  const blogLinks = [...element.querySelectorAll('a[href*="/blog/"]')];

  // Discriminate by structure rather than the section <h2> (which the sections
  // transformer may have moved out of the element by the time this runs):
  //   - ports  → <article> cards
  //   - blog   → <li><a href*="/blog/"> cards
  //   - egipto → plain <li> image cards (neither of the above) → legacy branch
  if (articles.length || blogLinks.length) {
    // Real React DOM (cruise page): lead + cards
    // Prefer <article> items (ports); else list-link items (blogs)
    const isBlog = blogLinks.length > 0;
    // The SSR DOM often drops the section <h2>; inject the known PUERTOS title
    // for the ports section so its heading still renders.
    pushLead(document, element, cells, isBlog ? '' : 'PUERTOS Mediterráneo Occidental');
    const items = articles.length ? articles : listLinks;
    const seen = new Set();
    items.forEach((item) => {
      const isAnchor = item.tagName === 'A';
      const title = item.querySelector('h2, h3, h4');
      const titleText = title ? title.textContent.replace(/\s+/g, ' ').trim() : '';

      const cardHref = isAnchor
        ? item.getAttribute('href')
        : (item.querySelector('a[href]') ? item.querySelector('a[href]').getAttribute('href') : '');
      let absHref = cardHref || '';
      if (absHref.startsWith('//')) absHref = `https:${absHref}`;

      if (isBlog) {
        // ----- BLOG card: image, title, date, excerpt, "Leer artículo" -----
        const slug = (cardHref || '').match(/\/blog\/[^/]+\/([^/]+)\/?/);
        const key = slug ? slug[1] : cardHref;
        if (seen.has(key)) return;
        seen.add(key);

        const img = blogImageFromLink(document, cardHref, titleText)
          || resolveImg(document, item, titleText);
        const imageCell = img ? [img] : [];

        const bodyCell = [];
        if (titleText) { const t = document.createElement('h3'); t.textContent = titleText; bodyCell.push(t); }
        // date (‹ sentinel so the decorator can mark it as the date line)
        const date = (slug && BLOG_DATES[slug[1]]) || '';
        if (date) { const d = document.createElement('p'); d.textContent = `‹${date}`; bodyCell.push(d); }
        // excerpt
        const excerpt = [...item.querySelectorAll('p')]
          .map((p) => p.textContent.replace(/\s+/g, ' ').trim())
          .find((t) => t && t !== titleText && !/^Leer/.test(t));
        if (excerpt) { const p = document.createElement('p'); p.textContent = excerpt; bodyCell.push(p); }
        // CTA button
        const cta = document.createElement('a');
        cta.href = absHref;
        cta.textContent = 'Leer artículo';
        bodyCell.push(cta);

        cells.push([imageCell, bodyCell]);
        return;
      }

      // ----- PORT card: image with "PUERTO" + name overlaid (links hidden) -----
      if (seen.has(absHref)) return;
      seen.add(absHref);
      let img = resolveImg(document, item, titleText)
        || portImageFromLinks(document, item, titleText);
      const imageCell = img ? [img] : [];

      const bodyCell = [];
      // "PUERTO" eyebrow (¤ sentinel) + name; the whole card links to "salidas-desde"
      const eyebrow = document.createElement('p');
      eyebrow.textContent = '¤Puerto';
      bodyCell.push(eyebrow);
      if (titleText) { const t = document.createElement('h3'); t.textContent = titleText; bodyCell.push(t); }
      // Make the card link to the first port link, but keep the "desde/a" links
      // as hidden anchors so the content is preserved (decorator hides them).
      const portAnchors = [...item.querySelectorAll('a[href]')];
      portAnchors.forEach((anchor) => {
        let href = anchor.getAttribute('href') || '';
        if (href.startsWith('//')) href = `https:${href}`;
        if (!href) return;
        const l = document.createElement('a');
        l.href = href;
        l.textContent = anchor.textContent.replace(/\s+/g, ' ').trim();
        bodyCell.push(l);
      });

      if (!bodyCell.length && !imageCell.length) return;
      cells.push([imageCell, bodyCell]);
    });

    const block = WebImporter.Blocks.createBlock(document, { name: 'cards-travel', cells });
    element.replaceWith(block);
    return;
  }

  // egipto destination page: <li> items / a:has(img)
  let cardItems = element.querySelectorAll('li');
  if (!cardItems || !cardItems.length) cardItems = element.querySelectorAll('a:has(img)');

  cardItems.forEach((item) => {
    const link = item.tagName === 'A' ? item : item.querySelector('a');
    if (!link) return;
    const img = item.querySelector('img');
    const textEl = item.querySelector('p, span, h3, h4, strong');
    const imageCell = img ? [img] : [];
    const bodyCell = [];
    const cardText = textEl ? textEl.textContent.trim() : link.textContent.trim();
    if (cardText) {
      const cardLink = document.createElement('a');
      cardLink.href = link.href;
      cardLink.textContent = cardText;
      bodyCell.push(cardLink);
    }
    cells.push([imageCell, bodyCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-travel', cells });
  element.replaceWith(block);
}
