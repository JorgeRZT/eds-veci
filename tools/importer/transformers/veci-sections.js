/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: veci (Viajes El Corte Ingles) section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks where style is defined.
 * Runs in afterTransform only. Uses payload.template.sections from page-templates.json.
 * All selectors verified against migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

/**
 * Finds an element matching a section selector.
 * Handles standard CSS selectors, :has() pseudo-class, and non-standard
 * :contains() pseudo-class by falling back to text-content matching.
 * @param {Element} element - The root element to search in
 * @param {string|string[]} selector - CSS selector or array of selectors
 * @returns {Element|null}
 */
function findSectionElement(element, selector) {
  const selectors = Array.isArray(selector) ? selector : [selector];

  for (const sel of selectors) {
    // Handle :contains() pseudo-class which is not standard CSS
    // Pattern: .selector:has(> h2:contains('text'))
    const containsMatch = sel.match(/^(.+):has\(>\s*h2:contains\('([^']+)'\)\)$/);
    if (containsMatch) {
      const baseSelector = containsMatch[1];
      const textToFind = containsMatch[2].toLowerCase();
      try {
        const candidates = element.querySelectorAll(baseSelector);
        for (const candidate of candidates) {
          const h2 = candidate.querySelector(':scope > h2');
          if (h2 && h2.textContent.toLowerCase().includes(textToFind)) {
            return candidate;
          }
        }
      } catch (e) {
        // Selector failed, continue to next
      }
      continue;
    }

    // Handle :has() with :first-child pattern
    // Pattern: .selector:not(.collapsible):has(h2:first-child)
    const hasMatch = sel.match(/^(.+):has\(([^)]+)\)$/);
    if (hasMatch) {
      // Try the full selector first (browser may support :has())
      try {
        const found = element.querySelector(sel);
        if (found) return found;
      } catch (e) {
        // :has() not supported, do manual check
      }
      // Manual fallback: parse base selector (before :has) and check condition
      const basePart = hasMatch[1];
      const hasPart = hasMatch[2];
      try {
        const candidates = element.querySelectorAll(basePart);
        for (const candidate of candidates) {
          try {
            const inner = candidate.querySelector(hasPart);
            if (inner) return candidate;
          } catch (e2) {
            // inner selector failed
          }
        }
      } catch (e) {
        // base selector failed
      }
      continue;
    }

    // Standard CSS selector
    try {
      const found = element.querySelector(sel);
      if (found) return found;
    } catch (e) {
      // Invalid selector, continue
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument;

    // Process sections in reverse order to avoid DOM position shifts
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      const sectionEl = findSectionElement(element, section.selector);

      if (!sectionEl) continue;

      // Add Section Metadata block if section has a style
      if (section.style) {
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(metadataBlock);
      }

      // Insert <hr> before section (except for the first section)
      if (i > 0) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    }
  }
}
