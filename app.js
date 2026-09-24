/* ===== Peached Tortilla — Manager Training · Portal (Pillar 8 engine) ===== */
(function () {
  "use strict";

  var USERS_KEY = "peached_users";
  var SESSION_KEY = "peached_session";
  var MGR_KEY = "peached_mgr_name";
  var MGR_PASS = (typeof APP !== "undefined" && APP.managerPass) || "1306";
  var COLL = (typeof APP !== "undefined" && APP.cloudCollection) || "progress";
  var PKEY = function (id) { return "peached_progress_" + id; };

  var state = { view: "login", employee: null, mid: null, level: null, mgrEmp: null, mgrAuthed: false };

  /* ---------- storage ---------- */
  function readJSON(k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function writeJSON(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function listUsers() { return readJSON(USERS_KEY, []); }
  function upsertUser(id, name) {
    var u = listUsers().filter(function (x) { return x.id !== id; });
    u.push({ id: id, name: name }); u.sort(function (a, b) { return a.name.localeCompare(b.name); });
    writeJSON(USERS_KEY, u);
  }
  function loadProgress(id) { return readJSON(PKEY(id), { name: "", lastModule: null, updatedAt: null, modules: {} }); }
  function saveProgress(id, d) { d.updatedAt = Date.now(); writeJSON(PKEY(id), d); Cloud.pushDebounced(id); }
  function moduleState(id, mid) { return loadProgress(id).modules[mid] || {}; }

  function chooseNewer(a, b) {
    if (!a || !a.modules) return b || null;
    if (!b || !b.modules) return a || null;
    return (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
  }

  /* ---------- cloud sync (Firebase, optional) ---------- */
  var Cloud = {
    on: false, status: "off", db: null, authReady: null, _timers: {},
    init: function () {
      try {
        if (typeof firebase === "undefined") { this.status = "off"; return; }
        if (typeof FIREBASE_CONFIG === "undefined" || !FIREBASE_CONFIG || !FIREBASE_CONFIG.projectId || String(FIREBASE_CONFIG.projectId).indexOf("PASTE") > -1) { this.status = "off"; return; }
        firebase.initializeApp(FIREBASE_CONFIG);
        this.db = firebase.firestore();
        this.on = true; this.status = "connecting";
        var self = this;
        this.authReady = new Promise(function (resolve) {
          firebase.auth().onAuthStateChanged(function (u) { if (u) { self.status = "on"; resolve(); syncBadge(); } });
          firebase.auth().signInAnonymously().catch(function () { self.status = "error"; resolve(); syncBadge(); });
        });
      } catch (e) { this.on = false; this.status = "error"; }
    },
    ready: function () { return this.on; },
    pull: function (id) {
      if (!this.on) return Promise.resolve(null);
      var self = this;
      return this.authReady.then(function () {
        return self.db.collection(COLL).doc(String(id)).get()
          .then(function (doc) { if (!doc.exists) return null; try { return JSON.parse(doc.data().data); } catch (e) { return null; } })
          .catch(function () { self.status = "error"; syncBadge(); return null; });
      });
    },
    all: function () {
      if (!this.on) return Promise.resolve(null);
      var self = this;
      return this.authReady.then(function () {
        return self.db.collection(COLL).get()
          .then(function (snap) { var out = []; snap.forEach(function (d) { try { var p = JSON.parse(d.data().data); p.id = d.id; out.push(p); } catch (e) {} }); return out; })
          .catch(function () { self.status = "error"; syncBadge(); return null; });
      });
    },
    push: function (id) {
      if (!this.on) return;
      var self = this, obj = loadProgress(id);
      this.authReady.then(function () {
        self.db.collection(COLL).doc(String(id)).set({
          id: String(id), name: obj.name || "", updatedAt: obj.updatedAt || Date.now(), data: JSON.stringify(obj)
        }).catch(function () { self.status = "error"; syncBadge(); });
      });
    },
    pushDebounced: function (id) {
      if (!this.on) return;
      var self = this; clearTimeout(this._timers[id]);
      this._timers[id] = setTimeout(function () { self.push(id); }, 1400);
    }
  };
  function syncBadge() {
    var el = document.getElementById("syncbadge"); if (!el) return;
    if (Cloud.status === "on") { el.textContent = "\u2601 Cloud sync on"; el.className = "syncbadge on"; }
    else if (Cloud.status === "connecting") { el.textContent = "\u2601 connecting\u2026"; el.className = "syncbadge"; }
    else if (Cloud.status === "error") { el.textContent = "\u26A0 cloud not connected"; el.className = "syncbadge err"; }
    else { el.textContent = "on this device only"; el.className = "syncbadge"; }
  }

  function statusOf(id, mid) {
    var m = moduleState(id, mid);
    if (m.reviewedAt) return "reviewed";
    if (m.selfPacedAt) return "selfdone";
    var touched = (m.scenario && m.scenario.trim()) || (m.answers && Object.keys(m.answers).some(function (k) { return (m.answers[k].text || "").trim() || m.answers[k].rating; }));
    return touched ? "inprog" : "notstarted";
  }
  var STATUS_LABEL = { notstarted: "Not started", inprog: "In progress", selfdone: "Self-paced complete", reviewed: "Signed off" };

  function levelMods(lv) { return MODULES.filter(function (m) { return m.level === lv; }); }
  function levelPct(id, lv) {
    var mods = levelMods(lv);
    var done = mods.filter(function (m) { var s = statusOf(id, m.id); return s === "selfdone" || s === "reviewed"; }).length;
    return mods.length ? Math.round((done / mods.length) * 100) : 0;
  }
  function levelComplete(id, lv) { return levelMods(lv).every(function (m) { var s = statusOf(id, m.id); return s === "selfdone" || s === "reviewed"; }); }
  function levelCertified(id, lv) { return levelMods(lv).every(function (m) { return statusOf(id, m.id) === "reviewed"; }); }
  function levelUnlocked(id, lv) { return true; } // all levels open

  /* ---------- utils ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); }
  function byId(x) { return document.getElementById(x); }
  var app = function () { return byId("app"); };
  function fmtDate(ts) { if (!ts) return ""; return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); }

  function sealSVG(size) {
    return '<svg class="seal" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<defs><path id="arcT" d="M20,50 a30,30 0 0,1 60,0" fill="none"/><path id="arcB" d="M22,54 a28,28 0 0,0 56,0" fill="none"/></defs>' +
      '<circle cx="50" cy="50" r="47" fill="none" stroke="var(--gold-soft)" stroke-width="1"/>' +
      '<circle cx="50" cy="50" r="41" fill="none" stroke="var(--gold-soft)" stroke-width="1.6"/>' +
      '<text class="seal-arc"><textPath href="#arcT" startOffset="50%" text-anchor="middle">' + esc(APP.sealTop) + '</textPath></text>' +
      '<text class="seal-arc"><textPath href="#arcB" startOffset="50%" text-anchor="middle">' + esc(APP.sealBottom) + '</textPath></text>' +
      '<line x1="34" y1="35" x2="66" y2="35" stroke="var(--gold-soft)" stroke-width="1"/>' +
      '<line x1="34" y1="65" x2="66" y2="65" stroke="var(--gold-soft)" stroke-width="1"/>' +
      '<text x="50" y="58" text-anchor="middle" class="seal-mono" style="font-size:' + (APP.sealCenter.length > 1 ? 20 : 27) + 'px">' + esc(APP.sealCenter) + '</text>' +
      "</svg>";
  }
  function ringSVG(pct, size, certified) {
    var r = 43, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return '<svg class="ring' + (certified ? " cert" : "") + '" viewBox="0 0 100 100" width="' + size + '" height="' + size + '" aria-hidden="true">' +
      '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="var(--gold-soft)" stroke-opacity=".45" stroke-width="2.4"/>' +
      '<circle cx="50" cy="50" r="' + r + '" fill="none" stroke="' + (certified ? "var(--gold-deep)" : "var(--gold)") + '" stroke-width="2.4" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 50 50)"/>' +
      '<text x="50" y="' + (size >= 96 ? 49 : 48) + '" text-anchor="middle" class="ring-pct" style="font-size:' + (size >= 96 ? 21 : 19) + 'px">' + pct + "%</text>" +
      '<text x="50" y="' + (size >= 96 ? 63 : 61) + '" text-anchor="middle" class="ring-lbl" style="font-size:' + (size >= 96 ? 8 : 7.5) + 'px">' + (certified ? "CERTIFIED" : "COMPLETE") + "</text>" +
      "</svg>";
  }

  /* ---------- completion + notification ---------- */
  function isComplete(id) {
    var p = loadProgress(id);
    return MODULES.every(function (m) { var ms = p.modules[m.id] || {}; return ms.selfPacedAt || ms.reviewedAt; });
  }
  function maybeNotifyComplete(id) {
    var p = loadProgress(id);
    if (!isComplete(id)) return;
    if (p.notifiedComplete) return;
    p.notifiedComplete = true; p.completedAt = p.completedAt || Date.now();
    writeJSON(PKEY(id), p); Cloud.push(id);
    Notify.send(p.name || ("Employee " + id), id, p.completedAt);
  }
  var Notify = {
    send: function (name, id, ts) {
      try {
        if (typeof NOTIFY_URL === "undefined" || !NOTIFY_URL || String(NOTIFY_URL).indexOf("PASTE") > -1) return;
        var payload = {
          name: name, id: String(id),
          date: new Date(ts).toLocaleString(),
          app: (typeof APP !== "undefined" && APP.brand) ? APP.brand + " Manager Training" : "Training",
          to: (typeof APP !== "undefined" && APP.notifyEmails) || []
        };
        fetch(NOTIFY_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
      } catch (e) {}
    }
  };

  /* ---------- content blocks ---------- */
  function renderBlocks(blocks) {
    if (!blocks) return "";
    return blocks.map(function (b) {
      switch (b.t) {
        case "h": return "<h2>" + esc(b.x) + "</h2>";
        case "sub": return '<h3 class="sub">' + esc(b.x) + "</h3>";
        case "p": return "<p>" + esc(b.x) + "</p>";
        case "quote": return '<div class="quote">' + esc(b.x) + "</div>";
        case "ul": return "<ul>" + b.x.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>";
        case "ol": return "<ol>" + b.x.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ol>";
        case "callout": return '<div class="callout"><div class="ct">' + esc(b.title) + "</div>" + b.lines.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") + "</div>";
        case "table":
          return '<table class="tbl"><thead><tr>' + b.head.map(function (h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>" +
            b.rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + esc(c) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table>";
        case "links":
          return '<div class="reslinks">' + b.x.map(function (l) { return '<a class="reslink course-link" href="' + esc(l.url) + '" target="_blank" rel="noopener noreferrer">' + esc(l.label) + " \u2197</a>"; }).join("") + "</div>";
        default: return "";
      }
    }).join("");
  }

  /* ================= LOGIN ================= */
  function renderLogin() {
    document.body.className = "login";
    app().innerHTML =
      '<div class="login-card">' + '<div class="nm">' + esc(APP.brand) + '</div>' +
      '<div class="tag">' + esc(APP.tagline) + '</div>' +
      '<div class="field"><label for="eid">Employee ID</label><input id="eid" autocomplete="off" placeholder="e.g. 1234" /></div>' +
      '<div class="field"><label for="enm">Your name</label><input id="enm" autocomplete="off" placeholder="First and last name" /></div>' +
      '<button class="btn block" id="go">Start my training</button>' +
      '<div class="login-alt">Reviewing someone\u2019s work? <button class="linkcaps" id="mgr">Manager mode</button></div>' +
      "</div>";
    byId("go").onclick = function () {
      var id = byId("eid").value.trim(), nm = byId("enm").value.trim();
      if (!id) { byId("eid").focus(); return; }
      writeJSON(SESSION_KEY, id);
      var localBefore = readJSON(PKEY(id), null);
      var finish = function (base) {
        base = base || { name: "", lastModule: null, updatedAt: null, modules: {} };
        if (nm) base.name = nm; else nm = base.name || ("Employee " + id);
        base.name = nm; writeJSON(PKEY(id), base); upsertUser(id, nm);
        Cloud.push(id);
        state.employee = { id: id, name: nm }; state.view = "home"; render();
      };
      if (Cloud.ready()) {
        renderLoading("Loading your progress\u2026");
        Cloud.pull(id).then(function (remote) { finish(chooseNewer(localBefore, remote)); });
      } else { finish(localBefore); }
    };
    byId("eid").addEventListener("keydown", function (e) { if (e.key === "Enter") byId("enm").focus(); });
    byId("enm").addEventListener("keydown", function (e) { if (e.key === "Enter") byId("go").click(); });
    byId("mgr").onclick = function () { state.view = "managerAuth"; render(); };
  }

  function renderLoading(msg) {
    document.body.className = "login";
    app().innerHTML = '<div class="login-card" style="text-align:center">' + '<div class="nm" style="font-size:20px">' + esc(APP.brand) + '</div>' +
      '<div class="tag">' + esc(APP.tagline) + '</div>' +
      '<div style="margin-top:16px;color:var(--muted);font-size:14px">' + esc(msg || "Loading\u2026") + "</div></div>";
  }

  /* ================= MANAGER PASSWORD GATE ================= */
  function renderManagerAuth() {
    document.body.className = "login";
    app().innerHTML =
      '<div class="login-card">' + '<div class="nm">Manager Review</div>' +
      '<div class="tag">' + esc(APP.brand) + ' \u00b7 ' + esc(APP.tagline) + '</div>' +
      '<div class="field"><label for="mpass">Manager password</label><input id="mpass" type="password" autocomplete="off" placeholder="Enter password" /></div>' +
      '<div id="mperr" style="color:#B4462A;font-size:13px;margin:-8px 0 12px;min-height:16px"></div>' +
      '<button class="btn block" id="mgo">Enter manager mode</button>' +
      '<div class="login-alt"><button class="linkcaps" id="mback">\u2190 Back</button></div>' +
      "</div>";
    function tryAuth() {
      if (byId("mpass").value.trim() === MGR_PASS) { state.mgrAuthed = true; state.view = "manager"; render(); }
      else { byId("mperr").textContent = "Incorrect password."; byId("mpass").value = ""; byId("mpass").focus(); }
    }
    byId("mgo").onclick = tryAuth;
    byId("mpass").addEventListener("keydown", function (e) { if (e.key === "Enter") tryAuth(); });
    byId("mback").onclick = function () { state.view = state.employee ? "home" : "login"; render(); };
    byId("mpass").focus();
  }

  /* ================= TOP BAR ================= */
  function topbar(right) {
    return '<div class="topbar">' +
      '<div class="brand"><span class="nm">' + esc(APP.brand) + '</span><span class="tag">' + esc(APP.tagline) + '</span></div>' +
      '<div class="spacer"></div>' + '<span id="syncbadge" class="syncbadge"></span>' + (right || "") + "</div>";
  }
  function whoBar(showSwitch) {
    var e = state.employee;
    return '<div class="who">Signed in as<br><b>' + esc(e.name) + "</b> \u00b7 " + esc(e.id) + "</div>" +
      (showSwitch ? '<button class="linkcaps switch" id="switch">Switch employee</button>' : "");
  }
  function wireSwitch() { var s = byId("switch"); if (s) s.onclick = function () { localStorage.removeItem(SESSION_KEY); state.employee = null; state.view = "login"; render(); }; }

  /* ================= HOME (flat module list) ================= */
  function renderHome() {
    document.body.className = "";
    var e = state.employee;
    maybeNotifyComplete(e.id);
    var done = MODULES.filter(function (m) { var s = statusOf(e.id, m.id); return s === "selfdone" || s === "reviewed"; }).length;
    var pct = Math.round(done / MODULES.length * 100);
    var complete = isComplete(e.id);
    var list = MODULES.map(function (m) {
      var s = statusOf(e.id, m.id);
      var cls = (s === "reviewed" || s === "selfdone") ? "done" : (s === "inprog" ? "inprog" : "");
      var tp = m.type === "course" ? '<span class="tpill course">Course</span>' : '<span class="tpill self">Self-paced</span>';
      var no = m.id === "pto" ? "PTO" : m.id.split("-")[0];
      return '<div class="mitem ' + cls + '" data-mid="' + esc(m.id) + '"><div class="no">' + esc(no) + "</div>" +
        '<div class="mtxt"><h4>' + esc(m.title) + '</h4><div class="ms">' + esc(m.subtitle) + "</div></div>" +
        '<div class="rt">' + tp + '<span class="status ' + s + '"><span class="dot"></span>' + STATUS_LABEL[s] + "</span></div></div>";
    }).join("");
    app().innerHTML = topbar(whoBar(true)) +
      '<div class="wrap">' +
      '<div class="home-head">' + ringSVG(pct, 96, complete) +
      '<div><div class="eyebrow">' + esc(APP.tagline) + '</div><h1>' + esc(APP.brand) + "</h1>" +
      '<div class="role">Your training classes</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-top:6px">' + done + " of " + MODULES.length + " modules complete" + (complete ? " \u00b7 training complete \u2726" : "") + "</div></div></div>" +
      (complete ? '<div class="banner-info">\u2726 You\u2019ve completed the training \u2014 your manager has been notified.</div>' : "") +
      '<div class="mlist">' + list + "</div>" +
      '<div class="footnote">' + (Cloud.ready() ? "Your progress syncs automatically." : "Progress saves on this device.") + "</div>" +
      "</div>";
    wireSwitch();
    Array.prototype.forEach.call(document.querySelectorAll(".mitem"), function (it) { it.onclick = function () { state.mid = it.getAttribute("data-mid"); state.view = "module"; render(); }; });
  }

  /* ================= PATH (track selection) ================= */
  function renderPath() {
    document.body.className = "";
    var e = state.employee;
    var cards = [1, 2, 3, 4].map(function (lv) {
      var cert = CERTS[lv], pct = levelPct(e.id, lv), unlocked = levelUnlocked(e.id, lv), certified = levelCertified(e.id, lv);
      var cls = certified ? "cert" : (unlocked && pct > 0 ? "open" : (unlocked ? "" : "locked"));
      var st;
      if (!unlocked) st = "Locked \u2014 finish Level " + (lv - 1) + " first";
      else if (certified) st = "Certified \u2726";
      else if (pct === 100) st = "Complete \u2014 ready for sign-off";
      else if (pct > 0) st = "In progress";
      else st = "Ready to start";
      var btn = unlocked
        ? '<button class="btn outline sm" data-lv="' + lv + '">Open track</button>'
        : '<button class="btn outline sm" disabled>Locked</button>';
      return '<div class="track ' + cls + '">' +
        '<span class="lvchip">Level ' + lv + "</span>" +
        '<div class="body">' + ringSVG(pct, 96, certified) +
        '<div class="txt"><h3>' + esc(cert.name) + "\u2122</h3>" +
        '<div class="role">' + esc(cert.role) + "</div>" +
        '<div class="st">' + st + "</div>" + btn + "</div></div></div>";
    }).join("");

    app().innerHTML = topbar(whoBar(true)) +
      '<div class="wrap">' +
      '<div class="center-head"><div class="eyebrow">Four Leveled Certifications</div>' +
      "<h1>Your Leadership Development Path</h1>" +
      "<p>Each certification builds on the one before it. Choose a track to continue.</p><div class=\"rule\"></div></div>" +
      '<div class="tracks">' + cards + "</div>" +
      '<div class="footnote">' + "Progress is saved on this device under your Employee ID.</div>" +
      "</div>";
    wireSwitch();
    Array.prototype.forEach.call(document.querySelectorAll("[data-lv]"), function (b) {
      b.onclick = function () { state.level = parseInt(b.getAttribute("data-lv"), 10); state.view = "track"; render(); };
    });
  }

  /* ================= TRACK (module list) ================= */
  function renderTrack() {
    document.body.className = "";
    var e = state.employee, lv = state.level, cert = CERTS[lv];
    var pct = levelPct(e.id, lv), certified = levelCertified(e.id, lv);
    var mods = levelMods(lv);
    var done = mods.filter(function (m) { var s = statusOf(e.id, m.id); return s === "selfdone" || s === "reviewed"; }).length;

    var list = mods.map(function (m) {
      var s = statusOf(e.id, m.id);
      var cls = s === "reviewed" || s === "selfdone" ? "done" : (s === "inprog" ? "inprog" : "");
      var tp = m.type === "course" ? '<span class="tpill course">Course</span>' : '<span class="tpill self">Self-paced</span>';
      return '<div class="mitem ' + cls + '" data-mid="' + esc(m.id) + '">' +
        '<div class="no">' + esc(m.id) + "</div>" +
        '<div class="mtxt"><h4>' + esc(m.title) + '</h4><div class="ms">' + esc(m.subtitle) + "</div></div>" +
        '<div class="rt">' + tp + '<span class="status ' + s + '"><span class="dot"></span>' + STATUS_LABEL[s] + "</span></div></div>";
    }).join("");

    app().innerHTML = topbar(whoBar(true)) +
      '<div class="wrap">' +
      '<span class="crumb" id="back">\u2190 All tracks</span>' +
      '<div class="trk-head">' + ringSVG(pct, 96, certified) +
      '<div class="meta"><div class="eyebrow">Level ' + lv + " \u00b7 " + esc(cert.theme) + "</div>" +
      "<h1>" + esc(cert.name) + '\u2122</h1><div class="role">' + esc(cert.role) + "</div>" +
      '<div style="font-size:13px;color:var(--muted);margin-top:6px">' + done + " of " + mods.length + " modules complete" + (certified ? " \u00b7 fully certified \u2726" : "") + "</div></div></div>" +
      '<div class="mlist">' + list + "</div>" +
      "</div>";
    byId("back").onclick = function () { state.view = "home"; render(); };
    Array.prototype.forEach.call(document.querySelectorAll(".mitem"), function (it) {
      it.onclick = function () { state.mid = it.getAttribute("data-mid"); state.view = "module"; render(); };
    });
  }

  /* ================= MODULE ================= */
  function renderModule() {
    document.body.className = "";
    var e = state.employee;
    var m = MODULES.filter(function (x) { return x.id === state.mid; })[0];
    state.level = m.level;
    var prog = loadProgress(e.id); prog.lastModule = m.id; saveProgress(e.id, prog);
    var ms = prog.modules[m.id] || (prog.modules[m.id] = {}); if (!ms.answers) ms.answers = {};

    var objectives = "<ul>" + m.objectives.map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("") + "</ul>";
    var coursesHtml = "";
    if (m.courses && m.courses.length) {
      coursesHtml = "<h2>Complete " + (m.courses.length > 1 ? "these courses" : "this course") + " first</h2>" +
        m.courses.map(function (c) {
          return '<div class="course"><div class="cn">' + esc(c.name) + '</div><div class="cc">' + esc(c.covers) + "</div>" +
            '<a class="course-link btn outline sm" href="' + esc(c.url) + '" target="_blank" rel="noopener noreferrer">Open course \u2197</a></div>';
        }).join("") +
        '<p class="course-note">Each course opens in a new tab. When you finish \u2014 even if it only offers a \u201cStart over\u201d button \u2014 just close that tab and come back here to keep going. Your place in this module is saved.</p>';
    }
    var checkHtml = m.check.map(function (qa, i) {
      var saved = ms.answers[i] || {}, rated = saved.rating || "";
      return '<div class="qa" data-qi="' + i + '"><div class="q">' + (i + 1) + ". " + esc(qa.q) + "</div>" +
        '<textarea class="ans" placeholder="Type your answer\u2026">' + esc(saved.text || "") + "</textarea>" +
        '<div class="qa-actions"><span class="rate"><button class="got' + (rated === "got" ? " on" : "") + '">\u2713 Got it</button>' +
        '<button class="rev' + (rated === "review" ? " on" : "") + '">Review again</button></span></div></div>';
    }).join("");

    var reviewedBanner = ms.reviewedAt ? '<div class="banner-info">\u2726 Signed off by ' + esc(ms.reviewedBy || "your manager") + " on " + fmtDate(ms.reviewedAt) + ".</div>" : "";
    var completeBtn = ms.selfPacedAt
      ? '<button class="btn gold sm" id="complete" disabled>\u2713 Self-paced complete \u00b7 ' + fmtDate(ms.selfPacedAt) + "</button>"
      : '<button class="btn sm" id="complete">Mark self-paced complete</button>';

    app().innerHTML = topbar(whoBar(false)) +
      '<div class="wrap">' +
      '<span class="crumb" id="back">\u2190 All modules</span>' +
      reviewedBanner +
      '<div class="mhead"><div class="eyebrow">Module ' + esc(m.id) + "</div><h1>" + esc(m.title) + '</h1><div class="sub">' + esc(m.subtitle) + "</div></div>" +
      '<div class="meta"><span>' + esc(m.audience) + "</span><span>" + esc(m.time) + "</span></div>" +
      '<div class="part-rule"><span class="k">Part 1</span><span class="t">' + (m.type === "course" ? "Courses &amp; Self-Paced" : "Self-Paced Learning") + "</span></div>" +
      '<div class="block"><h2>Why this matters</h2><p>' + esc(m.why) + "</p><h2>Learning objectives</h2>" + objectives + coursesHtml + renderBlocks(m.content) + "</div>" +
      '<div class="part-rule"><span class="k">Apply It</span><span class="t">' + esc(m.scenario.title) + "</span></div>" +
      '<div class="callout"><p>' + esc(m.scenario.text) + "</p></div>" +
      '<div class="qa"><div class="q">' + esc(m.scenario.prompt) + '</div><textarea id="scenario" placeholder="Write your response\u2026">' + esc(ms.scenario || "") + "</textarea></div>" +
      '<div class="part-rule"><span class="k">Check</span><span class="t">Knowledge Check</span></div>' + checkHtml +
      '<div class="savebar">' + completeBtn + '<span class="saved-note" id="savenote">Answers save automatically.</span></div>' +
      '<div class="part-rule"><span class="k">Part 2</span><span class="t">Manager Review &amp; Sign-Off</span></div>' +
      '<div class="panel"><h4>Field application (required for sign-off)</h4><ul class="checklist">' + m.field.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul></div>" +
      '<div class="panel"><h4>Sign-off checklist</h4><ul class="checklist ' + (ms.reviewedAt ? "signed" : "") + '">' + m.signoff.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
      '</ul><p style="font-size:13px;color:var(--muted);margin:8px 0 0">Your manager confirms these during your live review in manager mode.</p></div>' +
      '<div class="footnote">Module ' + esc(m.id) + " \u00b7 " + esc(m.title) + "</div></div>";

    byId("back").onclick = function () { state.view = "home"; render(); };

    // Force external course/resource links into a NEW tab so the module stays open.
    Array.prototype.forEach.call(document.querySelectorAll("a.course-link"), function (a) {
      a.addEventListener("click", function (e) {
        var win = window.open(a.href, "_blank", "noopener");
        if (win) { e.preventDefault(); try { win.opener = null; } catch (err) {} }
        // if a popup was blocked (win is null), the anchor's target=_blank still fires as a fallback
      });
    });
    var savenote = byId("savenote");
    function flash() { savenote.textContent = "Saved \u2713"; setTimeout(function () { savenote.textContent = "Answers save automatically."; }, 1100); }
    byId("scenario").addEventListener("input", function () { var p = loadProgress(e.id); (p.modules[m.id] = p.modules[m.id] || {}).scenario = this.value; saveProgress(e.id, p); flash(); });
    Array.prototype.forEach.call(document.querySelectorAll(".qa[data-qi]"), function (node) {
      var qi = node.getAttribute("data-qi"), ta = node.querySelector(".ans");
      ta.addEventListener("input", function () { var p = loadProgress(e.id); var mm = (p.modules[m.id] = p.modules[m.id] || {}); mm.answers = mm.answers || {}; (mm.answers[qi] = mm.answers[qi] || {}).text = ta.value; saveProgress(e.id, p); flash(); });
      function setRate(r) { var p = loadProgress(e.id); var mm = (p.modules[m.id] = p.modules[m.id] || {}); mm.answers = mm.answers || {}; var cur = (mm.answers[qi] = mm.answers[qi] || {}); cur.rating = (cur.rating === r ? "" : r); saveProgress(e.id, p); node.querySelector(".got").classList.toggle("on", cur.rating === "got"); node.querySelector(".rev").classList.toggle("on", cur.rating === "review"); }
      node.querySelector(".got").addEventListener("click", function () { setRate("got"); });
      node.querySelector(".rev").addEventListener("click", function () { setRate("review"); });
    });
    if (!ms.selfPacedAt) byId("complete").onclick = function () { var p = loadProgress(e.id); (p.modules[m.id] = p.modules[m.id] || {}).selfPacedAt = Date.now(); saveProgress(e.id, p); maybeNotifyComplete(e.id); render(); };
  }

  /* ================= MANAGER MODE ================= */
  function renderManagerList() {
    if (!state.mgrAuthed) { renderManagerAuth(); return; }
    document.body.className = "";
    var cloudy = Cloud.ready();

    var draw = function (loadingNote) {
      var right = '<button class="linkcaps" id="exit">Exit manager mode</button>';
      var users = listUsers();
      var cards = users.length ? users.map(function (u) {
        var pct = overall(u.id);
        var doneTag = isComplete(u.id) ? '<span style="color:var(--sage);font-weight:600"> \u00b7 \u2726 complete</span>' : "";
        return '<div class="emp" data-id="' + esc(u.id) + '"><div class="en">' + esc(u.name) + '</div><div class="ei">ID ' + esc(u.id) + " \u00b7 " + pct + "% complete" + doneTag + '</div><div class="ep"><i style="width:' + pct + '%"></i></div></div>';
      }).join("") : '<p style="color:var(--muted)">' + (loadingNote ? "Loading trainees\u2026" : "No trainees yet. They\u2019ll appear here once they log in and start.") + "</p>";
      var banner = cloudy
        ? '<div class="banner-info">\u2601 Cloud sync is on \u2014 every trainee who logs in appears here automatically, from any device.</div>'
        : '<div class="banner-info">Cloud sync is off, so this shows only trainees who worked on <b>this</b> device. Use <b>Import</b> to review work exported from another device.</div>';
      app().innerHTML = topbar(right) +
        '<div class="wrap">' +
        '<div class="mhead"><div class="eyebrow">Manager Mode</div><h1>Review &amp; Sign-Off</h1><div class="sub">See a trainee\u2019s work, then sign off each module after your live review.</div></div>' +
        banner +
        '<div class="savebar"><button class="btn outline sm" id="lookup">Look up by ID</button>' +
        '<label class="btn outline sm" style="cursor:pointer">Import file<input id="import" type="file" accept="application/json" class="hidden"></label></div>' +
        '<div class="section-title">Trainees</div><div class="mgr-emps">' + cards + "</div></div>";
      syncBadge();
      byId("exit").onclick = function () { state.mgrAuthed = false; state.view = state.employee ? "home" : "login"; render(); };
      byId("lookup").onclick = function () {
        var id = prompt("Enter the trainee\u2019s Employee ID:"); if (!id) return; id = id.trim();
        var go = function () { if (!readJSON(PKEY(id), null)) { alert("No saved work found for ID " + id + "."); return; } state.mgrEmp = id; state.view = "managerEmp"; render(); };
        if (cloudy) { Cloud.pull(id).then(function (r) { if (r) writeJSON(PKEY(id), r); go(); }); } else { go(); }
      };
      byId("import").onchange = function () {
        var f = this.files[0]; if (!f) return; var rd = new FileReader();
        rd.onload = function () { try { var d = JSON.parse(rd.result); if (!d.id || !d.progress) throw 0; writeJSON(PKEY(d.id), d.progress); upsertUser(d.id, d.progress.name || ("Employee " + d.id)); Cloud.push(d.id); state.mgrEmp = d.id; state.view = "managerEmp"; render(); } catch (e) { alert("That file didn\u2019t look like an exported progress file."); } };
        rd.readAsText(f);
      };
      Array.prototype.forEach.call(document.querySelectorAll(".emp"), function (c) { c.onclick = function () { state.mgrEmp = c.getAttribute("data-id"); state.view = "managerEmp"; render(); }; });
    };

    draw(cloudy);
    if (cloudy) {
      Cloud.all().then(function (list) {
        if (list) { list.forEach(function (r) { writeJSON(PKEY(r.id), r); upsertUser(r.id, r.name || ("Employee " + r.id)); }); }
        if (state.view === "manager") draw(false);
      });
    }
  }

  function overall(id) { var d = 0; MODULES.forEach(function (m) { var s = statusOf(id, m.id); if (s === "selfdone" || s === "reviewed") d++; }); return Math.round((d / MODULES.length) * 100); }

  function renderManagerEmployee() {
    if (!state.mgrAuthed) { renderManagerAuth(); return; }
    if (Cloud.ready() && state._meLoaded !== state.mgrEmp) {
      var wantId = state.mgrEmp;
      renderLoading("Loading trainee\u2019s work\u2026");
      Cloud.pull(wantId).then(function (r) { if (r) writeJSON(PKEY(wantId), r); state._meLoaded = wantId; if (state.view === "managerEmp" && state.mgrEmp === wantId) render(); });
      return;
    }
    document.body.className = "";
    var id = state.mgrEmp, prog = loadProgress(id);
    var right = '<button class="linkcaps" id="exit">Exit manager mode</button>';
    var mgrName = readJSON(MGR_KEY, "");

    var rowsHtml = MODULES.map(function (m) {
      var s = statusOf(id, m.id), ms = prog.modules[m.id] || {};
      var ans = '<div class="answers"><div class="ai"><div class="aq">Scenario \u2014 ' + esc(m.scenario.title) + '</div><div class="' + (ms.scenario ? "aa" : "aa empty") + '">' + (ms.scenario ? esc(ms.scenario) : "No response yet") + "</div></div>";
      m.check.forEach(function (qa, i) {
        var a = (ms.answers && ms.answers[i]) || {}, rate = a.rating === "got" ? " \u00b7 self-rated: Got it" : (a.rating === "review" ? " \u00b7 self-rated: Review again" : "");
        ans += '<div class="ai"><div class="aq">' + (i + 1) + ". " + esc(qa.q) + esc(rate) + '</div><div class="' + (a.text ? "aa" : "aa empty") + '">' + (a.text ? esc(a.text) : "No answer") + "</div></div>";
      });
      ans += "</div>";
      var signBtn = ms.reviewedAt ? '<button class="btn gold sm" disabled>\u2726 Signed off ' + fmtDate(ms.reviewedAt) + "</button>" : '<button class="btn sm" data-sign="' + esc(m.id) + '">Mark reviewed &amp; signed off</button>';
      var no = m.id === "pto" ? "PTO" : m.id;
      return '<div class="mrow"><div class="mid"><div class="mt">' + esc(no) + " \u00b7 " + esc(m.title) + '</div><div class="status ' + s + '" style="margin-top:4px"><span class="dot"></span>' + STATUS_LABEL[s] + "</div></div>" +
        '<button class="btn outline sm" data-toggle="' + esc(m.id) + '">View work</button>' + signBtn + "</div>" +
        '<div class="hidden" id="ans-' + esc(m.id) + '">' + ans + "</div>";
    }).join("");
    var byLevel = '<div class="section-title">Modules</div>' + rowsHtml;
    var doneBanner = isComplete(id) ? '<div class="banner-info">\u2726 Training complete' + (prog.completedAt ? " on " + fmtDate(prog.completedAt) : "") + (prog.notifiedComplete ? " \u00b7 completion email sent" : "") + ".</div>" : "";

    app().innerHTML = topbar(right) +
      '<div class="wrap"><span class="crumb" id="back">\u2190 All trainees</span>' +
      '<div class="mhead"><div class="eyebrow">Reviewing</div><h1>' + esc(prog.name || ("Employee " + id)) + '</h1><div class="sub">ID ' + esc(id) + " \u00b7 " + overall(id) + "% complete</div></div>" +
      doneBanner +
      '<div class="field" style="max-width:340px"><label for="mgrname">Your name (for sign-off records)</label><input id="mgrname" value="' + esc(mgrName) + '" placeholder="Manager / GM name"></div>' +
      '<div class="savebar"><button class="btn outline sm" id="export">Export this trainee\u2019s progress</button></div>' + byLevel +
      '<div class="footnote">Sign-offs are recorded with your name and the date' + (Cloud.ready() ? " and synced to the cloud." : ", saved on this device.") + "</div></div>";

    byId("exit").onclick = function () { state.mgrAuthed = false; state._meLoaded = null; state.view = state.employee ? "home" : "login"; render(); };
    byId("back").onclick = function () { state._meLoaded = null; state.view = "manager"; render(); };
    byId("mgrname").addEventListener("input", function () { writeJSON(MGR_KEY, this.value); });
    byId("export").onclick = function () {
      var payload = { id: id, progress: loadProgress(id), exportedAt: Date.now() };
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
      a.download = "pillar8_" + id + "_progress.json"; a.click();
    };
    Array.prototype.forEach.call(document.querySelectorAll("[data-toggle]"), function (btn) {
      btn.onclick = function () { var box = byId("ans-" + btn.getAttribute("data-toggle")); box.classList.toggle("hidden"); btn.textContent = box.classList.contains("hidden") ? "View work" : "Hide work"; };
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-sign]"), function (btn) {
      btn.onclick = function () {
        var mid = btn.getAttribute("data-sign"), nm = (byId("mgrname").value || "").trim();
        if (!nm) { alert("Enter your name first so the sign-off is recorded."); byId("mgrname").focus(); return; }
        if (!confirm("Sign off Module " + mid + " for " + (prog.name || id) + "?")) return;
        var p = loadProgress(id); var mm = (p.modules[mid] = p.modules[mid] || {}); mm.reviewedAt = Date.now(); mm.reviewedBy = nm; if (!mm.selfPacedAt) mm.selfPacedAt = Date.now(); saveProgress(id, p); render();
      };
    });
  }

  /* ================= ROUTER ================= */
  function render() {
    switch (state.view) {
      case "login": renderLogin(); break;
      case "home": renderHome(); break;
      case "path": renderPath(); break;
      case "track": renderTrack(); break;
      case "module": renderModule(); break;
      case "manager": renderManagerList(); break;
      case "managerAuth": renderManagerAuth(); break;
      case "managerEmp": renderManagerEmployee(); break;
      default: renderLogin();
    }
    syncBadge();
    window.scrollTo(0, 0);
  }

  Cloud.init();
  var sid = readJSON(SESSION_KEY, null);
  if (sid) {
    var lp = loadProgress(sid); state.employee = { id: sid, name: lp.name || ("Employee " + sid) }; state.view = "home";
    if (Cloud.ready()) {
      renderLoading("Loading your progress\u2026");
      Cloud.pull(sid).then(function (remote) { var base = chooseNewer(readJSON(PKEY(sid), null), remote); if (base) writeJSON(PKEY(sid), base); render(); });
    } else { render(); }
  } else { render(); }
})();
