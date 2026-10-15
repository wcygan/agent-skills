(() => {
  const section = document.querySelector('[data-figure="query-race"]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let theme;
  try { theme = localStorage.getItem('visual-lab-theme'); } catch {}
  theme = theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (!window.visualTokens[theme]) theme = 'light';
  let palette, time = 0, wanted = !motion.matches, visible = false, frame = null, previous = null;
  const end = 250, playbackScale = 60;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 500 540');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-labelledby', 'query-title query-desc');
  svg.setAttribute('font-family', 'system-ui,sans-serif');
  section.querySelector('.stage').append(svg);
  const text = (x,y,label,role='text',anchor='middle') => `<text x="${x}" y="${y}" dominant-baseline="middle" text-anchor="${anchor}" fill="${palette[role]}" font-size="20">${label}</text>`;
  function lane(name, y, batch) {
    const role = batch ? 'flow' : 'processing';
    return `<g data-lane="${name}" transform="translate(0 ${y})">
      ${text(28,24,batch?'One grouped query':'Ten sequential queries','text','start')}
      <text data-time x="472" y="24" text-anchor="end" dominant-baseline="middle" font-size="20" fill="${palette[role]}"></text>
      <path data-out d="M150 88H350" fill="none" stroke="${palette.border}" stroke-width="2" marker-end="url(#arrow)"/>
      <path data-back d="M350 128H150" fill="none" stroke="${palette.border}" stroke-width="2" marker-end="url(#arrow)"/>
      <rect x="28" y="64" width="122" height="88" rx="7" fill="${palette.processingFill}" stroke="${palette.processing}" stroke-width="2"/>
      ${text(89,108,'App')}
      <path d="M350 75V144C350 159 472 159 472 144V75" fill="${palette.storageFill}" stroke="${palette.storage}" stroke-width="2"/>
      <ellipse cx="411" cy="75" rx="61" ry="12" fill="${palette.storageFill}" stroke="${palette.storage}" stroke-width="2"/>
      ${text(411,116,'Database')}
      <g data-payload><rect x="-39" y="-16" width="78" height="32" rx="6" fill="${palette.surface}" stroke="${palette[role]}" stroke-width="2"/><text data-payload-label y="1" text-anchor="middle" dominant-baseline="middle" font-size="20" fill="${palette[role]}"></text></g>
      <text data-status x="250" y="181" text-anchor="middle" dominant-baseline="middle" font-size="20" fill="${palette.muted}"></text>
      ${Array.from({length:10},(_,i)=>`<g data-row="${i}"><rect x="${30+i*44}" y="205" width="38" height="32" rx="4" stroke-width="1.5"/><text x="${49+i*44}" y="221" dominant-baseline="middle" text-anchor="middle" font-size="20">${101+i}</text></g>`).join('')}
      <rect x="29" y="250" width="436" height="5" rx="2" fill="${palette.raised}"/><rect data-progress x="29" y="250" width="0" height="5" rx="2" fill="${palette.success}"/>
    </g>`;
  }
  let lanes = [];
  function draw() {
    palette = window.visualTokens[theme] || window.visualTokens.light;
    svg.innerHTML = `<title id="query-title">Ten known IDs: ten round trips versus one batch</title><desc id="query-desc">Both lanes start together and return the same ten records. Each individual trip costs 25 modeled milliseconds. The grouped query costs 35. Outgoing IDs travel right; returned rows travel left. Timings are illustrative, not measurements.</desc><defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${palette.border}"/></marker></defs>${lane('individual',0,false)}${lane('batch',275,true)}`;
    lanes = [...svg.querySelectorAll('[data-lane]')].map(g=>({g,batch:g.dataset.lane==='batch',out:g.querySelector('[data-out]'),back:g.querySelector('[data-back]'),packet:g.querySelector('[data-payload]')}));
    paint();
  }
  function snapshot(batch) {
    const duration = batch ? 35 : 25;
    const elapsed = Math.min(time, batch ? 35 : end);
    const done = elapsed >= (batch ? 35 : end);
    const completed = batch ? (done ? 10 : 0) : Math.floor(elapsed/25);
    const progress = done ? 1 : (elapsed % duration)/duration;
    return {elapsed,done,completed,progress,trips:batch?(done?1:0):completed};
  }
  function paint() {
    const states = {};
    for (const {g,batch,out,back,packet} of lanes) {
      const s = snapshot(batch); states[batch?'batch':'individual'] = s;
      const returning = s.progress >= .6;
      const processing = s.progress >= .4 && s.progress < .6;
      packet.style.display = s.done || processing || motion.matches ? 'none' : '';
      const route = returning ? back : out;
      const fraction = returning ? (s.progress-.6)/.4 : s.progress/.4;
      const point = route.getPointAtLength(route.getTotalLength()*Math.min(1,Math.max(0,fraction)));
      packet.setAttribute('transform', `translate(${point.x} ${point.y})`);
      g.querySelector('[data-payload-label]').textContent = returning ? (batch?'10 rows':'1 row') : (batch?'10 IDs':`ID ${101+s.completed}`);
      g.querySelector('[data-time]').textContent = `${Math.round(s.elapsed)} ms`;
      g.querySelector('[data-status]').textContent = s.done ? `✓ ${s.trips} ${s.trips===1?'trip':'trips'} · 10 rows` : `${s.completed}/10 rows · ${processing?'Querying':returning?'Receiving':'Requesting'}`;
      g.querySelector('[data-status]').setAttribute('fill',palette[s.done?'success':'muted']);
      for (const row of g.querySelectorAll('[data-row]')) {
        const received = Number(row.dataset.row)<s.completed;
        row.dataset.received=String(received);
        row.querySelector('rect').setAttribute('fill',palette[received?'flowFill':'surface']);
        row.querySelector('rect').setAttribute('stroke',palette[received?'success':'subtle']);
        row.querySelector('text').setAttribute('fill',palette[received?'text':'muted']);
      }
      g.querySelector('[data-progress]').setAttribute('width',436*s.elapsed/(batch?35:end));
    }
    section.dataset.state = JSON.stringify(states);
    const done = time >= end;
    section.querySelector('[data-action="play"]').textContent = wanted&&!done?'Pause':'Play';
    section.querySelector('[data-action="play"]').disabled = done;
    section.querySelector('[data-action="step"]').disabled = done;
    const status = done?'Same ten rows':wanted?'Playing slowly':'Paused';
    if(section.querySelector('output').textContent!==status) section.querySelector('output').textContent=status;
  }
  function active() { return wanted && visible && time<end && !document.hidden; }
  function tick(now) {
    frame=null;
    const dt=previous===null?0:Math.min(80,now-previous); previous=now;
    time=Math.min(end,time+dt/playbackScale); paint();
    if(active()) frame=requestAnimationFrame(tick); else previous=null;
  }
  function schedule() { if(frame===null&&active()) { previous=null; frame=requestAnimationFrame(tick); } }
  section.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    if(!action) return;
    if(action==='play') wanted=!wanted;
    if(action==='step') { wanted=false; time=[25,35,50,75,100,125,150,175,200,225,250].find(n=>n>time)??end; }
    if(action==='replay') { time=0; wanted=!motion.matches; }
    if(frame!==null) { cancelAnimationFrame(frame); frame=null; }
    paint(); schedule();
  });
  function applyTheme() {
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    Object.entries(window.visualTokens[theme]).forEach(([key,value])=>document.documentElement.style.setProperty('--'+key,value));
    document.querySelector('#theme').setAttribute('aria-pressed',String(theme==='dark'));
    document.querySelector('#theme').setAttribute('aria-label',theme==='dark'?'Light theme':'Dark theme');
    draw();
  }
  document.querySelector('#theme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';try { localStorage.setItem('visual-lab-theme',theme); } catch {} applyTheme();});
  document.addEventListener('visibilitychange',()=>{if(frame!==null){cancelAnimationFrame(frame);frame=null;} previous=null;schedule();});
  motion.addEventListener('change',()=>{if(motion.matches) wanted=false;paint();schedule();});
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible&&frame!==null){cancelAnimationFrame(frame);frame=null;} previous=null;schedule();}).observe(section);
  applyTheme();
})();
