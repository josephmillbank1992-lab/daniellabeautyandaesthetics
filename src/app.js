import{courses,treatments,images,coursePrice,money}from'./data.mjs';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const params=new URLSearchParams(location.search);
const toggle=$('.menu-toggle'),nav=$('#navigation');
function closeMenu(){toggle?.setAttribute('aria-expanded','false');nav?.classList.remove('open');if(toggle)toggle.innerHTML='Menu <span aria-hidden="true">+</span>';}
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);toggle.innerHTML=open?'Close <span aria-hidden="true">−</span>':'Menu <span aria-hidden="true">+</span>';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();toggle.focus();}});
nav?.addEventListener('click',e=>{if(e.target.closest('a'))closeMenu();});
$$('[data-course-filter]').forEach(button=>button.addEventListener('click',()=>{const audience=button.dataset.courseFilter;$$('[data-course-filter]').forEach(b=>{const selected=b===button;b.classList.toggle('active',selected);b.setAttribute('aria-pressed',String(selected));});let count=0;$$('[data-course-card]').forEach(card=>{card.hidden=audience!=='all'&&card.dataset.audience!==audience;if(!card.hidden)count++;});$('#course-count').textContent=count+' course'+(count===1?'':'s')+' to explore';}));
let category=['skin','aesthetics','beauty'].includes(params.get('category'))?params.get('category'):'all';
function filterTreatments(){let count=0;const query=($('#treatment-search')?.value||'').trim().toLowerCase();$$('[data-treatment]').forEach(card=>{card.hidden=(category!=='all'&&card.dataset.category!==category)||!card.dataset.search.includes(query);if(!card.hidden)count++;});if($('#treatment-count'))$('#treatment-count').textContent=count+' treatment'+(count===1?'':'s')+' to explore';if($('#no-treatments'))$('#no-treatments').hidden=count!==0;$$('[data-treatment-filter]').forEach(b=>{const active=b.dataset.treatmentFilter===category;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});}
$$('[data-treatment-filter]').forEach(b=>b.addEventListener('click',()=>{category=b.dataset.treatmentFilter;filterTreatments();}));
$('#treatment-search')?.addEventListener('input',filterTreatments);filterTreatments();
const selected=new Set((params.get('treatments')||'').split(',').filter(id=>treatments.some(t=>t.id===id)));
function updateShortlist(){const list=$('#shortlist-items');if(list){list.replaceChildren();for(const id of selected){const treatment=treatments.find(t=>t.id===id);const item=document.createElement('li');const text=document.createElement('span');text.textContent=treatment.name;const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','Remove '+treatment.name);remove.addEventListener('click',()=>{selected.delete(id);updateShortlist();});item.append(text,remove);list.append(item);}$('#shortlist-empty').hidden=selected.size>0;$('#shortlist-enquire').href='/contact/?intent=treatment&treatments='+encodeURIComponent([...selected].join(','))+'#enquiry';}$$('[data-shortlist]').forEach(b=>{const active=selected.has(b.dataset.shortlist);b.setAttribute('aria-pressed',String(active));b.textContent=active?'✓ Added to my enquiry':'+ Add to my enquiry';});}
$$('[data-shortlist]').forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.shortlist;selected.has(id)?selected.delete(id):selected.add(id);updateShortlist();}));updateShortlist();
const dialog=$('#gallery-dialog');let galleryTrigger;
$$('[data-gallery]').forEach(b=>b.addEventListener('click',()=>{galleryTrigger=b;$('#gallery-full').src=images[b.dataset.gallery];$('#gallery-full').alt=b.dataset.galleryLabel;$('#gallery-caption').textContent=b.dataset.galleryLabel;dialog.showModal();}));
$('.dialog-close')?.addEventListener('click',()=>dialog.close());dialog?.addEventListener('click',e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});dialog?.addEventListener('close',()=>galleryTrigger?.focus());
const form=$('#enquiry');
if(form){const courseSelect=form.elements.course,optionSelect=form.elements.option;
let initialOption=params.get('option')||'training';
const queryCourse=params.get('course');
if(queryCourse&&[...courseSelect.options].some(o=>o.value===queryCourse))courseSelect.value=queryCourse;
const intent=params.get('intent');if(['training','treatment','guidance'].includes(intent))form.querySelector('input[name=intent][value='+intent+']').checked=true;
function updateCourse(){const c=courses.find(c=>c.id===courseSelect.value);const summary=$('#selection-summary');optionSelect.replaceChildren();$('#kit-field').hidden=!c;
if(c){const options=[['training','Training only — '+money(c.price)]];if(c.kitPrice)options.push(['kit',c.kit+' — '+money(c.kitPrice)]);if(c.topupPrice)options.push(['topup','Eligible previous Classic student top-up kit — '+money(c.topupPrice)]);for(const[value,text]of options){const o=document.createElement('option');o.value=value;o.textContent=text;optionSelect.append(o);}if([...optionSelect.options].some(o=>o.value===initialOption))optionSelect.value=initialOption;initialOption='training';summary.hidden=false;summary.replaceChildren();const name=document.createElement('strong');name.textContent=c.name;const cost=document.createElement('p');cost.className='price';cost.textContent=money(coursePrice(c.id,optionSelect.value));const entry=document.createElement('p');entry.textContent=c.entry;summary.append(name,cost,entry);
}else{summary.hidden=true;}
}
function updatePrice(){const c=courses.find(c=>c.id===courseSelect.value);if(c)$('#selection-summary .price').textContent=money(coursePrice(c.id,optionSelect.value));}
function updateIntent(){const type=form.querySelector('input[name=intent]:checked').value;const training=type==='training';$('[data-training-fields]').hidden=!training;$('[data-treatment-fields]').hidden=type!=='treatment';form.elements.experience.required=training;form.elements.experience.disabled=!training;}
courseSelect.addEventListener('change',()=>{updateCourse();$('#enquiry-result').hidden=true;});optionSelect.addEventListener('change',updatePrice);form.querySelectorAll('input[name=intent]').forEach(r=>r.addEventListener('change',updateIntent));
const treatmentNames=[...selected].map(id=>treatments.find(t=>t.id===id).name);$('#selected-treatments').textContent=treatmentNames.length?'I’d like to discuss: '+treatmentNames.join(', '):'Tell Daniella what you’d like to explore in the message below.';
updateCourse();updateIntent();
form.addEventListener('input',()=>{$('#enquiry-result').hidden=true;});
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form),type=data.get('intent');const c=courses.find(c=>c.id===data.get('course'));const lines=['Hi Daniella, I’d like to enquire about '+(type==='training'?'training':type==='treatment'?'a treatment':'my options')+'.','Name: '+data.get('name'),'Contact: '+data.get('contact')];if(type==='training'){lines.push('Course: '+(c?.name||courseSelect.selectedOptions[0].textContent));if(c){lines.push('Option: '+optionSelect.selectedOptions[0].textContent,'Course price: '+money(coursePrice(c.id,data.get('option'))));}lines.push('Experience: '+data.get('experience'),'Payment plan interest: '+data.get('plan'));}if(type==='treatment'&&treatmentNames.length)lines.push('Treatments I’d like to discuss: '+treatmentNames.join(', '));if(data.get('dates'))lines.push('Preferred availability: '+data.get('dates'));if(data.get('message'))lines.push('My goals / questions: '+data.get('message'));lines.push('Please let me know the next steps. I understand this is an enquiry, not a confirmed booking.');$('#enquiry-message').value=lines.join('\n');$('#enquiry-result').hidden=false;$('#copy-status').textContent='Your message has not been sent yet.';$('#enquiry-message').focus();});
$('#copy-message').addEventListener('click',async()=>{const field=$('#enquiry-message');try{await navigator.clipboard.writeText(field.value);$('#copy-status').textContent='Copied. Open Instagram and paste your message to Daniella.';}catch{field.focus();field.select();$('#copy-status').textContent='Select and copy the message above, then send it to Daniella on Instagram.';}});
}


// Motion enhances the story; all content stays readable without it.
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let motionPaused=false;
const motionButtons=$$('.motion-toggle');
const heroSlides=$$('[data-hero-slide]');
let heroSlide=0,heroTimer,heroInView=true,heroEngaged=false;
const hero=$('.chapter-hero');
function stopHero(){if(heroTimer){clearTimeout(heroTimer);heroTimer=undefined;}}
function canAutoplay(){return heroSlides.length>1&&!motionPaused&&!reducedMotion.matches&&!document.hidden&&heroInView&&!heroEngaged;}
function queueHero(){stopHero();if(canAutoplay())heroTimer=setTimeout(()=>{showHero((heroSlide+1)%heroSlides.length);},6500);}
function showHero(index){heroSlide=index;heroSlides.forEach((slide,i)=>{const active=i===index;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));});$$('[data-hero-select]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));queueHero();}
function updateMotion(){const stopped=motionPaused||reducedMotion.matches;document.body.classList.toggle('motion-paused',stopped);motionButtons.forEach(b=>{b.setAttribute('aria-pressed',String(stopped));b.disabled=reducedMotion.matches;b.setAttribute('aria-label',reducedMotion.matches?'Reduced motion preference is active':stopped?'Resume decorative motion':'Pause decorative motion');b.innerHTML=(reducedMotion.matches?'Reduced motion':stopped?'Resume motion':'Pause motion')+' <span aria-hidden="true">'+(stopped?'▷':'Ⅱ')+'</span>';});if(stopped){$$('.reveal-pending').forEach(el=>el.classList.remove('reveal-pending'));stopHero();}else queueHero();}
motionButtons.forEach(b=>b.addEventListener('click',()=>{motionPaused=!(motionPaused||reducedMotion.matches);if(reducedMotion.matches)motionPaused=true;updateMotion();}));
reducedMotion.addEventListener('change',updateMotion);
$$('[data-hero-select]').forEach(b=>b.addEventListener('click',()=>showHero(Number(b.dataset.heroSelect))));
if(hero){hero.addEventListener('mouseenter',()=>{heroEngaged=true;stopHero();});hero.addEventListener('mouseleave',()=>{heroEngaged=false;queueHero();});hero.addEventListener('focusin',()=>{heroEngaged=true;stopHero();});hero.addEventListener('focusout',e=>{if(!hero.contains(e.relatedTarget)){heroEngaged=false;queueHero();}});if('IntersectionObserver'in window)new IntersectionObserver(entries=>{heroInView=entries[0].isIntersecting;queueHero();},{threshold:.1}).observe(hero);}
document.addEventListener('visibilitychange',queueHero);
function setupTabs(selector,onChange){const tabs=$$(selector);function select(tab,focus=false){tabs.forEach(t=>{const selected=t===tab;t.setAttribute('aria-selected',String(selected));t.tabIndex=selected?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!selected;});if(focus)tab.focus();onChange?.(tab);}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%tabs.length;else if(e.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;if(next!==undefined){e.preventDefault();select(tabs[next],true);}});});}
setupTabs('[data-chapter]',tab=>{hero.dataset.chapter=tab.dataset.chapter;if(tab.dataset.chapter==='clinic')showHero(0);else showHero(1);});
setupTabs('[data-path-step]');
$$('[data-rail-direction]').forEach(b=>b.addEventListener('click',()=>{const rail=$('.work-rail');rail.scrollBy({left:Number(b.dataset.railDirection)*(rail.querySelector('.work-frame').getBoundingClientRect().width+24),behavior:motionPaused||reducedMotion.matches?'instant':'smooth'});}));
const revealCandidates=$$('.section-heading,.story-heading,.story-body,.credential-line>div,.pathway-art,.pathway-content,.belief-intro,.belief-cards article,.clinic-chapter-copy,.personal-quote .wrap,.review-layout>div,.next-chapter .wrap>div,.course-card,.treatment,.course-booking,.steps article');
if('IntersectionObserver'in window&&!reducedMotion.matches){const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('reveal-pending');revealObserver.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});revealCandidates.forEach((el,i)=>{if(el.getBoundingClientRect().top>window.innerHeight*.85){el.classList.add('reveal-item','reveal-pending');el.style.setProperty('--reveal-delay',((i%3)*65)+'ms');revealObserver.observe(el);}});document.addEventListener('focusin',e=>e.target.closest('.reveal-pending')?.classList.remove('reveal-pending'));}
document.body.classList.add('motion-ready');
let scrollFrame=false;
function updateProgress(){const available=document.documentElement.scrollHeight-window.innerHeight;document.documentElement.style.setProperty('--reading-progress',available>0?Math.min(1,window.scrollY/available):0);scrollFrame=false;}
window.addEventListener('scroll',()=>{if(!scrollFrame){scrollFrame=true;requestAnimationFrame(updateProgress);}},{passive:true});
window.addEventListener('resize',updateProgress);updateProgress();
const visual=$('.chapter-visual');
if(visual&&window.matchMedia('(hover:hover) and (pointer:fine)').matches){visual.addEventListener('pointermove',e=>{if(motionPaused||reducedMotion.matches)return;const rect=visual.getBoundingClientRect();visual.style.setProperty('--pointer-x',((e.clientX-rect.left)/rect.width-.5)*8+'px');visual.style.setProperty('--pointer-y',((e.clientY-rect.top)/rect.height-.5)*8+'px');});visual.addEventListener('pointerleave',()=>{visual.style.setProperty('--pointer-x','0px');visual.style.setProperty('--pointer-y','0px');});}
updateMotion();
