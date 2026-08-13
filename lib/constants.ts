/* =========================================================
   BRAND
========================================================= */

export const BRAND = {
  name: "Little One Outlet",

  color: "#3742fa",

  tagline: "Trusted by Parents, Loved by Little Ones",

  email: "",

  whatsapp: "8801577000807",

  facebook: "https://www.facebook.com/profile.php?id=61582268844385",

  instagram: "https://www.instagram.com/little_one_outlet_/",

  delivery: {
    insideDhaka: 80,

    outsideDhaka: 130,

    eta: "3–5 working days",
  },
};

/* =========================================================
   PRODUCT CATEGORIES
========================================================= */

export const CATEGORIES = [
  "Baby & Toddler Toys",
  "Educational & Learning",
  "Musical & Dancing Toys",
  "Bath Toys",
  "Creative & Activity Toys",
  "Sensory & Fidget Toys",
  "Outdoor & Active Play",
  "Pretend Play",
  "Gift Sets & Combos",
] as const;

/* =========================================================
   PRODUCT TAGS
========================================================= */

export const PRODUCT_TAGS = [
  "Offer",
  "New Arrival",
  "Best Seller",
  "Featured",
] as const;

/* =========================================================
   DELIVERY
========================================================= */

export const DELIVERY_CHARGE = {
  insideDhaka: 80,
  outsideDhaka: 130,
};

/* =========================================================
   PRODUCT TAG LABELS
========================================================= */

export const PRODUCT_TAG_LABELS = {
  offer: "Offer",
  newArrival: "New Arrival",
  bestSeller: "Best Seller",
  featured: "Featured",
} as const;
