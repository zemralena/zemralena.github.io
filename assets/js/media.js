(() => {
  'use strict';
  const scriptBase = new URL('.', document.currentScript.src);
  const mobile = matchMedia('(max-width:600px)');
  let lastFocus;
  const dialog = document.createElement('dialog');
  dialog.className = 'media-dialog';
  dialog.setAttribute('aria-label', 'Enlarged media');
  dialog.innerHTML = '<div class="dialog-toolbar"><h2></h2><button type="button">Close ×</button></div><div class="dialog-images"></div>';
  document.body.append(dialog);
  const close = () => dialog.close();
  dialog.querySelector('button').addEventListener('click', close);
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close(); } });
  dialog.addEventListener('close', () => {document.body.style.overflow='';lastFocus?.focus();});
  function enlarge(title, sources) {
    if(typeof dialog.showModal!=='function'){window.open(sources[0].src,'_blank','noopener');return;}
    lastFocus=document.activeElement;
    dialog.querySelector('h2').textContent=title;
    const target=dialog.querySelector('.dialog-images');target.replaceChildren();target.classList.toggle('pair',sources.length>1);
    sources.forEach(s=>{const img=new Image();img.src=s.src;img.alt=s.alt;target.append(img);});
    dialog.showModal();document.body.style.overflow='hidden';dialog.querySelector('button').focus();
  }
  document.querySelectorAll('.document-reader').forEach(reader=>{
    const pages=JSON.parse(reader.dataset.pages);let page=0;
    const spread=reader.classList.contains('spread-reader');const images=[...reader.querySelectorAll('.reader-page')];
    const previous=reader.querySelector('[data-reader-prev]'),next=reader.querySelector('[data-reader-next]'),select=reader.querySelector('select'),status=reader.querySelector('.reader-status');
    const step=()=>spread&&!mobile.matches?2:1;
    function update(){
      images.forEach((img,i)=>{const index=page+i;img.hidden=index>=pages.length||i>=step();if(!img.hidden){img.src=pages[index];img.alt=`${reader.dataset.title}, page ${index+1}`;}});
      previous.disabled=page===0;next.disabled=page+step()>=pages.length;select.value=String(page);
      status.textContent=step()===2&&page+1<pages.length?`–${page+2} of ${pages.length}`:`of ${pages.length}`;
    }
    previous.addEventListener('click',()=>{page=Math.max(0,page-step());update();});
    next.addEventListener('click',()=>{page=Math.min(pages.length-1,page+step());update();});
    select.addEventListener('change',()=>{page=Number(select.value);update();});
    reader.querySelector('[data-reader-enlarge]').addEventListener('click',()=>enlarge(reader.dataset.title,images.filter(i=>!i.hidden).map(i=>({src:i.src,alt:i.alt}))));
    mobile.addEventListener('change',update);update();
  });
  document.querySelectorAll('a.image-open').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const img=a.querySelector('img');enlarge(img.alt,[{src:a.href,alt:img.alt}]);}));
  const videos=[...document.querySelectorAll('video')];
  videos.forEach(v=>v.addEventListener('play',()=>{if(v.controls)videos.forEach(other=>{if(other!==v)other.pause();});}));
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(!isIntersecting)target.pause();}),{threshold:0});videos.forEach(v=>observer.observe(v));}
  document.addEventListener('visibilitychange',()=>{if(document.hidden)videos.forEach(v=>v.pause());});
  const panel=document.getElementById('campaign-analytics');
  if(!panel)return;
  const n=x=>Number(x).toLocaleString('en-US');
  const date=x=>new Date(x+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
  function chart(rows){
    const width=900,height=260,left=50,right=15,top=20,bottom=35;
    const max=Math.ceil(Math.max(...rows.map(r=>r.impressions))/100)*100;
    const x=i=>left+i/(rows.length-1)*(width-left-right),y=v=>height-bottom-v/max*(height-top-bottom);
    const path=rows.map((r,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(r.impressions).toFixed(2)}`).join(' ');
    let content=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="chart-title chart-description"><title id="chart-title">Daily LinkedIn impressions</title><desc id="chart-description">${rows.length} days from ${date(rows[0].date)} to ${date(rows.at(-1).date)}. Exact values follow in the expandable table.</desc>`;
    [0,max/2,max].forEach(v=>content+=`<line class="grid-line" x1="${left}" x2="${width-right}" y1="${y(v)}" y2="${y(v)}"/><text x="${left-10}" y="${y(v)+4}" text-anchor="end">${n(v)}</text>`);
    content+=`<path class="plot-line" d="${path}"/><text x="${left}" y="${height-8}">${date(rows[0].date)}</text><text x="${width-right}" y="${height-8}" text-anchor="end">${date(rows.at(-1).date)}</text></svg>`;
    document.getElementById('linkedin-chart').innerHTML=content;
    const body=document.getElementById('daily-values');body.replaceChildren();
    rows.forEach(row=>{const tr=document.createElement('tr');[row.date,n(row.impressions),n(row.clicks)].forEach(value=>{const cell=document.createElement('td');cell.textContent=value;tr.append(cell);});body.append(tr);});
  }
  fetch(new URL('../data/tedx-results.json',scriptBase)).then(r=>{if(!r.ok)throw Error('Results unavailable');return r.json();}).then(data=>{
    function update(period){
      const ig=data.instagram[period],li=data.linkedin[period];
      ['views','reach','interactions','links'].forEach(k=>document.getElementById('ig-'+k).textContent=n(ig[k]));
      document.getElementById('ig-nonfollowers').textContent=ig.nonfollowers+'%';document.getElementById('audience-fill').style.width=ig.nonfollowers+'%';
      document.getElementById('instagram-period').textContent=`Last ${period} days · exported February 18, 2026`;
      document.getElementById('li-impressions').textContent=n(li.impressions);document.getElementById('li-clicks').textContent=n(li.clicks);document.getElementById('li-rate').textContent=(li.engagementRate*100).toFixed(2)+'%';
      document.getElementById('linkedin-period').textContent=`${li.start} – ${li.end} · ${li.days} days`;
      panel.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.period===period)));chart(li.daily);
    }
    panel.querySelectorAll('[data-period]').forEach(b=>b.addEventListener('click',()=>update(b.dataset.period)));update('90');
  }).catch(()=>{panel.querySelectorAll('[data-period]').forEach(b=>b.disabled=true);document.getElementById('linkedin-chart').textContent='The daily chart is temporarily unavailable. The reported totals remain above.';});
})();
