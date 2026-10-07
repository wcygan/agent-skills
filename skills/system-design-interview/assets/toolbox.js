// Keep native disclosures available when JavaScript is disabled.
const dialog = document.createElement('dialog');
dialog.className = 'details-popup';
dialog.setAttribute('aria-labelledby', 'details-popup-title');
dialog.innerHTML = '<div class="details-popup__header"><h2 id="details-popup-title"></h2><button type="button" class="details-popup__close" autofocus>Close</button></div><div class="details-popup__content"></div>';
document.body.append(dialog);
const title = dialog.querySelector('h2');
const content = dialog.querySelector('.details-popup__content');
let opener;
dialog.querySelector('button').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
// Follow related concepts inside the dialog, keeping the reader in context.
content.addEventListener('click', event => {
  const link = event.target.closest('a[href^="#"]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = document.getElementById(link.getAttribute('href').slice(1));
  const button = target?.querySelector('.concept-details-button');
  if (!button) return;
  event.preventDefault();
  button.click();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('details-popup-open');
  content.replaceChildren();
  opener?.focus();
});
for (const details of document.querySelectorAll('.concept-details')) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'concept-details-button';
  button.textContent = details.querySelector('summary').textContent;
  const card = details.closest('article, .semantics');
  const heading = card.querySelector('h3').textContent;
  button.setAttribute('aria-label', `${button.textContent}: ${heading}`);
  button.setAttribute('aria-haspopup', 'dialog');
  button.addEventListener('click', () => {
    opener = button;
    title.textContent = heading;
    const visualization = card.querySelector('svg').cloneNode(true);
    // Keep SVG marker IDs unique when the same diagram appears twice.
    for (const element of visualization.querySelectorAll('[id]')) {
      const previous = element.id;
      element.id = `popup-${previous}`;
      for (const node of visualization.querySelectorAll('*')) {
        for (const attribute of [...node.attributes]) {
          if (attribute.value.includes(`url(#${previous})`)) {
            node.setAttribute(attribute.name, attribute.value.replaceAll(`url(#${previous})`, `url(#${element.id})`));
          }
        }
      }
    }
    content.replaceChildren(card.querySelector('.concept-priority').cloneNode(true), visualization, details.querySelector('.concept-details__body').cloneNode(true));
    if (!dialog.open) dialog.showModal();
    else dialog.querySelector('.details-popup__close').focus();
    document.body.classList.add('details-popup-open');
  });
  details.replaceWith(button);
}
