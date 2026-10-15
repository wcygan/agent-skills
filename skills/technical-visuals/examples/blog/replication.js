(() => {
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let theme=localStorage.getItem('visual-lab-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');
  if(!window.visualTokens[theme]) theme='light';
  let palette, prefix, serial=0, frame=null, previous=null;
  const duration=2200;
  const copyStates = [
    [1,0,0], [2,1,0], [3,2,0], [4,3,1], [5,4,2],
    [6,5,3], [6,6,4], [6,6,5], [6,6,6],
  ];
  const lagStates = [
    [3,2,2,true,'Receiving'], [4,3,2,true,'Buffering'],
    [5,4,2,false,'Link paused'], [6,4,2,false,'Link paused'],
    [6,4,3,false,'Link paused'], [6,4,4,true,'Reconnected'],
    [6,5,4,true,'Catching up'], [6,6,5,true,'Catching up'],
    [6,6,6,true,'In sync'],
  ];
  const pairState = ([primary,received,applied,connected=true,stage='']) => ({primary,received,applied,connected,stage});
  const color = role => palette[role] || role;
  const fill = role => palette[role + 'Fill'] || `color-mix(in srgb, ${color(role)} 10%, ${palette.surface})`;
  const text = (x, y, label, role = 'text', size = 20, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" dominant-baseline="middle" fill="${color(role)}" font-size="${size}">${label}</text>`;
  const db = (x, y, w, h, label, role = 'storage', value = '') => `<path d="M${x} ${y+12}V${y+h-12}C${x} ${y+h+4} ${x+w} ${y+h+4} ${x+w} ${y+h-12}V${y+12}" fill="${fill(role)}" stroke="${color(role)}" stroke-width="2"/><ellipse cx="${x+w/2}" cy="${y+12}" rx="${w/2}" ry="12" fill="${fill(role)}" stroke="${color(role)}" stroke-width="2"/>${text(x+w/2,y+(value ? h/2-2 : h/2+8),label)}${value ? text(x+w/2,y+h/2+25,value,role) : ''}`;
  function chip(x, y, number, state = 'applied', role = 'storage', size = 36) {
    const edge = state === 'applied' ? 'success' : state === 'active' ? 'focus' : state === 'waiting' ? 'warning' : 'subtle';
    return `<g data-entry="${number}" data-entry-state="${state}"><rect x="${x}" y="${y}" width="${size}" height="36" rx="6" fill="${state === 'empty' ? palette.surface : fill(state === 'applied' ? role : 'warning')}" stroke="${color(edge)}" stroke-width="${state === 'active' ? 3 : 1.5}" ${state === 'waiting' ? 'stroke-dasharray="4 3"' : ''}/>${state === 'empty' ? '' : text(x+size/2,y+19,number,state === 'applied' ? role : 'text')}</g>`;
  }
  function rail(x, y, received, applied = received, role = 'storage', name = 'database') {
    let out = `<g data-log="${name}" data-received="${received}" data-applied="${applied}">`;
    for (let i=0;i<6;i++) out += chip(x+i*40,y,i+1,i<applied?'applied':i<received?(i===applied?'active':'waiting'):'empty',role);
    return out + '</g>';
  }
  function wire(points, role = 'border', packet = null, dashed = false, kind = '') {
    const id = `${prefix}-route-${serial++}`;
    const path = 'M' + points.map(p => p.join(',')).join(' L');
    let out = `<defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill="${color(role)}"/></marker></defs><path id="${id}" data-route data-kind="${kind}" d="${path}" fill="none" stroke="${color(role)}" stroke-width="2" ${dashed ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#${id}-arrow)"/>`;
    if (packet !== null) out += `<g data-payload data-path="${id}" transform="translate(${points[0]})"><rect x="-17" y="-16" width="34" height="32" rx="6" fill="${palette.surface}" stroke="${color('focus')}" stroke-width="2.5"/>${text(0,1,packet)}</g>`;
    return out;
  }
  function drawLog(s, done) {
    const n=s.appended, index=Math.min(n,5);
    return wire([[250,139],[250,218],[100+index*60,218],[100+index*60,284]],'storage',done?null:n+1,false,'append')
      + db(170,35,160,104,'Database','storage',`v${n}`)
      + text(250,240,'Log','storage')
      + `<g data-log="database" data-received="${n}" data-applied="${n}">${Array.from({length:6},(_,i)=>chip(76+i*60,284,i+1,i<n?'applied':'empty','storage',48)).join('')}</g>`
      + text(250,350,'Write order →','muted');
  }
  function drawPair(s, done, next) {
    const writing=next&&next.primary>s.primary;
    const receiving=next&&next.received>s.received;
    const applying=next&&next.applied>s.applied;
    const writeIndex=Math.min(5,writing?s.primary:Math.max(0,s.primary-1));
    const receiveIndex=Math.min(5,s.received), applyIndex=Math.min(5,s.applied);
    let out=wire([[94,35],[94,20],[224+writeIndex*40,20],[224+writeIndex*40,65]],'storage',writing?s.primary+1:null,false,'append');
    out+=wire([[224+receiveIndex*40,101],[224+receiveIndex*40,315]],s.connected?'flow':'failure',receiving?s.received+1:null,!s.connected,'receive');
    out+=wire([[224+applyIndex*40,351],[224+applyIndex*40,420],[94,420],[94,381]],'flow',applying?s.applied+1:null,false,'apply');
    if(!s.connected) out+=text(224+receiveIndex*40,208,'×','failure',30);
    out+=`<g data-node="primary">${db(24,35,140,96,'Primary','storage',`v${s.primary}`)}</g>`;
    out+=`<g data-node="peer">${db(24,285,140,96,'Peer','flow',`v${s.applied}`)}</g>`;
    out+=rail(206,65,s.primary,s.primary,'storage','primary') + rail(206,315,s.received,s.applied,'flow','peer');
    out+=text(472,83,'Log','storage') + text(472,333,'Log','flow');
    out+=text(94,215,s.stage||(done?'In sync':`${s.received-s.applied} buffered`),s.connected?'flow':'failure');
    if(s.stage&&!done) out+=text(94,247,`${s.received-s.applied} buffered`,'warning');
    return out;
  }
  const lessons=[
    { id:'database-log', phases:6, height:390,
      title:'Writes are recorded in order',
      description:'The database appends each write to the next log position. Numbers show write order; v is the database version. Animation timing is illustrative.',
      state:p=>({appended:p}), draw:drawLog },
    { id:'log-replication', phases:copyStates.length-1, height:540,
      title:'A peer receives writes before applying them',
      description:'Both databases start from the same data. The primary log contains committed writes. A received entry enters the peer log before it changes peer data. Orange marks the next pending entry, dashed entries wait behind it, and green borders mark applied entries. One serial applier is a teaching model, not every MySQL configuration.',
      state:p=>pairState(copyStates[p]), draw:drawPair },
    { id:'group-lag', phases:lagStates.length-1, height:540,
      title:'A lagging peer catches up',
      description:'A brief link interruption leaves the peer behind. Its buffered entries can still apply. After reconnection, retained missing history is copied and applied in order. This assumes an already ordered, committed history; group ordering and certification are omitted. A removed member may require rejoin and donor recovery.',
      state:p=>pairState(lagStates[p]), draw:drawPair },
  ];
  const models=lessons.map(lesson=>({phase:0,elapsed:0,wanted:!motion.matches,visible:false,lesson,packets:[],section:document.querySelector(`[data-figure="${lesson.id}"]`)}));
  for(const model of models) {
    model.section.querySelector('progress').max=model.lesson.phases;
    model.section.addEventListener('click',event=>{
      const button=event.target.closest('button[data-action]');
      if(!button) return;
      const action=button.dataset.action;
      if(action==='play') model.wanted=!model.wanted;
      if(action==='step') { model.wanted=false; model.phase=Math.min(model.lesson.phases,model.phase+1); model.elapsed=0; }
      if(action==='replay') { model.phase=0; model.elapsed=0; model.wanted=!motion.matches; }
      render(model); schedule();
    });
  }
  function render(model) {
    const {section,lesson,phase}=model, done=phase===lesson.phases;
    const state=lesson.state(phase), next=done?null:lesson.state(phase+1);
    section.dataset.state=JSON.stringify(state);
    section.dataset.phase=phase;
    prefix=lesson.id; serial=0;
    let svg=section.querySelector('.stage svg');
    if(!svg) {
      svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.setAttribute('viewBox',`0 0 500 ${lesson.height}`);
      svg.setAttribute('role','img');
      svg.setAttribute('aria-labelledby',`${prefix}-title ${prefix}-desc`);
      svg.setAttribute('font-family','system-ui,sans-serif');
      section.querySelector('.stage').append(svg);
    }
    svg.innerHTML=`<title id="${prefix}-title">${lesson.title}</title><desc id="${prefix}-desc">${lesson.description} State: ${JSON.stringify(state).replaceAll('"','')}</desc>${lesson.draw(state,done,next)}`;
    const play=section.querySelector('[data-action="play"]');
    play.textContent=model.wanted&&!done?'Pause':'Play';
    play.disabled=done;
    section.querySelector('[data-action="step"]').disabled=done;
    section.querySelector('output').textContent=done?'Complete':`${phase} / ${lesson.phases}`;
    model.packets=[...svg.querySelectorAll('[data-payload]')].map(node=>({node,path:svg.querySelector('#'+node.dataset.path)}));
    paint(model);
  }
  function paint(model) {
    const progress=Math.min(1,model.elapsed/duration);
    for(const {node,path} of model.packets) {
      const length=path.getTotalLength(), departure=Math.min(18,length/3);
      const point=path.getPointAtLength(departure+(length-departure)*progress);
      node.setAttribute('transform',`translate(${point.x} ${point.y})`);
    }
    model.section.querySelector('progress').value=model.phase+progress;
  }
  function active(model) { return model.wanted&&model.visible&&model.phase<model.lesson.phases&&!document.hidden; }
  function tick(now) {
    frame=null;
    const dt=previous===null?0:Math.min(now-previous,80); previous=now;
    for(const model of models) if(active(model)) {
      model.elapsed+=dt;
      if(model.elapsed>=duration) { model.phase++; model.elapsed=0; render(model); }
      else paint(model);
    }
    if(models.some(active)) frame=requestAnimationFrame(tick); else previous=null;
  }
  function schedule() { if(frame===null&&models.some(active)) { previous=null; frame=requestAnimationFrame(tick); } }
  function applyTheme() {
    palette=window.visualTokens[theme];
    document.documentElement.dataset.theme=theme;
    document.documentElement.style.colorScheme=theme;
    Object.entries(palette).forEach(([key,value])=>document.documentElement.style.setProperty('--'+key,value));
    document.querySelector('#theme').setAttribute('aria-pressed',String(theme==='dark'));
    document.querySelector('#theme').setAttribute('aria-label',theme==='dark'?'Light theme':'Dark theme');
    models.forEach(render);
  }
  document.querySelector('#theme').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';localStorage.setItem('visual-lab-theme',theme);applyTheme();});
  document.addEventListener('visibilitychange',()=>{previous=null;schedule();});
  motion.addEventListener('change',()=>{if(motion.matches) models.forEach(model=>{model.wanted=false;render(model);});schedule();});
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries) models.find(model=>model.section===entry.target).visible=entry.isIntersecting;
    previous=null; schedule();
  },{threshold:0});
  applyTheme(); models.forEach(model=>observer.observe(model.section));
})();
