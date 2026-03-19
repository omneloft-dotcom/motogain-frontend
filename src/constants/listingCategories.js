export const LOCKED_PARENT_CATEGORY = "Taşıtlar";

export const PARENT_CATEGORY_OPTIONS = [
  { value: LOCKED_PARENT_CATEGORY, label: `${LOCKED_PARENT_CATEGORY} (Kilitli)`, disabled: true },
  { value: "Ekipman", label: "Ekipman", disabled: false },
  { value: "Yedek Parça", label: "Yedek Parça", disabled: false },
  { value: "Aksesuar", label: "Aksesuar", disabled: false },
];

export const isLockedParentCategory = (value) => value === LOCKED_PARENT_CATEGORY;

export const sanitizeUnlockedParentCategory = (value) =>
  isLockedParentCategory(value) ? "" : value || "";