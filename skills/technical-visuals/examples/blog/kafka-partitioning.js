(() => {
  const keys = [
    "order-101",
    "order-102",
    "order-103",
    "order-109",
    "order-113",
    "order-129",
  ];
  const sequence = [0, 1, 2, 3, 4, 5, 1, 2, 0];
  function murmur2(key) {
    const bytes = new TextEncoder().encode(key);
    let remaining = bytes.length,
      hash = (0x9747b28c ^ remaining) >>> 0,
      i = 0;
    const m = 0x5bd1e995;
    while (remaining >= 4) {
      let k =
        bytes[i] |
        (bytes[i + 1] << 8) |
        (bytes[i + 2] << 16) |
        (bytes[i + 3] << 24);
      k = Math.imul(k, m);
      k ^= k >>> 24;
      k = Math.imul(k, m);
      hash = Math.imul(hash, m) ^ k;
      i += 4;
      remaining -= 4;
    }
    if (remaining === 3) hash ^= bytes[i + 2] << 16;
    if (remaining >= 2) hash ^= bytes[i + 1] << 8;
    if (remaining >= 1) {
      hash ^= bytes[i];
      hash = Math.imul(hash, m);
    }
    hash ^= hash >>> 13;
    hash = Math.imul(hash, m);
    hash ^= hash >>> 15;
    return hash >>> 0;
  }
  const figure = document.querySelector("[data-figure]"),
    svg = document.querySelector("#diagram");
  const play = document.querySelector('[data-action="play"]');
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 600px)");
  let step = 0,
    count = 3,
    mode = "keyed",
    speed = 1.5,
    playing = !reduced.matches,
    visible = false,
    running = false,
    remaining = 2300 / 1.5,
    deadline = 0,
    timer,
    animation;
  let theme =
    localStorage.getItem("visual-lab-theme") ||
    (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  function records() {
    const offsets = Array(count).fill(0);
    return sequence.map((k, i) => {
      const hash = murmur2(keys[k]) & 0x7fffffff;
      const partition = (mode === "keyed" ? hash : i) % count;
      return {
        id: i + 1,
        key: keys[k],
        hash,
        partition,
        offset: offsets[partition]++,
      };
    });
  }
  function keyStyle(key,t){
    const role=['focus','storage','success','processing','flow','warning'][keys.indexOf(key)];
    return {color:t[role],fill:t[role],ink:theme==='dark'?t.canvas:t.surface};
  }
  function mapping(t,list,current){
    document.querySelector('#key-map').innerHTML=keys.map(key=>{
      const r=list.find(r=>r.key===key),style=keyStyle(key,t);
      return `<span data-key-map="${key}" data-partition-map="${r.partition}" class="${current?.key===key?'current':''}" style="--key:${style.color}"><i aria-hidden="true"></i>${key}</span>`;
    }).join('');
  }
  const phaseDuration = () => (step % 2 ? 2300 : 4600 * 0.7 - 2300) / speed;
  function syncPlayback() {
    const active =
      playing && visible && !document.hidden && !reduced.matches && step < 18;
    if (!active && running) {
      remaining = Math.max(0, deadline - performance.now());
      clearTimeout(timer);
      animation?.pause();
    }
    if (active && !running) {
      if (step === 0) {
        step = 1;
        remaining = 2300 / speed;
        render(true);
      }
      if (
        animation &&
        animation.currentTime < animation.effect.getTiming().duration
      ) {
        remaining = Math.max(
          remaining,
          animation.effect.getTiming().duration -
            animation.currentTime +
            500 / speed,
        );
        animation.play();
      }
      deadline = performance.now() + remaining;
      timer = setTimeout(() => {
        running = false;
        step++;
        remaining = phaseDuration();
        render(true);
        if (step === 18) playing = false;
        syncPlayback();
      }, remaining);
    }
    running = active;
    play.textContent = playing && !reduced.matches ? "Pause" : "Play";
    play.disabled = reduced.matches;
  }
  function stop() {
    playing = false;
    syncPlayback();
  }
  function resetPhase() {
    remaining = phaseDuration();
  }
  function render(motion=false,duration=1800/speed){
    animation?.cancel();animation=null;
    const t=window.visualTokens[theme],mobile=compact.matches;
    const list=records(),appended=list.slice(0,Math.floor(step/2));
    const current=step?list[Math.floor((step-1)/2)]:null,routing=step%2===1;
    mapping(t,list,current);
    const locals=Array.from({length:count},(_,p)=>list.filter(r=>r.partition===p));
    const capacity=Math.max(...locals.map(rs=>rs.length));
    const columns=mobile?Math.min(5,capacity):capacity;
    const pitch=mobile?42:64,blockW=mobile?34:46,blockH=mobile?30:42;
    const laneWidth=mobile?234:capacity*pitch+28;
    const laneHeight=mobile?Math.ceil(capacity/columns)*62+26:88;
    const logX=mobile?54:capacity>6?340:450;
    const firstY=mobile?186:70;
    const height=mobile?firstY+count*(laneHeight+34)+10:Math.max(420,firstY+count*116+30);
    const width=mobile?320:1060;
    const source={x:mobile?120:100,y:mobile?38:height/2-38,w:80,h:76};
    const position=r=>({x:logX+14+(r.offset%columns)*pitch,y:firstY+r.partition*(mobile?laneHeight+34:116)+14+Math.floor(r.offset/columns)*62});
    const endFor=r=>{const p=position(r);return[p.x+blockW/2,p.y+blockH/2];};
    const start=mobile?[source.x+source.w,source.y+source.h/2]:[source.x+source.w,source.y+source.h/2];
    const curve=end=>{
      const rail=end[1]-blockH/2-32;
      const pts=mobile?[start,[302,start[1]],[302,end[1]],end]:[start,[300,start[1]],[300,rail],[end[0],rail],end];
      let d=`M${pts[0]}`;
      for(let i=1;i<pts.length-1;i++){
        const a=pts[i-1],v=pts[i],b=pts[i+1],before=Math.hypot(v[0]-a[0],v[1]-a[1]),after=Math.hypot(b[0]-v[0],b[1]-v[1]);
        const r=Math.min(12,before/2,after/2);
        const entry=[v[0]-(v[0]-a[0])*r/before,v[1]-(v[1]-a[1])*r/before];
        const exit=[v[0]+(b[0]-v[0])*r/after,v[1]+(b[1]-v[1])*r/after];
        d+=` L${entry} Q${v} ${exit}`;
      }
      return d+` L${pts.at(-1)}`;
    };
    const text=(x,y,value,size=16,color=t.text,anchor='middle')=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" text-anchor="${anchor}" dominant-baseline="middle">${value}</text>`;
    const rect=(x,y,w,h,fill,stroke=t.border,weight=1.5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${mobile?3:4}" fill="${fill}" stroke="${stroke}" stroke-width="${weight}"/>`;
    const tint=(rs)=>{
      const cs=[...new Set(rs.map(r=>r.key))].map(key=>keyStyle(key,t).color);
      if(!cs.length)return t.raised;
      const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
      const base=rgb(t.surface),average=[0,1,2].map(i=>cs.reduce((n,col)=>n+rgb(col)[i],0)/cs.length);
      return '#'+base.map((v,i)=>Math.round(v*.85+average[i]*.15).toString(16).padStart(2,'0')).join('');
    };
    let out=`<title id="svg-title">Kafka records entering partition logs</title><desc id="svg-desc">Record numbers show producer order. Colors identify keys. Offsets below the blocks belong to each individual partition. Only arrived records append.</desc><rect width="${width}" height="${height}" fill="${t.surface}"/>`;
    if(!current)locals.forEach((rs,p)=>{const y=firstY+p*(mobile?laneHeight+34:116)+laneHeight/2;out+=`<path d="${curve([logX-8,y])}" fill="none" stroke="${t.subtle}" stroke-width="1.2" stroke-dasharray="4 5"/>`;});
    out+=text(source.x+40,source.y-15,'Producer',16)
      +rect(source.x,source.y,source.w,source.h,t.canvas,t.border);
    keys.forEach((key,i)=>{out+=`<rect x="${source.x+7+i*11}" y="${source.y+10}" width="11" height="${source.h-20}" fill="${keyStyle(key,t).color}"/>`;});

    locals.forEach((rs,p)=>{
      const y=firstY+p*(mobile?laneHeight+34:116);
      out+=`<g data-partition="${p}" data-capacity="${rs.length}" data-display-capacity="${capacity}">`
        +rect(logX,y,laneWidth,laneHeight,tint(mode==='keyed'?rs:list),t.border)
        +text(logX-(mobile?20:26),y+laneHeight/2,`P${p}`,15,t.muted);
      rs.forEach(r=>{const pos=position(r);out+=`<g data-slot-offset="${r.offset}"><path d="M${pos.x+blockW/2},${pos.y+blockH+6} v4" stroke="${t.border}"/>`+text(pos.x+blockW/2,pos.y+blockH+19,r.offset,mobile?12:14,t.muted)+'</g>';});
      appended.filter(r=>r.partition===p).forEach(r=>{const pos=position(r),style=keyStyle(r.key,t);out+=`<g data-record-key="${r.key}" data-record-id="${r.id}"><title>Record ${r.id}: ${r.key}, P${p}, offset ${r.offset}</title>`+rect(pos.x,pos.y,blockW,blockH,style.fill,style.color)+text(pos.x+blockW/2,pos.y+blockH/2,r.id,16,style.ink)+'</g>';});
      out+='</g>';
    });
    if(current){
      const style=keyStyle(current.key,t),end=endFor(current);
      out+=`<path data-packet-route="[]" d="${curve(end)}" fill="none" stroke="${style.color}" stroke-width="2" ${routing?'':'stroke-dasharray="4 5"'}/>`;
      if(routing)out+=`<g id="packet" transform="translate(${end[0]-17} ${end[1]-15})"><title>Record ${current.id}: ${current.key} → P${current.partition}</title>`+rect(17-blockW/2,15-blockH/2,blockW,blockH,style.fill,style.color)+text(17,15,current.id,16,style.ink)+'</g>';
    }
    svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.setAttribute('font-family','system-ui,sans-serif');svg.innerHTML=out;
    let points;
    const route=svg.querySelector('[data-packet-route]');
    if(route){const length=route.getTotalLength();points=Array.from({length:241},(_,i)=>{const p=route.getPointAtLength(length*i/240);return[p.x,p.y];});route.dataset.packetRoute=JSON.stringify(points);}
    document.querySelector('#rule').textContent=current&&mode==='keyed'?`${current.hash} % ${count} = ${current.partition}`:`positive(murmur2(key)) % ${count}`;
    document.querySelector('#routing-heading').textContent='Kafka partitions events into separate logs';
    document.querySelector('#status').textContent=current?`${routing?'Record':'Appended'} ${current.id} · ${current.key} → P${current.partition} · ${appended.length}/9`:`One producer · ${count} partitions · nine records`;
    figure.dataset.state=JSON.stringify({mode,count,step,appended});document.querySelector('[data-action=step]').disabled=step===18;
    document.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
    if(routing&&motion&&!reduced.matches){const frames=points.map(([x,y],i)=>({transform:`translate(${x-17}px, ${y-15}px)`,offset:i/(points.length-1)}));animation=svg.querySelector('#packet').animate(frames,{duration,easing:'linear',fill:'forwards'});}
  }
  function applyTheme() {
    const position = animation?.currentTime;
    const duration = animation?.effect.getTiming().duration;
    const animationState = animation?.playState;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    Object.entries(window.visualTokens[theme]).forEach(([k, v]) =>
      document.documentElement.style.setProperty(`--${k}`, v),
    );
    document
      .querySelector("#theme")
      .setAttribute("aria-pressed", String(theme === "dark"));
    document
      .querySelector("#theme")
      .setAttribute(
        "aria-label",
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      );
    render(position != null, duration);
    if (animation && position != null) {
      animation.currentTime = position;
      if (animationState !== "running") animation.pause();
    }
  }
  compact.addEventListener("change", applyTheme);
  document.querySelector("#theme").onclick = () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("visual-lab-theme", theme);
    applyTheme();
  };
  document.querySelector('[data-action="step"]').onclick = () => {
    stop();
    step = Math.min(18, step + 1);
    resetPhase();
    render();
  };
  document.querySelector('[data-action="reset"]').onclick = () => {
    stop();
    step = 0;
    resetPhase();
    render();
    playing = !reduced.matches;
    syncPlayback();
  };
  play.onclick = () => {
    if (playing) {
      stop();
      return;
    }
    if (step === 18) {
      step = 0;
      render();
    }
    playing = true;
    syncPlayback();
  };
  document.querySelectorAll('[data-mode]').forEach(button=>button.onclick=()=>{
    stop();mode=button.dataset.mode;step=0;resetPhase();render();
  });
  document.querySelector("#partitions").oninput = (e) => {
    stop();
    count = Number(e.target.value);
    document.querySelector('#partition-count').value = count;
    step = 0;
    resetPhase();
    render();
  };
  document.querySelector("#speed").onchange = (e) => {
    const wasPlaying = playing;
    stop();
    const oldSpeed = speed;
    speed = Number(e.target.value);
    remaining *= oldSpeed / speed;
    if (animation) {
      const progress =
        animation.currentTime / animation.effect.getTiming().duration;
      animation.effect.updateTiming({ duration: 1800 / speed });
      animation.currentTime = (progress * 1800) / speed;
    }
    playing = wasPlaying;
    syncPlayback();
  };
  document.addEventListener("visibilitychange", syncPlayback);
  reduced.addEventListener("change", () => {
    if (reduced.matches) stop();
    syncPlayback();
  });
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    },
    { threshold: 0 },
  );
  observer.observe(svg);
  window.kafkaPartitioning = { murmur2, records };
  applyTheme();
  syncPlayback();
})();
