const $ = s => document.querySelector(s);
const waLink = text => `https://wa.me/${SELLER.whatsapp}?text=${encodeURIComponent(text)}`;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm = s => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
// item name → Number, so a row without a Number still finds its photos
const NUMBER_BY_NAME = Object.fromEntries(FALLBACK.map(r => [norm(r.item), r.number]));

$("#c-name").textContent = SELLER.name;
$("#c-address").textContent = SELLER.address;
$("#c-phone").textContent = "+" + SELLER.whatsapp;
$("#c-wa").href = waLink("Hi Luciano! I saw your moving sale page.");

function parseCSV(text) {
  const rows = []; let row = [], cur = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i+1] === '"') { cur += '"'; i++; } else if (c === '"') q = false; else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && text[i+1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
    else cur += c;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  const head = rows.shift().map(h => norm(h));
  const col = re => head.findIndex(h => re.test(h));
  const idx = { number: col(/^(number|no\b|#|id\b)/), item: col(/^(item|name)/), brand: col(/^brand/), status: col(/^status/), price: col(/^price/), measurements: col(/^measure/), link: col(/^(link|url)/) };
  return rows.filter(r => r.some(x => x.trim())).map(r =>
    Object.fromEntries(Object.entries(idx).map(([k, i]) => [k, i >= 0 ? (r[i] || "").trim() : ""])));
}

const normStatus = s => { s = norm(s); return s.startsWith("sold") ? "Sold" : s.startsWith("res") ? "Reserved" : "Available"; };
const fmtPrice = p => { if (!p) return ""; const n = parseFloat(String(p).replace(/[^\d.]/g, "")); return isNaN(n) ? p : n === 0 ? "Free" : "£" + n.toLocaleString("en-GB"); };

// Main dimensions on the card, everything else under "More details"
function splitMeasurements(m) {
  const parts = String(m || "").split(/,\s*|\n+/).map(s => s.trim()).filter(Boolean);
  const isMain = p => (/^(width|depth|height|length|overall)\b/i.test(p) && !/inside|drawer/i.test(p)) || (!p.includes(":") && /\d\s*\w*\s+x\s+\d/i.test(p));
  const main = parts.filter(isMain), more = parts.filter(p => !isMain(p));
  return { main: main.join(" · "), more };
}

let items = [], lastCSV = "";
function build(rows) {
  return rows.filter(r => r.item).map((r, n) => {
    const num = String(parseInt(r.number, 10) || NUMBER_BY_NAME[norm(r.item)] || "");
    const photos = Array.from({ length: PHOTO_COUNT[num] || 0 }, (_, k) => `img/${num}-${k + 1}.jpg`);
    return { ...r, order: n, photos, link: /^https?:\/\//i.test(r.link || "") ? r.link : LINKS[num], status: normStatus(r.status), ...splitMeasurements(r.measurements) };
  });
}

function gallery(i) {
  if (!i.photos.length) return `<div class="gallery empty"><span class="ph">Photo coming soon</span></div>`;
  const n = i.photos.length;
  return `<div class="gallery" data-photos='${esc(JSON.stringify(i.photos))}'>
    <div class="track">${i.photos.map((src, k) =>
      `<button class="slide" data-k="${k}" aria-label="Open photo ${k + 1} of ${n}"><img src="${src}" alt="" loading="lazy" draggable="false"></button>`).join("")}</div>
    ${n > 1 ? `<button class="g-nav prev" aria-label="Previous photo">‹</button><button class="g-nav next" aria-label="Next photo">›</button>
    ${n <= 8 ? `<div class="dots">${i.photos.map((_, k) => `<span class="${k ? "" : "on"}"></span>`).join("")}</div>` : ""}
    <span class="g-count">1/${n}</span>` : ""}
  </div>`;
}

// current slide of a horizontally scrolling track
const slideIndex = t => Math.round(t.scrollLeft / t.clientWidth);
const goTo = (t, k) => t.scrollTo({ left: k * t.clientWidth, behavior: "smooth" });

function initGallery(g) {
  const t = g.querySelector(".track"); if (!t) return;
  const photos = JSON.parse(g.dataset.photos), n = photos.length;
  const update = () => {
    const k = slideIndex(t);
    g.querySelectorAll(".dots span").forEach((d, j) => d.classList.toggle("on", j === k));
    const c = g.querySelector(".g-count"); if (c) c.textContent = `${k + 1}/${n}`;
  };
  t.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
  g.querySelector(".prev")?.addEventListener("click", () => goTo(t, (slideIndex(t) - 1 + n) % n));
  g.querySelector(".next")?.addEventListener("click", () => goTo(t, (slideIndex(t) + 1) % n));
  t.addEventListener("click", e => { const s = e.target.closest(".slide"); if (s) openLightbox(photos, +s.dataset.k); });
}

// full-screen carousel
const lb = $("#lightbox"), lbTrack = lb.querySelector(".lb-track");
let lbN = 0;
function lbUpdate() {
  const k = slideIndex(lbTrack);
  lb.querySelector(".lb-count").textContent = lbN > 1 ? `${k + 1} / ${lbN}` : "";
}
function openLightbox(photos, k) {
  lbN = photos.length;
  lbTrack.innerHTML = photos.map(src => `<div class="lb-slide"><img src="${src}" alt=""></div>`).join("");
  lb.classList.toggle("single", lbN < 2);
  lb.hidden = false; document.body.style.overflow = "hidden";
  lbTrack.scrollLeft = k * lbTrack.clientWidth; lbUpdate();
}
function closeLightbox() { lb.hidden = true; document.body.style.overflow = ""; }
lbTrack.addEventListener("scroll", () => requestAnimationFrame(lbUpdate), { passive: true });
lb.querySelector(".lb-close").addEventListener("click", closeLightbox);
lb.querySelector(".prev").addEventListener("click", () => goTo(lbTrack, (slideIndex(lbTrack) - 1 + lbN) % lbN));
lb.querySelector(".next").addEventListener("click", () => goTo(lbTrack, (slideIndex(lbTrack) + 1) % lbN));
lbTrack.addEventListener("click", e => { if (!e.target.closest("img")) closeLightbox(); });
document.addEventListener("keydown", e => {
  if (lb.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") lb.querySelector(".prev").click();
  if (e.key === "ArrowRight") lb.querySelector(".next").click();
});

function render() {
  const hide = $("#hide-sold").checked;
  const rank = { Available: 0, Reserved: 1, Sold: 2 };
  const list = items.slice().sort((a, b) => rank[a.status] - rank[b.status] || a.order - b.order);
  $("#count").textContent = `${items.filter(i => i.status !== "Sold").length} of ${items.length} still available`;
  $("#list").innerHTML = list.filter(i => !(hide && i.status === "Sold")).map(i => {
    return `
    <li class="item ${i.status === "Sold" ? "sold" : ""}">
      ${gallery(i)}
      <div class="info">
        <div class="name">${esc(i.item)}</div>
        ${i.brand ? `<div class="brand">${esc(i.brand)}</div>` : ""}
        ${i.main ? `<div class="meas">${esc(i.main)}</div>` : ""}
        ${i.more.length ? `<details class="more"><summary>More details</summary><ul>${i.more.map(m => `<li>${esc(m)}</li>`).join("")}</ul></details>` : ""}
        <div class="meta">
          <span class="price">${i.price ? esc(fmtPrice(i.price)) : `<span class="askprice">Ask for price</span>`}</span>
          <span class="badge ${i.status}">${i.status}</span>
        </div>
        <div class="links">
          ${i.status !== "Sold" ? `<a class="ask" href="${waLink(`Hi Luciano! Is the "${i.item}" still available?`)}">Ask on WhatsApp ›</a>` : ""}
          ${i.link ? `<a class="ref" href="${esc(i.link)}" target="_blank" rel="noopener">Product info ›</a>` : ""}
        </div>
      </div>
    </li>`;
  }).join("");
  document.querySelectorAll(".gallery").forEach(initGallery);
}

async function load() {
  try {
    const res = await fetch(SHEET_CSV_URL + "&t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const text = await res.text();
    if (text === lastCSV) return;          // nothing changed: keep carousels where they are
    lastCSV = text;
    const rows = parseCSV(text);
    if (!rows.length) throw new Error("empty");
    items = build(rows);
    $("#notice").hidden = true;
  } catch (e) {
    if (!items.length) items = build(FALLBACK);
    $("#notice").textContent = "Couldn't load the latest availability — some items may already be sold. Message me to check.";
    $("#notice").hidden = false;
  }
  render();
}

$("#hide-sold").addEventListener("change", render);
load();
setInterval(load, 60000);
