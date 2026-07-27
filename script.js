/* ============================================================
   Deliverable — shared behaviour
   Every page loads this. Safe to run on pages that lack any
   given element; each block no-ops if its target is absent.
   ============================================================ */

var SUPABASE_URL = 'https://okduntsweecbxlaaywlx.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_0F8E-a9VDxJLgCyhxC9PpA_QRxZWBzt';

function toggleMenu(){
  var menu = document.getElementById('mobileMenu');
  if(menu) menu.classList.toggle('open');
}

function switchTab(id, el){
  document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active')});
  document.querySelectorAll('.tab-content').forEach(function(t){t.classList.remove('active')});
  var target = document.getElementById('tab-' + id);
  if(target) target.classList.add('active');
  el.classList.add('active');
}

// Swap a poster facade for the real YouTube player. Keeps the ~1MB player
// off the initial page load until someone actually wants to watch.
function playVideo(btn){
  var frame = document.createElement('iframe');
  frame.className = 'facade-frame';
  frame.src = 'https://www.youtube.com/embed/' + btn.dataset.yt + '?rel=0&autoplay=1';
  frame.title = btn.dataset.title || 'Video';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen = true;

  var shell = document.createElement('div');
  shell.className = 'video-facade is-playing';
  shell.appendChild(frame);
  btn.replaceWith(shell);
  frame.focus();
}

// Cursor-tracked spotlight in the hero. Pointer-fine devices only; the glow
// element is pointer-events:none so it never blocks the CTAs.
(function heroSpotlight(){
  var hero = document.querySelector('.hero');
  if(!hero || !window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  var pending = false, mx = 0, my = 0;
  hero.addEventListener('mousemove', function(e){
    var r = hero.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    if(pending) return;
    pending = true;
    requestAnimationFrame(function(){
      hero.style.setProperty('--mx', mx + 'px');
      hero.style.setProperty('--my', my + 'px');
      pending = false;
    });
  });
})();

// Staggered hero entrance, then reveal each band as it scrolls into view.
(function revealOnScroll(){
  var hero = document.querySelector('.hero');
  if(hero){
    var showHero = function(){hero.classList.add('in')};
    requestAnimationFrame(showHero);
    // rAF never fires while a tab is backgrounded, which would leave the hero
    // stuck at opacity 0. The timer guarantees the content appears either way.
    setTimeout(showHero, 400);
  }

  var els = document.querySelectorAll('.section,.cta-section,.trust-bar,.work-section,.page-header');
  var showAll = function(){
    Array.prototype.forEach.call(els, function(el){el.classList.add('in')});
  };
  if(!('IntersectionObserver' in window)){ showAll(); return; }

  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return;
      en.target.classList.add('in');
      io.unobserve(en.target);
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:0.05});
  Array.prototype.forEach.call(els, function(el){io.observe(el)});

  // Failsafe for throttled tabs where the observer is never scheduled.
  setTimeout(showAll, 3000);
})();

async function handleContactSubmit(e){
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('.form-submit');
  var success = document.getElementById('formSuccess');
  var error = document.getElementById('formError');

  btn.disabled = true;
  btn.textContent = 'Sending...';
  success.style.display = 'none';
  error.style.display = 'none';

  var data = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    company: form.company.value.trim() || null,
    message: form.message.value.trim()
  };

  try{
    var res = await fetch(SUPABASE_URL + '/rest/v1/Leads', {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(data)
    });
    if(res.ok){
      form.reset();
      success.style.display = 'block';
    } else {
      throw new Error('failed');
    }
  } catch(err){
    error.textContent = 'Something went wrong. Email us directly at hello@deliverable.studio';
    error.style.display = 'block';
  }

  btn.disabled = false;
  btn.textContent = 'Send message';
}
