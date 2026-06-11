export default function decorate(block) {
  const section = block.closest('.section');
  if (section) {
    [...block.children].forEach((row) => {
      const key = row.children[0]?.textContent.trim().toLowerCase();
      const value = row.children[1]?.textContent.trim();
      if (key === 'style' && value) {
        value.split(',').forEach((style) => {
          section.classList.add(style.trim());
        });
      }
    });
  }
  block.remove();
}
