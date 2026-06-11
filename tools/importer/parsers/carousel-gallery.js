/* eslint-disable */
/* global WebImporter */

/**
 * Parser for carousel-gallery
 * Base block: carousel
 * Source: https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto
 * Selector: .thumbnail-module.mgb30
 * Generated: 2026-06-11
 *
 * Source structure: A slider with multiple <li> items each containing figure/picture/img,
 * plus a shared container-description with heading and paragraph text.
 * Target: Standard EDS carousel - 2 columns per row (image | text content).
 * Each subsequent row is a slide with mandatory image in col1, optional text in col2.
 */
export default function parse(element, { document }) {
  // Extract all slide list items from the gallery slider
  const slideItems = Array.from(element.querySelectorAll('ul li'));

  // Extract the shared description content (heading + paragraphs)
  const descHeading = element.querySelector('.container-description h3, .description h3');
  const descParagraphs = Array.from(
    element.querySelectorAll('.container-description p, .description p')
  );

  // Build cells array - each entry is one row (slide)
  // Row format: [image] or [image, [textElements...]]
  const cells = [];

  for (let i = 0; i < slideItems.length; i += 1) {
    const li = slideItems[i];
    const img = li.querySelector('img');
    if (!img) continue;

    // Prefer picture element (with responsive sources) over bare img
    const picture = li.querySelector('picture') || img;

    if (i === 0 && descHeading) {
      // First slide gets the shared gallery description in column 2
      const textCell = [descHeading];
      descParagraphs.forEach((p) => textCell.push(p));
      cells.push([picture, textCell]);
    } else {
      // Remaining slides have only the image
      cells.push([picture]);
    }
  }

  // Fallback: if no list items found, extract images directly
  if (cells.length === 0) {
    const allPictures = Array.from(element.querySelectorAll('picture'));
    if (allPictures.length > 0) {
      allPictures.forEach((pic) => cells.push([pic]));
    } else {
      const allImages = Array.from(element.querySelectorAll('img'));
      allImages.forEach((img) => cells.push([img]));
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel-gallery', cells });
  element.replaceWith(block);
}
