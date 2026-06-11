import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  let fragment = await loadFragment(footerPath);
  if (!fragment && footerPath === '/footer') {
    fragment = await loadFragment('/content/footer');
  }

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Sections come decorated as .section wrappers. Tag them by role so CSS can
  // target them reliably regardless of EDS section/wrapper nesting.
  const sections = [...footer.querySelectorAll(':scope > .section')];
  const [shortcuts, columns, copyright] = sections;
  if (shortcuts) shortcuts.classList.add('footer-shortcuts');
  if (columns) columns.classList.add('footer-columns');
  if (copyright) copyright.classList.add('footer-copyright');

  // The columns section is flattened into a single content wrapper. Re-group
  // its children into columns: a leading logo paragraph, then one column per
  // heading (h2/h3) including the elements that follow it.
  if (columns) {
    const wrapper = columns.querySelector(':scope > div') || columns;
    const nodes = [...wrapper.children];
    wrapper.textContent = '';

    let current = null;
    nodes.forEach((node) => {
      const isHeading = /^H[1-6]$/.test(node.tagName);
      const isLogo = node.tagName === 'P' && node.querySelector('img');
      if (isLogo) {
        const logoCol = document.createElement('div');
        logoCol.className = 'footer-column footer-logo';
        logoCol.append(node);
        wrapper.append(logoCol);
        current = null;
      } else if (isHeading) {
        current = document.createElement('div');
        current.className = 'footer-column';
        current.append(node);
        wrapper.append(current);
      } else if (current) {
        current.append(node);
      } else {
        wrapper.append(node);
      }
    });
  }

  block.append(footer);
}
