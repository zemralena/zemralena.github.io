(function () {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const bar = document.getElementById('progress');
  const videos = [...document.querySelectorAll('video[data-motion]')];
  const toggle = document.querySelector('.motion-toggle');
  let paused = preference.matches;
  let queued = false;
  function progress() {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
  }
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(progress); } }, {passive:true});
  addEventListener('resize', progress);
  addEventListener('load', progress);
  progress();
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  document.querySelectorAll('.exp-btn').forEach((btn, i) => {
    const wrap = btn.closest('.exp');
    const body = wrap.querySelector('.exp-body');
    body.id = 'experience-panel-' + i;
    btn.id = 'experience-button-' + i;
    btn.setAttribute('aria-controls', body.id);
    body.setAttribute('aria-labelledby', btn.id);
    body.setAttribute('role', 'region');
    body.inert = true;
    btn.addEventListener('click', () => {
      const open = wrap.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      body.inert = !open;
      btn.querySelector('.plus').textContent = open ? '−' : '+';
      setTimeout(progress, 460);
    });
  });
  function syncMotion() {
    document.body.classList.toggle('motion-paused', paused);
    if (toggle) { toggle.textContent = paused ? 'Play motion' : 'Pause motion'; toggle.setAttribute('aria-pressed', String(paused)); }
    videos.forEach(v => {
      if (paused || document.hidden || v.dataset.inView !== 'true') v.pause();
      else if (!v.controls) v.play().catch(() => {});
    });
  }
  if (toggle) { toggle.hidden = false; toggle.addEventListener('click', () => { paused = !paused; syncMotion(); }); }
  // Case-study videos use native controls; homepage previews run only in view.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({target, isIntersecting}) => {
        target.dataset.inView = String(isIntersecting);
        if (isIntersecting && target.preload === 'none') target.preload = 'metadata';
      });
      syncMotion();
    }, {threshold:0.15});
    videos.forEach(v => observer.observe(v));
  }
  preference.addEventListener('change', () => { paused = preference.matches; syncMotion(); });
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();
})();
