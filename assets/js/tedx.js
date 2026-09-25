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
    const max=stage.scrollWidth-stage.clientWidth;
    const target=Math.max(0,Math.min(max,scene.offsetLeft-(stage.clientWidth-scene.offsetWidth)/2));
    window.scrollTo({top:scrollY+story.getBoundingClientRect().top-64+target/max*travel,behavior:'instant'});
  });
  scenes.forEach(scene=>{
    const video=scene.querySelector('video'),player=scene.querySelector('.reel-player');
    video.controls=false;player.hidden=false;
    const play=player.querySelector('[data-play]'),sound=player.querySelector('[data-sound]');
    play.textContent='Play';
    play.addEventListener('click',()=>{video.dataset.userPaused=String(!video.paused);video.paused?video.play().catch(()=>{}):video.pause();});
    sound.addEventListener('click',()=>{video.muted=!video.muted;sound.textContent=video.muted?'Sound on':'Mute';if(!video.muted)scenes.forEach(other=>{const v=other.querySelector('video');if(v!==video){v.muted=true;other.querySelector('[data-sound]').textContent='Sound on';}});});
    video.addEventListener('play',()=>{play.textContent='Pause';});
    video.addEventListener('pause',()=>{play.textContent='Play';});
  });
  function syncVideos(){scenes.forEach(scene=>{const v=scene.querySelector('video');if(v.dataset.visible==='true'&&!document.hidden&&!reduced.matches&&v.dataset.userPaused!=='true'){if(v.paused)v.play().catch(()=>{});}else v.pause();});}
  const observer=new IntersectionObserver(entries=>{entries.forEach(({target,intersectionRatio})=>{target.dataset.visible=String(intersectionRatio>.45);});syncVideos();},{threshold:[0,.45,.5,1]});
  scenes.forEach(scene=>observer.observe(scene.querySelector('video')));
  document.addEventListener('visibilitychange',syncVideos);reduced.addEventListener('change',syncVideos);
  layout();
})();
