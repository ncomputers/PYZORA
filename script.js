(function () {
  "use strict";
  var CAT = window.PYZORA_CATALOGUE || [];
  var BRANDS = window.PYZORA_BRANDS || [];
  var EMAIL = "enquiry@pyzora.com";
  var WA = "919799754730";
  var STORE = "pyzora-enquiry-v1";

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  /* ---------- enquiry basket ---------- */
  var basket = {}; // key -> {name, make, qty}
  try { basket = JSON.parse(localStorage.getItem(STORE) || "{}") || {}; } catch (e) { basket = {}; }
  var save = function () { try { localStorage.setItem(STORE, JSON.stringify(basket)); } catch (e) {} };
  var keyOf = function (n, m) { return n + " | " + m; };
  var total = function () { return Object.keys(basket).length; };

  /* ---------- stats ---------- */
  var itemCount = CAT.reduce(function (a, c) { return a + c.items.length; }, 0);
  var set = function (k, v) { var el = $('[data-stat="' + k + '"]'); if (el) el.textContent = v; };
  set("cats", 10); set("items", itemCount); set("brands", BRANDS.length);
  $("#yr").textContent = new Date().getFullYear();

  /* ---------- brands ---------- */
  $("#brand-list").innerHTML = BRANDS.map(function (b) { return "<li>" + esc(b) + "</li>"; }).join("");

  /* ---------- catalogue ---------- */
  var state = { q: "", cat: "all" };
  var chips = $("#chips");
  chips.innerHTML = '<button class="chip" data-cat="all" aria-pressed="true">All</button>' +
    CAT.map(function (c) { return '<button class="chip" data-cat="' + c.id + '" aria-pressed="false">' + esc(c.name) + "</button>"; }).join("");

  function hl(text, q) {
    var t = esc(text);
    if (!q) return t;
    var re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return t.replace(re, "<mark>$1</mark>");
  }

  function renderCatalogue() {
    var q = state.q.trim().toLowerCase();
    var html = "", shown = 0;
    CAT.forEach(function (c) {
      if (state.cat !== "all" && state.cat !== c.id) return;
      var rows = "";
      c.items.forEach(function (it, i) {
        if (q && (it[0] + " " + it[1] + " " + c.name).toLowerCase().indexOf(q) === -1) return;
        var k = keyOf(it[0], it[1]), on = !!basket[k];
        shown++;
        rows += '<div class="row"><span class="idx">' + (i + 1) + '</span><span class="item">' + hl(it[0], q) + '</span><span class="make">' + hl(it[1], q) + '</span>' +
          '<button class="add' + (on ? " on" : "") + '" data-k="' + esc(k) + '" data-n="' + esc(it[0]) + '" data-m="' + esc(it[1]) + '" aria-pressed="' + on + '">' + (on ? "Added" : "+ Add") + "</button></div>";
      });
      if (rows) html += '<section class="cat"><div class="cat-head"><h3>' + esc(c.name) + "</h3>" + (c.note ? "<small>" + esc(c.note) + "</small>" : "") + "</div>" + rows + "</section>";
    });
    $("#cat-list").innerHTML = html;
    $("#no-results").hidden = shown > 0;
  }

  chips.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.cat = b.dataset.cat;
    $$(".chip", chips).forEach(function (c) { c.setAttribute("aria-pressed", String(c === b)); });
    renderCatalogue();
  });
  $("#q").addEventListener("input", function (e) { state.q = e.target.value; renderCatalogue(); });

  $("#cat-list").addEventListener("click", function (e) {
    var b = e.target.closest(".add"); if (!b) return;
    var k = b.dataset.k;
    if (basket[k]) delete basket[k]; else basket[k] = { name: b.dataset.n, make: b.dataset.m, qty: "" };
    save(); b.classList.toggle("on", !!basket[k]); b.textContent = basket[k] ? "Added" : "+ Add"; b.setAttribute("aria-pressed", String(!!basket[k]));
    renderBasket();
  });

  /* ---------- basket UI ---------- */
  function renderBasket() {
    var keys = Object.keys(basket), n = keys.length;
    $$("[data-enq-count]").forEach(function (el) { el.textContent = n; if (el.classList.contains("count") && el.closest(".btn")) el.hidden = !n; });
    $("#tray").hidden = !n;
    $("#basket-empty").hidden = n > 0;
    $("#basket-list").innerHTML = keys.map(function (k) {
      var it = basket[k];
      return '<li><span>' + esc(it.name) + "<small>" + esc(it.make) + '</small></span><input aria-label="Quantity for ' + esc(it.name) + '" placeholder="Qty" data-q="' + esc(k) + '" value="' + esc(it.qty || "") + '"><button type="button" class="rm" data-rm="' + esc(k) + '" aria-label="Remove ' + esc(it.name) + '">&times;</button></li>';
    }).join("");
    updateWA();
  }
  $("#basket-list").addEventListener("input", function (e) {
    var k = e.target.dataset.q; if (k && basket[k]) { basket[k].qty = e.target.value; save(); updateWA(); }
  });
  $("#basket-list").addEventListener("click", function (e) {
    var k = e.target.dataset.rm; if (!k) return;
    delete basket[k]; save(); renderBasket(); renderCatalogue();
  });
  $("#clear-btn").addEventListener("click", function () { basket = {}; save(); renderBasket(); renderCatalogue(); });

  /* ---------- compose message ---------- */
  var form = $("#enq-form");
  function compose() {
    var f = new FormData(form), L = [];
    L.push("Hello Pyzora Finechem LLP,", "", "I would like a quotation for the following:", "");
    Object.keys(basket).forEach(function (k, i) {
      var it = basket[k];
      L.push((i + 1) + ". " + it.name + " (" + it.make + ")" + (it.qty ? " - Qty: " + it.qty : ""));
    });
    var notes = (f.get("notes") || "").trim();
    if (notes) L.push("", "Other items / notes:", notes);
    L.push("", "Name: " + (f.get("name") || ""));
    if (f.get("company")) L.push("Company: " + f.get("company"));
    if (f.get("phone")) L.push("Phone: " + f.get("phone"));
    if (f.get("email")) L.push("Email: " + f.get("email"));
    return L.join("\n");
  }
  function updateWA() { $("#wa-btn").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(compose()); }
  form.addEventListener("input", updateWA);

  function valid() {
    var name = form.elements.name, ok = true;
    name.classList.toggle("invalid", !name.value.trim());
    if (!name.value.trim()) ok = false;
    if (!total() && !form.elements.notes.value.trim()) { $("#enq-hint").textContent = "Please add items from the catalogue or type your list in the notes box."; ok = false; }
    return ok;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!valid()) return;
    location.href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent("Enquiry for labware / consumables") + "&body=" + encodeURIComponent(compose());
  });
  $("#wa-btn").addEventListener("click", function (e) { if (!valid()) e.preventDefault(); else updateWA(); });

  /* ---------- nav ---------- */
  var tgl = $(".nav-toggle"), nav = $("#nav");
  tgl.addEventListener("click", function () { var o = nav.classList.toggle("open"); tgl.setAttribute("aria-expanded", String(o)); });
  nav.addEventListener("click", function (e) { if (e.target.tagName === "A") { nav.classList.remove("open"); tgl.setAttribute("aria-expanded", "false"); } });

  renderCatalogue();
  renderBasket();
})();
