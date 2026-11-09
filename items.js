// ─── EDIT ME ────────────────────────────────────────────────
const SELLER = {
  name: "Luciano",
  address: "10 Garrick Close, W5 1AS",
  whatsapp: "447453784833",   // international format, digits only
};

// Live data: the Google Sheet (must be shared as "Anyone with the link – Viewer").
// Columns: Item | Brand | Status | Price (£) | Measurements
const SHEET_ID = "1Ima1cT66dk5cUmO0NLK3YD-jKEIY4ZmHMxxWyUTXecM";
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Photos + product link for each item (matched to the sheet by item name).
// Photos live in /img, named <item number>-<photo number>.jpg, e.g. "5-1.jpg", "5-2.jpg".
// The first photo is the main one shown on the card.
const EXTRAS = {
  "Black floor lamp with uplighter and reading light": { photos: [], link: "https://www.ikea.com/nl/en/p/tagarp-floor-uplighter-reading-lamp-black-white-40486387/" },
  "Black coffee table with bottom shelf":              { photos: [], link: "https://www.ikea.com/gb/en/p/lack-tv-bench-white-00625521/" },
  "Grey and white ergonomic office chair":             { photos: [], link: "https://www.amazon.co.uk/dp/B0BLNW3P7M" },
  "Grey desk with white legs":                         { photos: [], link: "https://www.ikea.com/gb/en/p/lagkapten-adils-desk-white-stained-oak-effect-white-s79416874/" },
  "Burgundy 2-drawer chest":                           { photos: ["5-1.jpg"], link: "https://www.ikea.com/gb/en/p/malm-chest-of-2-drawers-high-gloss-white-50336552/" },
  "Light wood slatted shelving unit":                  { photos: [], link: "https://www.ikea.com/gb/en/p/ragrund-shelving-unit-bamboo-80549420/" },
  "Black 8-cube shelving unit":                        { photos: [], link: "https://www.ikea.com/gb/en/p/kallax-shelving-unit-black-brown-20275885/" },
  "Light wood desk with white legs":                   { photos: [], link: "https://www.ikea.com/gb/en/p/lagkapten-adils-desk-white-stained-oak-effect-white-s79416874/" },
  "Black JVC TV (including Amazon Fire TV Stick)":     { photos: [] },
  "Black TV stand with silver handles":                { photos: [] },
  "Beige rectangular storage box":                     { photos: [] },
  "White swivel office chair with black base":         { photos: [], link: "https://www.ikea.com/gb/en/p/loberget-malskaer-swivel-chair-white-black-s29488571/" },
};

// Backup copy of the sheet (used only if the sheet can't be reached).
const FALLBACK = [
  ["Black floor lamp with uplighter and reading light","IKEA","Available","8","Base diameter: 21 cm, Cord length: 100 cm, Height: 178 cm, Shade diameter: 24 cm"],
  ["Black coffee table with bottom shelf","IKEA","Available","7","Width: 90 cm, Depth: 36 cm, Height: 45 cm, Max. TV weight: 10 kg, Max. load/shelf: 14 kg"],
  ["Grey and white ergonomic office chair","Holludle - Amazon","Available","30","65D x 65W x 106.7H centimetres"],
  ["White swivel office chair with black base","IKEA","Available","12","Width: 67 cm, Depth: 67 cm, Height: 90 cm, Seat width: 40 cm, Seat depth: 43 cm"],
  ["Grey desk with white legs","IKEA","Available","12","Max. load: 50 kg, Length: 120 cm, Width: 60 cm, Height: 73 cm"],
  ["Light wood desk with white legs","IKEA","Available","12","Max. load: 50 kg, Length: 120 cm, Width: 60 cm, Height: 73 cm"],
  ["Burgundy 2-drawer chest","IKEA","Available","30","Depth: 50 cm, Depth of drawer (inside): 40 cm, Height: 53 cm, Height of drawer (inside): 16 cm, Width: 40 cm, Width of drawer (inside): 31 cm"],
  ["Light wood slatted shelving unit","IKEA","Available","12","Depth: 37 cm, Height: 104 cm, Width: 37 cm"],
  ["Black 8-cube shelving unit","IKEA","Available","17","Width: 76.5 cm, Depth: 39 cm, Height: 146.5 cm, Max. load/shelf: 13 kg"],
  ["Black JVC TV (including Amazon Fire TV Stick)","JVC","Available","",""],
  ["Black TV stand with silver handles","Lassic","Available","20","Overall dimensions: 38cm (H) x 120cm (W) x 40cm (D), Glass shelf width: 38cm, Inside door: 31.5cm (H) x 36.5cm (W), Glass shelf top and bottom height: 15cm, Handle: 18cm x 2.5cm"],
  ["Beige rectangular storage box","Lassic","Available","7",""],
].map(([item, brand, status, price, measurements]) => ({ item, brand, status, price, measurements }));
