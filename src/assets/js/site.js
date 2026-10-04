// Site behaviour for every page. Each block runs only if its elements exist.
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var menuToggle = document.getElementById('menuToggle');
  var menuClose = document.getElementById('menuClose');
  var mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    mobileMenu.style.opacity = open ? '1' : '0';
    mobileMenu.style.pointerEvents = open ? 'auto' : 'none';
    mobileMenu.inert = !open;
    menuToggle.setAttribute('aria-expanded', String(open));
    (open ? menuClose : menuToggle).focus();
  }
  if (menuToggle && menuClose && mobileMenu) {
    menuToggle.setAttribute('aria-controls', 'mobileMenu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', function () { setMenu(true); });
    menuClose.addEventListener('click', function () { setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') setMenu(false);
    });
  }

  // Animated grid cells
  var gridContainer = document.getElementById('gridCells');
  if (gridContainer) {
    // About 60px cells (the .grid-bg size), so cells stay square however tall the section is.
    var cols = Math.max(1, Math.round(gridContainer.offsetWidth / 60));
    var rows = Math.max(1, Math.round(gridContainer.offsetHeight / 60));
    var cells = [];
    gridContainer.style.setProperty('--cols', cols);
    gridContainer.style.setProperty('--rows', rows);
    for (var i = 0; i < cols * rows; i++) {
      var cell = document.createElement('div');
      cell.className = 'grid-cell';
      gridContainer.appendChild(cell);
      cells.push(cell);
    }
    var lightRandomCell = function () { cells[Math.floor(Math.random() * cells.length)].classList.add('lit'); };
    if (!reduceMotion) setInterval(function () {
      cells.forEach(function (c) { if (c.classList.contains('lit') && Math.random() < 0.3) c.classList.remove('lit'); });
      for (var n = 3 + Math.floor(Math.random() * 5); n > 0; n--) lightRandomCell();
    }, 400);
    for (var k = 0; k < 12; k++) lightRandomCell();
  }

  // Network visualization (home hero)
  var vizSvg = document.getElementById('heroViz');
  if (vizSvg) {
    var ns = 'http://www.w3.org/2000/svg';
    var nodes = [
      {x:70,y:50}, {x:200,y:30}, {x:330,y:65},
      {x:50,y:160}, {x:180,y:140}, {x:310,y:175},
      {x:90,y:270}, {x:220,y:255}, {x:350,y:285},
      {x:60,y:370}, {x:200,y:380}, {x:340,y:395},
      {x:200,y:470}
    ];
    var edges = [
      [0,1],[1,2],[0,3],[1,4],[2,5],[3,4],[4,5],
      [3,6],[4,7],[5,8],[6,7],[7,8],
      [6,9],[7,10],[8,11],[9,10],[10,11],[10,12],[9,12]
    ];
    var optimalPath = [[0,1],[1,4],[4,7],[7,10],[10,12]];
    var optimalNodes = [0,1,4,7,10,12];
    var drawEdge = function (e, cls) {
      var line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', nodes[e[0]].x);
      line.setAttribute('y1', nodes[e[0]].y);
      line.setAttribute('x2', nodes[e[1]].x);
      line.setAttribute('y2', nodes[e[1]].y);
      line.setAttribute('class', cls);
      vizSvg.appendChild(line);
    };
    edges.forEach(function (e) { drawEdge(e, 'viz-edge'); });
    optimalPath.forEach(function (e) { drawEdge(e, 'viz-edge optimal'); });
    nodes.forEach(function (n, i) {
      var active = optimalNodes.indexOf(i) !== -1;
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('cx', n.x);
      circle.setAttribute('cy', n.y);
      circle.setAttribute('r', active ? 7 : 5);
      circle.setAttribute('class', 'viz-node' + (active ? ' active' : ''));
      vizSvg.appendChild(circle);
    });

    var traveler = document.createElementNS(ns, 'circle');
    traveler.setAttribute('r', 4);
    traveler.setAttribute('class', 'viz-traveler');
    traveler.setAttribute('cx', nodes[0].x);
    traveler.setAttribute('cy', nodes[0].y);
    vizSvg.appendChild(traveler);
    var segIndex = 0, segProgress = 0;
    function animateTraveler() {
      var e = optimalPath[segIndex], a = nodes[e[0]], b = nodes[e[1]];
      traveler.setAttribute('cx', a.x + (b.x - a.x) * segProgress);
      traveler.setAttribute('cy', a.y + (b.y - a.y) * segProgress);
      segProgress += 0.006;
      if (segProgress >= 1) { segProgress = 0; segIndex = (segIndex + 1) % optimalPath.length; }
      requestAnimationFrame(animateTraveler);
    }
    if (!reduceMotion) animateTraveler();

    if (!reduceMotion) setInterval(function () {
      var activeCircles = vizSvg.querySelectorAll('.viz-node.active');
      var pick = activeCircles[Math.floor(Math.random() * activeCircles.length)];
      pick.setAttribute('r', 9);
      setTimeout(function () { pick.setAttribute('r', 7); }, 600);
    }, 1500);
  }

  // Services methods carousel: sidebar links and prev/next buttons slide the track (CSS scroll-snap);
  // the slide in view drives the sidebar highlight and the "n / total" counter.
  var track = document.getElementById('methodTrack');
  var controls = document.getElementById('methodControls');
  if (track && controls) {
    var slides = track.children;
    var sidebarLinks = document.querySelectorAll('aside nav a');
    var counter = controls.querySelector('.method-count');
    var current = -1, target = null, targetTimer;
    var setLink = function (link, active) {
      link.classList.toggle('text-slate-500', !active);
      link.classList.toggle('bg-primary/10', active);
      link.classList.toggle('text-primary', active);
      var span = link.querySelector('.text-sm');
      if (span) { span.classList.toggle('font-medium', !active); span.classList.toggle('font-bold', active); }
      if (active) link.setAttribute('aria-current', 'true'); else link.removeAttribute('aria-current');
    };
    var setActive = function (i) {
      if (i === current) return;
      current = i;
      counter.textContent = (i + 1) + ' / ' + slides.length;
      sidebarLinks.forEach(function (link) { setLink(link, link.getAttribute('href') === '#' + slides[i].id); });
    };
    var slideInView = function () {
      var step = slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : 1;
      return Math.min(slides.length - 1, Math.max(0, Math.round(track.scrollLeft / step)));
    };
    var show = function (i) {
      i = (i + slides.length) % slides.length;
      // While the track glides to the target, ignore the slides it passes on the way.
      target = i;
      clearTimeout(targetTimer);
      targetTimer = setTimeout(function () { target = null; }, 1000);
      track.scrollTo({ left: slides[i].offsetLeft, behavior: reduceMotion ? 'auto' : 'smooth' });
      setActive(i);
      // Bring the controls back into view if the reader had scrolled past them (80px fixed nav).
      var top = controls.getBoundingClientRect().top;
      if (top < 80) window.scrollBy({ top: top - 112, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var ticking = false;
    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        var i = slideInView();
        if (target !== null) { if (i !== target) return; target = null; }
        setActive(i);
      });
    });
    sidebarLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        for (var i = 0; i < slides.length; i++) {
          if ('#' + slides[i].id === link.getAttribute('href')) { e.preventDefault(); show(i); return; }
        }
      });
    });
    controls.querySelector('.method-prev').addEventListener('click', function () { show(current - 1); });
    controls.querySelector('.method-next').addEventListener('click', function () { show(current + 1); });
    controls.hidden = false;
    setActive(slideInView());
  }

  // Contact form: post JSON to Web3Forms, show inline status.
  // Messages come from data-msg-* attributes on the form, so this stays language-neutral.
  // Without JS the form falls back to a normal POST to its action URL.
  var contactForm = document.getElementById('contactForm');
  var formStatus = document.getElementById('formStatus');
  if (contactForm && formStatus) {
    var msg = contactForm.dataset;
    var showStatus = function (ok, text) {
      formStatus.className = ok
        ? 'mt-4 p-4 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm'
        : 'mt-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm';
      formStatus.textContent = text;
    };
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = msg.msgSending;
      formStatus.className = 'hidden';
      var payload = {};
      new FormData(contactForm).forEach(function (value, key) { payload[key] = value; });
      fetch(contactForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (response) { return response.json(); })
        .then(function (result) {
          if (result.success) { showStatus(true, msg.msgSuccess); contactForm.reset(); }
          else showStatus(false, msg.msgError);
        })
        .catch(function () { showStatus(false, msg.msgNetwork); })
        .then(function () { submitBtn.disabled = false; submitBtn.innerHTML = originalHTML; });
    });
  }
})();
