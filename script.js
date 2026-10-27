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

// Hairline under the nav once the page has scrolled.
(function navShadow(){
  var shell = document.getElementById('navShell');
  if(!shell) return;
  var update = function(){ shell.classList.toggle('scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', update, {passive:true});
  update();
})();

// Example loops: muted, decorative, optional. Play only while visible,
// never under reduced motion unless the visitor presses Play, and always
// with a real keyboard-operable control.
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
  function label(btn, v){
    var playing = !v.paused;
    btn.textContent = playing ? 'Pause' : 'Play';
    btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
    btn.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + ' the example loop');
  }

  Array.prototype.forEach.call(vids, function(v){
    var win = v.closest('.shot-win') || v.parentNode;
    var btn = win.querySelector('[data-ctl]');
    v.muted = true;
    if(!still && io) io.observe(v);
    if(!still && !io) safePlay(v);
    if(btn){
      btn.addEventListener('click', function(){
        if(v.paused){ v.dataset.user = 'playing'; safePlay(v); }
        else { v.dataset.user = 'paused'; v.pause(); }
      });
      v.addEventListener('play', function(){ label(btn, v); });
      v.addEventListener('pause', function(){ label(btn, v); });
      label(btn, v);
    }
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
