(() => {
  const scenes=[...document.querySelectorAll('.reel-scene')];
  const story=document.querySelector('.reel-story');
  const stage=story.querySelector('.reel-stage');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let travel=0,queued=false;
  function update(){
    queued=false;
    if(!story.classList.contains('horizontal-scroll'))return;
    const progress=Math.max(0,Math.min(1,(64-story.getBoundingClientRect().top)/travel));
    stage.scrollLeft=progress*(stage.scrollWidth-stage.clientWidth);
  }
  function layout(){
    story.classList.remove('horizontal-scroll');story.style.height='';
    const distance=stage.scrollWidth-stage.clientWidth;
    if(reduced.matches||innerHeight<650||distance<1)return;
    travel=Math.max(distance,innerHeight*.9);
    story.classList.add('horizontal-scroll');
    story.style.height=`${Math.min(590,innerHeight-64)+travel}px`;
    update();
  }
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',layout);reduced.addEventListener('change',layout);
  stage.addEventListener('focusin',e=>{
    const scene=e.target.closest('.reel-scene');
    if(!scene||!story.classList.contains('horizontal-scroll'))return;
    const bounds=scene.getBoundingClientRect();
    if(bounds.left>=0&&bounds.right<=innerWidth)return;
    const max=stage.scrollWidth-stage.clientWidth;
    const target=Math.max(0,Math.min(max,scene.offsetLeft-(stage.clientWidth-scene.offsetWidth)/2));
    window.scrollTo({top:scrollY+story.getBoundingClientRect().top-64+target/max*travel,behavior:'instant'});
  });
  scenes.forEach(scene=>{
    const video=scene.querySelector('video');
    video.controls=false;video.muted=true;
    const play=scene.querySelector('[data-play]'),sound=scene.querySelector('[data-sound]');
    play.hidden=false;sound.hidden=false;
    const title=video.getAttribute('aria-label');
    function state(){play.setAttribute('aria-label',`${video.paused?'Play':'Pause'} ${title}`);play.classList.toggle('is-paused',video.paused);sound.setAttribute('aria-label',`${video.muted?'Unmute':'Mute'} ${title}`);sound.classList.toggle('is-unmuted',!video.muted);}
    play.addEventListener('click',()=>{video.dataset.userPaused=String(!video.paused);video.paused?video.play().catch(()=>{}):video.pause();});
    sound.addEventListener('click',()=>{video.muted=!video.muted;if(!video.muted)scenes.forEach(other=>{const v=other.querySelector('video');if(v!==video)v.muted=true;});});
    video.addEventListener('play',state);video.addEventListener('pause',state);video.addEventListener('volumechange',state);state();
  });
  function syncVideos(){scenes.forEach(scene=>{const v=scene.querySelector('video');if(v.dataset.visible==='true'&&!document.hidden&&!reduced.matches&&v.dataset.userPaused!=='true'){if(v.paused)v.play().catch(()=>{});}else v.pause();});}
  const observer=new IntersectionObserver(entries=>{entries.forEach(({target,intersectionRatio})=>{target.dataset.visible=String(intersectionRatio>.45);});syncVideos();},{threshold:[0,.45,.5,1]});
  scenes.forEach(scene=>observer.observe(scene.querySelector('video')));
  document.addEventListener('visibilitychange',syncVideos);reduced.addEventListener('change',syncVideos);
  layout();
  // A spatial wave follows the pointer without distorting the original artwork.
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  document.querySelectorAll('.speaker-grid').forEach(grid=>{
    const cards=[...grid.querySelectorAll('.speaker-card')];let pending=false,x=0,y=0;
    function reset(){cards.forEach(card=>{card.style.removeProperty('--wave-y');card.style.removeProperty('--wave-tilt');});}
    grid.addEventListener('pointermove',e=>{
      if(reduced.matches||!fine.matches)return;x=e.clientX;y=e.clientY;
      if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;cards.forEach(card=>{const r=card.getBoundingClientRect();const dx=x-r.left-r.width/2,dy=y-r.top-r.height/2,d=Math.hypot(dx,dy);const wave=Math.cos(d/105)*Math.exp(-d/450);card.style.setProperty('--wave-y',`${-28*wave}px`);card.style.setProperty('--wave-tilt',`${Math.max(-5,Math.min(5,dx/45))*Math.exp(-d/400)}deg`);});});
    });grid.addEventListener('pointerleave',reset);reduced.addEventListener('change',reset);
  });
  const reader=document.querySelector('[data-reader="paper-program"]');
  const wrap=document.createElement('div');wrap.className='program-scroll';reader.before(wrap);wrap.append(reader);
  const select=reader.querySelector('select');let last=-1,manual=false,programTravel=0;
  function programLayout(){wrap.classList.remove('is-guided');wrap.style.height='';if(reduced.matches||innerHeight<700)return;wrap.classList.add('is-guided');programTravel=innerHeight*1.4;wrap.style.height=`${reader.offsetHeight+programTravel}px`;programUpdate();}
  function programUpdate(){if(!wrap.classList.contains('is-guided')||manual)return;const r=wrap.getBoundingClientRect();if(r.top>innerHeight||r.bottom<0)return;const progress=Math.max(0,Math.min(.999,(80-r.top)/programTravel));const part=Math.floor(progress*8);if(part===last)return;last=part;select.value=String(part*2);select.dispatchEvent(new Event('change',{bubbles:true}));if(!reduced.matches)reader.querySelector('.reader-stage').animate([{opacity:.55,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});}
  reader.querySelector('.reader-controls').addEventListener('pointerdown',()=>{manual=true;});
  select.addEventListener('change',e=>{if(e.isTrusted)manual=true;});
  addEventListener('scroll',programUpdate,{passive:true});addEventListener('resize',programLayout);reduced.addEventListener('change',programLayout);
  programLayout();
})();
