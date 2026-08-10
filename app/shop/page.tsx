import Link from "next/link";
import { Search, SlidersHorizontal, PackageOpen } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/mongodb";
import { Product } from "@/models/types";
import { CATEGORIES } from "@/lib/constants";

type SearchParams = {
  category?: string;
  q?: string;
  offer?: string;
};

async function getProducts(params: SearchParams): Promise<Product[]> {
  try {
    const d = await db();

    const query: Record<string, any> = {};

    if (params.category) {
      query.category = params.category;
    }

    if (params.offer === "true") {
      query.offerPrice = {
        $exists: true,
        $ne: null,
      };
    }

    if (params.q?.trim()) {
      const search = params.q.trim();

      query.$or = [
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
          category: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const products = await d
      .collection("products")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return products.map((product) => ({
      ...product,
      _id: product._id?.toString(),
      createdAt:
        product.createdAt instanceof Date
          ? product.createdAt.toISOString()
          : product.createdAt,
    })) as unknown as Product[];
  } catch (error) {
    console.error("Failed to load shop products:", error);
    return [];
  }
}

function buildFilterUrl(category?: string, offer?: boolean) {
  const params = new URLSearchParams();

  if (category) {
    params.set("category", category);
  }

  if (offer) {
    params.set("offer", "true");
  }

  const query = params.toString();

  return query ? `/shop?${query}` : "/shop";
}

export default async function Shop({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const products = await getProducts(params);

  const activeCategory = params.category || "";

  const isOfferPage = params.offer === "true";

  const searchQuery = params.q?.trim() || "";

  let pageTitle = "All Toys";

  if (activeCategory) {
    pageTitle = activeCategory;
  }

  if (isOfferPage) {
    pageTitle = "Special Offers";
  }

  return (
    <main className="shop-page">
      {/* =========================
          SHOP HEADER
      ========================= */}

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

      {/* =========================
          MAIN SHOP
      ========================= */}

      <section className="section shop-section">
        <div className="container">
          {/* SEARCH */}

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

          {/* =========================
              FILTERS
          ========================= */}

          <div className="shop-filters">
            <div className="filter-label">
              <SlidersHorizontal size={16} />
              Categories
            </div>

            <div className="filter-list">
              <Link
                href={buildFilterUrl(undefined, isOfferPage)}
                className={
                  !activeCategory && !isOfferPage
                    ? "filter-chip active"
                    : "filter-chip"
                }
              >
                All
              </Link>

              {CATEGORIES.map((category) => (
                <Link
                  key={category}
                  href={buildFilterUrl(category, false)}
                  className={
                    activeCategory === category
                      ? "filter-chip active"
                      : "filter-chip"
                  }
                >
                  {category}
                </Link>
              ))}

              <Link
                href="/shop?offer=true"
                className={
                  isOfferPage ? "filter-chip offer active" : "filter-chip offer"
                }
              >
                🔥 Offers
              </Link>
            </div>
          </div>

          {/* =========================
              ACTIVE FILTER
          ========================= */}

          {(activeCategory || isOfferPage || searchQuery) && (
            <div className="active-filter">
              <div>
                <span>Showing:</span>

                <strong>{searchQuery ? `"${searchQuery}"` : pageTitle}</strong>
              </div>

              <Link href="/shop">Clear filters ×</Link>
            </div>
          )}

          {/* =========================
              PRODUCTS
          ========================= */}

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
                category.
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
