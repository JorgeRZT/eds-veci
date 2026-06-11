/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-guide
 * Base block: accordion
 * Source: https://www.viajeselcorteingles.es/grandes-viajes/destinos/egipto
 * Selector: .module.mod-info.collapsible
 * Generated: 2026-06-11
 * Validation: Site WAF blocks headless validator (403); parser logic verified via MCP Playwright.
 *
 * Source structure (per element):
 *   div.module.mod-info.collapsible
 *     > button.action-show (toggle control, skip)
 *     > h2 (accordion item title)
 *     > div.content-mod-info (accordion item body)
 *       > div.carrusel-mod-info > ul > li > img (carousel images)
 *       > p (description paragraphs)
 *
 * Target: Standard EDS accordion block - one row per item [title, content]
 * Each matched element produces one accordion block with one row.
 */
export default function parse(element, { document }) {
  // Extract the heading (accordion item title)
  const heading = element.querySelector('h2, h3, h4');

  // Extract the content container with the body text and images
  const contentContainer = element.querySelector('.content-mod-info, .content');

  // Build content cell: images followed by paragraphs
  const contentElements = [];

  if (contentContainer) {
    // Extract images from the carousel/gallery area
    const images = Array.from(contentContainer.querySelectorAll('img'));
    for (const img of images) {
      contentElements.push(img);
    }

    // Extract text paragraphs (direct children of content container)
    const paragraphs = Array.from(contentContainer.querySelectorAll(':scope > p'));
    for (const p of paragraphs) {
      if (p.textContent.trim()) {
        contentElements.push(p);
      }
    }
  }

  // Build cells: standard accordion row = [title, body content]
  const cells = [];

  if (heading) {
    if (contentElements.length > 0) {
      cells.push([heading, contentElements]);
    } else {
      // Heading only, no expandable content
      cells.push([heading, '']);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-guide', cells });
  element.replaceWith(block);
}
