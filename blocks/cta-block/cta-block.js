export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length === 0) return;

  const content = rows[0]?.querySelector('div');
  if (!content) return;

  content.classList.add('cta-block-content');

  const textDiv = document.createElement('div');
  const buttonDiv = document.createElement('div');

  [...content.children].forEach((child) => {
    if (child.classList.contains('button-wrapper') || child.querySelector('.button')) {
      buttonDiv.appendChild(child);
    } else {
      textDiv.appendChild(child);
    }
  });

  content.appendChild(textDiv);
  content.appendChild(buttonDiv);
}
