(() => {
  const art = document.querySelector('.hero-art');
  const control = art?.querySelector('.art-motion-control');
  if (!art || !control) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  let visible = true;
  let frame = 0;
  let x = 0;
  let y = 0;

  const center = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    art.style.setProperty('--pointer-x', '0deg');
    art.style.setProperty('--pointer-y', '0deg');
  };
  const sync = () => {
    const stopped = paused || reduced.matches;
    art.dataset.motion = stopped ? 'paused' : 'playing';
    art.dataset.visible = String(visible && !document.hidden);
    control.setAttribute('aria-pressed', String(paused));
    const label = paused ? 'Включить анимацию' : 'Остановить анимацию';
    control.setAttribute('aria-label', label);
    control.querySelector('span').textContent = label;
    if (stopped || !visible || document.hidden) center();
  };
  control.addEventListener('click', () => { paused = !paused; sync(); });
  art.addEventListener('pointermove', (event) => {
    if (paused || reduced.matches || !finePointer.matches || !visible) return;
    const bounds = art.getBoundingClientRect();
    x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    if (frame) return;
    frame = requestAnimationFrame(() => {
      art.style.setProperty('--pointer-x', `${(x * 8).toFixed(2)}deg`);
      art.style.setProperty('--pointer-y', `${(-y * 6).toFixed(2)}deg`);
      frame = 0;
    });
  }, { passive: true });
  art.addEventListener('pointerleave', center);
  reduced.addEventListener('change', sync);
  finePointer.addEventListener('change', center);
  document.addEventListener('visibilitychange', sync);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    }, { threshold: 0 }).observe(art);
  }
  sync();
})();
