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

// Play the hero video in place: the poster stage becomes the player.
function playHero(btn){
  var stage = document.querySelector('.hero-stage');
  if(!stage) return;
  var frame = document.createElement('iframe');
  frame.className = 'facade-frame';
  frame.src = 'https://www.youtube.com/embed/' + stage.dataset.yt + '?rel=0&autoplay=1';
  frame.title = stage.dataset.title || 'Video';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen = true;
  stage.innerHTML = '';
  stage.appendChild(frame);
  frame.focus();
}

// Play a carousel card in place. Swaps the card's contents rather than the
// card itself, so the carousel keeps its node references, and halts the
// auto-advance so the slide can't scroll away mid-watch.
function playCard(btn){
  var card = btn.closest('.carousel-card');
  if(!card) return;
  var root = card.closest('.carousel');
  if(root) root.dispatchEvent(new CustomEvent('carousel:stop'));

  var frame = document.createElement('iframe');
  frame.className = 'facade-frame';
  frame.src = 'https://www.youtube.com/embed/' + card.dataset.yt + '?rel=0&autoplay=1';
  frame.title = card.dataset.title || 'Video';
  frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  frame.allowFullscreen = true;

  card.innerHTML = '';
  card.classList.add('is-playing');
  card.appendChild(frame);
  frame.focus();
}

// Stadium-card carousel: scroll-snap for the motion, buttons and dots for
// control, auto-advance with a pause toggle.
(function carousel(){
  var root = document.querySelector('.carousel');
  if(!root) return;
  var track = root.querySelector('.carousel-track');
  var cards = Array.prototype.slice.call(root.querySelectorAll('.carousel-card'));
  var dots = Array.prototype.slice.call(root.querySelectorAll('.carousel-dot'));
  var pauseBtn = root.querySelector('.carousel-pause');
  if(!track || !cards.length) return;

  var index = 0, timer = null, playing = true;

  // Only the centred card shows its chip, title and play control — a
  // half-scrolled card would have its pill sliced by the track edge.
  function mark(){
    cards.forEach(function(c, n){ c.classList.toggle('is-active', n === index); });
    dots.forEach(function(d, n){ d.classList.toggle('active', n === index); });
  }

  function goTo(i){
    index = (i + cards.length) % cards.length;
    var card = cards[index];
    // scrollLeft rather than scrollIntoView so the page itself never jumps
    track.scrollTo({left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2, behavior: 'smooth'});
    mark();
  }

  function start(){ stop(); if(playing) timer = setInterval(function(){goTo(index + 1)}, 5000); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  // A card that starts playing halts auto-advance for good, so the slide
  // cannot scroll out from under someone watching it.
  root.addEventListener('carousel:stop', function(){ playing = false; stop(); if(pauseBtn) pauseBtn.textContent = '▶'; });

  root.querySelector('.carousel-prev').addEventListener('click', function(){goTo(index - 1); start();});
  root.querySelector('.carousel-next').addEventListener('click', function(){goTo(index + 1); start();});
  dots.forEach(function(d, n){ d.addEventListener('click', function(){goTo(n); start();}); });

  if(pauseBtn){
    pauseBtn.addEventListener('click', function(){
      playing = !playing;
      pauseBtn.textContent = playing ? '❚❚' : '▶';
      pauseBtn.setAttribute('aria-label', playing ? 'Pause carousel' : 'Play carousel');
      if(playing) start(); else stop();
    });
  }

  // Respect a reduced-motion preference: no auto-advance at all.
  if(window.matchMedia('(prefers-reduced-motion:reduce)').matches){
    playing = false;
    if(pauseBtn) pauseBtn.textContent = '▶';
  }

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  // Keep the dots honest when someone swipes the track directly.
  var settle;
  track.addEventListener('scroll', function(){
    clearTimeout(settle);
    settle = setTimeout(function(){
      var mid = track.scrollLeft + track.clientWidth / 2;
      var nearest = 0, best = Infinity;
      cards.forEach(function(c, n){
        var d = Math.abs(c.offsetLeft + c.clientWidth / 2 - mid);
        if(d < best){ best = d; nearest = n; }
      });
      index = nearest;
      mark();
    }, 120);
  });

  goTo(0);
  start();
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
