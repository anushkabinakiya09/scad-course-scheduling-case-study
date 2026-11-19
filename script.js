(function(){
  var root=document.documentElement;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // reveal on scroll
  if('IntersectionObserver' in window){
    root.classList.add('rv-on');
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.12});
    document.querySelectorAll('.rvs, .rvs > *, .rvs > div > *, .rvbars, .tl, .aff').forEach(function(el){el.classList.add('rv');io.observe(el);});
    document.querySelectorAll('.rvbars').forEach(function(el){el.querySelectorAll('div').forEach(function(d){d.classList.add('bar');});});
  }
  // progress, active nav, back-to-top
  var bar=document.getElementById('progress'), top=document.getElementById('toTop');
  var ids=['challenge','role','approach','findings','archetypes','journey','recommendations','impact'];
  var links=document.querySelectorAll('.navlink'), ticking=false,lastAct=null;
  function update(){
    ticking=false;
    var el=document.scrollingElement||root, max=(el.scrollHeight-el.clientHeight)||1;
    var p=Math.max(0,Math.min(1,el.scrollTop/max));
    bar.style.width=(p*100).toFixed(1)+'%';
    top.hidden=!(p>0.04);
    var act='';
    ids.forEach(function(id){var n=document.getElementById(id);if(n&&n.getBoundingClientRect().top<=160)act=id;});
    links.forEach(function(a){var on=a.dataset.id===act;a.classList.toggle('active',on);if(on){a.setAttribute('aria-current','true');if(act!==lastAct&&a.parentNode.scrollWidth>a.parentNode.clientWidth)a.parentNode.scrollTo({left:a.offsetLeft-16,behavior:reduce?'auto':'smooth'});}else a.removeAttribute('aria-current');});
    lastAct=act;
  }
  window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  window.addEventListener('resize',update);
  update();
  // count-up stats
  var counts=document.querySelectorAll('.count');
  if(!reduce){
    counts.forEach(function(c){c.textContent='0';});
    var t0=performance.now(),dur=1400;
    (function tick(now){var k=Math.min(1,(now-t0)/dur),e=1-Math.pow(1-k,3);
      counts.forEach(function(c){c.textContent=Math.round(+c.dataset.to*e);});
      if(k<1)requestAnimationFrame(tick);})(t0);
  }
  // journey stage tabs
  var DATA={
    fy:{name:'first-year',note:'Stage 3 is where the biggest gap sits: the moment a change is still possible.',S:[
      ["1 · Awareness","Receiving the schedule","I didn't really know what was bad and what was good.","It arrives before students know the campus."],
      ["2 · Consideration","Questioning it","I don't know anything about it.","Information is scattered and often found by chance."],
      ["3 · Acquisition","Keeping or changing it","I feel like I'm breaking a rule.","Knowing a change is possible depends on who you know."],
      ["4 · Service","Living the schedule","What I have now, I think it works for me.","Real fit only shows once classes start."],
      ["5 · Loyalty","Carrying it forward","You don't really get shown that right now.","Unsure how registering for themselves will work."]]},
    uc:{name:'upperclass',note:'Stage 3 is where registration pressure peaks: sections fill fast and fallback options are thin.',S:[
      ["1 · Awareness","Registering","I like when I have a plan.","Records can be late or wrong, and the guide doesn't show which courses can move."],
      ["2 · Consideration","Questioning it","I freaking love Rate My Professor.","Ratings and peer advice don't always predict personal fit."],
      ["3 · Acquisition","Keeping or changing it","I now have three time-consuming classes all in one quarter just because the registration didn't work.","Sections fill fast, and 3 of 6 described a class they needed being full."],
      ["4 · Service","Living the schedule","I'm enjoying it.","A substitution can stack the hardest classes into one quarter."],
      ["5 · Loyalty","Carrying it forward","I wish I had known that I could change my sequencing.","34 of 51 wished they had known more about course sequencing, the most-selected answer."]]}
  };
  var S=DATA.fy.S;
  var tabs=[].slice.call(document.querySelectorAll('.stage')), panel=document.getElementById('stage-panel');
  function pick(i,focus){
    tabs.forEach(function(t,j){var on=j===i;t.setAttribute('aria-selected',on?'true':'false');t.tabIndex=on?0:-1;});
    var s=S[i];
    document.getElementById('cur-label').textContent=s[0]+' · '+s[1];
    document.getElementById('cur-quote').textContent=s[2];
    document.getElementById('cur-insight').textContent=s[3];
    document.getElementById('cur-pct').style.width=((i+1)*20)+'%';
    panel.setAttribute('aria-labelledby','stage-'+i);
    panel.classList.remove('panelswap');void panel.offsetWidth;panel.classList.add('panelswap');
    if(focus)tabs[i].focus();
  }
  function setCohort(k){
    S=DATA[k].S;
    document.querySelectorAll('#j-seg .segbtn').forEach(function(x){x.setAttribute('aria-pressed',x.dataset.k===k?'true':'false');});
    document.getElementById('j-cohort').textContent=DATA[k].name;
    document.getElementById('j-note').textContent=DATA[k].note;
    tabs.forEach(function(t,i){t.querySelector('.stage-title').textContent=S[i][1];});
    pick(2);
  }
  document.querySelectorAll('#j-seg .segbtn').forEach(function(b){b.addEventListener('click',function(){setCohort(b.dataset.k);});});
  tabs.forEach(function(t,i){
    t.addEventListener('click',function(){pick(i);});
    t.addEventListener('keydown',function(e){
      var n=null;
      if(e.key==='ArrowRight'||e.key==='ArrowDown')n=(i+1)%tabs.length;
      else if(e.key==='ArrowLeft'||e.key==='ArrowUp')n=(i-1+tabs.length)%tabs.length;
      else if(e.key==='Home')n=0; else if(e.key==='End')n=tabs.length-1;
      if(n!==null){e.preventDefault();pick(n,true);}
    });
  });
})();

// ---- findings & charts ----
(function(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var charts=document.querySelectorAll('.chart'), dots=document.querySelectorAll('.dots'), cus=document.querySelectorAll('.cu');
  dots.forEach(function(d){
    var t=+d.dataset.total;
    for(var i=0;i<t;i++){d.appendChild(document.createElement('i'));}
    d.setAttribute('aria-hidden','true');
    var cap=document.createElement('p');cap.className='dotcap';cap.textContent=d.dataset.cap;d.appendChild(cap);
  });
  function fillDots(d){var on=+d.dataset.on,els=d.querySelectorAll('i');
    for(var i=0;i<on;i++){(function(i){if(reduce)els[i].classList.add('on');else setTimeout(function(){els[i].classList.add('on');},i*45);})(i);}}
  function countUp(c){var to=+c.dataset.to;if(reduce)return;var t0=performance.now(),dur=900;
    (function tick(now){var k=Math.min(1,(now-t0)/dur);c.textContent=Math.round(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(tick);})(t0);}
  if(!('IntersectionObserver' in window)){dots.forEach(fillDots);charts.forEach(function(c){c.classList.add('in');});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;
    var el=e.target;io.unobserve(el);
    if(el.classList.contains('chart'))el.classList.add('in');
    else if(el.classList.contains('dots'))fillDots(el);
    else if(el.classList.contains('cu'))countUp(el);
  });},{threshold:0.4});
  charts.forEach(function(c){io.observe(c);});dots.forEach(function(c){io.observe(c);});cus.forEach(function(c){io.observe(c);});
  // finding 3 cohort toggle
  var f3=document.querySelector('.f3');
  if(f3){
    var note=document.getElementById('f3-note'),base=note.textContent;
    var N={both:base,
      fy:'36% of first-years already wish they had known more, and 18 of 50 also understood only slightly, or not at all, how their first-quarter courses fit their degree.',
      uc:'34 of 51 upperclassmen: the most-selected answer among them. About 2 in 3 wish they had known earlier, nearly double the first-year share.'};
    var btns=f3.querySelectorAll('.segbtn');
    btns.forEach(function(b){b.addEventListener('click',function(){
      btns.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false');});
      f3.dataset.view=b.dataset.v;note.textContent=N[b.dataset.v];});});
  }
})();

// ---- archetypes ----
(function(){
  var wheel=document.getElementById('wheel'); if(!wheel)return;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COH={fy:{a:['innocent','everyman'],label:'first-years: The Innocent and The Everyman'},uc:{a:['ruler','outlaw'],label:'upperclassmen: The Ruler and The Outlaw'}};
  var cur='fy', btns=document.querySelectorAll('#a-seg .segbtn'), groups=document.querySelectorAll('.ag'), wedges=wheel.querySelectorAll('.w');
  function select(a){
    document.querySelectorAll('.ag:not([hidden]) .ac').forEach(function(c){c.setAttribute('aria-pressed',c.dataset.a===a?'true':'false');});
    wedges.forEach(function(w){w.classList.toggle('sel',w.dataset.a===a);});
  }
  function setCohort(k){
    cur=k;
    btns.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.k===k?'true':'false');});
    groups.forEach(function(g){var on=g.dataset.k===k;g.hidden=!on;g.classList.remove('swap');if(on&&!reduce){void g.offsetWidth;g.classList.add('swap');}});
    wedges.forEach(function(w){w.classList.remove('on','sel');if(COH[k].a.indexOf(w.dataset.a)>-1)w.classList.add('on');});
    wheel.setAttribute('aria-label',"Jung's 12 archetypes wheel. Highlighted for "+COH[k].label+'.');
    select(COH[k].a[0]);
  }
  btns.forEach(function(b){b.addEventListener('click',function(){if(b.dataset.k!==cur)setCohort(b.dataset.k);});});
  document.querySelectorAll('.ac').forEach(function(c){
    c.addEventListener('click',function(){select(c.dataset.a);});
    c.addEventListener('mouseenter',function(){select(c.dataset.a);});
  });
  wedges.forEach(function(w){w.addEventListener('click',function(){if(w.classList.contains('on'))select(w.dataset.a);});});
  var box=wheel.parentNode;
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){box.classList.add('in');io.disconnect();}});},{threshold:0.25});
    io.observe(box);
  } else box.classList.add('in');
  setCohort('fy');
})();

// ---- keep anchor targets clear of the sticky nav ----
(function(){
  var nav=document.getElementById('top'); if(!nav)return;
  function setH(){document.documentElement.style.setProperty('--navh',Math.ceil(nav.getBoundingClientRect().height)+'px');}
  setH(); window.addEventListener('resize',setH);
  if(window.ResizeObserver)new ResizeObserver(setH).observe(nav);
})();
