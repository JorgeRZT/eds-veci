export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const content = rows[0]?.querySelector('div');
  if (!content) return;

  content.classList.add('cta-search-content');

  // Ensure the CTA link is rendered as a button even if EDS button
  // auto-decoration did not run for this block's markup.
  content.querySelectorAll('p > a').forEach((a) => {
    const p = a.parentElement;
    if (p.childNodes.length === 1) {
      a.classList.add('button');
      p.classList.add('button-container');
    }
  });

  const textDiv = document.createElement('div');
  const buttonDiv = document.createElement('div');

  [...content.children].forEach((child) => {
    if (child.classList.contains('button-container')
      || child.classList.contains('button-wrapper')
      || child.querySelector('.button')) {
      buttonDiv.appendChild(child);
    } else {
      textDiv.appendChild(child);
    }
  });

  content.appendChild(textDiv);
  content.appendChild(buttonDiv);
}
