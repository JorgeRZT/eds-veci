/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: veci (Viajes El Corte Ingles) section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks where style is defined.
 * Runs in afterTransform only. Uses payload.template.sections from page-templates.json.
 * Generic across templates (destination-page, cruise-zone-page); selectors come from the
 * template's sections[] in page-templates.json (verified against migration-work/cleaned.html).
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

// Recognised block names produced by this project's parsers. WebImporter's
// createBlock() emits each block as a <table> whose first cell holds the block
// name (optionally with a "(variant)" suffix). After block parsing the DOM
// therefore contains <table> nodes, not <div class="…"> — those classes only
// appear once the table is rendered to markdown/plain HTML downstream.
const BLOCK_NAMES = new Set([
  'hero-destination', 'cta-search', 'cards-cruise', 'columns-intro',
  'table-calendar', 'cards-travel', 'cards-links', 'cards-features',
  'carousel-gallery', 'accordion-guide',
]);

// Normalise a block label to kebab-case. createBlock() title-cases the name and
// uses spaces (e.g. "Cards Cruise"); strip any "(variant)" suffix first.
function toKebab(label) {
  return (label || '')
    .replace(/\(.*\)/, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

function isBlockEl(node) {
  if (!node || node.nodeType !== 1) return false;
  // Generated block table: first cell contains the (title-cased) block name.
  if (node.tagName === 'TABLE') {
    const firstCell = node.querySelector('tr td, tr th');
    return !!firstCell && BLOCK_NAMES.has(toKebab(firstCell.textContent));
  }
  // Already-decorated block div (defensive; some pipelines pre-render).
  if (node.tagName === 'DIV') {
    return [...node.classList].some((c) => BLOCK_NAMES.has(c));
  }
  return false;
}

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument;

    // After block parsing the original source <section data-name="…"> elements
    // no longer exist — each parser replaced its section with a generated block
    // table. EDS derives page sections from <hr> separators, so we insert one
    // <hr> before every top-level block (except the first) to split the single
    // wrapper into one section per block. We also emit a Section Metadata block
    // for sections that declare a style, mapped to blocks by source order.
    //
    // The wrapper holding the blocks is usually the importer's <main>/<body>;
    // fall back to the parent of the first recognised block element (the blocks
    // may be nested several levels deep inside the original React wrappers).
    let container = element;
    if (![...container.children].some(isBlockEl)) {
      const allBlocks = [...container.querySelectorAll('table, div[class]')].filter(isBlockEl);
      if (allBlocks.length && allBlocks[0].parentElement) {
        container = allBlocks[0].parentElement;
      }
    }

    const blocks = [...container.children].filter(isBlockEl);
    if (blocks.length < 2) {
      // Fall back to the legacy selector-based behaviour (e.g. templates whose
      // parsers do not replace their section element).
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const sectionEl = findSectionElement(element, section.selector);
        if (!sectionEl) continue;
        if (section.style) {
          sectionEl.after(WebImporter.Blocks.createBlock(document, {
            name: 'Section Metadata',
            cells: { style: section.style },
          }));
        }
        if (i > 0) sectionEl.before(document.createElement('hr'));
      }
      return;
    }

    // Rebuild the document as a flat sequence of top-level sections separated by
    // <hr>. html2md only treats an <hr> as a section break when it is a direct
    // child of the root element it serializes — an <hr> left nested inside the
    // original React wrapper is dropped. So we move each block (plus its Section
    // Metadata) up to `element` and interleave <hr> separators between them.
    const root = element;
    const frag = document.createElement('div');
    blocks.forEach((block, i) => {
      if (i > 0) frag.appendChild(document.createElement('hr'));
      frag.appendChild(block); // moves the block out of the nested wrapper
      const style = sections[i] && sections[i].style;
      if (style) {
        frag.appendChild(WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style },
        }));
      }
    });
    // Replace the root's contents with the flattened, section-separated output.
    root.textContent = '';
    while (frag.firstChild) root.appendChild(frag.firstChild);
  }
}
