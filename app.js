(() => {
  'use strict';
  const content=window.SITE_CONTENT;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const price=new Intl.NumberFormat('ru-RU');
  const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
  const icon=name=>{const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.setAttribute('aria-hidden','true');const u=document.createElementNS(s.namespaceURI,'use');u.setAttribute('href','#i-'+name);s.append(u);return s;};
  const entranceAnimations=new Set();
  function playEntrance(el,frames,timing){
    const a=el.animate(frames,timing);entranceAnimations.add(a);
    a.finished.then(()=>{entranceAnimations.delete(a);a.cancel();}).catch(()=>entranceAnimations.delete(a));
    return a;
  }
  const motionObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>{
    for(const e of entries){
      if(!e.isIntersecting)continue;
      const el=e.target;motionObserver.unobserve(el);el.dataset.revealPlayed='1';
      if(reduce.matches)continue;
      const kind=el.dataset.motion,direction=Number(el.dataset.direction||1),delay=Number(el.dataset.delay||0);
      const timing={duration:850,delay,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'};
      if(kind==='title'){
        el.dataset.revealFrom=direction<0?'left':'right';
        playEntrance(el,[{transform:`translateX(${direction*22}px)`,opacity:0},{transform:'translateX(0)',opacity:1}],{...timing,duration:620});
        const letters=el.querySelectorAll('.motion-letter');
        letters.forEach((letter,i)=>playEntrance(letter,[
          {transform:`translate3d(${direction*17}px,4px,0)`,opacity:0,filter:'blur(2px)'},
          {transform:'translate3d(0,0,0)',opacity:1,filter:'blur(0)'}
        ],{...timing,duration:540,delay:delay+Math.min(i*18,420)}));
        continue;
      }
      let frames;
      if(kind==='side'){
        el.dataset.revealFrom=direction<0?'left':'right';
        frames=[{transform:`translate3d(${direction*30}px,5px,0)`,opacity:0,filter:'blur(2px)'},{transform:'translate3d(0,0,0)',opacity:1,filter:'blur(0)'}];
        timing.duration=760;
      }else if(kind==='programme'){frames=[{transform:`translate3d(${direction*25}px,12px,0)`,opacity:0},{transform:'translate3d(0,0,0)',opacity:1}];timing.duration=620;}else if(kind==='photo')frames=[{transform:'translateY(24px) scale(.975)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}];
      else if(kind==='card'){
        frames=[{transform:`translate3d(${direction*45}px,70px,0) scale(.92) rotate(${direction*2}deg)`,opacity:0},{transform:'translate3d(0,0,0) scale(1) rotate(0)',opacity:1}];timing.duration=1000;
      }else frames=[{transform:'translateY(36px)',filter:'blur(3px)',opacity:0},{transform:'translateY(0)',filter:'blur(0)',opacity:1}];
      if(kind==='photo')el.classList.add('gallery-entered');
      playEntrance(el,frames,timing);
    }
  },{threshold:.12,rootMargin:'0px 0px -15px 0px'}):null;
  function motion(el,kind='block',index=0){
    if(!motionObserver||reduce.matches)return;
    el.dataset.motion=kind;el.dataset.direction=index%2?-1:1;el.dataset.delay=String((index%3)*90);motionObserver.observe(el);
  }
  function titleMotion(el,index=0){
    if(reduce.matches||!motionObserver)return;
    const label=el.innerText.replace(/\s+/g,' ').trim(),parts=el.innerHTML.split(/<br\s*\/?\s*>/i);
    el.setAttribute('aria-label',label);el.dataset.letterTitle='1';el.replaceChildren();
    parts.forEach((html,lineIndex)=>{
      const line=node('span','motion-line'),inside=node('span','motion-content');
      line.setAttribute('aria-hidden','true');inside.innerHTML=html;
      const walker=document.createTreeWalker(inside,NodeFilter.SHOW_TEXT),texts=[];
      while(walker.nextNode())texts.push(walker.currentNode);
      for(const text of texts){
        const fragment=document.createDocumentFragment();
        for(const part of text.textContent.split(/(\s+)/u)){
          if(!part)continue;
          if(/^\s+$/u.test(part)){fragment.append(document.createTextNode(part));continue;}
          const word=node('span','motion-word');
          for(const char of Array.from(part))word.append(node('span','motion-letter',char));
          fragment.append(word);
        }
        text.replaceWith(fragment);
      }
      line.append(inside);el.append(line);motion(inside,'title',index+lineIndex);
    });
  }
  // Alternating directions follow the page's sections, not every line of body copy.
  document.querySelectorAll('h2:not(#booking-dialog-title),#welcome-offer-title,#gift-terms-title').forEach(titleMotion);
  document.querySelectorAll('.hero-brand,.hero-location,.hero-portrait,.hero-actions').forEach((el,i)=>motion(el,'block',i));
  document.querySelectorAll('.hero-intro p,.section-copy,.review-copy>p:not(.eyebrow),.gift-help,.gift-terms-intro,.film-copy>p:not(.small-label)').forEach((el,i)=>motion(el,'side',i));
  document.querySelectorAll('.category-card').forEach((el,i)=>motion(el,'card',i));
  document.querySelectorAll('.about-status,.approach-block,.education,.gift-format,.gift-bottom,.offer-card,.course-terms,.comfort-grid article,.cabinet-film,.first-visit,.route-gallery figure,.reviews-card,.booking-options').forEach((el,i)=>motion(el,'block',i));
  reduce.addEventListener('change',e=>{if(e.matches)for(const a of entranceAnimations)a.finish();});

  function fitTagline(){const heading=document.getElementById('brand-title'),line=document.querySelector('.brand-tagline'),span=line?.firstElementChild;if(!heading||!span)return;span.style.letterSpacing='0px';span.style.marginRight='0';const range=document.createRange();range.selectNodeContents(heading);const width=Math.min(range.getBoundingClientRect().width,heading.getBoundingClientRect().width);line.style.width=width+'px';const natural=span.getBoundingClientRect().width;const spacing=Math.max(0,(width-natural)/(Array.from(span.textContent.trim()).length-1));span.style.letterSpacing=spacing+'px';span.style.marginRight=-spacing+'px';}
  function fitAddress(){const box=document.querySelector('.hero-location'),a=box?.querySelector('a'),pin=box?.querySelector('svg');if(!a)return;a.style.fontSize='21px';const gap=parseFloat(getComputedStyle(box).gap)||10,available=box.clientWidth-(pin?.getBoundingClientRect().width||0)-gap;const range=document.createRange();range.selectNodeContents(a);const width=range.getBoundingClientRect().width;if(width>available)a.style.fontSize=(21*available/width)+'px';}
  function fitBrand(){const heading=document.getElementById('brand-title'),box=document.querySelector('.hero');if(!heading||!box)return;heading.style.fontSize='';const range=document.createRange();range.selectNodeContents(heading);const width=range.getBoundingClientRect().width,max=box.clientWidth;if(width>max){const size=parseFloat(getComputedStyle(heading).fontSize);heading.style.fontSize=Math.max(10,size*max/width-.3)+'px';}}
  function fitHero(){fitBrand();fitTagline();fitAddress();}document.fonts.ready.then(fitHero);addEventListener('resize',fitHero);
  const highlights=/(напряжённые мышцы|без спешки|массаж головы и лица|массаж головы|в спине и плечах|в спине|пояснице|шею и плечи|по ощущениям|усталость|комфортно)/i;
  function paragraph(parent,text,cls=''){const p=node('p',cls);const match=text.match(highlights);if(!match){p.textContent=text;}else{const start=match.index;p.append(document.createTextNode(text.slice(0,start)),node('strong','',match[0]),document.createTextNode(text.slice(start+match[0].length)));}parent.append(p);}
  function sourceBlocks(parent,title,blocks){if(!blocks.length)return;parent.append(node('h5','',title));for(const b of blocks)paragraph(parent,b.text,b.tag==='h3'?'detail-subheading':'');}
  let group='general',kind=null;const list=document.getElementById('service-list');
  const categories={wellness:['Общий оздоровительный массаж тела','от 1 до 2,5 часов'],relax:['Общий расслабляющий массаж тела','от 1 до 2,5 часов'],local:['Массаж отдельных зон','от 20 до 50 минут'],complex:['Комплексные программы','1 час']};
  function render(){
    if(motionObserver)for(const c of list.children)motionObserver.unobserve(c);
    list.replaceChildren();const category=group==='general'?kind:group;
    document.querySelectorAll('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));
    document.getElementById('general-directions').hidden=group!=='general'||kind!==null;
    document.getElementById('catalog-quick-kinds').hidden=group!=='general'||kind===null;
    document.getElementById('programme-results').hidden=!category;
    document.querySelectorAll('[data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(group==='general'&&b.dataset.kind===kind)));
    if(!category)return;
    document.getElementById('category-title').textContent=categories[category][0];
    document.getElementById('category-note').textContent=categories[category][1];
    const explanation=document.getElementById('direction-description'),direction=content.directions[category];
    explanation.hidden=!direction;explanation.replaceChildren();
    if(direction){explanation.dataset.direction=category;explanation.append(node('strong','',direction.lead),document.createTextNode(' '+direction.text));}
    for(const [i,s] of content.services.filter(s=>s.category===category).entries()){
      const card=node('details','service-card programme-accordion');card.name='massage-programmes';card.dataset.program=s.program;card.dataset.tone=s.category==='local'&&s.name.includes('лица')?'face':s.category;
      const summary=node('summary','programme-summary');
      const top=node('span','programme-row-top'),time=node('span','programme-row-time'),cost=node('span','programme-row-price',price.format(s.price)+' ₽');
      time.append(icon('clock'),node('span','',s.duration));top.append(time,cost);
      const title=node('strong','programme-row-title',`«${s.program}»`);
      const subtitle=node('strong','programme-row-subtitle',s.previewTitle);
      const hint=node('span','programme-row-hint'),hintOpen=node('span','hint-open','Развернуть описание и записаться'),hintClose=node('span','hint-close','Свернуть описание'),arrow=node('span','programme-row-arrow');arrow.append(icon('chevron'));hint.append(hintOpen,hintClose,arrow);
      summary.append(top,title,subtitle,hint);
      const expanded=node('div','programme-expanded');expanded.id='programme-'+s.sourceKey.replace(/[^a-z0-9-]/g,'-');summary.setAttribute('aria-controls',expanded.id);
      const coverage=node('div','service-coverage');s.previewLines.forEach((text,index)=>coverage.append(node('p',index?'service-extra':'',text)));
      const bottom=node('div','service-bottom'),book=node('button','service-book','Записаться');book.type='button';book.dataset.bookProgramme=s.program;book.dataset.bookDuration=s.duration;book.setAttribute('aria-label',`Записаться на программу «${s.program}», ${price.format(s.price)} рублей`);book.append(icon('arrow'));bottom.append(book);
      const body=node('div','service-detail-content');
      if(s.technique)sourceBlocks(body,'Техника и интенсивность',[{tag:'p',text:s.technique}]);
      sourceBlocks(body,'Что входит в сеанс',s.coverageBlocks);sourceBlocks(body,'Для кого этот формат',s.descriptionBlocks);
      if(s.approachBlocks?.length)sourceBlocks(body,'Как проходит сеанс',s.approachBlocks);
      if(s.session.length){body.append(node('h5','','В программе сеанса'));const steps=node('ol','programme-steps');s.session.forEach(text=>{const step=node('li');paragraph(step,text);steps.append(step);});body.append(steps);}
      expanded.append(coverage,bottom,body);card.append(summary,expanded);list.append(card);motion(card,'programme',i);
      card.addEventListener('toggle',()=>{
        if(!card.open)return;
        // Explicit fallback for browsers without exclusive <details name> support.
        for(const other of list.children)if(other!==card&&other.open)other.open=false;
        const rect=summary.getBoundingClientRect(),edge=document.getElementById('catalog-switcher').getBoundingClientRect().bottom+14;
        if(rect.top<edge)scrollCatalogue(card);
        if(!reduce.matches)playEntrance(expanded,[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.16,1,.3,1)'});
      });
    }
  }
  function scrollCatalogue(target){target.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'start'});}
  document.querySelectorAll('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;kind=null;render();scrollCatalogue(document.getElementById('catalog-switcher'));}));
  document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{group='general';kind=b.dataset.kind;render();document.querySelector('.catalog-quick-kinds [data-kind="'+kind+'"]').focus({preventScroll:true});scrollCatalogue(document.getElementById('programme-results'));}));
  document.querySelectorAll('[data-category]').forEach(a=>a.addEventListener('click',()=>{group=a.dataset.category;kind=null;render();}));
  document.querySelectorAll('[data-link="booking"]').forEach(a=>a.href=content.links.booking);render();

  const contacts=document.getElementById('messenger-options');for(const c of content.contacts){if(!c.url)continue;const a=node('a','messenger');a.href=c.url;const img=node('img');img.src=c.logo;img.alt='';img.width=35;img.height=35;a.append(img,node('span','',c.label),icon('arrow'));contacts.append(a);}
  const bookingDialog=document.getElementById('booking-dialog');let lastBooking;
  const choices=document.getElementById('booking-dialog-messengers');for(const c of content.contacts){const link=node('a','booking-choice');link.href=c.url;const image=node('img');image.src=c.logo;image.alt='';image.width=30;image.height=30;link.append(image,node('span','',c.label),icon('arrow'));choices.append(link);}
  document.addEventListener('click',e=>{const button=e.target.closest('[data-book-programme],[data-gift-certificate]');if(!button)return;lastBooking=button;const gift=button.hasAttribute('data-gift-certificate');document.getElementById('booking-dialog-label').textContent=gift?'ПОДАРОЧНЫЙ СЕРТИФИКАТ':'ЗАПИСЬ НА МАССАЖ';document.getElementById('booking-dialog-title').innerHTML=gift?'Оформить подарочный<br>сертификат':'Как вам удобно<br>записаться?';document.getElementById('booking-programme').textContent=gift?'На один сеанс, целый курс или выбранную сумму':`«${button.dataset.bookProgramme}» · ${button.dataset.bookDuration}`;bookingDialog.querySelector('.booking-dialog-online').hidden=gift;bookingDialog.querySelector('.booking-dialog-note').textContent=gift?'Напишите мне — помогу выбрать и оформить сертификат':'Или напишите мне в мессенджере';bookingDialog.showModal();document.body.classList.add('has-dialog');});
  bookingDialog.querySelector('.booking-dialog-close').addEventListener('click',()=>bookingDialog.close());bookingDialog.addEventListener('close',()=>{document.body.classList.remove('has-dialog');lastBooking?.focus({preventScroll:true});});bookingDialog.addEventListener('click',e=>{if(e.target!==bookingDialog)return;const r=bookingDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)bookingDialog.close();});
  const menu=document.querySelector('.menu-toggle'),menuPanel=document.getElementById('mobile-menu');function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть разделы сайта');menuPanel.hidden=true;}menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть разделы сайта':'Открыть разделы сайта');menuPanel.hidden=!open;});menuPanel.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menuPanel.hidden){closeMenu();menu.focus();}});
  const dialog=document.getElementById('photo-dialog'),media=document.getElementById('dialog-media');let lastPhoto;
  document.addEventListener('click',event=>{const button=event.target.closest('[data-photo]');if(!button)return;lastPhoto=button;media.replaceChildren();const art=button.querySelector('svg.paper-art,svg.route-art');if(art){const clone=art.cloneNode(true);clone.querySelectorAll('[id]').forEach(e=>{const old=e.id,newId='modal-'+old;e.id=newId;clone.querySelectorAll('[clip-path]').forEach(n=>{if(n.getAttribute('clip-path')===`url(#${old})`)n.setAttribute('clip-path',`url(#${newId})`);});});media.append(clone);}else{const image=node('img');image.src=button.dataset.photo;image.alt=button.dataset.caption||'';media.append(image);}document.getElementById('dialog-caption').textContent=button.dataset.caption||'';dialog.showModal();document.body.classList.add('has-dialog');});
  dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});dialog.addEventListener('close',()=>{document.body.classList.remove('has-dialog');lastPhoto?.focus({preventScroll:true});});
  let roomId='massage',roomPage=0;const rail=document.getElementById('room-gallery');function renderRoom(){const current=content.roomGroups.find(g=>g.id===roomId),pages=Math.ceil(current.photos.length/3);roomPage=(roomPage+pages)%pages;document.querySelectorAll('[data-room]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.room===roomId)));if(motionObserver)for(const f of rail.children)motionObserver.unobserve(f);rail.replaceChildren();for(const [i,p] of current.photos.slice(roomPage*3,roomPage*3+3).entries()){const figure=node('figure'),button=node('button','photo-open');button.type='button';button.dataset.photo=p.src;button.dataset.caption='';button.setAttribute('aria-label',`Открыть фотографию ${roomPage*3+i+1} из ${current.photos.length}: ${current.label}`);const image=node('img');image.src=p.src;image.alt=p.alt;image.loading='lazy';image.style.objectPosition=p.focus||'50% 50%';const expand=node('span','photo-expand');expand.append(icon('arrow'));button.append(image,expand);figure.append(button);rail.append(figure);motion(figure,'photo',i);}document.getElementById('room-page').textContent=String(roomPage+1).padStart(2,'0')+' / '+String(pages).padStart(2,'0');}
  document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>{roomId=b.dataset.room;roomPage=0;renderRoom();}));document.getElementById('room-prev').addEventListener('click',()=>{roomPage--;renderRoom();});document.getElementById('room-next').addEventListener('click',()=>{roomPage++;renderRoom();});renderRoom();
  let swipeStart;rail.addEventListener('touchstart',e=>{const t=e.changedTouches[0];swipeStart={x:t.clientX,y:t.clientY};},{passive:true});rail.addEventListener('touchend',e=>{if(!swipeStart)return;const t=e.changedTouches[0],dx=t.clientX-swipeStart.x,dy=t.clientY-swipeStart.y;swipeStart=null;if(Math.abs(dx)>60&&Math.abs(dx)>2*Math.abs(dy)){roomPage+=dx<0?1:-1;renderRoom();}},{passive:true});
  const film=document.getElementById('cabinet-video'),playButton=document.getElementById('film-play'),soundButton=document.getElementById('film-sound');function loadVideo(){const source=film.querySelector('source[data-src]');if(source){source.src=source.dataset.src;delete source.dataset.src;film.load();}}function syncFilm(){playButton.textContent=film.paused?'Смотреть видео':'Пауза';soundButton.textContent=film.muted?'Включить звук':'Выключить звук';soundButton.setAttribute('aria-pressed',String(!film.muted));}function startVideo(){loadVideo();film.play().catch(syncFilm);}playButton.addEventListener('click',()=>{if(film.paused)startVideo();else film.pause();});soundButton.addEventListener('click',()=>{loadVideo();film.muted=!film.muted;if(film.paused)startVideo();syncFilm();});['play','pause','volumechange'].forEach(e=>film.addEventListener(e,syncFilm));if('IntersectionObserver' in window){new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){if(!reduce.matches&&!navigator.connection?.saveData)startVideo();}else{film.pause();film.muted=true;syncFilm();}}},{threshold:.25}).observe(film);}document.addEventListener('visibilitychange',()=>{if(document.hidden){film.pause();film.muted=true;syncFilm();}});

  // One quiet reminder while browsing; dismissing it lasts for this visit.
  const welcome=document.getElementById('welcome-offer'),reminder=document.getElementById('welcome-reminder');
  let dismissed=false;try{dismissed=sessionStorage.getItem('maximum-welcome-dismissed')==='1';}catch{}
  let reminderWasVisible=false,reminderEntrance=[];
  function syncWelcome(){
    const visible=!dismissed&&welcome.getBoundingClientRect().bottom<=0;
    reminder.hidden=!visible;
    if(visible&&!reminderWasVisible&&!reduce.matches){
      for(const a of reminderEntrance)a.cancel();
      const timing={duration:780,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'};
      reminderEntrance=[playEntrance(reminder.querySelector('.reminder-discount'),[{transform:'translateX(-75px) scale(.9)',opacity:0},{transform:'translateX(0) scale(1)',opacity:1}],timing)];
      const ticket=reminder.querySelector('.offer-sticker-mark');if(ticket)reminderEntrance.push(playEntrance(ticket,[{transform:'translateY(8px) scale(.72)',opacity:0},{transform:'translateY(0) scale(1)',opacity:1}],{...timing,duration:600,delay:260}));
      reminder.querySelector('.reminder-discount').dataset.revealFrom='left';
      reminder.querySelectorAll('.reminder-copy>small,.reminder-copy>strong,.reminder-cta').forEach((line,i)=>{line.dataset.revealFrom='right';reminderEntrance.push(playEntrance(line,[{transform:'translateX(65px)',opacity:0},{transform:'translateX(0)',opacity:1}],{...timing,delay:100+i*90}));});
    }
    reminderWasVisible=visible;
  }
  document.getElementById('welcome-dismiss').addEventListener('click',()=>{dismissed=true;reminder.hidden=true;try{sessionStorage.setItem('maximum-welcome-dismissed','1');}catch{}});
  let reminderTouch;
  reminder.addEventListener('touchstart',e=>{const t=e.changedTouches[0];reminderTouch={x:t.clientX,y:t.clientY};},{passive:true});
  reminder.addEventListener('touchend',e=>{if(!reminderTouch)return;const t=e.changedTouches[0],dx=t.clientX-reminderTouch.x,dy=t.clientY-reminderTouch.y;reminderTouch=null;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5){document.getElementById('welcome-dismiss').click();}},{passive:true});
  if('IntersectionObserver' in window)new IntersectionObserver(syncWelcome,{threshold:0}).observe(welcome);
  addEventListener('resize',syncWelcome);syncWelcome();
  // Ordinary text links retain a visible underline even on touch screens.
  document.querySelectorAll('a[href]').forEach(a=>{if(!a.children.length)a.classList.add('text-tap');});


  // Every actual link has a visible transition marker. Keep address text fitting.
  document.querySelectorAll('a[href]').forEach((a,i)=>{
    if(a.classList.contains('skip-link'))return;
    if(!a.querySelector('use[href="#i-arrow"]')){const arrow=icon('arrow');arrow.classList.add('link-marker');a.append(arrow);a.classList.add('has-link-marker');}
    a.style.setProperty('--impulse-delay',(-i*.29%3.6)+'s');
  });
  document.fonts.ready.then(fitHero);


  // Keep cues active only on screen; rendered programme buttons are tracked too.
  if('IntersectionObserver' in window){
    const cues=new IntersectionObserver(entries=>{for(const e of entries)e.target.classList.toggle('arrow-awake',e.isIntersecting);},{rootMargin:'20px'});
    function trackCue(el){if(!el.matches?.('a[href],button,summary')||!el.querySelector('use[href="#i-arrow"],use[href="#i-chevron"]')||el.dataset.cueTracked)return;el.dataset.cueTracked='1';cues.observe(el);}
    document.querySelectorAll('a[href],button,summary').forEach(trackCue);
    const changes=new MutationObserver(records=>{for(const record of records)for(const item of record.addedNodes){if(item.nodeType!==1)continue;trackCue(item);item.querySelectorAll('a[href],button,summary').forEach(trackCue);}});
    for(const container of [list,rail])changes.observe(container,{childList:true,subtree:true});
    document.documentElement.classList.add('js-cues');
  }
  function pauseBackgroundCues(){document.documentElement.classList.toggle('page-inactive',document.hidden);}
  document.addEventListener('visibilitychange',pauseBackgroundCues);pauseBackgroundCues();
  // A small specular reflection follows the pointer inside the glass, not the text.
  if(matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce.matches){
    const glass=document.querySelector('.welcome-glass-content');let pending=false,lastPoint;
    glass.addEventListener('pointermove',e=>{lastPoint={x:e.clientX,y:e.clientY};if(pending)return;pending=true;requestAnimationFrame(()=>{const rect=glass.getBoundingClientRect();glass.style.setProperty('--light-x',(lastPoint.x-rect.left)+'px');glass.style.setProperty('--light-y',(lastPoint.y-rect.top)+'px');pending=false;});});
  }

  const progress=document.querySelector('.reading-progress');let scheduled=false;function updateProgress(){const height=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${height>0?Math.min(1,Math.max(0,scrollY/height)):0})`;scheduled=false;}addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(updateProgress);}},{passive:true});addEventListener('resize',updateProgress);updateProgress();
  if('IntersectionObserver' in window){const navObserver=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){const id=e.target.id==='catalog'?'services':e.target.id;document.querySelectorAll('.bottom-nav a').forEach(a=>{const active=a.getAttribute('href')==='#'+id;a.classList.toggle('is-active',active);if(active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-20% 0px -65% 0px'});document.querySelectorAll('#services,#catalog,#offers,#reviews,#gift,#cabinet,#address,#booking').forEach(e=>navObserver.observe(e));}
})();
