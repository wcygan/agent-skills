const menu = document.getElementById('menu');
const sidebar = document.getElementById('sidebar');
const scrim = document.getElementById('scrim');
const mobile = matchMedia('(max-width: 900px)');
function setOpen(open) {
  document.body.classList.toggle('nav-open', open);
  menu.setAttribute('aria-expanded', String(open));
  scrim.hidden = !open;
  sidebar.inert = mobile.matches && !open;
  if (open) sidebar.querySelector('[aria-current]').focus();
}
menu.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
scrim.addEventListener('click', () => { setOpen(false); menu.focus(); });
document.addEventListener('keydown', event => {
  if (menu.getAttribute('aria-expanded') !== 'true') return;
  if (event.key === 'Escape') { setOpen(false); menu.focus(); }
  if (event.key === 'Tab') {
    const targets = [menu, ...sidebar.querySelectorAll('a')];
    const first = targets[0], last = targets[targets.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
mobile.addEventListener('change', () => setOpen(false));
setOpen(false);
