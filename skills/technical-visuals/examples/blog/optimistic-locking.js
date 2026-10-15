(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const section = document.querySelector('[data-figure]');
  let theme;
  try { theme = localStorage.getItem('visual-lab-theme'); } catch {}
  if (!['light', 'dark'].includes(theme)) theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  let phase = 0, elapsed = 0, wanted = !reduced.matches, visible = false, frame = null, previous = null;
  const duration = 1800;
  const states = [
    [2,7,null,null,null,null,'Both workers read'],
    [2,7,null,null,null,null,'The row returns v7'],
    [2,7,7,7,null,null,'A writes with v7'],
    [1,8,7,7,null,null,'A’s update succeeds'],
    [1,8,7,7,1,null,'B writes with stale v7'],
    [1,8,7,7,1,null,'Version mismatch · no change'],
    [1,8,7,7,1,0,'B rereads the row'],
    [1,8,7,7,1,0,'The row returns v8'],
    [1,8,7,8,1,0,'B retries with v8'],
    [0,9,7,8,1,0,'B’s retry succeeds'],
    [0,9,7,8,1,1,'Both reservations saved'],
  ];
  const transfers = [
    [['A','down','Read'],['B','down','Read']],
    [['A','up','v7'],['B','up','v7']],
    [['A','down','v7']], [['A','up','1 row']],
    [['B','down','v7']], [['B','up','0 rows']],
    [['B','down','Read']], [['B','up','v8']],
    [['B','down','v8']], [['B','up','1 row']], [],
  ];
  const t = role => window.visualTokens[theme][role];
  const text = (x,y,value,role='text',size=22) => `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" fill="${t(role)}" font-size="${size}">${value}</text>`;
  const box = (x,y,w,h,role) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${t(role+'Fill')}" stroke="${t(role)}" stroke-width="2"/>`;
  let packets = [];
  function render() {
    const [available,version,a,b,ar,br,status] = states[phase];
    section.dataset.phase = phase;
    section.dataset.state = JSON.stringify({phase,status,available,version,readA:a,readB:b,affectedA:ar,affectedB:br});
    let out = `<title id="figure-title">A stale version cannot change the row</title><desc id="figure-desc">${status}. Available ${available}, version ${version}. Worker A affected rows ${ar??'pending'}, worker B ${br??'pending'}. One illustrative inventory row; no live database.</desc>`;
    for (const [id,x,role,read,result] of [['A',110,'processing',a,ar],['B',390,'control',b,br]]) {
      out += `<path id="route-${id}" d="M${x} 148 V245 H${id==='A'?180:320} V302" fill="none" stroke="${t(role)}" stroke-width="2"/>`;
      out += box(x-100,28,200,120,role) + text(x,52,`Worker ${id}`,role) + text(x,85,read===null?'Read —':`Read v${read}`);
      if(result!==null) out += `<rect x="${x-65}" y="105" width="130" height="36" rx="18" fill="${t('surface')}" stroke="${t(result?'success':'failure')}" stroke-width="2"/>` + text(x,124,`${result?'✓':'×'} ${result} ${result===1?'row':'rows'}`,result?'success':'failure');
    }
    out += `<path d="M100 316 V427 C100 451 400 451 400 427 V316" fill="${t('storageFill')}" stroke="${t('storage')}" stroke-width="2"/><ellipse cx="250" cy="316" rx="150" ry="14" fill="${t('storageFill')}" stroke="${t('storage')}" stroke-width="2"/>`;
    out += text(250,350,'SKU-42','storage') + text(192,386,`${available} available`) + text(341,386,`v${version}`,'storage');
    for(let i=0;i<2;i++) out += `<rect x="${168+i*30}" y="410" width="22" height="18" rx="3" fill="${t(i<available?'storage':'surface')}" stroke="${t('storage')}" stroke-width="1.5"/>`;
    out += text(250,488,status,'text',22);
    for(const [id,direction,label] of transfers[phase]) {
      const role=id==='A'?'processing':'control';
      out += `<g data-payload data-route="route-${id}" data-direction="${direction}"><rect x="-44" y="-19" width="88" height="38" rx="7" fill="${t('surface')}" stroke="${t(role)}" stroke-width="2.5"/>${text(0,1,label,role)}</g>`;
    }
    const svg=section.querySelector('svg');
    svg.innerHTML=out;
    packets=[...svg.querySelectorAll('[data-payload]')].map(node=>({node,path:svg.querySelector('#'+node.dataset.route),reverse:node.dataset.direction==='up'}));
    const play=section.querySelector('[data-action="play"]');
    play.textContent=wanted&&phase<10?'Pause':'Play'; play.disabled=phase===10;
    section.querySelector('[data-action="step"]').disabled=phase===10;
    paint();
  }
  function paint() {
    const progress=elapsed/duration;
    for(const {node,path,reverse} of packets) {
      const point=path.getPointAtLength(path.getTotalLength()*(reverse?1-progress:progress));
      node.setAttribute('transform',`translate(${point.x} ${point.y})`);
      node.style.visibility=reduced.matches?'hidden':'visible';
    }
    section.querySelector('progress').value=phase+progress;
  }
  function active() {return wanted&&visible&&phase<10&&!document.hidden;}
  function tick(now) {
    frame=null;
    const dt=previous===null?0:Math.min(80,now-previous); previous=now;
    if(active()) {
      elapsed+=dt;
      if(elapsed>=duration) {phase++;elapsed=0;render();} else paint();
    }
    if(active()) frame=requestAnimationFrame(tick); else previous=null;
  }
  function schedule() {if(frame===null&&active()){previous=null;frame=requestAnimationFrame(tick);}}
  section.querySelector('.stage').innerHTML='<svg viewBox="0 0 500 520" role="img" aria-labelledby="figure-title figure-desc" font-family="system-ui,sans-serif"></svg>';
  section.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!action)return;
    if(action==='play')wanted=!wanted;
    if(action==='step'){wanted=false;phase=Math.min(10,phase+1);elapsed=0;}
    if(action==='reset'){phase=0;elapsed=0;wanted=!reduced.matches;}
    render();schedule();
  });
  function applyTheme() {
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    Object.entries(window.visualTokens[theme]).forEach(([key,value])=>document.documentElement.style.setProperty('--'+key,value));
    document.querySelector('#theme').setAttribute('aria-pressed',String(theme==='dark'));
    document.querySelector('#theme').setAttribute('aria-label',theme==='dark'?'Light theme':'Dark theme');
    render();
  }
  document.querySelector('#theme').addEventListener('click',()=>{theme=theme==='light'?'dark':'light';try{localStorage.setItem('visual-lab-theme',theme);}catch{}applyTheme();});
  document.addEventListener('visibilitychange',()=>{previous=null;schedule();});
  reduced.addEventListener('change',()=>{if(reduced.matches)wanted=false;render();schedule();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;previous=null;schedule();},{threshold:0}).observe(section);
  applyTheme();
})();
