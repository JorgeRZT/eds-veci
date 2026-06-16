/* eslint-disable */
/* global WebImporter */

/**
 * Parser for table-calendar
 * Base block: table (departure-pricing matrix: months x cruise lines)
 * Live React DOM: section[data-name="PriceCalendar"] is a TRANSPOSED carousel:
 *   - a header column <ul> lists the cruise lines (<h3>): Costa Cruceros, MSC, ...
 *   - each month is a column <ul.MonthColumn...> with a year/month header and
 *     one <li.MonthCell> per cruise line, each holding <strong>PRICE<span>€</span></strong>.
 * splide duplicates month columns as clones, so months are de-duplicated by
 * year+month label. Empty future months (no prices) are dropped.
 *
 * Output (transposed back to rows for the table block):
 *   Row 0 (header): ["Mes", <line1>, <line2>, ...]
 *   Row i: [<month label>, <price or "">, ...] aligned to the line order.
 * The <h2> heading is carried as lead content (caption) before the block.
 */
export default function parse(element, { document }) {
  const E = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const cells = [];

  // Cruise-line headers (column order)
  const lineHeaders = [...element.querySelectorAll('[class*="HeadersColumn"] h3')].map((h) => E(h.textContent));

  // Month columns (dedupe clones by year+month)
  const cols = [...element.querySelectorAll('ul[class*="MonthColumn"]')];
  const seen = new Set();
  const monthRows = [];
  cols.forEach((col) => {
    const year = E((col.querySelector('[class*="MonthHeaderYear"]') || {}).textContent);
    const monthName = E((col.querySelector('[class*="MonthHeaderMonth"]') || {}).textContent);
    const label = `${monthName} ${year}`.trim();
    const key = `${year}|${monthName}`;
    if (!label || seen.has(key)) return;
    seen.add(key);

    const priceCells = [...col.querySelectorAll('li[class*="MonthCell"]')].map((li) => {
      const strong = li.querySelector('strong');
      if (!strong) return '';
      return E(strong.textContent).replace(/\s*€/, '€');
    });
    // Drop months with no prices at all (empty future months)
    if (priceCells.some((p) => p)) {
      monthRows.push({ label, prices: priceCells });
    }
  });

  if (lineHeaders.length && monthRows.length) {
    // Transposed to match the source: cruise lines are ROWS (sticky first
    // column) and months are COLUMNS that scroll horizontally.
    //   Header row:  ['', month1, month2, …]
    //   Line row i:  [lineName_i, price(month1,i), price(month2,i), …]
    cells.push(['', ...monthRows.map((r) => r.label)]);
    lineHeaders.forEach((lineName, i) => {
      const row = [lineName];
      monthRows.forEach((r) => row.push(r.prices[i] || ''));
      cells.push(row);
    });
  } else {
    // Fallback: a plain <table> (egipto-style or SSR variant)
    const table = element.querySelector('table');
    if (table) {
      [...table.querySelectorAll('tr')].forEach((tr) => {
        const rowCells = [...tr.children].map((c) => E(c.textContent) || '');
        if (rowCells.length) cells.push(rowCells);
      });
    }
  }

  // The SSR DOM frequently drops the section <h2>; fall back to the known
  // title. Carry it as a single-cell heading row INSIDE the block (a standalone
  // <h2> sibling gets discarded by the sections transformer) — the block JS
  // lifts this row out and renders it above the table.
  const heading = element.querySelector('h1, h2, h3');
  const headingText = (heading && E(heading.textContent))
    || 'Calendario de salidas Mediterráneo Occidental';
  if (headingText) {
    const h = document.createElement('h2');
    h.textContent = headingText;
    cells.unshift([h]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'table-calendar', cells });
  element.replaceWith(block);
}
