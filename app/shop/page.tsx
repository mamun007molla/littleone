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
};

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(product: any): Product {
  const categories = Array.isArray(product?.categories)
    ? product.categories
    : typeof product?.category === "string" && product.category.trim()
      ? [product.category]
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
   GET PRODUCTS
========================================================= */

async function getProducts(params: SearchParams): Promise<Product[]> {
  try {
    const d = await db();

    const query: Record<string, any> = {};

    /* =====================================================
       CATEGORY FILTER

       New products:
       categories: ["Baby & Toddler Toys", ...]

       Old products:
       category: "Baby Toys"
    ===================================================== */

    if (params.category) {
      query.$or = [
        {
          categories: params.category,
        },

        {
          category: params.category,
        },
      ];
    }

    /* =====================================================
       OFFER FILTER
    ===================================================== */

    if (params.offer === "true") {
      query.offer = true;
    }

    /* =====================================================
       NEW ARRIVAL FILTER
    ===================================================== */

    if (params.newArrival === "true") {
      query.newArrival = true;
    }

    /* =====================================================
       BEST SELLER FILTER
    ===================================================== */

    if (params.bestSeller === "true") {
      query.bestSeller = true;
    }

    /* =====================================================
       SEARCH
    ===================================================== */

    if (params.q?.trim()) {
      const search = params.q.trim();

      const searchConditions = [
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

        /*
         * Old products
         */

        {
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];

      /*
       * If category filter already
       * exists, combine search with
       * existing filters using $and.
       */

      const existingFilters =
        Object.keys(query).length > 0
          ? {
              ...query,
            }
          : null;

      if (existingFilters) {
        delete query.$or;

        const categoryCondition = params.category
          ? {
              $or: [
                {
                  categories: params.category,
                },

                {
                  category: params.category,
                },
              ],
            }
          : null;

        const tagConditions: Record<string, any> = {};

        if (params.offer === "true") {
          tagConditions.offer = true;
        }

        if (params.newArrival === "true") {
          tagConditions.newArrival = true;
        }

        if (params.bestSeller === "true") {
          tagConditions.bestSeller = true;
        }

        const andConditions: any[] = [];

        if (categoryCondition) {
          andConditions.push(categoryCondition);
        }

        if (Object.keys(tagConditions).length > 0) {
          andConditions.push(tagConditions);
        }

        andConditions.push({
          $or: searchConditions,
        });

        query.$and = andConditions;
      } else {
        query.$or = searchConditions;
      }
    }

    /* =====================================================
       FETCH
    ===================================================== */

    const products = await d
      .collection("products")
      .find(query)
      .sort({
        createdAt: -1,
      })
      .toArray();

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
     ACTIVE FILTER CHECK
  ===================================================== */

  const hasActiveFilter = Boolean(
    activeCategory ||
    isOfferPage ||
    isNewArrivalPage ||
    isBestSellerPage ||
    searchQuery,
  );

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

              {/* Preserve category */}

              {activeCategory && (
                <input type="hidden" name="category" value={activeCategory} />
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
                href="/shop"
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
