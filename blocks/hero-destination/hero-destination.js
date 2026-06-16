export default function decorate(block) {
  const hasImage = !!block.querySelector(':scope > div:first-child picture');
  if (!hasImage) {
    block.classList.add('no-image');
  }
  // "simple" banner variant: image + title only (no description paragraph).
  // The title is rendered above the image on a light background (no overlay),
  // matching source banners like the cruise zone pages.
  if (hasImage && !block.querySelector(':scope p')) {
    block.classList.add('simple');
  }
}
