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
    story.style.height=`${innerHeight-64+travel}px`;
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
    play.addEventListener('click',()=>video.paused?video.play().catch(()=>{}):video.pause());
    sound.addEventListener('click',()=>{video.muted=!video.muted;sound.textContent=video.muted?'Sound on':'Mute';});
    video.addEventListener('play',()=>{play.textContent='Pause';scenes.forEach(other=>{if(other!==scene)other.querySelector('video').pause();});});
    video.addEventListener('pause',()=>{play.textContent='Play';});
  });
  layout();
})();
