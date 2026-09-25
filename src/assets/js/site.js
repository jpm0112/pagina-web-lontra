// Site behaviour for every page. Each block runs only if its elements exist.
(function () {
  'use strict';

  // Mobile menu
  var menuToggle = document.getElementById('menuToggle');
  var menuClose = document.getElementById('menuClose');
  var mobileMenu = document.getElementById('mobileMenu');
  function setMenu(open) {
    mobileMenu.style.opacity = open ? '1' : '0';
    mobileMenu.style.pointerEvents = open ? 'auto' : 'none';
    menuToggle.setAttribute('aria-expanded', String(open));
  }
  if (menuToggle && menuClose && mobileMenu) {
    menuToggle.setAttribute('aria-controls', 'mobileMenu');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', function () { setMenu(true); });
    menuClose.addEventListener('click', function () { setMenu(false); });
  }

  // Mouse spotlight (home)
  var spotlight = document.getElementById('spotlight');
  if (spotlight) {
    document.addEventListener('mousemove', function (e) {
      spotlight.style.setProperty('--mx', e.clientX + 'px');
      spotlight.style.setProperty('--my', e.clientY + 'px');
    });
  }

  // Mouse trail dots
  var lastTrailTime = 0;
  document.addEventListener('mousemove', function (e) {
    var now = Date.now();
    if (now - lastTrailTime < 60) return;
    lastTrailTime = now;
    var dot = document.createElement('div');
    dot.className = 'trail-dot';
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    document.body.appendChild(dot);
    setTimeout(function () { dot.remove(); }, 1000);
  });

  // Animated grid cells
  var gridContainer = document.getElementById('gridCells');
  if (gridContainer) {
    var cols = 22, rows = 14, cells = [];
    gridContainer.style.setProperty('--cols', cols);
    gridContainer.style.setProperty('--rows', rows);
    for (var i = 0; i < cols * rows; i++) {
      var cell = document.createElement('div');
      cell.className = 'grid-cell';
      gridContainer.appendChild(cell);
      cells.push(cell);
    }
    var lightRandomCell = function () { cells[Math.floor(Math.random() * cells.length)].classList.add('lit'); };
    setInterval(function () {
      cells.forEach(function (c) { if (c.classList.contains('lit') && Math.random() < 0.3) c.classList.remove('lit'); });
      for (var n = 3 + Math.floor(Math.random() * 5); n > 0; n--) lightRandomCell();
    }, 400);
    for (var k = 0; k < 12; k++) lightRandomCell();
  }

  // Data streams on expertise cards (home)
  document.querySelectorAll('[data-stream]').forEach(function (streamBg) {
    var numCols = 12;
    for (var c = 0; c < numCols; c++) {
      var streamCol = document.createElement('div');
      streamCol.className = 'data-stream-col';
      streamCol.style.left = (c * (100 / numCols)) + '%';
      streamCol.style.setProperty('--stream-dur', (3 + Math.random() * 4) + 's');
      streamCol.style.setProperty('--stream-delay', (Math.random() * 3) + 's');
      var chars = '';
      for (var n = 30 + Math.floor(Math.random() * 20); n > 0; n--) {
        chars += (Math.random() > 0.5 ? (Math.random() > 0.5 ? '1' : '0') : Math.floor(Math.random() * 10)) + '\n';
      }
      streamCol.textContent = chars;
      streamBg.appendChild(streamCol);
    }
  });

  // Scroll reveals (one-shot)
  function reveal(el) { el.classList.add(el.classList.contains('clip-reveal') ? 'revealed' : 'in-view'); }
  function revealOnScroll(selector, threshold) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: threshold });
    document.querySelectorAll(selector).forEach(function (el) { observer.observe(el); });
  }
  revealOnScroll('.slide-left, .slide-right, .slide-up, .fade-up', 0.15);
  // A clip-path circle of 0 makes the element's visible area 0, so its intersection
  // ratio never passes 0.15. Threshold 0 fires as soon as it enters the viewport.
  revealOnScroll('.clip-reveal', 0);

  // Hero entrance on load: line-by-line glitch reveal on home, fade-ins elsewhere
  window.addEventListener('load', function () {
    var lines = document.querySelectorAll('.hero-line-inner');
    if (lines.length) {
      lines.forEach(function (line) {
        var delay = parseInt(line.getAttribute('data-delay'), 10) || 0;
        setTimeout(function () {
          line.classList.add('visible');
          line.querySelectorAll('.glitch-word').forEach(function (word, w) {
            setTimeout(function () { word.classList.add('glitching'); }, w * 120);
          });
        }, 300 + delay);
      });
      setTimeout(function () { document.querySelectorAll('#hero .fade-up').forEach(reveal); }, 800);
      return;
    }
    setTimeout(function () {
      var hero = document.querySelector('section');
      if (hero) hero.querySelectorAll('.fade-up, .slide-left, .slide-right, .slide-up').forEach(reveal);
    }, 100);
  });

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
    vizSvg.appendChild(traveler);
    var segIndex = 0, segProgress = 0;
    (function animateTraveler() {
      var e = optimalPath[segIndex], a = nodes[e[0]], b = nodes[e[1]];
      traveler.setAttribute('cx', a.x + (b.x - a.x) * segProgress);
      traveler.setAttribute('cy', a.y + (b.y - a.y) * segProgress);
      segProgress += 0.006;
      if (segProgress >= 1) { segProgress = 0; segIndex = (segIndex + 1) % optimalPath.length; }
      requestAnimationFrame(animateTraveler);
    })();

    setInterval(function () {
      var activeCircles = vizSvg.querySelectorAll('.viz-node.active');
      var pick = activeCircles[Math.floor(Math.random() * activeCircles.length)];
      pick.setAttribute('r', 9);
      setTimeout(function () { pick.setAttribute('r', 7); }, 600);
    }, 1500);
  }

  // Services sidebar: highlight the link of the section in view
  var sidebarLinks = document.querySelectorAll('aside nav a');
  if (sidebarLinks.length) {
    var setLink = function (link, active) {
      link.classList.toggle('text-slate-500', !active);
      link.classList.toggle('bg-primary/10', active);
      link.classList.toggle('text-primary', active);
      var span = link.querySelector('.text-sm');
      if (span) { span.classList.toggle('font-medium', !active); span.classList.toggle('font-bold', active); }
    };
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        sidebarLinks.forEach(function (link) { setLink(link, link.getAttribute('href') === id); });
      });
    }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });
    document.querySelectorAll('section[id]').forEach(function (s) { sectionObserver.observe(s); });
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
