/* =========================================================
   PRODUCT VARIANT
========================================================= */

export type ProductVariant = {
  id: string;

  /**
   * Color name
   * Example: Blue, Pink, Green
   */
  color: string;

  /**
   * Images belonging to this color
   */
  images: string[];

  /**
   * Optional product demo video
   */
  video?: string;

  /**
   * Stock available for this color
   */
  stock: number;
};

/* =========================================================
   PRODUCT
========================================================= */

export type Product = {
  _id?: string;

  /**
   * Product name
   */
  name: string;

  /**
   * URL slug
   */
  slug: string;

  /**
   * One product can belong to multiple categories.
   *
   * Example:
   * [
   *   "Baby & Toddler Toys",
   *   "Musical & Dancing Toys"
   * ]
   */
  categories: string[];

  /**
   * Product description
   */
  description: string;

  /**
   * Product features
   */
  features: string[];

  /**
   * Regular/original price
   */
  regularPrice: number;

  /**
   * Optional discounted price
   */
  offerPrice?: number;

  /**
   * Total product stock.
   *
   * If variants exist, this should be calculated
   * from the variant stocks.
   */
  stock: number;

  /**
   * Recommended age
   */
  ageRange?: string;

  /**
   * Main/default product images
   */
  images: string[];

  /**
   * Different color variants
   */
  variants?: ProductVariant[];

  /* =====================================================
     PRODUCT TAGS / HOMEPAGE FLAGS
  ===================================================== */

  /**
   * Product has an active offer
   */
  offer?: boolean;

  /**
   * Show as New Arrival
   */
  newArrival?: boolean;

  /**
   * Show in Best Sellers section
   */
  bestSeller?: boolean;

  /**
   * Show as Featured Product
   */
  featured?: boolean;

  /* =====================================================
     TIMESTAMPS
  ===================================================== */

  createdAt?: string;

  updatedAt?: string;
};

/* =========================================================
   CART ITEM
========================================================= */

export type CartItem = Product & {
  /**
   * Cart item always has an ID
   */
  _id: string;

  /**
   * Quantity selected by customer
   */
  quantity: number;

  /**
   * Selected color variant ID
   */
  variantId?: string;

  /**
   * Selected color name
   */
  variantColor?: string;

  /**
   * Selected variant image
   */
  variantImage?: string;
};
