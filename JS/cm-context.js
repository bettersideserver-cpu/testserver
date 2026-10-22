(() => {
  // Keep selected property context while navigating the separate room pages.
  document.addEventListener('click', event => {
    const path = event.target.closest('path[data-link]');
    const match = path?.id.match(/^Floor_([A-Z]+)_(\d+)$/i);
    if (!match) return;
    try {
      sessionStorage.setItem('cmInfiniaTower', match[1].toUpperCase());
      sessionStorage.setItem('cmInfiniaFloor', match[2]);
      sessionStorage.setItem('cmInfiniaUnit', '1');
    } catch { /* Navigation remains available when storage is restricted. */ }
  }, true);
})();
