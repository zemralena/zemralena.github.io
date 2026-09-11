/* Zemra Lena — portfolio. Reveals are opt-in: content is visible unless JS says otherwise. */
(function () {
  "use strict";

  // rotating verb in the hero
  var rot = document.getElementById("rot");
  if (rot) {
    var words = rot.querySelectorAll("i"), ri = 0;
    if (words.length > 1) setInterval(function () {
      words[ri].classList.remove("on");
      ri = (ri + 1) % words.length;
      words[ri].classList.add("on");
    }, 3400);
  }

  // tabs
  var tabs = document.querySelectorAll(".tabs button");
  tabs.forEach(function (b) {
    b.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x === b); });
      document.querySelectorAll(".panel").forEach(function (p) { p.hidden = p.id !== b.dataset.p; });
    });
  });

  // video tiles play on hover, pause and rewind on leave
  document.querySelectorAll(".pc video").forEach(function (v) {
    var c = v.closest(".pc");
    c.addEventListener("mouseenter", function () { v.preload = "auto"; v.play().catch(function () {}); });
    c.addEventListener("mouseleave", function () { v.pause(); v.currentTime = 0; });
  });


  // document carousels: advance on their own, pause on hover, clickable dots
  document.querySelectorAll(".pc--carousel").forEach(function (pc) {
    var imgs = [].slice.call(pc.querySelectorAll(".cs__img"));
    var dots = [].slice.call(pc.querySelectorAll(".cs__dot"));
    var count = pc.querySelector(".carou__count b");
    var dotbox = pc.querySelector(".cs__dots");
    if (dotbox && imgs.length > 10) dotbox.classList.add("many");
    if (imgs.length < 2) return;
    var i = 0, timer = null, paused = false;
    function go(n) {
      imgs[i].classList.remove("on"); if (dots[i]) dots[i].classList.remove("on");
      i = (n + imgs.length) % imgs.length;
      imgs[i].classList.add("on"); if (dots[i]) dots[i].classList.add("on");
      if (count) count.textContent = i + 1;
      if (dotbox && dotbox.classList.contains("many"))
        dotbox.style.setProperty("--p", ((i + 1) / imgs.length * 100).toFixed(1) + "%");
    }
    function start() { stop(); timer = setInterval(function () { if (!paused) go(i + 1); }, 1700); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    dots.forEach(function (d, k) {
      d.addEventListener("click", function () { go(k); start(); });
    });
    pc.addEventListener("mouseenter", function () { paused = true; });
    pc.addEventListener("mouseleave", function () { paused = false; });
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    start();                                   // always run; IO only pauses it off-screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          // only pause for genuinely off-screen; a hidden tab reports false for everything
          if (!document.hidden) paused = !e.isIntersecting;
        });
      }, { threshold: 0.15 }).observe(pc);
    }
  });





  // ---- counting numbers on the fact rows ----
  (function () {
    var dds = [].slice.call(document.querySelectorAll(".fact dd"));
    if (!dds.length || window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    function run(dd) {
      var raw = dd.textContent.trim();
      var m = raw.match(/^([^0-9]*)([0-9][0-9,\.]*)(.*)$/);
      if (!m) return;                                  // GA4, SQL and the like just sit there
      var pre = m[1], num = parseFloat(m[2].replace(/,/g, "")), post = m[3];
      var dec = (m[2].split(".")[1] || "").length, grouped = m[2].indexOf(",") > -1;
      var t0 = null, dur = 1100;
      function fmt(v) {
        var out = dec ? v.toFixed(dec) : String(Math.round(v));
        if (grouped) out = Number(out).toLocaleString("en-US");
        return pre + out + post;
      }
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        dd.textContent = fmt(num * e);
        if (p < 1) requestAnimationFrame(step); else dd.textContent = raw;
      }
      requestAnimationFrame(step);
    }
    if ("IntersectionObserver" in window && !document.hidden) {
      var no = new IntersectionObserver(function (es, o) {
        es.forEach(function (e) { if (e.isIntersecting) { run(e.target); o.unobserve(e.target); } });
      }, { threshold: 0.6 });
      dds.forEach(function (d) { no.observe(d); });
    }
  })();

  // ---- clip-path wipe on artwork ----
  (function () {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches || document.hidden) return;
    if (!("IntersectionObserver" in window)) return;
    var frames = [].slice.call(document.querySelectorAll(".pc--card .fr, .pc--photo .fr, .wall--2 .pc .fr"));
    frames.forEach(function (f) { f.classList.add("wipe", "armed"); });
    var wo = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("shown"); o.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -4% 0px" });
    frames.forEach(function (f) { wo.observe(f); });
    setTimeout(function () { frames.forEach(function (f) { f.classList.add("shown"); }); }, 2600);
  })();

  // ---- cursor ring + magnetic CTA ----
  (function () {
    if (matchMedia("(hover:none),(pointer:coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    var ring = document.createElement("div");
    ring.className = "ring"; document.body.appendChild(ring);
    var rx = 0, ry = 0, tx = 0, ty = 0;
    addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY; ring.classList.add("on");
    }, { passive: true });
    (function loop() {
      rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
      ring.style.transform = "translate(" + rx.toFixed(1) + "px," + ry.toFixed(1) + "px)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("a,button,.pc,.app").forEach(function (el) {
      el.addEventListener("mouseenter", function () { ring.classList.add("grab"); });
      el.addEventListener("mouseleave", function () { ring.classList.remove("grab"); });
    });
    var mail = document.querySelector(".mail");
    if (mail) {
      mail.addEventListener("mousemove", function (e) {
        var r = mail.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        mail.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      mail.addEventListener("mouseleave", function () { mail.style.transform = ""; });
    }
  })();

  // ---- section progress rail ----
  (function () {
    var secs = [].slice.call(document.querySelectorAll("section[id], header.hero, footer[id]"));
    if (secs.length < 3 || innerWidth < 1100) return;
    var rail = document.createElement("nav");
    rail.className = "rail-dots"; rail.setAttribute("aria-label", "Sections");
    secs.forEach(function (s) {
      var a = document.createElement("a");
      a.href = "#" + (s.id || "top");
      a.setAttribute("aria-label", (s.querySelector("h1,h2") || {}).textContent || "Section");
      rail.appendChild(a);
    });
    document.body.appendChild(rail);
    var links = [].slice.call(rail.children);
    function sync() {
      var mid = innerHeight * 0.4, best = 0, bd = Infinity;
      secs.forEach(function (s, k) {
        var r = s.getBoundingClientRect();
        var d = Math.abs(r.top - mid);
        if (d < bd) { bd = d; best = k; }
      });
      links.forEach(function (a, k) { a.classList.toggle("on", k === best); });
    }
    addEventListener("scroll", function () { requestAnimationFrame(sync); }, { passive: true });
    sync();
  })();

  // ---- page transitions ----
  (function () {
    var h = document.documentElement;
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    // only animate in when the tab is actually visible; a hidden tab freezes CSS animations
    if (!document.hidden) h.classList.add("pt-in");
    h.classList.add("pt");
    document.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (!href || a.target === "_blank" || href.charAt(0) === "#" ||
          href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
      if (a.origin && a.origin !== location.origin) return;
      e.preventDefault();
      h.classList.add("leaving");
      setTimeout(function () { location.href = a.href; }, 260);
    });
    addEventListener("pageshow", function (ev) { if (ev.persisted) h.classList.remove("leaving"); });
  })();

  // ---- skeletons clear as artwork arrives ----
  document.querySelectorAll(".pc .fr").forEach(function (fr) {
    var m = fr.querySelector("img, video");
    if (!m) { fr.classList.add("loaded"); return; }
    if (m.tagName === "IMG") {
      if (m.complete && m.naturalWidth > 0) fr.classList.add("loaded");
      else {
        m.addEventListener("load", function () { fr.classList.add("loaded"); });
        m.addEventListener("error", function () { fr.classList.add("loaded"); });
      }
    } else fr.classList.add("loaded");
  });
  if ("IntersectionObserver" in window) {
    var sk = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var m = e.target.querySelector("img, video");
        if (!m || m.tagName !== "IMG" || (m.complete && m.naturalWidth > 0)) e.target.classList.add("loaded");
      });
    }, { rootMargin: "300px" });
    document.querySelectorAll(".pc .fr:not(.loaded)").forEach(function (f) { sk.observe(f); });
  }
  setTimeout(function () {
    document.querySelectorAll(".pc .fr").forEach(function (f) { f.classList.add("loaded"); });
  }, 2500);

  // ---- self-drawing rules under headings ----
  var heads = [].slice.call(document.querySelectorAll(".head"));
  if (heads.length && "IntersectionObserver" in window && !document.hidden) {
    var ho = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("drawn"); o.unobserve(e.target); }
      });
    }, { threshold: 0.3 });
    heads.forEach(function (h2) { ho.observe(h2); });
    setTimeout(function () { heads.forEach(function (h2) { h2.classList.add("drawn"); }); }, 2500);
  } else heads.forEach(function (h2) { h2.classList.add("drawn"); });

  // ---- landscape feature videos autoplay while on screen ----
  var feats = [].slice.call(document.querySelectorAll(".pc--feature video"));
  if (feats.length) {
    var reduceV = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    feats.forEach(function (v) {
      v.muted = true; v.loop = true; v.setAttribute("playsinline", "");
      v.removeAttribute("preload");
      var card = v.closest(".pc--feature");
      var rate = parseFloat(card.dataset.rate || "1");
      function play() {
        if (rate && rate !== 1) v.playbackRate = rate;   // reset every play: some browsers drop it
        v.play().then(function () { card.classList.add("playing"); }).catch(function () {});
      }
      function pause() { v.pause(); card.classList.remove("playing"); }
      if (reduceV) return;
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) { e.isIntersecting ? play() : pause(); });
        }, { threshold: 0.3 }).observe(v);
      } else play();
      card.addEventListener("click", function (e) {
        e.preventDefault();
        if (v.paused) play(); else pause();
      });
    });
  }

  // ---- scroll progress on the nav ----
  var bar = document.getElementById("scrollbar");
  // ---- parallax ----
  var par = [].slice.call(document.querySelectorAll("[data-par]"));
  addEventListener("resize", function () {
    par.forEach(function (el) { el.__parBase = null; el.style.transform = ""; });
  });
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      if (bar) {
        var max = document.body.scrollHeight - innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      }
      if (!reduce) {
        par.forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > innerHeight + 200) return;
          /* Anchor to the element's own resting position so the offset is exactly
             zero before you scroll. Measuring from the viewport centre instead put
             a -23px shift on the hero portrait at load, dropping it onto the
             eyebrow line above it. */
          if (el.__parBase == null) {
            var prev = el.style.transform;
            el.style.transform = "none";
            el.__parBase = el.getBoundingClientRect().top + y;
            el.style.transform = prev;
          }
          var start = Math.max(0, el.__parBase - innerHeight);   // page hasn't reached it yet
          var travelled = Math.max(0, y - start);
          el.style.transform = "translate3d(0," + (travelled * parseFloat(el.dataset.par)).toFixed(2) + "px,0)";
        });
      }
      ticking = false;
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  // ---- hamburger ----
  var burger = document.getElementById("burger"), menu = document.getElementById("menu");
  if (burger && menu) {
    function setMenu(open) {
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      menu.classList.toggle("open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    addEventListener("resize", function () { if (innerWidth > 820) setMenu(false); });
  }

  // ---- staggered reveals ----
  var stag = [].slice.call(document.querySelectorAll(".stag"));
  if (stag.length && !reduce && !document.hidden && "IntersectionObserver" in window) {
    var so = new IntersectionObserver(function (es, o) {
      es.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    stag.forEach(function (e) { so.observe(e); });
    setTimeout(function () { stag.forEach(function (e) { e.classList.add("in"); }); }, 2500);
  } else stag.forEach(function (e) { e.classList.add("in"); });

  // ---- scrollytelling: highlight the role level with the viewport centre ----
  var roles = [].slice.call(document.querySelectorAll(".exp a"));
  if (roles.length && !reduce) {
    function mark() {
      var mid = innerHeight * 0.45, best = null, bestD = Infinity;
      roles.forEach(function (a) {
        var r = a.getBoundingClientRect();
        var d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestD) { bestD = d; best = a; }
      });
      roles.forEach(function (a) { a.classList.toggle("live", a === best); });
    }
    addEventListener("scroll", function () { requestAnimationFrame(mark); }, { passive: true });
    mark();
  }

  // scroll reveals
  var els = [].slice.call(document.querySelectorAll(".rv"));
  var show = function (e) { e.classList.add("in"); };
  var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
  if (els.length && !reduce && !document.hidden && "IntersectionObserver" in window) {
    document.documentElement.classList.add("anim");
    var io = new IntersectionObserver(function (ents, o) {
      ents.forEach(function (e) { if (e.isIntersecting) { show(e.target); o.unobserve(e.target); } });
    }, { threshold: 0, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (e) { io.observe(e); });
    requestAnimationFrame(function () {
      els.forEach(function (e) { if (e.getBoundingClientRect().top < innerHeight) show(e); });
    });
    setTimeout(function () { els.forEach(show); }, 2000);          // failsafe
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) els.forEach(show);
    });
  }

  // lightbox over still images
  var lb = document.getElementById("lb");
  if (!lb) return;
  var img = document.getElementById("lbi"), cap = document.getElementById("lbc");
  var shots = [].slice.call(document.querySelectorAll('.pc[href$=".jpg"], .pc[href$=".png"], .pc[href$=".svg"]'));
  var at = 0;
  function open(i) {
    at = (i + shots.length) % shots.length;
    img.src = shots[at].getAttribute("href");
    cap.textContent = shots[at].dataset.t || "";
    lb.classList.add("on");
    document.body.style.overflow = "hidden";
  }
  function close() { lb.classList.remove("on"); img.src = ""; document.body.style.overflow = ""; }
  shots.forEach(function (a, i) {
    a.addEventListener("click", function (e) { e.preventDefault(); open(i); });
  });
  document.getElementById("lbx").addEventListener("click", close);
  document.getElementById("lbp").addEventListener("click", function () { open(at - 1); });
  document.getElementById("lbn").addEventListener("click", function () { open(at + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("on")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") open(at - 1);
    if (e.key === "ArrowRight") open(at + 1);
  });
})();

/* ---- scroll sideways through the work ------------------------------------
   Base HTML/CSS is a plain swipeable strip. We only pin when we have measured
   real horizontal overflow on a wide screen, so a script failure leaves a
   working section rather than a blank one. */
(function () {
  [].slice.call(document.querySelectorAll('.hs')).forEach(setup);

  function setup(sec) {
  var vp   = sec.querySelector('.hs__vp'),
      tr   = sec.querySelector('.hs__track'),
      bar  = sec.querySelector('.hs__bar i');
  if (!vp || !tr) return;
  var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  var on = false, dist = 0;

  /* travel is measured against the viewport's CONTENT box, so the last card
     finishes flush with the right gutter instead of half off the screen */
  function span() {
    var cs = getComputedStyle(vp);
    var inner = vp.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    return Math.max(0, tr.scrollWidth - inner);
  }

  function off() {
    on = false;
    sec.classList.remove('hs--on');
    sec.style.height = '';
    tr.style.transform = '';
    if (bar) bar.style.width = '';
  }

  function measure() {
    if (reduce || innerWidth < 900) { off(); return; }
    sec.style.height = '';
    /* measure in the pinned geometry, not the flat one: the pinned state sizes
       the pieces differently, so measuring first could decide "no overflow"
       about a layout that never renders */
    sec.classList.add('hs--on');
    dist = span();
    if (dist < 80) { off(); return; }
    on = true;
    sec.style.height = (innerHeight + dist + 140) + 'px';
    tick();
  }

  function tick() {
    if (!on) return;
    var total = sec.offsetHeight - innerHeight;
    var p = total > 0 ? (-sec.getBoundingClientRect().top) / total : 0;
    p = p < 0 ? 0 : p > 1 ? 1 : p;
    tr.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
    if (bar) bar.style.width = (p * 100).toFixed(1) + '%';
  }

  /* tick straight off the scroll event: rAF never fires in a background tab,
     and the read is one getBoundingClientRect against an already-clean layout */
  function onScroll() { tick(); }

  var t;
  function remeasure() { clearTimeout(t); t = setTimeout(measure, 160); }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', remeasure);
  addEventListener('load', remeasure);
  // artwork loads late and changes the track width
  Array.prototype.forEach.call(tr.querySelectorAll('img'), function (im) {
    if (!im.complete) im.addEventListener('load', remeasure, { once: true });
  });
  measure();
  setTimeout(measure, 900);
  setTimeout(measure, 2200);
  }
})();

/* ---- analytics: bars grow and figures count up on first view ---------------
   The charts are inlined SVG (not <img>) so their contents can animate. The
   final state is what the markup already says, and JS only ever animates
   toward it, so a failure here leaves a correct, readable chart. */
(function () {
  var charts = [].slice.call(document.querySelectorAll("svg.cv"));
  if (!charts.length) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;

  function parse(txt) {
    var m = String(txt).match(/^([^0-9-]*)(-?[\d,]*\.?\d+)(.*)$/);
    if (!m) return null;
    var digits = m[2].replace(/,/g, "");
    var dec = (digits.split(".")[1] || "").length;
    return { pre: m[1], to: parseFloat(digits), post: m[3],
             comma: m[2].indexOf(",") > -1, dec: dec };
  }
  function fmt(p, v) {
    var n = p.dec ? v.toFixed(p.dec) : String(Math.round(v));
    if (p.comma) {
      var bits = n.split(".");
      bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      n = bits.join(".");
    }
    return p.pre + n + p.post;
  }

  function run(svg) {
    if (svg.dataset.ran) return;
    svg.dataset.ran = "1";
    var bars = [].slice.call(svg.querySelectorAll(".cv__bar")).map(function (r) {
      var y = parseFloat(r.getAttribute("y")), h = parseFloat(r.getAttribute("height"));
      return { el: r, y: y, h: h, base: y + h };
    });
    var vals = [].slice.call(svg.querySelectorAll(".cv__val")).map(function (t) {
      var p = parse(t.getAttribute("data-v"));
      return p ? { el: t, p: p, y: parseFloat(t.getAttribute("y")) } : null;
    }).filter(Boolean);
    if (!bars.length && !vals.length) return;

    var DUR = 1150, t0 = null;
    function frame(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / DUR);
      var e = 1 - Math.pow(1 - p, 3);
      bars.forEach(function (b) {
        b.el.setAttribute("height", (b.h * e).toFixed(2));
        b.el.setAttribute("y", (b.base - b.h * e).toFixed(2));
      });
      vals.forEach(function (v, i) {
        v.el.textContent = fmt(v.p, v.p.to * e);
        var bar = bars[i];
        if (bar) v.el.setAttribute("y", (bar.base - (bar.base - v.y) * e).toFixed(2));
      });
      if (p < 1) requestAnimationFrame(frame);
      else {
        // land exactly on the authored values, never on a rounding artefact
        bars.forEach(function (b) { b.el.setAttribute("height", b.h); b.el.setAttribute("y", b.y); });
        vals.forEach(function (v) { v.el.textContent = v.el.getAttribute("data-v"); v.el.setAttribute("y", v.y); });
      }
    }
    // collapse to the baseline, then grow
    bars.forEach(function (b) { b.el.setAttribute("height", 0); b.el.setAttribute("y", b.base); });
    vals.forEach(function (v, i) {
      v.el.textContent = fmt(v.p, 0);
      if (bars[i]) v.el.setAttribute("y", bars[i].base);
    });
    requestAnimationFrame(frame);
  }

  if (!("IntersectionObserver" in window)) return;   // leave charts as authored
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.35 });
  charts.forEach(function (c) { io.observe(c); });
  // failsafe: whatever happens, never leave a chart collapsed
  setTimeout(function () {
    charts.forEach(function (svg) {
      if (svg.dataset.ran) return;
      svg.querySelectorAll(".cv__val").forEach(function (t) { t.textContent = t.getAttribute("data-v"); });
    });
  }, 6000);
})();
