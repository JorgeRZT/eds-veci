export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    const content = row.querySelector('a') || row;
    if (content.tagName === 'A') {
      li.append(content.cloneNode(true));
    } else {
      li.textContent = content.textContent.trim();
      li.setAttribute('aria-current', 'page');
    }
    ol.append(li);
  });

  nav.append(ol);
  block.textContent = '';
  block.append(nav);
}
