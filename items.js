// ─── EDIT ME ────────────────────────────────────────────────
const SELLER = {
  name: "Luciano",
  address: "10 Garrick Close, W5 1AS",
  whatsapp: "447453784833",   // international format, digits only
};

// Live data: the Google Sheet (must be shared as "Anyone with the link – Viewer").
// Columns (any order): Number | Item | Brand | Price (£) | Status | Measurements | Link
// Status = Available / Reserved / Sold. A missing or empty Status counts as Available.
const SHEET_ID = "1rwFktQ5MbJJsvmz9ec1CcOi3xUeqAPHexFeGnWfTEV0";
const SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv`;

// Photos per item, keyed by the sheet's Number column.
// Files live in /img as <number>-<photo>.jpg (photo 1 is the main one on the card).
const PHOTO_COUNT = { 1: 4, 2: 5, 3: 6, 4: 3, 5: 1, 6: 4, 7: 6, 8: 3, 9: 6, 10: 9, 11: 7, 12: 7, 13: 13 };

// Backup product links, keyed by Number. A link in the sheet's Link column takes priority.
const LINKS = {
  1: "https://www.ikea.com/nl/en/p/tagarp-floor-uplighter-reading-lamp-black-white-40486387/",
  2: "https://www.ikea.com/gb/en/p/lack-tv-bench-white-00625521/",
  3: "https://www.amazon.co.uk/dp/B0BLNW3P7M",
  4: "https://www.ikea.com/gb/en/p/loberget-malskaer-swivel-chair-white-black-s29488571/",
  5: "https://www.ikea.com/gb/en/p/lagkapten-adils-desk-white-stained-oak-effect-white-s79416874/",
  6: "https://www.ikea.com/gb/en/p/lagkapten-adils-desk-white-stained-oak-effect-white-s79416874/",
  7: "https://www.ikea.com/gb/en/p/malm-chest-of-2-drawers-white-90625319/",
  8: "https://www.ikea.com/gb/en/p/ragrund-shelving-unit-bamboo-80549420/",
  9: "https://www.ikea.com/gb/en/p/kallax-shelving-unit-black-brown-20275885/",
  13: "https://www.amazon.co.uk/s?k=elephas+home+projector+bl108&rh=n%3A10392531&ref=nb_sb_noss",
};

// Backup copy of the sheet (used only if the sheet can't be reached).
const FALLBACK = [
  [1, "Black floor lamp with uplighter and reading light", "IKEA", "8", "Base diameter: 21 cm, Cord length: 100 cm, Height: 178 cm, Shade diameter: 24 cm"],
  [2, "Black coffee table with bottom shelf", "IKEA", "7", "Width: 90 cm, Depth: 36 cm, Height: 45 cm, Max. TV weight: 10 kg, Max. load/shelf: 14 kg"],
  [3, "Grey and white ergonomic office chair", "Holludle - Amazon", "30", "65D x 65W x 106.7H centimetres"],
  [4, "White swivel office chair with black base", "IKEA", "12", "Width: 67 cm, Depth: 67 cm, Height: 90 cm, Seat width: 40 cm, Seat depth: 43 cm"],
  [5, "Grey desk with white legs", "IKEA", "12", "Max. load: 50 kg, Length: 120 cm, Width: 60 cm, Height: 73 cm"],
  [6, "Light wood desk with white legs", "IKEA", "12", "Max. load: 50 kg, Length: 120 cm, Width: 60 cm, Height: 73 cm"],
  [7, "2x Burgundy 2-drawer chest", "IKEA", "30", "Depth: 50 cm, Depth of drawer (inside): 40 cm, Height: 53 cm, Height of drawer (inside): 16 cm, Width: 40 cm, Width of drawer (inside): 31 cm"],
  [8, "Light wood slatted shelving unit", "IKEA", "12", "Depth: 37 cm, Height: 104 cm, Width: 37 cm"],
  [9, "Black 8-cube shelving unit (cubes included)", "IKEA", "20", "Width: 76.5 cm, Depth: 39 cm, Height: 146.5 cm, Max. load/shelf: 13 kg"],
  [10, "Black JVC TV (including Amazon Fire TV Stick)", "JVC", "50", ""],
  [11, "Black TV stand with silver handles", "Lassic", "20", "120cm Unit (Regular and LED)\nOverall dimensions: 38cm (H) x 120cm (W) x 40cm (D)\nGlass shelf width: 38cm\nInside door: 31.5cm (H) x 36.5cm (W)\nGlass shelf top and bottom height: 15cm\nHandle: 18cm x 2.5cm"],
  [12, "Beige rectangular storage box", "Lassic", "7", ""],
  [13, "Projector Full HD 1080P complete set", "Elephas", "27", ""],
].map(([number, item, brand, price, measurements]) => ({ number: String(number), item, brand, price, measurements, status: "" }));
