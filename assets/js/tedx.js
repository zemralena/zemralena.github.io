(() => {
  const scenes=[...document.querySelectorAll('.reel-scene')];
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
})();
