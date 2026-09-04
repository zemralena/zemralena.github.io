(function(){
  'use strict';

  /* reveal on scroll */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0, rootMargin: '0px 0px -6% 0px' });
  var rvs = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    rvs.forEach(function(el){ el.classList.add('in'); });
  } else {
    rvs.forEach(function(el){ io.observe(el); });
    // failsafe: never leave content hidden
    setTimeout(function(){ rvs.forEach(function(el){ el.classList.add('in'); }); }, 2500);
  }

  /* bar tone inversion over dark sections */
  var dark = document.querySelectorAll('.sec--deep, .contact');
  var tone = new IntersectionObserver(function(es){
    var over = false;
    es.forEach(function(e){ if (e.isIntersecting) over = true; });
    document.body.classList.toggle('tone-deep', over);
  }, { rootMargin: '-1px 0px -95% 0px' });
  dark.forEach(function(s){ tone.observe(s); });

  /* filters */
  var chips = document.querySelectorAll('.chip'), wall = document.getElementById('wall');
  chips.forEach(function(ch){
    ch.addEventListener('click', function(){
      chips.forEach(function(c){ c.setAttribute('aria-pressed','false'); });
      ch.setAttribute('aria-pressed','true');
      var f = ch.dataset.f;
      wall.querySelectorAll('.tile').forEach(function(t){
        t.classList.toggle('is-hidden', f !== 'All' && t.dataset.cat !== f);
      });
    });
  });

  /* logo plate follows the work index */
  var plate = document.getElementById('plate'), pimg = document.getElementById('plateImg');
  if (plate) {
    document.querySelectorAll('.row').forEach(function(r){
      var logo = r.dataset.logo;
      r.addEventListener('mouseenter', function(){
        if (!logo) { plate.classList.remove('on'); return; }
        pimg.src = logo; plate.classList.add('on');
      });
      r.addEventListener('mouseleave', function(){ plate.classList.remove('on'); });
      r.addEventListener('mousemove', function(e){
        var w = plate.offsetWidth, h = plate.offsetHeight;
        var x = e.clientX + 170, y = e.clientY;
        x = Math.max(w/2 + 8, Math.min(innerWidth  - w/2 - 8, x));
        y = Math.max(h/2 + 8, Math.min(innerHeight - h/2 - 8, y));
        plate.style.left = x + 'px';
        plate.style.top  = y + 'px';
      });
    });
  }

  /* sticky mini-nav after the masthead scrolls past */
  (function(){
    var mb = document.getElementById('minibar'), mast = document.querySelector('.mast');
    if (!mb || !mast) return;
    var io = new IntersectionObserver(function(e){
      mb.classList.toggle('on', !e[0].isIntersecting);
    }, { rootMargin: '-10px 0px 0px 0px' });
    io.observe(mast);
  })();

  /* video tiles: play on hover, tap to toggle on touch */
  document.querySelectorAll('.tile--v').forEach(function(t){
    var v = t.querySelector('video');
    if (!v) return;
    function play(){ v.preload='auto'; var p=v.play(); if(p&&p.catch)p.catch(function(){}); t.classList.add('is-playing'); }
    function stop(){ v.pause(); t.classList.remove('is-playing'); }
    t.addEventListener('mouseenter', play);
    t.addEventListener('mouseleave', stop);
    t.addEventListener('click', function(){ v.paused ? play() : stop(); });
  });

  /* lightbox */
  var lb = document.getElementById('lb'), img = document.getElementById('lbi'),
      cap = document.getElementById('lbc'), tiles = [], i = 0;
  function collect(){ tiles = [].slice.call(document.querySelectorAll('.tile:not(.is-hidden)')); }
  function show(n){
    collect(); if (!tiles.length) return;
    i = (n + tiles.length) % tiles.length;
    var t = tiles[i];
    img.src = t.getAttribute('href');
    img.alt = t.dataset.p + ' — ' + t.dataset.t;
    cap.innerHTML = '<b>' + t.dataset.p + '</b> &nbsp; ' + t.dataset.t + (t.dataset.credit ? ' &nbsp;·&nbsp; ' + t.dataset.credit : '');
    lb.classList.add('is-on'); document.body.style.overflow = 'hidden';
  }
  function close(){ lb.classList.remove('is-on'); document.body.style.overflow=''; img.src=''; }
  document.addEventListener('click', function(e){
    var l = e.target.closest('.tile__link');
    if (l && l.dataset.href){ e.preventDefault(); e.stopPropagation(); window.open(l.dataset.href,'_blank','noopener'); return; }
    var t = e.target.closest('.tile');
    if (t){ e.preventDefault(); collect(); show(tiles.indexOf(t)); }
  });
  if (lb) {
    document.getElementById('lbx').addEventListener('click', close);
    document.getElementById('lbp').addEventListener('click', function(e){ e.stopPropagation(); show(i-1); });
    document.getElementById('lbn').addEventListener('click', function(e){ e.stopPropagation(); show(i+1); });
    lb.addEventListener('click', function(e){ if (e.target === lb) close(); });
    document.addEventListener('keydown', function(e){
      if (!lb.classList.contains('is-on')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(i-1);
      if (e.key === 'ArrowRight') show(i+1);
    });
  }

  /* wordmark fits the viewport exactly, then breathes on scroll */
  (function(){
    var w = document.getElementById('word');
    if (!w) return;
    var pad = parseFloat(getComputedStyle(document.querySelector('.mast')).paddingLeft) * 2;
    function fit(){
      var avail = document.documentElement.clientWidth - pad;
      w.style.fontSize = '100px';
      w.style.fontVariationSettings = "'wdth' 112,'wght' 800";
      var natural = w.scrollWidth;
      if (!natural) return;
      w.style.fontSize = (100 * avail / natural) + 'px';
    }
    fit();
    document.fonts && document.fonts.ready.then(fit);
    addEventListener('resize', fit, { passive:true });
    var t = 0;
    addEventListener('scroll', function(){
      if (t) return;
      t = requestAnimationFrame(function(){
        t = 0;
        if (innerWidth < 700) return;
        var p = Math.min(1, scrollY / (innerHeight * 0.7));
        w.style.fontVariationSettings = "'wdth' " + (112 - 34 * p).toFixed(1) + ",'wght' 800";
      });
    }, { passive:true });
  })();
})();
