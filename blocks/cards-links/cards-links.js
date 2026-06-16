import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-links — "EL CRUCERO QUE BUSCAS": portrait image cards in a carousel.
 * Each card is a tall image with the category name centred below it. The four
 * central cards are fully visible; the carousel pages in blocks of 4 and the
 * edges fade to white.
 */
export default function decorate(block) {
  const rows = [...block.children];

  // Leading heading row: image cell empty, body holds the h2 (+ subheading).
  let headerRow = null;
  if (rows.length && rows[0].querySelector('h2') && !rows[0].querySelector('a')) {
    headerRow = rows.shift();
  }

  const ul = document.createElement('ul');
  rows.forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-links-card-image';
      else div.className = 'cards-links-card-body';
    });
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '450' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';

  if (headerRow) {
    const header = document.createElement('div');
    header.className = 'cards-links-header';
    while (headerRow.firstElementChild) {
      const cell = headerRow.firstElementChild;
      while (cell.firstElementChild) header.append(cell.firstElementChild);
      cell.remove();
    }
    block.append(header);
  }

  // Carousel with edge fade + prev/next arrows (pages in blocks of 4).
  const viewport = document.createElement('div');
  viewport.className = 'cards-links-carousel';
  ul.classList.add('cards-links-track');
  viewport.append(ul);

  const pageStep = () => {
    const card = ul.querySelector('li');
    if (!card) return ul.clientWidth;
    const style = getComputedStyle(ul);
    const gap = parseFloat(style.columnGap || style.gap || '16') || 16;
    const cardW = card.getBoundingClientRect().width + gap;
    // exclude the horizontal padding (the side gutters that reveal neighbouring
    // cards) so a "page" counts only the fully visible cards in the content box
    const padL = parseFloat(style.paddingLeft) || 0;
    const padR = parseFloat(style.paddingRight) || 0;
    const visible = ul.clientWidth - padL - padR;
    const perPage = Math.max(1, Math.round(visible / cardW));
    return cardW * perPage;
  };

  const makeArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cards-links-arrow cards-links-arrow-${dir}`;
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
    viewport.classList.toggle('at-start', prev.disabled);
    viewport.classList.toggle('at-end', next.disabled);
  };
  ul.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  viewport.prepend(prev);
  viewport.append(next);

  block.append(viewport);
  requestAnimationFrame(update);
}
