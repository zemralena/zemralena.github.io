(() => {
  'use strict';
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const story = document.querySelector('.campaign-takeover');
  const scenes = [story.querySelector('.campaign-opening'), ...story.querySelectorAll('.story-panel')];
  const labels = ['The campaign', 'Out-of-home', 'Print concepts', 'Prouder. Louder. Bolder.', 'Houston mural'];
  const controls = story.querySelector('.sequence-controls');
  const previous = controls.querySelector('[data-scene-prev]');
  const next = controls.querySelector('[data-scene-next]');
  const clamp = value => Math.max(0, Math.min(1, value));
  let queued = false;
  let activeIndex = 0;
  function render() {
    queued = false;
    document.body.classList.toggle('takeover-enabled', !preference.matches);
    controls.hidden = preference.matches;
    if (preference.matches) {
      scenes.forEach(scene => { scene.removeAttribute('style'); scene.querySelector('.image-open')?.removeAttribute('style'); scene.inert = false; scene.removeAttribute('aria-hidden'); });
      return;
    }
    const distance = story.offsetHeight - (innerHeight - 64);
    const progress = clamp((64 - story.getBoundingClientRect().top) / distance) * (scenes.length - .25);
    activeIndex = Math.min(scenes.length - 1, Math.floor(progress + .3));
    scenes.forEach((scene, index) => {
      const entrance = index === 0 ? 1 : clamp((progress - index + .65) / .65);
      const eased = entrance * entrance * (3 - 2 * entrance);
      scene.style.zIndex = String(index + 1);
      scene.style.visibility = entrance > 0 ? 'visible' : 'hidden';
      scene.style.clipPath = `inset(${((1 - eased) * 100).toFixed(3)}% 0 0 0)`;
      const art = scene.querySelector('.image-open');
      if (art) art.style.transform = `translate3d(0,${((1-eased)*28).toFixed(2)}px,0) scale(${(.975+.025*eased).toFixed(4)})`;
      const active = index === activeIndex;
      scene.classList.toggle('is-current', active);
      scene.inert = !active;
      scene.setAttribute('aria-hidden', String(!active));
    });
    controls.querySelector('#scene-index').textContent = String(activeIndex + 1).padStart(2, '0');
    controls.querySelector('#scene-label').textContent = labels[activeIndex];
    controls.querySelector('.sequence-track span').style.width = `${clamp(progress / (scenes.length - 1)) * 100}%`;
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === scenes.length - 1;
  }
  function schedule() { if (!queued) { queued = true; requestAnimationFrame(render); } }
  function goTo(index) {
    const top = scrollY + story.getBoundingClientRect().top - 64;
    const distance = story.offsetHeight - (innerHeight - 64);
    window.scrollTo({top: top + index / (scenes.length - .25) * distance, behavior: 'smooth'});
  }
  previous.addEventListener('click', () => goTo(Math.max(0, activeIndex - 1)));
  next.addEventListener('click', () => goTo(Math.min(scenes.length - 1, activeIndex + 1)));
  story.querySelector('.scroll-cue').addEventListener('click', event => {
    if (preference.matches) return;
    event.preventDefault(); goTo(1);
  });
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  preference.addEventListener('change', schedule);
  render();
})();
