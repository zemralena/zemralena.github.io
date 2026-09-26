(() => {
  const takeover = document.querySelector('[data-pipeline-book]');
  if (!takeover) return;

  const pages = [...takeover.querySelectorAll('.pipeline-book-page')];
  const count = takeover.querySelector('[data-pipeline-page]');
  const progressBar = takeover.querySelector('[data-pipeline-progress]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let active = -1;
  let queued = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function setPage(index) {
    if (index === active && pages[index].classList.contains('is-active')) return;
    active = index;
    pages.forEach((page, pageIndex) => {
      const current = pageIndex === index;
      page.classList.toggle('is-active', current);
      page.setAttribute('aria-hidden', String(!current));
    });
    count.textContent = String(index + 1).padStart(2, '0');
  }

  function update() {
    queued = false;
    if (!takeover.classList.contains('is-guided')) return;
    const travel = Math.max(1, takeover.offsetHeight - (innerHeight - 64));
    const progress = clamp((64 - takeover.getBoundingClientRect().top) / travel);
    const index = Math.min(pages.length - 1, Math.floor(progress * pages.length));
    setPage(index);
    progressBar.style.width = `${progress * 100}%`;
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }

  function layout() {
    const guided = !reducedMotion.matches && innerHeight >= 520;
    takeover.classList.toggle('is-guided', guided);
    if (guided) {
      setPage(active);
      update();
    } else {
      pages.forEach(page => page.removeAttribute('aria-hidden'));
      progressBar.style.width = '0';
    }
  }

  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', layout);
  reducedMotion.addEventListener('change', layout);
  layout();
  if (location.hash) {
    setTimeout(() => document.querySelector(location.hash)?.scrollIntoView(), 120);
  }
})();
