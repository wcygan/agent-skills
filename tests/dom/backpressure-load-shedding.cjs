// Optional state/DOM/geometry checks; jsdom does not render browser pixels.
// NODE_PATH=/tmp/temporal-scale-dom-checks/node_modules node tests/dom/backpressure-load-shedding.cjs
const {JSDOM, VirtualConsole}=require('jsdom');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.resolve(__dirname,'../../skills/style-technical-visuals/references/standalone/backpressure-load-shedding.html'),'utf8');
let stateChecks=0,geometryChecks=0;
function closeTo(actual,expected,message) {assert(Math.abs(actual-expected)<1e-8,`${message}: ${actual} vs ${expected}`);}
function chartCounts(app,id) {
  const chart=app.get('lane-'+id).querySelector('.chart');
  const maximum=Number(chart.querySelector('[data-chart=scale]').textContent);
  return ['queue','waiting','discarded'].map(key=>{
    const coordinates=chart.querySelector(`[data-curve=${key}]`).getAttribute('d').match(/[\d.]+/g).map(Number);
    return Math.round((80-coordinates.at(-1))*maximum/64);
  });
}
function open({compact=false,reduced=false}={}) {
  const tasks=new Map(),media=new Map(),observers=[],errors=[];
  const counts={created:0,replaced:0,frames:0,nativeStarts:0};
  let nextId=1,hidden=false;
  const console=new VirtualConsole(); console.on('jsdomError',error=>errors.push(error));
  const dom=new JSDOM(source,{runScripts:'dangerously',virtualConsole:console,beforeParse(w) {
    w.matchMedia=query=>{
      const listeners=[];
      const item={matches:query.includes('reduced-motion')?reduced:compact,
        addEventListener(type,callback) {assert.equal(type,'change'); listeners.push(callback);},
        change(value) {item.matches=value; listeners.forEach(callback=>callback(item));}};
      media.set(query,item); return item;
    };
    w.setTimeout=(callback,delay)=>{const id=nextId++; tasks.set(id,{callback,delay}); return id;};
    w.clearTimeout=id=>tasks.delete(id);
    w.requestAnimationFrame=()=>{counts.frames++; throw new Error('Discrete retained SVG needs no frame loop');};
    w.IntersectionObserver=class {constructor(callback) {this.callback=callback; observers.push(this);} observe(target) {this.target=target;}};
    Object.defineProperty(w.document,'hidden',{get:()=>hidden});
    w.SVGElement.prototype.beginElement=function() {counts.nativeStarts++; this.dataset.started='true';};
    w.SVGElement.prototype.endElement=function() {this.dataset.ended='true';};
    w.SVGElement.prototype.pauseAnimations=function() {this.dataset.animationState='paused';};
    w.SVGElement.prototype.unpauseAnimations=function() {this.dataset.animationState='running';};
    const create=w.Document.prototype.createElementNS;
    w.Document.prototype.createElementNS=function(...args) {counts.created++; return create.apply(this,args);};
    const replace=w.Element.prototype.replaceChildren;
    w.Element.prototype.replaceChildren=function(...args) {counts.replaced++; return replace.apply(this,args);};
  }});
  const doc=dom.window.document;
  const app={dom,doc,tasks,media,counts,
    get:id=>doc.getElementById(id),
    click(id) {app.get(id).click();},
    set(id,value) {app.get(id).value=value; app.get(id).dispatchEvent(new dom.window.Event(id==='seed'?'change':'input'));},
    configure(values) {for (const [id,value] of Object.entries(values)) app.set(id,value);},
    step(n=1) {for (let i=0;i<n;i++) app.click('step');},
    advance() {assert.equal(tasks.size,1); const [id,task]=tasks.entries().next().value; tasks.delete(id); task.callback(); return task.delay;},
    snapshot() {return JSON.parse(JSON.stringify(dom.window.backpressureDemo.snapshot()));},
    visible(value) {observers.forEach(observer=>observer.callback([{target:observer.target,isIntersecting:value}]));},
    hidden(value) {hidden=value; doc.dispatchEvent(new dom.window.Event('visibilitychange'));},
    page(value) {dom.window.dispatchEvent(new dom.window.Event(value?'pageshow':'pagehide'));},
    motion(value) {media.get('(prefers-reduced-motion: reduce)').change(value);},
    compact(value) {media.get('(max-width: 650px)').change(value);},
    close() {assert.deepEqual(errors,[]); assert.equal(counts.frames,0); dom.window.close();}
  };
  assert.equal(tasks.size,reduced?0:1,'Standalone starts automatically unless reduced motion requests Pause');
  return app;
}
function check(app) {
  stateChecks++;
  const state=app.snapshot(),p=state.parameters;
  assert(state.offered<=6000); assert(state.time<=120);
  const commonBirths=new Map();
  for (const lane of state.lanes) {
    assert.equal(lane.offered,state.offered,'Same offered load reaches every policy');
    assert(lane.queue.length<=p.capacity,'Downstream queue stays bounded');
    const inFlight=lane.active?1:0;
    assert.equal(lane.offered,lane.completed+lane.queue.length+inFlight+lane.waiting+lane.dropped+lane.rejected,'Every request has exactly one current outcome');
    assert.equal(lane.admitted,lane.completed+lane.queue.length+inFlight,'Admitted work stays downstream until completion');
    if (lane.id==='backpressure') {assert.equal(lane.dropped+lane.rejected,0); assert.equal(lane.offered,lane.admitted+lane.waiting);}
    else {assert.equal(lane.waiting,0); assert.equal(lane.oldest,null);}
    if (lane.id==='buffer') assert.equal(lane.rejected,0);
    if (lane.id==='shedding') {assert.equal(lane.dropped,0); assert(lane.queue.length<=Math.ceil(p.capacity/2),'Early admission threshold');}
    assert(lane.history.length<=81); assert(lane.finished.length<=24); assert(lane.recent.length<=201);
    assert(lane.upstreamHead.length<=24);
    let previousDiscarded=0;
    for (const point of lane.history) {
      assert(point.time>=Math.max(0,state.time-20)-1e-9); assert(point.queue<=p.capacity); assert(point.waiting>=0);
      assert(point.discarded>=previousDiscarded,'Discard history is a cumulative total');
      previousDiscarded=point.discarded;
    }
    assert.equal(lane.history.at(-1).discarded,lane.dropped+lane.rejected,'Newest chart sample includes every discard');
    for (const time of lane.recent) assert(time>state.time-5-1e-8 && time<=state.time+1e-8);
    const outstanding=[...(lane.active?[lane.active]:[]),...lane.queue,...lane.upstreamHead];
    for (let i=1;i<outstanding.length;i++) assert(outstanding[i-1].id<outstanding[i].id,'Retained requests remain FIFO across boundaries');
    for (let i=1;i<lane.finished.length;i++) assert(lane.finished[i-1].id<lane.finished[i].id,'Completion order is FIFO');
    for (const request of lane.finished) {
      assert(request.offeredAt<=request.admittedAt+1e-9);
      assert(request.admittedAt<=request.startedAt+1e-9);
      assert(request.startedAt<request.completedAt);
      assert(request.completedAt<=state.time+1e-9);
      if (commonBirths.has(request.id)) closeTo(request.offeredAt,commonBirths.get(request.id),'Identical request birth time');
      else commonBirths.set(request.id,request.offeredAt);
    }
    const card=app.get('lane-'+lane.id);
    assert.deepEqual(chartCounts(app,lane.id),[lane.queue.length,lane.waiting,lane.dropped+lane.rejected],'Chart includes current waiting and cumulative discarded counts');
    const discardedCurve=card.querySelector('[data-curve=discarded]');
    assert.equal(discardedCurve.getAttribute('stroke'),'var(--bad)');
    assert(discardedCurve.hasAttribute('stroke-dasharray'),'Discard also has a distinct line pattern');
    assert.equal(card.querySelector('.discarded-key').textContent,lane.id==='shedding'?'┈ rejected total':'┈ dropped total');
    assert(card.querySelector('.chart').getAttribute('aria-label').includes('cumulative'));
    for (const [key,value] of Object.entries({offered:lane.offered,admitted:lane.admitted,completed:lane.completed,discarded:lane.dropped+lane.rejected,queue:lane.queue.length,waiting:lane.waiting,active:inFlight})) {
      assert.equal(Number(card.querySelector(`[data-metric=${key}]`).textContent),value,'Displayed '+key+' is actual state');
      assert.equal(Number(card.dataset[key]),value);
    }
    const expectedThroughput=state.time?lane.recent.length/Math.min(state.time,5):0;
    assert.equal(card.querySelector('[data-metric=throughput]').textContent,expectedThroughput.toFixed(2));
    const totals={queue:lane.queueWait,upstream:lane.upstreamWait,total:lane.totalLatency};
    for (const [key,total] of Object.entries(totals)) assert.equal(card.querySelector(`[data-latency=${key}]`).textContent,lane.completed?(total/lane.completed).toFixed(2)+'s':'—');
    assert.equal(card.querySelector('[data-latency=oldest]').textContent,lane.waiting?(state.time-lane.oldest).toFixed(2)+'s':'—');
    const cells=[...card.querySelectorAll('[data-kind=queue] rect')].slice(1);
    assert.equal(cells.filter(cell=>cell.getAttribute('visibility')==='visible').length,p.capacity);
    assert.deepEqual(cells.filter(cell=>cell.hasAttribute('data-request')).map(cell=>Number(cell.dataset.request)),lane.queue.map(request=>request.id));
  }
  return state;
}
function geometry(app,compact) {
  geometryChecks++;
  const nodes=[...app.doc.querySelectorAll('[data-node]')].filter(node=>node.style.display!=='none');
  const box=node=>['x','y','w','h'].map(key=>Number(node.dataset[key]));
  const port=(node,side)=>{const [x,y,w,h]=box(node); return side==='left'?[x,y+h/2]:side==='right'?[x+w,y+h/2]:side==='top'?[x+w/2,y]:[x+w/2,y+h];};
  for (const svg of app.doc.querySelectorAll('.scene')) assert.equal(svg.getAttribute('viewBox'),compact?'0 0 360 440':'0 0 800 265');
  for (const node of nodes) {
    const [x,y,w,h]=box(node),svg=node.closest('svg');
    const [,,vw,vh]=svg.getAttribute('viewBox').split(' ').map(Number);
    assert(x>=0 && y>=0 && x+w<=vw && y+h<=vh);
    for (const text of node.querySelectorAll('text')) {
      const tx=Number(text.getAttribute('x')),ty=Number(text.getAttribute('y')),font=Number(text.getAttribute('font-size'));
      assert(tx>=x+8 && tx+text.textContent.length*font*.61<=x+w-8,'Conservative label width: '+text.textContent);
      assert(ty-font>=y && ty<=y+h-8,'Label height: '+text.textContent);
    }
  }
  for (const wire of app.doc.querySelectorAll('[data-route]')) {
    const svg=wire.closest('svg'),points=JSON.parse(wire.dataset.points);
    const from=app.doc.querySelector(`[data-node="${wire.dataset.from}"]`),to=app.doc.querySelector(`[data-node="${wire.dataset.to}"]`);
    assert.deepEqual(points[0],port(from,wire.dataset.fromSide)); assert.deepEqual(points.at(-1),port(to,wire.dataset.toSide));
    for (const [side,segment] of [[wire.dataset.fromSide,points.slice(0,2)],[wire.dataset.toSide,points.slice(-2)]]) {
      assert.equal(segment[0][['left','right'].includes(side)?1:0],segment[1][['left','right'].includes(side)?1:0],'Perpendicular ports');
    }
    for (let i=1;i<points.length;i++) {
      const a=points[i-1],b=points[i]; assert(a[0]===b[0] || a[1]===b[1]);
      for (const node of nodes.filter(node=>node.closest('svg')===svg)) {
        const [x,y,w,h]=box(node);
        const intersects=a[0]===b[0]?a[0]>x&&a[0]<x+w&&Math.max(a[1],b[1])>y&&Math.min(a[1],b[1])<y+h:a[1]>y&&a[1]<y+h&&Math.max(a[0],b[0])>x&&Math.min(a[0],b[0])<x+w;
        assert(!intersects,wire.dataset.route+' clears '+node.dataset.node);
      }
    }
    const marker=app.get(wire.getAttribute('marker-end').slice(5,-1));
    assert.equal(marker.getAttribute('refX'),'8'); assert.equal(marker.getAttribute('refY'),'0'); assert.equal(marker.getAttribute('orient'),'auto');
    const packet=app.doc.querySelector(`[data-packet="${wire.dataset.route}"]`),motion=packet.querySelector('animateMotion');
    assert.equal(motion.getAttribute('path'),wire.getAttribute('d'),'Native packet uses exact wire');
    assert.equal(motion.getAttribute('begin'),'indefinite');
    if (packet.getAttribute('visibility')==='visible') {assert.equal(motion.dataset.started,'true'); assert(Number(wire.dataset.events)>0,'Packets summarize real events');}
  }
  for (const chart of app.doc.querySelectorAll('.chart')) {
    const [,,width,height]=chart.getAttribute('viewBox').split(' ').map(Number);
    for (const curve of chart.querySelectorAll('[data-curve]')) {
      const numbers=curve.getAttribute('d').match(/[\d.]+/g).map(Number);
      for (let i=0;i<numbers.length;i+=2) assert(numbers[i]>=0&&numbers[i]<=width&&numbers[i+1]>=0&&numbers[i+1]<=height);
    }
  }
}

// A fixed burst has independently calculable admissions, discard, FIFO order and latency.
for (const compact of [false,true]) {
  const app=open({compact}); app.click('play');
  app.configure({arrival:0,processing:4,capacity:8,'burst-size':24}); app.click('burst');
  let state=check(app); geometry(app,compact);
  const [buffer,bp,shed]=state.lanes;
  assert.deepEqual([buffer.admitted,bp.admitted,shed.admitted],[9,9,5]);
  assert.deepEqual([buffer.dropped,bp.waiting,shed.rejected],[15,15,19]);
  assert.deepEqual(state.lanes.map(lane=>chartCounts(app,lane.id)),[[8,0,15],[8,15,0],[4,0,19]],'Burst chart shows overflow, retained demand, and early rejections');
  assert.deepEqual(buffer.queue.map(job=>job.id),[2,3,4,5,6,7,8,9]);
  assert.equal(bp.upstreamHead[0].id,10); assert.equal(bp.waiting,15);
  for (let i=0;i<24;i++) {app.step(); state=check(app);}
  const [doneBuffer,doneBP,doneShed]=state.lanes;
  assert.deepEqual(state.lanes.map(lane=>lane.completed),[9,24,5]);
  assert(state.lanes.every(lane=>lane.queue.length===0&&lane.waiting===0&&!lane.active));
  assert.deepEqual(state.lanes.map(lane=>chartCounts(app,lane.id)),[[0,0,15],[0,0,0],[0,0,19]],'Discard lines persist when downstream and upstream drain');
  closeTo(doneBuffer.queueWait/9,1,'Buffer queue wait');
  closeTo(doneBuffer.totalLatency/9,1.25,'Buffer total latency');
  closeTo(doneBP.queueWait/24,1.625,'Backpressure completed queue wait');
  closeTo(doneBP.upstreamWait/24,1.25,'Backpressure upstream wait stays visible');
  closeTo(doneBP.totalLatency/24,3.125,'Backpressure total latency includes upstream wait');
  closeTo(doneShed.queueWait/5,.5,'Early shedding queue wait');
  closeTo(doneShed.totalLatency/5,.75,'Early shedding completed total latency');
  for (const lane of state.lanes) for (const job of lane.finished) closeTo(job.completedAt-job.startedAt,.25,'Equal service cost');
  assert.equal(app.tasks.size,0); geometry(app,compact);
  app.click('play'); assert.equal(app.tasks.size,0,'No arrivals or retained work: idle sleeps');
  assert.equal(app.get('playback').textContent,'idle');
  app.close();
}

// Minimum, odd, and maximum capacities use the actual admission rule in both layouts.
for (const compact of [false,true]) {
  const app=open({compact}); app.click('play');
  app.configure({arrival:0,processing:0,'burst-size':64});
  for (const capacity of [1,3,32]) {
    app.set('capacity',capacity); app.click('burst');
    const state=check(app); geometry(app,compact);
    assert.equal(state.lanes[0].admitted,capacity+1,'One active request plus finite buffer');
    assert.equal(state.lanes[1].waiting,64-capacity-1);
    assert.equal(state.lanes[2].admitted,Math.ceil(capacity/2)+1,'Half-capacity gate is rounded up');
  }
  app.close();
}

// Sustained overload grows upstream demand, while downstream queues stay bounded.
const overload=open(); overload.click('play'); overload.configure({arrival:12,processing:4,capacity:8});
let beforeWaiting=0;
for (let i=0;i<80;i++) {
  overload.step(); const state=check(overload); const bp=state.lanes[1];
  if (i>20) assert(bp.waiting>=beforeWaiting,'Upstream demand grows under sustained overload');
  beforeWaiting=bp.waiting;
}
let state=check(overload);
assert(state.lanes[1].waiting>140); assert(state.lanes[0].dropped>140); assert(state.lanes[2].rejected>140);
assert(state.lanes[1].oldest<state.time-10,'Current upstream age exposes unfinished latency');
for (const lane of state.lanes) assert.equal(Number(overload.get('lane-'+lane.id).querySelector('[data-metric=throughput]').textContent),4,'Discard does not count as throughput');
const discarded=state.lanes.map(lane=>lane.dropped+lane.rejected);
overload.set('arrival',0); overload.set('processing',20);
for (let i=0;i<40;i++) {overload.step(); check(overload);}
state=check(overload);
assert(state.lanes.every(lane=>lane.queue.length===0&&lane.waiting===0&&!lane.active),'Spare capacity drains both queues');
assert.deepEqual(state.lanes.map(lane=>lane.dropped+lane.rejected),discarded,'Discarded requests do not return during recovery');
assert.equal(state.lanes[1].completed,state.offered,'Backpressure retains all work');
assert(state.lanes[1].upstreamWait>0);
assert(state.lanes[1].totalLatency>state.lanes[1].queueWait+state.lanes[1].upstreamWait);
overload.set('capacity',1); state=check(overload);
assert.equal(state.time,0); assert.equal(state.offered,0); assert.equal(state.parameters.capacity,1);
assert.deepEqual(state.lanes.map(lane=>chartCounts(overload,lane.id)),[[0,0,0],[0,0,0],[0,0,0]],'Reset clears all chart series');
assert(overload.get('status').textContent.includes('Capacity changed'));
assert.equal(overload.tasks.size,0,'Capacity reset preserves Pause');
geometry(overload,false);
overload.close();

// Processing changes preserve fractional work and take effect at exact completion time.
const rates=open(); rates.click('play'); rates.configure({arrival:0,processing:2,'burst-size':1}); rates.click('burst'); rates.step();
state=check(rates); assert.equal(state.lanes[0].active.progress,.5);
rates.set('processing',0); rates.click('play'); assert.equal(rates.tasks.size,0,'Stalled worker sleeps');
assert(rates.get('playback').textContent.includes('stalled'));
rates.set('processing',8); assert.equal(rates.tasks.size,1,'Changing rate wakes retained work'); rates.advance();
state=check(rates);
for (const lane of state.lanes) closeTo(lane.finished[0].completedAt,.3125,'Remaining half cost uses new rate');
assert.equal(rates.tasks.size,0,'Drain returns to idle');
rates.set('arrival',1); assert.equal(rates.tasks.size,1,'New arrivals wake idle playback');
rates.close();

// Reset reproduces a seeded stream; a different seed changes actual birth times.
const seeded=open(); seeded.click('play'); seeded.step(12); const first=check(seeded);
seeded.click('reset'); seeded.step(12); assert.deepEqual(check(seeded),first);
seeded.set('seed',7000); seeded.step(12); const different=check(seeded);
assert.notEqual(different.lanes[0].finished[0].offeredAt,first.lanes[0].finished[0].offeredAt);
seeded.set('seed',17); seeded.step(12); assert.deepEqual(check(seeded),first);
seeded.close();

// Scene nodes and native packets remain allocated across ticks, resizing, and resets.
const lifecycle=open();
const retained=lifecycle.doc.querySelector('[data-node]'),wire=lifecycle.doc.querySelector('[data-route]'),packet=lifecycle.doc.querySelector('[data-packet]');
const discardedCurves=[...lifecycle.doc.querySelectorAll('[data-curve=discarded]')];
const created=lifecycle.counts.created,replaced=lifecycle.counts.replaced;
lifecycle.advance(); check(lifecycle); assert(lifecycle.counts.nativeStarts>0);
lifecycle.visible(false); assert.equal(lifecycle.tasks.size,0); assert.equal(lifecycle.get('playback').textContent,'suspended');
const suspended=lifecycle.snapshot().time; lifecycle.hidden(true); lifecycle.visible(true); assert.equal(lifecycle.tasks.size,0);
assert.equal(lifecycle.snapshot().time,suspended,'Hidden time does not advance');
lifecycle.hidden(false); assert.equal(lifecycle.tasks.size,1);
lifecycle.page(false); assert.equal(lifecycle.tasks.size,0); lifecycle.page(true); assert.equal(lifecycle.tasks.size,1);
lifecycle.click('play'); assert.equal(lifecycle.tasks.size,0);
lifecycle.visible(false); lifecycle.visible(true); assert.equal(lifecycle.tasks.size,0,'Visibility preserves user Pause');
lifecycle.step(); assert.equal(lifecycle.tasks.size,0);
for (const svg of lifecycle.doc.querySelectorAll('.scene')) assert.equal(svg.dataset.animationState,'running','Manual steps can play finite native packets');
lifecycle.click('reset'); assert.equal(lifecycle.tasks.size,0);
lifecycle.click('play'); lifecycle.click('reset'); assert.equal(lifecycle.tasks.size,1,'Reset preserves Play');
lifecycle.motion(true); assert.equal(lifecycle.tasks.size,0,'Enabling reduced motion pauses playback');
const starts=lifecycle.counts.nativeStarts; lifecycle.click('play');
assert.equal(lifecycle.advance(),900,'Reduced motion keeps slower discrete updates');
assert.equal(lifecycle.counts.nativeStarts,starts,'Reduced motion creates no native movement');
assert([...lifecycle.doc.querySelectorAll('[data-packet]')].every(node=>node.getAttribute('visibility')==='hidden'));
lifecycle.compact(true); geometry(lifecycle,true); lifecycle.compact(false); geometry(lifecycle,false);
assert.equal(lifecycle.doc.querySelector('[data-node]'),retained); assert.equal(lifecycle.doc.querySelector('[data-route]'),wire); assert.equal(lifecycle.doc.querySelector('[data-packet]'),packet);
assert.deepEqual([...lifecycle.doc.querySelectorAll('[data-curve=discarded]')],discardedCurves,'New curves are retained across ticks, resizing, and resets');
assert.equal(lifecycle.counts.created,created); assert.equal(lifecycle.counts.replaced,replaced);
lifecycle.close();

const reducedStartup=open({reduced:true});
assert.equal(reducedStartup.get('play').textContent,'Play');
reducedStartup.step(); check(reducedStartup); assert.equal(reducedStartup.counts.nativeStarts,0);
reducedStartup.click('play'); assert.equal(reducedStartup.tasks.size,1); reducedStartup.advance();
assert.equal(reducedStartup.counts.nativeStarts,0); reducedStartup.motion(false);
assert.equal(reducedStartup.tasks.size,1,'Disabling reduced motion preserves explicit Play intent');
reducedStartup.close();

// Finite budgets bound request objects, history, timers, and time during worst overload.
const budget=open(); budget.click('play'); budget.configure({arrival:0,processing:0,'burst-size':64});
for (let i=0;i<94;i++) budget.click('burst');
state=check(budget); assert.equal(state.offered,6000); assert.equal(state.limit,true);
assert(state.lanes[1].waiting<=6000); assert.equal(budget.tasks.size,0); assert.equal(budget.get('burst').disabled,true);
assert.equal(budget.get('step').disabled,true); budget.step(); assert.equal(budget.snapshot().time,0);
budget.click('reset'); assert.equal(budget.snapshot().offered,0); assert.equal(budget.get('step').disabled,false);
budget.set('arrival',40); budget.set('processing',0); budget.step(480);
state=check(budget); assert.equal(state.time,120); assert.equal(state.limit,true); assert.equal(budget.tasks.size,0);
assert(state.lanes.every(lane=>lane.history.length<=81)); geometry(budget,false);
budget.close();

assert(!/<script[^>]+src=|<link[^>]+stylesheet|fetch\(|XMLHttpRequest|requestAnimationFrame\(/.test(source),'Offline, discrete simulation');
assert(!/body\s*\{[^}]*overflow\s*:\s*hidden/.test(source),'Standalone permits natural scrolling');
assert(source.includes('reactive-streams-jvm/blob/v1.0.4/README.md'));
assert(source.includes('rel_mitigate_interaction_failure_fail_fast.html'));
console.log(`Backpressure/load shedding passed: ${stateChecks} conservation/latency/chart samples, ${geometryChecks} geometry samples; discard curves, overload, FIFO, recovery, rate/capacity changes, deterministic reset, native paths, retained DOM, lifecycle, reduced motion, and bounded budgets.`);
