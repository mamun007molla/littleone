import Link from "next/link";
import { Search, SlidersHorizontal, PackageOpen } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/mongodb";
import { Product } from "@/models/types";
import { CATEGORIES } from "@/lib/constants";

/* =========================================================
   SEARCH PARAMS
========================================================= */

type SearchParams = {
  category?: string;
  q?: string;

  offer?: string;
  newArrival?: string;
  bestSeller?: string;

  sort?: string;
};

/* =========================================================
   SORT OPTIONS
========================================================= */

type SortOption =
  | "random"
  | "newest"
  | "price-low"
  | "price-high"
  | "best-seller"
  | "new-arrival"
  | "offer";

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
}[] = [
  {
    value: "random",
    label: "Recommended",
  },
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "price-low",
    label: "Price: Low to High",
  },
  {
    value: "price-high",
    label: "Price: High to Low",
  },
  {
    value: "best-seller",
    label: "Best Sellers",
  },
  {
    value: "new-arrival",
    label: "New Arrivals",
  },
  {
    value: "offer",
    label: "Offers",
  },
];

/* =========================================================
   VALIDATE SORT
========================================================= */

function getSortOption(value?: string): SortOption {
  const allowed: SortOption[] = [
    "random",
    "newest",
    "price-low",
    "price-high",
    "best-seller",
    "new-arrival",
    "offer",
  ];

  if (value && allowed.includes(value as SortOption)) {
    return value as SortOption;
  }

  return "random";
}

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(product: any): Product {
  const categories = Array.isArray(product?.categories)
    ? product.categories
        .map((category: any) => String(category || "").trim())
        .filter(Boolean)
    : typeof product?.category === "string" && product.category.trim()
      ? [product.category.trim()]
      : [];

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  const variantStock = variants.reduce(
    (total: number, variant: any) => total + Number(variant?.stock || 0),
    0,
  );

  return {
    ...product,

    _id: product?._id?.toString(),

    categories,

    stock: variants.length > 0 ? variantStock : Number(product?.stock || 0),

    offer: Boolean(product?.offer),

    newArrival: Boolean(product?.newArrival),

    bestSeller: Boolean(product?.bestSeller),

    featured: Boolean(product?.featured),

    createdAt:
      product?.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product?.createdAt,

    updatedAt:
      product?.updatedAt instanceof Date
        ? product.updatedAt.toISOString()
        : product?.updatedAt,
  } as Product;
}

/* =========================================================
   EFFECTIVE PRICE
========================================================= */

function getEffectivePrice(product: any): number {
  const regularPrice = Number(product?.regularPrice || 0);

  const offerPrice =
    product?.offerPrice !== undefined && product?.offerPrice !== null
      ? Number(product.offerPrice)
      : null;

  if (offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice) {
    return offerPrice;
  }

  return regularPrice;
}

/* =========================================================
   GET PRODUCTS
========================================================= */

async function getProducts(params: SearchParams): Promise<Product[]> {
  try {
    const d = await db();

    const conditions: Record<string, any>[] = [];

    /* =====================================================
       CATEGORY FILTER
    ===================================================== */

    if (params.category?.trim()) {
      conditions.push({
        $or: [
          {
            categories: params.category.trim(),
          },

          {
            category: params.category.trim(),
          },
        ],
      });
    }

    /* =====================================================
       OFFER FILTER
    ===================================================== */

    if (params.offer === "true") {
      conditions.push({
        $or: [
          {
            offer: true,
          },

          {
            offerPrice: {
              $exists: true,
              $ne: null,
            },
          },
        ],
      });
    }

    /* =====================================================
       NEW ARRIVAL FILTER
    ===================================================== */

    if (params.newArrival === "true") {
      conditions.push({
        newArrival: true,
      });
    }

    /* =====================================================
       BEST SELLER FILTER
    ===================================================== */

    if (params.bestSeller === "true") {
      conditions.push({
        bestSeller: true,
      });
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    if (params.q?.trim()) {
      const search = params.q.trim();

      conditions.push({
        $or: [
          {
            name: {
              $regex: search,
              $options: "i",
            },
          },

          {
            description: {
              $regex: search,
              $options: "i",
            },
          },

          {
            categories: {
              $regex: search,
              $options: "i",
            },
          },

          {
            category: {
              $regex: search,
              $options: "i",
            },
          },
        ],
      });
    }

    /* =====================================================
       FINAL QUERY
    ===================================================== */

    const query =
      conditions.length > 0
        ? {
            $and: conditions,
          }
        : {};

    const sortOption = getSortOption(params.sort);

    let products: any[] = [];

    /* =====================================================
       RANDOM
       
       Default sorting.
       
       MongoDB $sample makes the order random
       on every request.
    ===================================================== */

    if (sortOption === "random") {
      products = await d
        .collection("products")
        .aggregate([
          {
            $match: query,
          },

          {
            $sample: {
              size: 1000,
            },
          },
        ])
        .toArray();
    } else {

    /* =====================================================
       NEWEST
    ===================================================== */
      products = await d.collection("products").find(query).toArray();

      /* ===================================================
         NEWEST
      =================================================== */

      if (sortOption === "newest") {
        products.sort((a, b) => {
          const aTime = new Date(a?.createdAt || 0).getTime();

          const bTime = new Date(b?.createdAt || 0).getTime();

          return bTime - aTime;
        });
      }

      /* ===================================================
         PRICE LOW → HIGH
      =================================================== */

      if (sortOption === "price-low") {
        products.sort((a, b) => {
          return getEffectivePrice(a) - getEffectivePrice(b);
        });
      }

      /* ===================================================
         PRICE HIGH → LOW
      =================================================== */

      if (sortOption === "price-high") {
        products.sort((a, b) => {
          return getEffectivePrice(b) - getEffectivePrice(a);
        });
      }

      /* ===================================================
         BEST SELLERS
         
         Best sellers come first.
         Other products remain visible below.
      =================================================== */

      if (sortOption === "best-seller") {
        products.sort((a, b) => {
          const aBest = a?.bestSeller ? 1 : 0;

          const bBest = b?.bestSeller ? 1 : 0;

          if (aBest !== bBest) {
            return bBest - aBest;
          }

          const aTime = new Date(a?.createdAt || 0).getTime();

          const bTime = new Date(b?.createdAt || 0).getTime();

          return bTime - aTime;
        });
      }

      /* ===================================================
         NEW ARRIVALS
         
         New arrivals come first.
      =================================================== */

      if (sortOption === "new-arrival") {
        products.sort((a, b) => {
          const aNew = a?.newArrival ? 1 : 0;

          const bNew = b?.newArrival ? 1 : 0;

          if (aNew !== bNew) {
            return bNew - aNew;
          }

          const aTime = new Date(a?.createdAt || 0).getTime();

          const bTime = new Date(b?.createdAt || 0).getTime();

          return bTime - aTime;
        });
      }

      /* ===================================================
         OFFERS
         
         Products with active offers come first.
      =================================================== */

      if (sortOption === "offer") {
        products.sort((a, b) => {
          const aHasOffer =
            a?.offer === true ||
            (a?.offerPrice != null &&
              Number(a.offerPrice) < Number(a.regularPrice));

          const bHasOffer =
            b?.offer === true ||
            (b?.offerPrice != null &&
              Number(b.offerPrice) < Number(b.regularPrice));

          if (aHasOffer !== bHasOffer) {
            return Number(bHasOffer) - Number(aHasOffer);
          }

          return getEffectivePrice(a) - getEffectivePrice(b);
        });
      }
    }

    /* =====================================================
       NORMALIZE
    ===================================================== */

    return products.map(normalizeProduct);
  } catch (error) {
    console.error("Failed to load shop products:", error);

    return [];
  }
}

/* =========================================================
   BUILD FILTER URL
========================================================= */

function buildFilterUrl(
  options: {
    category?: string;

    offer?: boolean;

    newArrival?: boolean;

    bestSeller?: boolean;

    q?: string;

    sort?: SortOption;
  } = {},
) {
  const params = new URLSearchParams();

  if (options.category) {
    params.set("category", options.category);
  }

  if (options.offer) {
    params.set("offer", "true");
  }

  if (options.newArrival) {
    params.set("newArrival", "true");
  }

  if (options.bestSeller) {
    params.set("bestSeller", "true");
  }

  if (options.q?.trim()) {
    params.set("q", options.q.trim());
  }

  if (options.sort && options.sort !== "random") {
    params.set("sort", options.sort);
  }

  const query = params.toString();

  return query ? `/shop?${query}` : "/shop";
}

/* =========================================================
   SHOP PAGE
========================================================= */

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const products = await getProducts(params);

  const activeCategory = params.category || "";

  const isOfferPage = params.offer === "true";

  const isNewArrivalPage = params.newArrival === "true";

  const isBestSellerPage = params.bestSeller === "true";

  const searchQuery = params.q?.trim() || "";

  const sortOption = getSortOption(params.sort);

  /* =====================================================
     PAGE TITLE
  ===================================================== */

  let pageTitle = "All Toys";

  if (activeCategory) {
    pageTitle = activeCategory;
  }

  if (isOfferPage) {
    pageTitle = "Special Offers";
  }

  if (isNewArrivalPage) {
    pageTitle = "New Arrivals";
  }

  if (isBestSellerPage) {
    pageTitle = "Best Sellers";
  }

  if (searchQuery) {
    pageTitle = `Search: "${searchQuery}"`;
  }

  /* =====================================================
     ACTIVE FILTER
  ===================================================== */

  const hasActiveFilter = Boolean(
    activeCategory ||
    isOfferPage ||
    isNewArrivalPage ||
    isBestSellerPage ||
    searchQuery ||
    sortOption !== "random",
  );

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <main className="shop-page">
      {/* =================================================
          SHOP HEADER
      ================================================= */}

      <section className="shop-hero">
        <div className="container">
          <div className="shop-hero-content">
            <div>
              <span className="eyebrow">LITTLE ONE OUTLET</span>

              <h1>
                Find Something
                <span> Special</span>
              </h1>

              <p>
                Explore our collection of fun, engaging and carefully selected
                toys for little ones.
              </p>
            </div>

            <div className="shop-hero-icon">🧸</div>
          </div>
        </div>
      </section>

      {/* =================================================
          MAIN SHOP
      ================================================= */}

      <section className="section shop-section">
        <div className="container">
          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="shop-toolbar">
            <form action="/shop" method="GET" className="shop-search">
              <Search size={19} />

              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search toys..."
              />

              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
              )}

              {isOfferPage && <input type="hidden" name="offer" value="true" />}

              {isNewArrivalPage && (
                <input type="hidden" name="newArrival" value="true" />
              )}

              {isBestSellerPage && (
                <input type="hidden" name="bestSeller" value="true" />
              )}

              {sortOption !== "random" && (
                <input type="hidden" name="sort" value={sortOption} />
              )}

              <button type="submit" className="btn">
                Search
              </button>
            </form>

            <div className="shop-result-count">
              <PackageOpen size={17} />

              <span>
                {products.length}{" "}
                {products.length === 1 ? "product" : "products"}
              </span>
            </div>
          </div>

          {/* =================================================
              SORT
          ================================================= */}

          <div
            className="shop-sort-bar"
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              gap: 10,
              marginTop: 18,
              marginBottom: 18,
              flexWrap: "wrap",
            }}
          >
            <form
              action="/shop"
              method="GET"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {/* Preserve category */}

              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
              )}

              {/* Preserve search */}

              {searchQuery && (
                <input type="hidden" name="q" value={searchQuery} />
              )}

              {/* Preserve offer */}

              {isOfferPage && <input type="hidden" name="offer" value="true" />}

              {/* Preserve new arrival */}

              {isNewArrivalPage && (
                <input type="hidden" name="newArrival" value="true" />
              )}

              {/* Preserve best seller */}

              {isBestSellerPage && (
                <input type="hidden" name="bestSeller" value="true" />
              )}

              <label
                htmlFor="shop-sort"
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Sort by
              </label>

              <select
                id="shop-sort"
                name="sort"
                defaultValue={sortOption}
                style={{
                  minWidth: 190,
                  padding: "10px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: 10,
                  background: "white",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button type="submit" className="btn secondary">
                Apply
              </button>
            </form>
          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <div className="shop-filters">
            <div className="filter-label">
              <SlidersHorizontal size={16} />
              Categories
            </div>

            <div className="filter-list">
              {/* ALL */}

              <Link
                href={buildFilterUrl({
                  sort: sortOption,
                })}
                className={
                  !activeCategory &&
                  !isOfferPage &&
                  !isNewArrivalPage &&
                  !isBestSellerPage
                    ? "filter-chip active"
                    : "filter-chip"
                }
              >
                All
              </Link>

              {/* CATEGORIES */}

              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={buildFilterUrl({
                    category,
                    sort: sortOption,
                  })}
                  className={
                    activeCategory === category
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                >
                  {category}
                </Link>
              ))}

              {/* OFFER */}

              <Link
                href={buildFilterUrl({
                  offer: true,
                  sort: sortOption,
                })}
                className={
                  isOfferPage ? "filter-chip offer active" : "filter-chip offer"
                }
              >
                🏷️ Offers
              </Link>

              {/* NEW ARRIVAL */}

              <Link
                href={buildFilterUrl({
                  newArrival: true,
                  sort: sortOption,
                })}
                className={
                  isNewArrivalPage ? "filter-chip active" : "filter-chip"
                }
              >
                ✨ New Arrivals
              </Link>

              {/* BEST SELLER */}

              <Link
                href={buildFilterUrl({
                  bestSeller: true,
                  sort: sortOption,
                })}
                className={
                  isBestSellerPage ? "filter-chip active" : "filter-chip"
                }
              >
                🔥 Best Sellers
              </Link>
            </div>
          </div>

          {/* =================================================
              ACTIVE FILTER
          ================================================= */}

          {hasActiveFilter && (
            <div className="active-filter">
              <div>
                <span>Showing:</span>

                <strong>{pageTitle}</strong>

                {sortOption !== "random" && (
                  <span
                    style={{
                      marginLeft: 8,
                      fontSize: 12,
                    }}
                  >
                    •{" "}
                    {SORT_OPTIONS.find((option) => option.value === sortOption)
                      ?.label || "Recommended"}
                  </span>
                )}
              </div>

              <Link href="/shop">Clear filters ×</Link>
            </div>
          )}

          {/* =================================================
              PRODUCTS
          ================================================= */}

          {products.length > 0 ? (
            <div className="product-grid shop-product-grid">
              {products.map((product) => (
                <ProductCard
                  key={String(product._id ?? product.slug)}
                  p={product}
                />
              ))}
            </div>
          ) : (
            <div className="shop-empty">
              <div className="shop-empty-icon">🔎</div>

              <h2>No products found</h2>

              <p>
                We couldn't find any products matching your search or selected
                filter.
              </p>

              <Link href="/shop" className="btn">
                View All Products
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
