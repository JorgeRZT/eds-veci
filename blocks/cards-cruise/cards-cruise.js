import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Rebuild a cruise card body from the anchor produced by the parser. The anchor
 * text carries ordered markers that survive the markdown round-trip:
 *   ¬<logoUrl>   ### <title>   #### <ship>   <duration>   <dates>
 *   ‖ <promo · promo>   desde <strong>price</strong>
 * (the Zones "MÁS DESTINOS" cards have no ¬/####/‖ markers — just title, count
 * and price.)
 */
function buildCardBody(body) {
  const anchor = body.querySelector('a');
  if (!anchor) return;
  const href = anchor.getAttribute('href');

  const priceStrong = anchor.querySelector('strong');
  const priceValue = priceStrong ? priceStrong.textContent.trim() : '';

  let text = anchor.textContent.replace(/\s+/g, ' ').trim();

  // price off the end
  let pricePrefix = '';
  const desdeIdx = priceValue ? text.lastIndexOf('desde') : -1;
  if (desdeIdx !== -1) {
    pricePrefix = text.slice(desdeIdx).replace(priceValue, '').replace(/\s+/g, ' ').trim();
    text = text.slice(0, desdeIdx).trim();
  }

  // logo url (¬...) — first marker. Stop before the "###" title marker, which
  // follows immediately with no separating whitespace.
  let logoUrl = '';
  const logoMatch = text.match(/¬([^\s#]+)/);
  if (logoMatch) { [, logoUrl] = logoMatch; text = text.replace(logoMatch[0], '').trim(); }

  // promo band (‖ ...)
  let promo = '';
  const promoIdx = text.indexOf('‖');
  if (promoIdx !== -1) { promo = text.slice(promoIdx + 1).replace(/\s+/g, ' ').trim(); text = text.slice(0, promoIdx).trim(); }

  // title (###) and ship (####)
  let title = '';
  let ship = '';
  let meta = text;
  if (text.startsWith('###')) {
    const afterTitle = text.replace(/^###\s*/, '');
    const shipSplit = afterTitle.indexOf('####');
    if (shipSplit !== -1) {
      title = afterTitle.slice(0, shipSplit).trim();
      const rest = afterTitle.slice(shipSplit).replace(/^####\s*/, '');
      const m = rest.match(/(\d|Salida)/);
      if (m) { ship = rest.slice(0, m.index).trim(); meta = rest.slice(m.index).trim(); } else { ship = rest.trim(); meta = ''; }
    } else {
      // Zones card: title may carry a trailing "N cruceros" count.
      const countMatch = afterTitle.match(/(\d[\d.,]*\s+cruceros)\s*$/i);
      if (countMatch) { title = afterTitle.slice(0, countMatch.index).trim(); meta = countMatch[1].trim(); } else { title = afterTitle.trim(); meta = ''; }
    }
  }

  // split meta into duration + dates
  const metaLines = [];
  if (meta) {
    const salidaIdx = meta.search(/Salidas?:/);
    if (salidaIdx > 0) {
      metaLines.push(meta.slice(0, salidaIdx).trim());
      metaLines.push(meta.slice(salidaIdx).trim());
    } else {
      metaLines.push(meta.trim());
    }
  }

  // rebuild
  anchor.textContent = '';
  anchor.removeAttribute('title');

  if (logoUrl) {
    const logo = document.createElement('img');
    logo.className = 'cards-cruise-logo';
    logo.src = logoUrl;
    logo.alt = '';
    logo.loading = 'lazy';
    // logo overlays the image cell, so move it into the image cell if present
    const imageCell = body.parentElement && body.parentElement.querySelector('.cards-cruise-card-image');
    if (imageCell) imageCell.append(logo); else anchor.append(logo);
  }

  if (ship) {
    const label = document.createElement('span');
    label.className = 'cards-cruise-label';
    label.textContent = 'Crucero';
    anchor.append(label);
  }
  if (title) { const h3 = document.createElement('h3'); h3.textContent = title; anchor.append(h3); }
  if (ship) { const h4 = document.createElement('h4'); h4.textContent = ship; anchor.append(h4); }
  metaLines.filter(Boolean).forEach((line) => { const p = document.createElement('p'); p.textContent = line; anchor.append(p); });

  if (promo) {
    const promoEl = document.createElement('p');
    promoEl.className = 'cards-cruise-promo';
    promo.split('·').map((s) => s.trim()).filter(Boolean).forEach((adv) => {
      const span = document.createElement('span');
      span.textContent = adv;
      promoEl.append(span);
    });
    anchor.append(promoEl);
  }

  if (priceValue) {
    const price = document.createElement('p');
    price.className = 'cards-cruise-price';
    if (pricePrefix) price.append(`${pricePrefix} `);
    const strong = document.createElement('strong');
    strong.textContent = priceValue;
    price.append(strong);
    anchor.append(price);
  }

  const wrapper = anchor.closest('p');
  if (wrapper && wrapper.parentElement === body) wrapper.replaceWith(anchor);
  if (href) anchor.setAttribute('href', href);
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-cruise-card-image';
      else div.className = 'cards-cruise-card-body';
    });
    if (!li.querySelector('.cards-cruise-card-image')) {
      li.className = 'cards-cruise-heading';
    } else {
      const body = li.querySelector('.cards-cruise-card-body');
      if (body && body.querySelector('a')) buildCardBody(body);
    }
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((image) => {
    const optimizedPic = createOptimizedPicture(image.src, image.alt, false, [{ width: '750' }]);
    image.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';

  // lead heading above the carousel
  const heading = ul.querySelector(':scope > li.cards-cruise-heading');
  if (heading) block.append(heading);

  // carousel
  const viewport = document.createElement('div');
  viewport.className = 'cards-cruise-carousel';
  ul.classList.add('cards-cruise-track');
  viewport.append(ul);

  const pageStep = () => {
    const card = ul.querySelector('li');
    if (!card) return ul.clientWidth;
    const style = getComputedStyle(ul);
    const gap = parseFloat(style.columnGap || style.gap || '20') || 20;
    const cardW = card.getBoundingClientRect().width + gap;
    // scroll by a full "page" of visible cards (blocks of 4 on desktop)
    const perPage = Math.max(1, Math.round(ul.clientWidth / cardW));
    return cardW * perPage;
  };

  const makeArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cards-cruise-arrow cards-cruise-arrow-${dir}`;
    btn.setAttribute('aria-label', dir === 'prev' ? 'Anterior' : 'Siguiente');
    btn.innerHTML = dir === 'prev' ? '&#8249;' : '&#8250;';
    btn.addEventListener('click', () => {
      ul.scrollBy({ left: dir === 'prev' ? -pageStep() : pageStep(), behavior: 'smooth' });
    });
    return btn;
  };

  const prev = makeArrow('prev');
  const next = makeArrow('next');
  const update = () => {
    prev.disabled = ul.scrollLeft <= 4;
    next.disabled = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 4;
  };
  ul.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  viewport.prepend(prev);
  viewport.append(next);
  block.append(viewport);
  requestAnimationFrame(update);
}
