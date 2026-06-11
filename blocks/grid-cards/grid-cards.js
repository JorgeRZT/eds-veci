export default function decorate(block) {
  const rows = [...block.children];
  const header = rows.shift();

  if (header) {
    header.classList.add('grid-cards-header');
  }

  const grid = document.createElement('ul');
  grid.classList.add('grid-cards-grid');

  rows.forEach((row) => {
    const li = document.createElement('li');
    li.classList.add('grid-cards-item');

    const cols = [...row.children];
    const imageCol = cols[0];
    const textCol = cols[1];

    if (imageCol) {
      const imgWrapper = document.createElement('div');
      imgWrapper.classList.add('grid-cards-image');
      imgWrapper.innerHTML = imageCol.innerHTML;
      li.appendChild(imgWrapper);
    }

    if (textCol) {
      const body = document.createElement('div');
      body.classList.add('grid-cards-body');
      body.innerHTML = textCol.innerHTML;
      li.appendChild(body);
    }

    grid.appendChild(li);
    row.remove();
  });

  block.appendChild(grid);
}
