(() => {
  const story=document.querySelector('.reel-story');
  const scenes=[...document.querySelectorAll('.reel-scene')];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const tall=matchMedia('(min-height:700px)');
  const nav=story.querySelector('.reel-navigation');
  const previous=nav.querySelector('[data-reel-prev]'),next=nav.querySelector('[data-reel-next]');
  let active=-1,queued=false,visible=false;
  scenes.forEach(scene=>{
    const video=scene.querySelector('video'),player=scene.querySelector('.reel-player');
    video.controls=false;player.hidden=false;
    const play=player.querySelector('[data-play]'),sound=player.querySelector('[data-sound]');
    play.addEventListener('click',()=>{if(video.paused){video.dataset.userPaused='false';video.play().catch(()=>{});}else{video.dataset.userPaused='true';video.pause();}});
    sound.addEventListener('click',()=>{video.muted=!video.muted;sound.textContent=video.muted?'Sound on':'Mute';});
    video.addEventListener('play',()=>{play.textContent='Pause';scenes.forEach(other=>{if(other!==scene)other.querySelector('video').pause();});});
    video.addEventListener('pause',()=>{play.textContent='Play';});
    play.textContent='Play';
  });
  function playback(){scenes.forEach((scene,i)=>{const v=scene.querySelector('video');if(!document.hidden&&visible&&i===active&&!reduced.matches&&v.dataset.userPaused!=='true')v.play().catch(()=>{});else v.pause();});}
  function update(){
    queued=false;
    if(!story.classList.contains('is-enhanced'))return;
    const r=story.getBoundingClientRect(),travel=story.offsetHeight-story.querySelector('.reel-stage').offsetHeight;
    visible=r.top<innerHeight*.7&&r.bottom>innerHeight*.4;
    const index=Math.max(0,Math.min(scenes.length-1,Math.floor((64-r.top)/Math.max(1,travel)*scenes.length)));
    if(index!==active){active=index;scenes.forEach((s,i)=>{s.classList.toggle('is-active',i===active);s.inert=i!==active;s.setAttribute('aria-hidden',String(i!==active));});nav.querySelector('[data-reel-counter]').textContent=`0${active+1} / ${String(scenes.length).padStart(2,'0')}`;previous.disabled=active===0;next.disabled=active===scenes.length-1;}
    playback();
  }
  function configure(){const enabled=!reduced.matches&&tall.matches;story.classList.toggle('is-enhanced',enabled);story.style.height=enabled?`${scenes.length*110}vh`:'';nav.hidden=!enabled;active=-1;scenes.forEach(s=>{s.inert=false;s.removeAttribute('aria-hidden');s.classList.remove('is-active');s.querySelector('video').pause();});update();}
  function jump(delta){const target=Math.max(0,Math.min(scenes.length-1,active+delta));const travel=story.offsetHeight-story.querySelector('.reel-stage').offsetHeight;window.scrollTo({top:scrollY+story.getBoundingClientRect().top-64+(target+.15)/scenes.length*travel,behavior:'smooth'});}
  previous.addEventListener('click',()=>jump(-1));next.addEventListener('click',()=>jump(1));
  addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',configure);reduced.addEventListener('change',configure);tall.addEventListener('change',configure);
  document.addEventListener('visibilitychange',()=>{if(story.classList.contains('is-enhanced'))playback();});
  configure();
})();
