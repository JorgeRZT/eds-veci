/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cta-search
 * Base block: cta-search
 * Live React DOM: the cruise booking-engine search widget section
 * (main > section:has([role="search"])). It renders filter <button>s
 * (Destino, Mes, Puerto, Duración, Navieras), a "Buscar" button, and a result
 * count (e.g. "2.270"). The widget is a live JS app with no plain anchor.
 *
 * Authorable equivalent (per page-analysis): a static CTA panel:
 *   - heading: "Buscador de cruceros"
 *   - supporting text: "{count} cruceros encontrados en {destino}"
 *   - button: "Buscar cruceros" → booking-engine searcher URL
 *
 * Output: single row / single cell [heading, text, button]. cta-search.js routes
 * a child containing a `.button` (a bare <a>) into the button column.
 */
export default function parse(element, { document }) {
  // Booking-engine searcher URL: prefer a real anchor, else the known endpoint.
  const anchor = element.querySelector('a[href*="searcher"], a[href*="bookings"]');
  const searcherUrl = anchor
    ? (anchor.getAttribute('href').startsWith('//') ? `https:${anchor.getAttribute('href')}` : anchor.href)
    : 'https://bookings.viajeselcorteingles.es/cruisesshowcase/searcher?codzona=1';

  // Destination: first filter button's value (e.g. "Mediterráneo Occidental").
  let destination = '';
  const buttons = [...element.querySelectorAll('button')];
  const destBtn = buttons.find((b) => /Mediterr|Destino/i.test(b.getAttribute('aria-label') || b.textContent));
  if (destBtn) {
    const v = destBtn.textContent.replace(/\s+/g, ' ').replace(/^Destino/i, '').trim();
    if (v && !/^destino$/i.test(v)) destination = v;
  }

  // Count: first standalone number like "2.270".
  let count = '';
  const all = [...element.querySelectorAll('p, span, div')];
  for (const el of all) {
    const t = el.textContent.replace(/\s+/g, ' ').trim();
    const m = t.match(/^[\d.]{2,}$/);
    if (m) { count = m[0]; break; }
  }

  const heading = document.createElement('h2');
  heading.textContent = 'Buscador de cruceros';

  const text = document.createElement('p');
  if (count && destination) text.textContent = `${count} cruceros encontrados en ${destination}`;
  else if (count) text.textContent = `${count} cruceros encontrados`;
  else text.textContent = 'Encuentra tu próximo crucero';

  const button = document.createElement('a');
  button.href = searcherUrl;
  button.textContent = 'Buscar cruceros';

  const cells = [[[heading, text, button]]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'cta-search', cells });
  element.replaceWith(block);
}
