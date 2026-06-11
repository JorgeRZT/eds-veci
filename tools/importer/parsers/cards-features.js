/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-features
 * Base block: cards
 * Source: https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto
 * Selector: section.hv-advantages
 * Generated: 2026-06-11
 *
 * Source structure:
 *   section.hv-advantages > .container-advantages > .hv-advantages-container > article
 *   Each article contains:
 *     - span.icon (with class advN for icon type)
 *     - div.text > h3 (feature title) + p (feature description)
 */
export default function parse(element, { document }) {
  // Extract all feature articles from the advantages container
  const articles = Array.from(
    element.querySelectorAll('article')
  );

  const cells = [];

  articles.forEach((article) => {
    // Extract text content: heading and description
    const heading = article.querySelector('h3');
    const description = article.querySelector('p');

    // Build card row - each row is one feature card
    // Single cell per row with all card content elements
    const cellContent = [];
    if (heading) cellContent.push(heading);
    if (description) cellContent.push(description);

    if (cellContent.length > 0) {
      cells.push([cellContent]);
    }
  });

  if (cells.length === 0) return;

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-features', cells });
  element.replaceWith(block);
}
