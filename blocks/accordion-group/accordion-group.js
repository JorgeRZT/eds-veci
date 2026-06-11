/* Builds a carousel from a list of <picture>/<img> wrappers. */
function buildCarousel(images) {
  const carousel = document.createElement('div');
  carousel.className = 'accordion-group-carousel';
  carousel.dataset.activeSlide = '0';

  const track = document.createElement('ul');
  track.className = 'accordion-group-carousel-track';

  images.forEach((img, idx) => {
    const slide = document.createElement('li');
    slide.className = 'accordion-group-carousel-slide';
    slide.dataset.slideIndex = idx;
    slide.append(img);
    track.append(slide);
  });
  carousel.append(track);

  const showSlide = (index) => {
    const slides = track.children;
    let target = index;
    if (target < 0) target = slides.length - 1;
    if (target >= slides.length) target = 0;
    carousel.dataset.activeSlide = target;
    track.style.transform = `translateX(-${target * 100}%)`;
    carousel.querySelectorAll('.accordion-group-carousel-dot').forEach((dot, i) => {
      dot.setAttribute('aria-current', i === target ? 'true' : 'false');
    });
  };

  const nav = document.createElement('div');
  nav.className = 'accordion-group-carousel-nav';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'accordion-group-carousel-prev';
  prev.setAttribute('aria-label', 'Anterior');
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'accordion-group-carousel-next';
  next.setAttribute('aria-label', 'Siguiente');
  prev.addEventListener('click', () => showSlide(parseInt(carousel.dataset.activeSlide, 10) - 1));
  next.addEventListener('click', () => showSlide(parseInt(carousel.dataset.activeSlide, 10) + 1));
  nav.append(prev, next);
  carousel.append(nav);

  const dots = document.createElement('ol');
  dots.className = 'accordion-group-carousel-dots';
  images.forEach((img, idx) => {
    const dot = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'accordion-group-carousel-dot';
    btn.setAttribute('aria-label', `Imagen ${idx + 1}`);
    btn.setAttribute('aria-current', idx === 0 ? 'true' : 'false');
    btn.addEventListener('click', () => showSlide(idx));
    dot.append(btn);
    dots.append(dot);
  });
  carousel.append(dots);

  return carousel;
}

/* Processes the media inside a body cell: groups image-only paragraphs and,
   if more than one image, replaces them with a carousel. */
function processMedia(body) {
  const imageParagraphs = [...body.querySelectorAll(':scope > p')].filter(
    (p) => p.querySelector('picture, img') && !p.textContent.trim(),
  );

  if (imageParagraphs.length <= 1) {
    imageParagraphs.forEach((p) => p.classList.add('accordion-group-image'));
    return;
  }

  const images = imageParagraphs.map((p) => {
    const pic = p.querySelector('picture') || p.querySelector('img');
    return pic;
  });

  const carousel = buildCarousel(images);
  imageParagraphs[0].replaceWith(carousel);
  imageParagraphs.slice(1).forEach((p) => p.remove());
}

export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const layout = document.createElement('div');
  layout.className = 'accordion-group-layout';

  /* First row = intro: left title cell + right content cell */
  const introRow = rows.shift();
  const introCells = [...introRow.children];

  const aside = document.createElement('div');
  aside.className = 'accordion-group-aside';
  if (introCells[0]) {
    aside.append(...introCells[0].childNodes);
  }

  const content = document.createElement('div');
  content.className = 'accordion-group-content';
  const intro = document.createElement('div');
  intro.className = 'accordion-group-intro';
  if (introCells[1]) {
    intro.append(...introCells[1].childNodes);
    processMedia(intro);
  }
  content.append(intro);

  /* Remaining rows = accordion items */
  rows.forEach((row) => {
    const cells = [...row.children];
    const summary = document.createElement('summary');
    summary.className = 'accordion-group-item-label';
    if (cells[0]) summary.append(...cells[0].childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-group-item-body';
    if (cells[1]) {
      body.append(...cells[1].childNodes);
      processMedia(body);
    }

    const details = document.createElement('details');
    details.className = 'accordion-group-item';
    details.append(summary, body);
    content.append(details);
  });

  layout.append(aside, content);
  block.textContent = '';
  block.append(layout);
}
