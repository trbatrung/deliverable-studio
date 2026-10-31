/* ============================================================
   Deliverable, shared behaviour. Every page loads this; each
   block no-ops when its target is absent.
   ============================================================ */

var SUPABASE_URL = 'https://okduntsweecbxlaaywlx.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_0F8E-a9VDxJLgCyhxC9PpA_QRxZWBzt';

function toggleMenu(){
  var menu = document.getElementById('mobileMenu');
  var btn = document.querySelector('.hamburger');
  if(!menu) return;
  var open = menu.classList.toggle('open');
  if(btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

// Close the mobile menu when one of its links is followed (most jump within the homepage).
(function closeMenuOnLink(){
  var menu = document.getElementById('mobileMenu');
  if(!menu) return;
  menu.addEventListener('click', function(e){
    var a = e.target.closest('a');
    if(!a || !menu.classList.contains('open')) return;
    toggleMenu();
    // Closing the menu shifts the layout and cancels a native smooth scroll,
    // so same-page jumps scroll explicitly.
    var url = new URL(a.href);
    var target = url.pathname === location.pathname && url.hash ? document.querySelector(url.hash) : null;
    if(!target) return;
    e.preventDefault();
    history.pushState(null, '', url.hash);
    var still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    target.scrollIntoView({behavior: still ? 'auto' : 'smooth'});
  });
})();

// Hairline under the nav once the page has scrolled.
(function navShadow(){
  var shell = document.getElementById('navShell');
  if(!shell) return;
  var update = function(){ shell.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

// Phones get the portrait 4:5 version of a video where one exists
// (data-portrait="media/name-45"); everything else, and no-JS, keeps 16:9.
(function portraitVideos(){
  if(!window.matchMedia('(max-width:599px)').matches) return;
  var vids = document.querySelectorAll('video[data-portrait]');
  Array.prototype.forEach.call(vids, function(v){
    var base = v.getAttribute('data-portrait');
    Array.prototype.forEach.call(v.querySelectorAll('source'), function(src){
      src.src = base + (src.type === 'video/webm' ? '.webm' : '.mp4');
    });
    v.poster = base + '.webp';
    v.parentNode.classList.add('portrait');
    v.load();
  });
})();

// Example loops: muted, decorative, optional. Play only while visible and
// never on their own under reduced motion; the video itself is the
// keyboard-operable pause/play control.
(function loops(){
  var vids = document.querySelectorAll('video.loop');
  if(!vids.length) return;
  var still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      var v = en.target;
      if(v.dataset.user === 'paused') return;
      if(en.isIntersecting) safePlay(v); else v.pause();
    });
  }, {threshold:0.35}) : null;

  function safePlay(v){
    var p = v.play();
    if(p && p.catch) p.catch(function(){});
  }
  function toggle(v){
    if(v.paused){ v.dataset.user = 'playing'; safePlay(v); }
    else { v.dataset.user = 'paused'; v.pause(); }
  }

  // No visible control: the loop plays while in view. Clicking or tapping it,
  // or Enter/Space when focused, pauses and resumes it (WCAG 2.2.2).
  Array.prototype.forEach.call(vids, function(v){
    v.muted = true;
    v.tabIndex = 0;
    v.setAttribute('aria-label', (v.getAttribute('aria-label') || 'Example loop') + '. Select to pause or play.');
    if(!still && io) io.observe(v);
    if(!still && !io) safePlay(v);
    v.addEventListener('click', function(){ toggle(v); });
    v.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(v); }
    });
  });
})();

// Full pieces: a quiet Play button over the poster instead of the browser's
// dark control bar; native controls take over once the piece is playing.
// Without JavaScript the video keeps its native controls.
(function fullPieces(){
  var vids = document.querySelectorAll('video[data-full]');
  Array.prototype.forEach.call(vids, function(v){
    var btn = v.parentNode.querySelector('.play-full');
    if(!btn) return;
    v.controls = false;
    btn.hidden = false;
    btn.addEventListener('click', function(){
      v.controls = true;
      btn.hidden = true;
      var p = v.play();
      if(p && p.catch) p.catch(function(){});
      v.focus();
    });
  });
})();

(function sceneLists(){
  var pieces = document.querySelectorAll('[data-piece]');
  Array.prototype.forEach.call(pieces, function(piece){
    var v = piece.querySelector('video');
    var links = piece.querySelectorAll('[data-seek]');
    if(!v || !links.length) return;
    var starts = Array.prototype.map.call(links, function(a){ return parseFloat(a.getAttribute('data-seek')); });
    Array.prototype.forEach.call(links, function(a, i){
      a.addEventListener('click', function(e){
        e.preventDefault();
        var btn = v.parentNode.querySelector('.play-full');
        if(btn) btn.hidden = true;
        v.controls = true;
        v.currentTime = starts[i];
        // On phones the list sits below the video: bring the video back into view.
        var r = v.getBoundingClientRect();
        if(r.top < 0 || r.bottom > window.innerHeight){
          var still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
          v.scrollIntoView({behavior: still ? 'auto' : 'smooth', block: 'center'});
        }
        var p = v.play(); if(p && p.catch) p.catch(function(){});
      });
    });
    v.addEventListener('timeupdate', function(){
      var cur = -1;
      for(var i = 0; i < starts.length; i++){ if(v.currentTime >= starts[i]) cur = i; }
      Array.prototype.forEach.call(links, function(a, i){ a.classList.toggle('on', i === cur && (v.currentTime > 0)); });
    });
  });
})();

// Deck: one slide image at a time, stepped by the arrows, the arrow keys or the
// slide list. Without JavaScript the first slide and the PDF link remain.
(function decks(){
  var decks = document.querySelectorAll('[data-deck]');
  Array.prototype.forEach.call(decks, function(deck){
    var img = deck.querySelector('img[data-base]');
    var links = deck.querySelectorAll('[data-slide]');
    var steps = deck.querySelectorAll('[data-step]');
    var n = deck.querySelector('.deck-n');
    if(!img || !links.length) return;
    var base = img.getAttribute('data-base'), total = links.length, cur = 0;
    var pad = function(i){ return (i < 9 ? '0' : '') + (i + 1); };
    var label = function(i){ return 'Slide ' + (i + 1) + ' of ' + total + ': ' + links[i].querySelector('.d').textContent + '.'; };
    function show(i){
      cur = Math.max(0, Math.min(total - 1, i));
      img.src = base + pad(cur) + '.webp';
      img.alt = label(cur);
      n.textContent = (cur + 1) + ' / ' + total;
      steps[0].disabled = cur === 0;
      steps[1].disabled = cur === total - 1;
      Array.prototype.forEach.call(links, function(a, j){ a.classList.toggle('on', j === cur); });
      if(cur < total - 1){ var next = new Image(); next.src = base + pad(cur + 1) + '.webp'; }
    }
    Array.prototype.forEach.call(steps, function(b){
      b.hidden = false;
      b.addEventListener('click', function(){ show(cur + parseInt(b.getAttribute('data-step'), 10)); });
    });
    deck.querySelector('figure').addEventListener('keydown', function(e){
      if(e.key === 'ArrowRight'){ e.preventDefault(); show(cur + 1); }
      if(e.key === 'ArrowLeft'){ e.preventDefault(); show(cur - 1); }
    });
    Array.prototype.forEach.call(links, function(a, i){
      a.addEventListener('click', function(e){
        e.preventDefault();
        show(i);
        var r = img.getBoundingClientRect();
        if(r.top < 0 || r.bottom > window.innerHeight){
          var still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
          img.scrollIntoView({behavior: still ? 'auto' : 'smooth', block: 'center'});
        }
      });
    });
    show(0);
  });
})();

async function handleContactSubmit(e){
  e.preventDefault();
  var form = e.target;
  var btn = form.querySelector('.form-submit');
  var success = document.getElementById('formSuccess');
  var error = document.getElementById('formError');
  var original = btn.textContent;

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
    error.textContent = 'Something went wrong. Email me directly at hello@deliverable.studio';
    error.style.display = 'block';
  }

  btn.disabled = false;
  btn.textContent = original;
}
