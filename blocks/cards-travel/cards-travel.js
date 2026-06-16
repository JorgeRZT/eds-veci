import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * cards-travel renders two card patterns from this cruise page plus the legacy
 * egipto cards:
 *   - PORT cards: portrait image with "PUERTO" + name overlaid; the per-card
 *     "Cruceros desde/a" links are kept but hidden. Body text marked: a "¤"
 *     prefix flags the eyebrow ("Puerto").
 *   - BLOG cards: image, title, date (marked "‹"), excerpt, "Leer artículo"
 *     button. Rendered as a static 3-column grid (no carousel).
 * The section title row (h2) is lifted above the cards.
 */

function markCard(li) {
  const body = li.querySelector('.cards-travel-card-body');
  if (!body) return;
  // Date line: paragraph starting with "‹"
  [...body.querySelectorAll('p')].forEach((p) => {
    const t = p.textContent.trim();
    if (t.startsWith('‹')) {
      p.textContent = t.slice(1).trim();
      p.className = 'cards-travel-date';
    } else if (t.startsWith('¤')) {
      p.textContent = t.slice(1).trim();
      p.className = 'cards-travel-eyebrow';
    }
  });
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-travel-card-image';
      else div.className = 'cards-travel-card-body';
    });
    markCard(li);
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';

  // Lift the section title row (a card whose body holds the section h2).
  const titleLi = [...ul.children].find((li) => li.querySelector('.cards-travel-card-body h2'));
  if (titleLi) {
    const heading = document.createElement('div');
    heading.className = 'cards-travel-heading';
    while (titleLi.firstElementChild) {
      const cell = titleLi.firstElementChild;
      if (cell.querySelector('h2, p')) {
        while (cell.firstElementChild) heading.append(cell.firstElementChild);
      }
      titleLi.removeChild(cell);
    }
    ul.removeChild(titleLi);
    block.append(heading);
  }

  // Blog = a static 3-column grid (detected by a blog link). Ports/egipto =
  // horizontal carousel.
  const isBlog = !!ul.querySelector('a[href*="/blog/"]');
  if (isBlog) {
    ul.classList.add('cards-travel-grid');
    block.append(ul);
    return;
  }

  // Carousel
  const viewport = document.createElement('div');
  viewport.className = 'cards-travel-carousel';
  ul.classList.add('cards-travel-track');
  viewport.append(ul);

  const pageStep = () => {
    const card = ul.querySelector('li');
    if (!card) return ul.clientWidth;
    const style = getComputedStyle(ul);
    const gap = parseFloat(style.columnGap || style.gap || '20') || 20;
    const cardW = card.getBoundingClientRect().width + gap;
    const perPage = Math.max(1, Math.round(ul.clientWidth / cardW));
    return cardW * perPage;
  };

  const makeArrow = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `cards-travel-arrow cards-travel-arrow-${dir}`;
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
