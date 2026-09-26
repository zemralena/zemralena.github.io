(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const book = document.querySelector('[data-pho-brand-book]');

  if (book) {
    const pages = [...book.querySelectorAll('.pho-book-page')];
    const count = book.querySelector('[data-pho-book-page]');
    let active = -1;
    let queued = false;

    const setPage = (index) => {
      if (index === active) return;
      active = index;
      pages.forEach((page, pageIndex) => {
        const current = pageIndex === index;
        page.classList.toggle('is-active', current);
        page.setAttribute('aria-hidden', String(!current));
      });
      count.textContent = String(index + 1).padStart(2, '0');
    };

    const update = () => {
      queued = false;
      if (!book.classList.contains('is-guided')) return;
      const travel = Math.max(1, book.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -book.getBoundingClientRect().top / travel));
      setPage(Math.min(pages.length - 1, Math.floor(progress * pages.length)));
    };

    const schedule = () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(update);
    };

    const layout = () => {
      const guided = !reduceMotion.matches && window.innerHeight >= 520;
      book.classList.toggle('is-guided', guided);
      if (guided) update();
      else {
        active = 0;
        pages.forEach((page) => page.removeAttribute('aria-hidden'));
        pages.forEach((page, pageIndex) => page.classList.toggle('is-active', pageIndex === 0));
        count.textContent = '01';
      }
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', layout);
    reduceMotion.addEventListener('change', layout);
    layout();
  }

  const stories = document.querySelector('[data-pho-stories]');
  if (!stories) return;

  const cards = [...stories.querySelectorAll('[data-pho-story]')];
  const dots = [...stories.querySelectorAll('[data-pho-story-dot]')];
  const current = stories.querySelector('[data-pho-story-current]');
  const previous = stories.querySelector('[data-pho-story-prev]');
  const next = stories.querySelector('[data-pho-story-next]');
  let storyIndex = 0;
  let timer;

  const showStory = (nextIndex) => {
    storyIndex = (nextIndex + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const active = cardIndex === storyIndex;
      card.classList.toggle('is-active', active);
      card.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === storyIndex;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    current.textContent = String(storyIndex + 1).padStart(2, '0');
  };

  const stop = () => window.clearInterval(timer);
  const start = () => {
    if (reduceMotion.matches) return;
    stop();
    timer = window.setInterval(() => showStory(storyIndex + 1), 5000);
  };

  previous.addEventListener('click', () => { showStory(storyIndex - 1); start(); });
  next.addEventListener('click', () => { showStory(storyIndex + 1); start(); });
  dots.forEach((dot, dotIndex) => dot.addEventListener('click', () => { showStory(dotIndex); start(); }));
  stories.addEventListener('pointerenter', stop);
  stories.addEventListener('pointerleave', start);
  stories.addEventListener('focusin', stop);
  stories.addEventListener('focusout', (event) => {
    if (!stories.contains(event.relatedTarget)) start();
  });
  document.addEventListener('visibilitychange', () => document.hidden ? stop() : start());

  showStory(0);
  start();
})();
