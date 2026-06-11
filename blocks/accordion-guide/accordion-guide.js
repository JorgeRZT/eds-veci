export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-guide-item-label';
    summary.append(...label.childNodes);
    const body = row.children[1];
    body.className = 'accordion-guide-item-body';
    const details = document.createElement('details');
    details.className = 'accordion-guide-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
