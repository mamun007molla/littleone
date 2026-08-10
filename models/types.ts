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

  name: string;

  slug: string;

  category: string;

  description: string;

  features: string[];

  regularPrice: number;

  offerPrice?: number;

  /**
   * Total stock.
   *
   * If variants exist, this is automatically
   * calculated from all variant stocks.
   */
  stock: number;

  ageRange?: string;

  /**
   * Main/default product images
   */
  images: string[];

  /**
   * Different color variants
   */
  variants?: ProductVariant[];

  featured?: boolean;

  createdAt?: string;

  updatedAt?: string;
};

/* =========================================================
   CART ITEM
========================================================= */

export type CartItem = Product & {
  _id: string;

  quantity: number;

  /**
   * Selected color variant
   */
  variantId?: string;

  /**
   * Selected color name
   */
  variantColor?: string;

  /**
   * Image of selected variant
   */
  variantImage?: string;
};
