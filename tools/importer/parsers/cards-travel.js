/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-travel
 * Base block: cards
 * Source: https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto
 * Selectors: section.mod_section_access, section.mod-links.mod-links-destination-x2
 * Generated: 2026-06-11
 *
 * Extracts travel option cards from list items containing linked images and text.
 * Each card becomes one row with [image, text+link].
 * Manually validated via MCP Playwright. Site WAF blocks automated validator.
 */
export default function parse(element, { document }) {
  // Find all card items - try multiple patterns for robustness
  // Pattern 1: section.mod_section_access structure
  // Pattern 2: section.mod-links structure
  // Pattern 3: generic list items with links
  let cardItems = element.querySelectorAll('li');

  // If no list items, look for direct link containers (anchor tags with images)
  if (!cardItems || !cardItems.length) {
    cardItems = element.querySelectorAll('a:has(img)');
  }

  const cells = [];

  if (cardItems && cardItems.length) {
    cardItems.forEach((item) => {
      // Each card item contains a link wrapping an image and text
      const link = item.tagName === 'A' ? item : item.querySelector('a');
      if (!link) return;

      const img = item.querySelector('img');
      const textEl = item.querySelector('p, span, h3, h4, strong');

      // Cell 1: Image
      const imageCell = [];
      if (img) {
        imageCell.push(img);
      }

      // Cell 2: Card body - link with card text
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
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-travel', cells });
  element.replaceWith(block);
}
