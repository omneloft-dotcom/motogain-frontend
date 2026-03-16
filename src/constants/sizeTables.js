// Standardized size tables for equipment listings (frontend only copy of backend rules).
export const SIZE_CATEGORY_MAP = {
  "Kask": { table: "HELMET", sizeType: "HELMET_SIZE", defaultGender: "UNISEX", defaultSystem: "CM" },
  "Mont": { table: "CLOTHING_TOP", sizeType: "CLOTHING_SIZE", defaultGender: "MALE", defaultSystem: "EU" },
  "Ceket": { table: "CLOTHING_TOP", sizeType: "CLOTHING_SIZE", defaultGender: "MALE", defaultSystem: "EU" },
  "Tulum": { table: "CLOTHING_TOP", sizeType: "CLOTHING_SIZE", defaultGender: "UNISEX", defaultSystem: "EU" },
  "Yağmurluk": { table: "CLOTHING_TOP", sizeType: "CLOTHING_SIZE", defaultGender: "UNISEX", defaultSystem: "EU" },
  "Sweatshirt": { table: "CLOTHING_TOP", sizeType: "CLOTHING_SIZE", defaultGender: "UNISEX", defaultSystem: "EU" },
  "Tişört": { table: "CLOTHING_TOP", sizeType: "CLOTHING_SIZE", defaultGender: "UNISEX", defaultSystem: "EU" },
  "Pantolon": { table: "CLOTHING_PANT", sizeType: "CLOTHING_SIZE", defaultGender: "MALE", defaultSystem: "EU" },
  "Ayakkabı & Bot": { table: "SHOE", sizeType: "SHOE_SIZE", defaultGender: "MALE", defaultSystem: "EU" },
  "Eldiven": { table: "GLOVE", sizeType: "GLOVE_SIZE", defaultGender: "UNISEX", defaultSystem: "CM" },
};

export const SIZE_TABLES = {
  HELMET: {
    systems: ["CM", "EU", "US"],
    options: [
      { key: "XS", cm: "53-54", eu: "53-54", us: "6 1/2 - 6 3/4", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "S", cm: "55-56", eu: "55-56", us: "6 7/8 - 7", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "M", cm: "57-58", eu: "57-58", us: "7 1/8 - 7 1/4", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "L", cm: "59-60", eu: "59-60", us: "7 3/8 - 7 1/2", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "XL", cm: "61-62", eu: "61-62", us: "7 5/8 - 7 3/4", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "XXL", cm: "63-64", eu: "63-64", us: "7 7/8 - 8", genders: ["UNISEX", "MALE", "FEMALE"] },
    ],
  },
  CLOTHING_TOP: {
    systems: ["EU", "US", "CM"],
    options: [
      { key: "XS", eu: "44 / 32-34", us: "34 / 2-4", cm: "84-89 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "S", eu: "46 / 36", us: "36 / 6", cm: "89-94 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "M", eu: "48-50 / 38-40", us: "38-40 / 8-10", cm: "94-102 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "L", eu: "52-54 / 42-44", us: "42-44 / 12-14", cm: "102-110 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "XL", eu: "56 / 46-48", us: "46-48 / 16-18", cm: "110-116 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "XXL", eu: "58 / 50", us: "50 / 20", cm: "116-122 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "3XL", eu: "60 / 52", us: "52 / 22", cm: "122-128 göğüs", genders: ["MALE", "FEMALE", "UNISEX"] },
    ],
  },
  CLOTHING_PANT: {
    systems: ["EU", "US", "CM"],
    options: [
      { key: "28–30", eu: "44", us: "28-29", cm: "71-76 bel", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "30–32", eu: "46", us: "30-31", cm: "76-81 bel", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "32–34", eu: "48", us: "32-33", cm: "81-86 bel", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "34–36", eu: "50", us: "34-35", cm: "86-91 bel", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "36–38", eu: "52", us: "36-38", cm: "91-97 bel", genders: ["MALE", "FEMALE", "UNISEX"] },
    ],
  },
  SHOE: {
    systems: ["EU", "US", "CM"],
    options: [
      { key: "38–39", eu: "38-39", us: "6-7", cm: "24-25", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "40", eu: "40", us: "7-7.5", cm: "25", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "41", eu: "41", us: "8", cm: "26", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "42", eu: "42", us: "8.5-9", cm: "27", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "43", eu: "43", us: "9.5-10", cm: "27.5", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "44", eu: "44", us: "10-10.5", cm: "28", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "45", eu: "45", us: "11-11.5", cm: "29", genders: ["MALE", "FEMALE", "UNISEX"] },
      { key: "46", eu: "46", us: "12", cm: "29.5", genders: ["MALE", "FEMALE", "UNISEX"] },
    ],
  },
  GLOVE: {
    systems: ["CM", "EU", "US"],
    options: [
      { key: "XS", cm: "17-18 çevre", eu: "6", us: "XS", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "S", cm: "18-19 çevre", eu: "7", us: "S", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "M", cm: "19-21 çevre", eu: "8", us: "M", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "L", cm: "21-23 çevre", eu: "9", us: "L", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "XL", cm: "23-24 çevre", eu: "10", us: "XL", genders: ["UNISEX", "MALE", "FEMALE"] },
      { key: "XXL", cm: "24-25 çevre", eu: "11", us: "XXL", genders: ["UNISEX", "MALE", "FEMALE"] },
    ],
  },
};

export const normalizeGender = (gender, fallback) =>
  (gender || fallback || "UNISEX").toString().trim().toUpperCase();

export const normalizeSystem = (system, fallback) =>
  (system || fallback || "EU").toString().trim().toUpperCase();

export const getDefaultSizeMetaForCategory = (category) => {
  const map = SIZE_CATEGORY_MAP[category] || {};
  return {
    sizeType: map.sizeType || "",
    sizeGender: map.defaultGender || "UNISEX",
    sizeSystem: map.defaultSystem || "EU",
    systems: SIZE_TABLES[map.table]?.systems || ["EU", "US", "CM"],
  };
};

export const getSizeOptions = (category, gender, system) => {
  const map = SIZE_CATEGORY_MAP[category];
  if (!map) return [];

  const normalizedGender = normalizeGender(gender, map.defaultGender);
  const normalizedSystem = normalizeSystem(system, map.defaultSystem);
  const options = SIZE_TABLES[map.table]?.options || [];
  const filtered = options.filter((opt) => !opt.genders || opt.genders.includes(normalizedGender));

  return filtered.map((opt) => ({
    value: opt.key,
    label: buildLabel(opt, normalizedSystem),
    meta: opt,
  }));
};

const buildLabel = (opt, system) => {
  const parts = [];
  if (system === "CM" && opt.cm) parts.push(opt.cm + " cm");
  if (system === "EU" && opt.eu) parts.push(`EU ${opt.eu}`);
  if (system === "US" && opt.us) parts.push(`US ${opt.us}`);

  const conversions = [];
  if (opt.eu && system !== "EU") conversions.push(`EU ${opt.eu}`);
  if (opt.us && system !== "US") conversions.push(`US ${opt.us}`);
  if (opt.cm && system !== "CM") conversions.push(`${opt.cm} cm`);

  const main = parts.length ? parts.join(" / ") : opt.key;
  const trail = conversions.length ? ` (${conversions.join(" • ")})` : "";
  return `${opt.key} — ${main}${trail}`;
};




