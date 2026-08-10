import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { db } from "@/lib/mongodb";
import { Product } from "@/models/types";
import { CATEGORIES } from "@/lib/constants";

async function getProducts(): Promise<Product[]> {
  try {
    const d = await db();

    const products = await d
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .limit(8)
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
    console.error("Failed to load homepage products:", error);
    return [];
  }
}

const categoryIcons = ["🧸", "🛁", "🧠", "🎨"];

const whyItems = [
  {
    icon: "🛡️",
    title: "Safe & Baby-Friendly",
    description: "Carefully selected products with little ones in mind.",
  },
  {
    icon: "✨",
    title: "Trusted Quality",
    description: "Products chosen with care for fun, learning and play.",
  },
  {
    icon: "🚚",
    title: "Fast Delivery",
    description: "Reliable delivery across Bangladesh within 3–5 working days.",
  },
  {
    icon: "💙",
    title: "Caring Support",
    description: "We're always here to help you choose the right product.",
  },
];

export default async function Home() {
  const products = await getProducts();

  return (
    <main>
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="home-hero">
        <div className="container">
          <div className="hero-card">
            {/* HERO CONTENT */}

            <div className="hero-content">
              <div className="hero-label">
                <span>✨</span>
                <span>Made for Little Ones</span>
              </div>

              <h1>
                Trusted by Parents,
                <br />
                <span>Loved by Little Ones</span>
              </h1>

              <p>
                Discover carefully selected toys made to bring fun, learning and
                happy moments to your little one.
              </p>

              <div className="hero-actions">
                <Link href="/shop" className="btn hero-primary-btn">
                  Shop Now
                  <span>→</span>
                </Link>

                <Link
                  href="#categories"
                  className="btn secondary hero-secondary-btn"
                >
                  Explore Categories
                </Link>
              </div>

              {/* TRUST POINTS */}

              <div className="hero-trust">
                <div className="hero-trust-item">
                  <div className="hero-trust-icon">🚚</div>

                  <div>
                    <strong>Fast Delivery</strong>

                    <span>3–5 working days</span>
                  </div>
                </div>

                <div className="hero-trust-item">
                  <div className="hero-trust-icon">🛡️</div>

                  <div>
                    <strong>Trusted Quality</strong>

                    <span>Carefully selected</span>
                  </div>
                </div>

                <div className="hero-trust-item">
                  <div className="hero-trust-icon">💙</div>

                  <div>
                    <strong>Made with Care</strong>

                    <span>For little ones</span>
                  </div>
                </div>
              </div>
            </div>

            {/* HERO VISUAL */}

            <div className="hero-visual">
              <div className="hero-circle">
                <div className="hero-circle-glow"></div>

                <span className="hero-teddy">🧸</span>

                <span className="hero-star star-one">✦</span>

                <span className="hero-star star-two">✦</span>

                <span className="hero-star star-three">✧</span>
              </div>

              <div className="hero-floating hero-floating-one">
                <span>✨</span>
                <small>Fun</small>
              </div>

              <div className="hero-floating hero-floating-two">
                <span>💙</span>
                <small>Love</small>
              </div>

              <div className="hero-floating hero-floating-three">
                <span>🎁</span>
                <small>Joy</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          SHOP BY CATEGORY
      ===================================================== */}

      <section id="categories" className="section category-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">FIND THEIR FAVORITE</span>

              <h2>Shop by Category</h2>

              <p>Find something special for your little one.</p>
            </div>

            <Link href="/shop" className="text-link">
              View All
              <span>→</span>
            </Link>
          </div>

          <div className="category-grid">
            {CATEGORIES.slice(0, 4).map((category, index) => (
              <Link
                key={category}
                href={`/shop?category=${encodeURIComponent(category)}`}
                className="category-card"
              >
                <div className={`category-icon category-${index}`}>
                  {categoryIcons[index] || "🧸"}
                </div>

                <div className="category-content">
                  <h3>{category}</h3>

                  <span>
                    Explore collection
                    <b>→</b>
                  </span>
                </div>

                <div className="category-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          NEW & POPULAR
      ===================================================== */}

      <section className="section products-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">JUST FOR THEM</span>

              <h2>New & Popular</h2>

              <p>Our latest toys and customer favourites.</p>
            </div>

            <Link href="/shop" className="text-link">
              View All
              <span>→</span>
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="product-grid home-product-grid">
              {products.map((product) => (
                <ProductCard
                  key={String(product._id ?? product.slug)}
                  p={product}
                />
              ))}
            </div>
          ) : (
            <div className="empty-products">
              <div className="empty-icon">🧸</div>

              <h3>Products coming soon</h3>

              <p>
                Products will appear here after you add them from the admin
                panel.
              </p>

              <Link href="/shop" className="btn">
                Explore Shop
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          WHY CHOOSE US
      ===================================================== */}

      <section className="section why-section">
        <div className="container">
          <div className="center-heading">
            <span className="eyebrow">WHY LITTLE ONE OUTLET</span>

            <h2>Why Parents Choose Us</h2>

            <p>Because every little one deserves something special.</p>
          </div>

          <div className="why-grid">
            {whyItems.map((item) => (
              <div key={item.title} className="why-card">
                <div className="why-icon">{item.icon}</div>

                <h3>{item.title}</h3>

                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          TRUST STRIP
      ===================================================== */}

      <section className="trust-strip-section">
        <div className="container">
          <div className="trust-strip">
            <div>
              <span>💳</span>
              <div>
                <strong>Easy Payment</strong>
                <small>COD, bKash & Nagad</small>
              </div>
            </div>

            <div>
              <span>🚚</span>
              <div>
                <strong>Nationwide Delivery</strong>
                <small>We deliver across Bangladesh</small>
              </div>
            </div>

            <div>
              <span>💙</span>
              <div>
                <strong>Customer Care</strong>
                <small>We're here when you need us</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-decoration cta-decoration-one">✦</div>

            <div className="cta-decoration cta-decoration-two">✧</div>

            <div className="cta-content">
              <span className="eyebrow">READY FOR SOME FUN?</span>

              <h2>Find something they'll love 💙</h2>

              <p>
                Explore our collection of cute, fun and engaging toys for little
                ones.
              </p>
            </div>

            <Link href="/shop" className="btn cta-btn">
              Explore Toys
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
