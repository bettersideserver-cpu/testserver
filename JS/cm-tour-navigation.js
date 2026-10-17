(() => {
  'use strict';
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-cm-room]');
    if (!control) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const destination = new URL(control.dataset.cmRoom, location.href);
    const resume = () => location.assign(destination.href);
    if (window.CMInfiniaRequireVisitor?.(resume)) resume();
  }, true);
})();
