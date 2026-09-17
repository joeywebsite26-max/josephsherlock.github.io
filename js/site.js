/* josephsherlock.com micro-interaction. No dependencies.
   Everything here degrades to a complete, static page if JS is off
   or the visitor prefers reduced motion.                            */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. typewriter ---------- */
  function typewriter(el) {
    var phrases;
    try { phrases = JSON.parse(el.dataset.phrases); } catch (e) { return; }
    if (!phrases || !phrases.length) return;

    if (reduced) { el.textContent = phrases[0]; return; }

    var caret = document.createElement("span");
    caret.className = "tw-caret";
    caret.setAttribute("aria-hidden", "true");
    el.after(caret);

    var i = 0, j = 0, deleting = false;
    function tick() {
      var word = phrases[i];
      j = deleting ? j - 1 : j + 1;
      el.textContent = word.slice(0, j);

      var wait = deleting ? 34 : 58;
      if (!deleting && j === word.length) { deleting = true; wait = 2200; }
      else if (deleting && j === 0) { deleting = false; i = (i + 1) % phrases.length; wait = 320; }
      setTimeout(tick, wait);
    }
    el.textContent = "";
    setTimeout(tick, 900);
  }
  document.querySelectorAll("[data-phrases]").forEach(typewriter);

  /* ---------- 2. staggered reveal ---------- */
  var rv = document.querySelectorAll(".rv");
  if (reduced || !("IntersectionObserver" in window)) {
    rv.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var group = e.target.parentElement ? [].indexOf.call(e.target.parentElement.children, e.target) : 0;
        e.target.style.transitionDelay = Math.min(group, 6) * 60 + "ms";
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -5% 0px", threshold: 0 });
    rv.forEach(function (el) { io.observe(el); });
    // safety net: never leave content invisible if the observer misses something
    setTimeout(function () {
      rv.forEach(function (el) { el.classList.add("in"); });
    }, 2500);
  }

  /* ---------- 3. counting numbers ---------- */
  function fmt(n, pre, suf) {
    return (pre || "") + (n >= 1000 ? n.toLocaleString("en-US") : String(n)) + (suf || "");
  }
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var target = parseFloat(el.dataset.count),
        pre = el.dataset.prefix || "",
        suf = el.dataset.suffix || "";
    if (reduced || !("IntersectionObserver" in window)) { el.textContent = fmt(target, pre, suf); return; }
    el.textContent = fmt(0, pre, suf);
    var seen = false;
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting || seen) return;
        seen = true;
        var t0 = performance.now(), dur = 1300;
        (function step(now) {
          var p = Math.min((now - t0) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * eased), pre, suf);
          if (p < 1) requestAnimationFrame(step);
        })(t0);
        o.disconnect();
      });
    }, { threshold: 0.4 });
    o.observe(el);
  });

  /* ---------- 4. video facades (no YouTube request until clicked) ---------- */
  document.querySelectorAll(".video").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.dataset.video;
      var media = btn.querySelector(".card-media");
      var f = document.createElement("iframe");
      f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      f.title = btn.dataset.title || "Video";
      f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture";
      f.allowFullscreen = true;
      media.innerHTML = "";
      media.appendChild(f);
    }, { once: true });
  });

  /* ---------- 5. featured case-study stage ---------- */
  document.querySelectorAll("[data-stage]").forEach(function (stage) {
    var slides = [].slice.call(stage.querySelectorAll(".slide"));
    var dots   = [].slice.call(stage.querySelectorAll(".dot"));
    var cur    = stage.querySelector("[data-cur]");
    if (slides.length < 2) return;

    var DUR = 7000;
    stage.style.setProperty("--slide-dur", DUR + "ms");
    var i = 0, timer = null, held = false;

    function show(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle("is-on", on);
        if (on) { s.removeAttribute("aria-hidden"); s.removeAttribute("tabindex"); }
        else { s.setAttribute("aria-hidden", "true"); s.setAttribute("tabindex", "-1"); }
      });
      dots.forEach(function (d, k) {
        d.setAttribute("aria-current", String(k === i));
        if (k === i) {                 // restart the fill animation
          var c = d.cloneNode(true);
          c.setAttribute("aria-current", "true");
          d.parentNode.replaceChild(c, d);
          dots[k] = c;
          bindDot(c, k);
          if (held) c.classList.add("paused");
        }
      });
      if (cur) cur.textContent = String(i + 1);
    }

    function bindDot(d, k) {
      d.addEventListener("click", function () { go(k); });
    }
    dots.forEach(bindDot);

    function start() { if (!reduced) { stop(); timer = setInterval(function () { show(i + 1); }, DUR); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function go(n) { show(n); start(); }

    var prev = stage.querySelector("[data-prev]"), next = stage.querySelector("[data-next]");
    if (prev) prev.addEventListener("click", function () { go(i - 1); });
    if (next) next.addEventListener("click", function () { go(i + 1); });

    function hold(on) {
      held = on;
      dots.forEach(function (d) { d.classList.toggle("paused", on && d.getAttribute("aria-current") === "true"); });
      if (on) stop(); else start();
    }
    stage.addEventListener("mouseenter", function () { hold(true); });
    stage.addEventListener("mouseleave", function () { hold(false); });
    stage.addEventListener("focusin",  function () { hold(true); });
    stage.addEventListener("focusout", function () { hold(false); });

    // pause while off-screen so the timer isn't racing in a background tab
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { e.isIntersecting ? start() : stop(); });
      }, { threshold: 0.2 }).observe(stage);
    } else { start(); }

    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    show(0);
    start();
  });

  /* ---------- 6. research filters + expandable rows ---------- */
  var list = document.getElementById("pub-list");
  if (list) {
    var rows = [].slice.call(list.querySelectorAll(".pub"));
    var chips = [].slice.call(document.querySelectorAll(".chip"));
    var showall = document.getElementById("showall");
    var empty = document.getElementById("pub-empty");
    var LIMIT = 8;
    var filter = "all", expanded = false;

    function matches(row) {
      return filter === "all" ||
             row.dataset.theme === filter ||
             row.dataset.stage === filter;
    }

    function render() {
      var shown = 0, total = 0;
      rows.forEach(function (row) {
        var ok = matches(row);
        if (ok) total++;
        var visible = ok && (expanded || total <= LIMIT);
        row.hidden = !visible;
        if (visible) shown++;
      });
      empty.hidden = total > 0;
      if (total > LIMIT) {
        showall.hidden = false;
        showall.textContent = expanded ? "Show fewer" : "Show all " + total + " →";
      } else {
        showall.hidden = true;
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", String(c === chip)); });
        filter = chip.dataset.filter;
        expanded = false;
        render();
      });
    });

    if (showall) {
      showall.addEventListener("click", function () { expanded = !expanded; render(); });
    }
    render();
  }

  document.querySelectorAll(".pub-head").forEach(function (h) {
    h.addEventListener("click", function () {
      h.setAttribute("aria-expanded", h.getAttribute("aria-expanded") === "true" ? "false" : "true");
    });
  });
})();
