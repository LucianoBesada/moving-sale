const $ = s => document.querySelector(s);
const waLink = text => `https://wa.me/${SELLER.whatsapp}?text=${encodeURIComponent(text)}`;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const norm = s => String(s || "").toLowerCase().replace(/\s+/g, " ").trim();
const EXTRA_BY_NAME = Object.fromEntries(Object.entries(EXTRAS).map(([k, v]) => [norm(k), v]));

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
  const idx = { item: col(/^(item|name)/), brand: col(/^brand/), status: col(/^status/), price: col(/^price/), measurements: col(/^measure/) };
  return rows.filter(r => r.some(x => x.trim())).map(r =>
    Object.fromEntries(Object.entries(idx).map(([k, i]) => [k, i >= 0 ? (r[i] || "").trim() : ""])));
}

const normStatus = s => { s = norm(s); return s.startsWith("sold") ? "Sold" : s.startsWith("res") ? "Reserved" : "Available"; };
const fmtPrice = p => { if (!p) return ""; const n = parseFloat(String(p).replace(/[^\d.]/g, "")); return isNaN(n) ? p : n === 0 ? "Free" : "£" + n.toLocaleString("en-GB"); };

// Main dimensions on the card, everything else under "More details"
function splitMeasurements(m) {
  const parts = String(m || "").split(/,\s*/).map(s => s.trim()).filter(Boolean);
  const isMain = p => (/^(width|depth|height|length|overall)\b/i.test(p) && !/inside|drawer/i.test(p)) || !p.includes(":");
  const main = parts.filter(isMain), more = parts.filter(p => !isMain(p));
  return { main: main.join(" · "), more };
}

let items = [];
function build(rows) {
  return rows.filter(r => r.item).map((r, n) => {
    const x = EXTRA_BY_NAME[norm(r.item)] || {};
    return { ...r, order: n, photo: x.photo, link: x.link, status: normStatus(r.status), ...splitMeasurements(r.measurements) };
  });
}

function render() {
  const hide = $("#hide-sold").checked;
  const rank = { Available: 0, Reserved: 1, Sold: 2 };
  const list = items.slice().sort((a, b) => rank[a.status] - rank[b.status] || a.order - b.order);
  $("#count").textContent = `${items.filter(i => i.status !== "Sold").length} of ${items.length} still available`;
  $("#list").innerHTML = list.filter(i => !(hide && i.status === "Sold")).map(i => {
    const img = i.photo ? `img/${i.photo}.jpg` : "";
    return `
    <li class="item ${i.status === "Sold" ? "sold" : ""}">
      <button class="photo" data-img="${img}" style="${img ? `background-image:url('${img}')` : ""}" aria-label="Enlarge photo"><span class="ph">Photo coming soon</span></button>
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
  document.querySelectorAll(".photo").forEach(b => {
    if (!b.dataset.img) return;
    const im = new Image(); im.onload = () => b.querySelector(".ph")?.remove(); im.onerror = () => b.style.backgroundImage = ""; im.src = b.dataset.img;
  });
}

async function load() {
  try {
    const res = await fetch(SHEET_CSV_URL + "&t=" + Date.now(), { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    const rows = parseCSV(await res.text());
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
$("#list").addEventListener("click", e => { const b = e.target.closest(".photo"); if (!b || !b.dataset.img || b.querySelector(".ph")) return; $("#lightbox img").src = b.dataset.img; $("#lightbox").hidden = false; });
$("#lightbox").addEventListener("click", () => $("#lightbox").hidden = true);
load();
setInterval(load, 60000);
