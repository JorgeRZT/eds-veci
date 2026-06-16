/*
 * Table Calendar Block
 * Departure pricing matrix: cruise lines are rows, months are columns.
 * Only the months up to October are shown (no horizontal scroll). Collapsed it
 * shows the first few cruise-line rows; a "Ver más" / "Ver menos" toggle
 * expands/collapses the remaining rows vertically.
 */

const COLLAPSED_ROWS = 3; // cruise-line rows shown before "Ver más"

export default async function decorate(block) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const header = !block.classList.contains('no-header');

  let rows = [...block.children];

  // Optional leading heading row: a single cell holding an <h2> (carried inside
  // the block because a standalone heading is dropped by the sections
  // transformer). Lift it out and render it above the table.
  let headingEl = null;
  if (rows.length) {
    const firstCells = [...rows[0].children];
    if (firstCells.length === 1 && firstCells[0].querySelector('h1, h2, h3')) {
      headingEl = firstCells[0].querySelector('h1, h2, h3');
      rows = rows.slice(1);
    }
  }

  // Determine the column cutoff: keep the label column plus every month up to
  // and including the first "octubre" header, dropping later months so the
  // table fits without horizontal scrolling.
  let colLimit = Infinity;
  if (rows.length) {
    const headerCells = [...rows[0].children];
    const octIndex = headerCells.findIndex((cell, idx) => idx > 0
      && /^oct/i.test(cell.textContent.trim()));
    if (octIndex !== -1) colLimit = octIndex + 1;
  }

  let bodyRowCount = 0;
  rows.forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHeaderRow = i === 0 && header;
    [...row.children].forEach((cell, colIndex) => {
      if (colIndex >= colLimit) return;
      const td = document.createElement(isHeaderRow ? 'th' : 'td');
      if (isHeaderRow) td.setAttribute('scope', 'column');
      td.innerHTML = cell.innerHTML;
      tr.append(td);
    });
    if (isHeaderRow) {
      thead.append(tr);
    } else {
      // mark cruise-line rows beyond the collapsed limit for vertical expand
      if (bodyRowCount >= COLLAPSED_ROWS) tr.classList.add('table-calendar-extra');
      bodyRowCount += 1;
      tbody.append(tr);
    }
  });
  table.append(thead, tbody);

  const viewport = document.createElement('div');
  viewport.className = 'table-calendar-viewport table-calendar-collapsed';
  viewport.append(table);

  const parts = [];
  if (headingEl) {
    const heading = document.createElement('h2');
    heading.className = 'table-calendar-heading';
    heading.textContent = headingEl.textContent;
    parts.push(heading);
  }
  parts.push(viewport);

  if (bodyRowCount > COLLAPSED_ROWS) {
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'table-calendar-toggle';
    toggle.textContent = 'Ver más';
    toggle.addEventListener('click', () => {
      const collapsed = viewport.classList.toggle('table-calendar-collapsed');
      toggle.textContent = collapsed ? 'Ver más' : 'Ver menos';
    });
    parts.push(toggle);
  }
  block.replaceChildren(...parts);
}
