// Minimal vanilla JS: lazy video loading, environment gallery tabs, BibTeX copy.
(function () {
  "use strict";

  // ---------- lazy videos: load + play only while on screen ----------
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          if (!v.getAttribute("src") && v.dataset.src) {
            v.src = v.dataset.src;
            v.load();
          }
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { rootMargin: "200px 0px" });
  }
  function observe(v) {
    if (io) io.observe(v);
    else if (v.dataset.src) { v.src = v.dataset.src; }
  }
  function observeAll(root) {
    (root || document).querySelectorAll("video.lazy").forEach(observe);
  }

  // ---------- environment gallery ----------
  var ARMS = [
    { key: "zerograv", name: "Zero-G", note: "gravity off until contact / grasp" },
    { key: "vanilla_walled", name: "Regular gravity, walled", note: "same 3D spawn + walls" },
    { key: "vanilla_nowall", name: "Regular gravity, no walls", note: "same 3D spawn" },
    { key: "gravity_dr_fixed", name: "Gravity-DR (fixed)", note: "|g| ~ U[6, 14] m/s²" }
  ];
  var TASKS = {
    pushcube: { label: "PushCube", desc: "Push a cube to a target region on the table.",
      ids: ["PushCube-ZeroGrav-OnContact-v1", "PushCube-Vanilla-Walled-Matched-v1", "PushCube-Vanilla-NoWall-Matched-v1", "PushCube-GravityADR-v1"] },
    pickcube: { label: "PickCube", desc: "Grasp a cube and move it to a 3D goal (green marker).",
      ids: ["PickCube-ZeroGrav-OnContact-v1", "PickCube-Vanilla-Walled-Matched-v1", "PickCube-Vanilla-NoWall-Matched-v1", "PickCube-GravityADR-v1"] },
    liftpeg: { label: "LiftPeg", desc: "Grasp a lying peg and stand it upright.",
      ids: ["LiftPeg-ZeroGrav-OnGrasp-Fixed-WallFix-v1", "LiftPeg-Vanilla-Walled-Matched-v1", "LiftPeg-Vanilla-NoWall-Matched-v1", "LiftPeg-GravityADR-v1"] },
    picksingleycb: { label: "PickSingleYCB", desc: "Grasp a YCB household object and move it to a 3D goal.",
      ids: ["PickSingleYCB-ZeroGrav-OnGrasp-v1", "PickSingleYCB-Vanilla-Walled-Matched-v1", "PickSingleYCB-Vanilla-NoWall-Matched-v1", "PickSingleYCB-GravityADR-v1"] },
    pullcube: { label: "PullCube", desc: "Pull a cube back toward the robot, onto a target region.",
      ids: ["PullCube-ZeroGrav-OnContact-Confined-v1", "PullCube-Vanilla-Walled-Matched-v1", "PullCube-Vanilla-NoWall-Matched-v1", "PullCube-GravityADR-v1"] },
    pusht: { label: "PushT", desc: "Push a T-shaped block to match a target pose.",
      ids: ["PushT-ZeroGrav-OnContact-v3", "PushT-Vanilla-Walled-Matched-v3", "PushT-Vanilla-NoWall-Matched-v1", "PushT-GravityADR-v1"],
      missing: { zerograv: "In this clip (seed 0) the Zero-G tee spawns above the camera’s field of view and stays there, so the clip shows only the target. Needs a re-render with a wider camera. See the Zero-G PushT demonstrations further down." } },
    placesphere: { label: "PlaceSphere", desc: "Grasp a sphere and place it into a bin.",
      ids: ["PlaceSphere-ZeroGrav-OnGrasp-WallRelease-v2", "PlaceSphere-Vanilla-Matched-WallRelease-v2", "PlaceSphere-Vanilla-NoWall-Matched-v1", "PlaceSphere-GravityADR-v1"] },
    rollball: { label: "RollBall", desc: "Push a ball so that it rolls into a goal region.",
      ids: ["RollBall-ZeroGrav-OnContact-SpawnBox-Release-Corridor-v1", "RollBall-Vanilla-Walled-Matched-v1", "RollBall-Vanilla-NoWall-Matched-v1", "RollBall-GravityADR-v1"] }
  };

  var tabsEl = document.getElementById("task-tabs");
  var gridEl = document.getElementById("arm-grid");
  var descEl = document.getElementById("task-desc");

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function showTask(key) {
    var t = TASKS[key];
    if (!t) return;
    tabsEl.querySelectorAll(".tab").forEach(function (b) {
      b.setAttribute("aria-selected", b.dataset.task === key ? "true" : "false");
    });
    descEl.textContent = t.desc;
    if (io) gridEl.querySelectorAll("video").forEach(function (v) { io.unobserve(v); });
    var html = "";
    ARMS.forEach(function (a, i) {
      var base = "static/videos/gallery/" + key + "_" + a.key;
      var media;
      if (t.missing && t.missing[a.key]) {
        media = '<div class="placeholder"><strong>Clip not usable</strong>' + esc(t.missing[a.key]) + "</div>";
      } else {
        media = '<video class="lazy" muted loop playsinline preload="none" poster="' + base + '.jpg" data-src="' + base + '.mp4"></video>';
      }
      html += "<figure>" + media + "<figcaption><b>" + esc(a.name) + "</b>" + esc(a.note) +
        '<br><span class="envid">' + esc(t.ids[i]) + "</span></figcaption></figure>";
    });
    gridEl.innerHTML = html;
    observeAll(gridEl);
  }

  if (tabsEl && gridEl) {
    Object.keys(TASKS).forEach(function (k, i) {
      var b = document.createElement("button");
      b.className = "tab";
      b.type = "button";
      b.dataset.task = k;
      b.setAttribute("role", "tab");
      b.textContent = TASKS[k].label;
      b.addEventListener("click", function () { showTask(k); });
      tabsEl.appendChild(b);
    });
    showTask("pickcube");
  }

  observeAll(document);

  // ---------- BibTeX copy ----------
  var copyBtn = document.getElementById("copy-bib");
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var text = document.getElementById("bibtex").innerText;
      function done() { copyBtn.textContent = "Copied"; setTimeout(function () { copyBtn.textContent = "Copy"; }, 1500); }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }
})();
