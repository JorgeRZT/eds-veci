/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-destination
 * Base block: hero
 * Source: https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto
 * Selector: .header-block
 * Generated: 2026-06-11
 *
 * Extracts hero content from destination pages:
 * - Background/hero image from figure > picture > img (excludes loading spinners)
 * - Heading (h1) with destination name
 * - Description paragraph with destination summary
 *
 * Target block structure (standard hero):
 *   Row 1: Hero background image
 *   Row 2: Heading + description text
 */
export default function parse(element, { document }) {
  // Extract the hero image from figure/picture (avoids loading spinner in .pre-loading)
  const heroImage = element.querySelector('figure picture img, .mod-full-header figure img');

  // Extract heading from content-text section
  const heading = element.querySelector('.content-text h1, .content-title-page h1, h1');

  // Extract description paragraph from content-text section
  // Exclude empty paragraphs like .inspirational-claim
  const description = element.querySelector('.content-text p, .content-title-page p');

  // Build cells array matching standard hero block structure:
  // Row 1: Background image
  // Row 2: Content (heading + description)
  const cells = [];

  // Row 1: Image (if present)
  if (heroImage) {
    cells.push([heroImage]);
  }

  // Row 2: Content cell with heading and description
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description && description.textContent.trim()) contentCell.push(description);

  // Only add content row if there is content
  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-destination', cells });
  element.replaceWith(block);
}
