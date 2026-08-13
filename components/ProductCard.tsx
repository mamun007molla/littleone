import Link from "next/link";
import Image from "next/image";
import { Product } from "@/models/types";
import { ShoppingCart, ArrowUpRight } from "lucide-react";

export default function ProductCard({ p }: { p: Product }) {
  /* =========================================================
     PRICE
  ========================================================= */

  const regularPrice = Number(p.regularPrice || 0);

  const offerPrice = p.offerPrice != null ? Number(p.offerPrice) : null;

  const hasOffer =
    offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice;

  const price = hasOffer ? offerPrice : regularPrice;

  const discount =
    hasOffer && regularPrice > 0
      ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
      : 0;

  /* =========================================================
     STOCK
  ========================================================= */

  const inStock = Number(p.stock || 0) > 0;

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = Array.isArray(p.categories) ? p.categories : [];

  const categoryLabel = categories.length > 0 ? categories[0] : "Baby Toys";

  /* =========================================================
     PRODUCT TAGS
  ========================================================= */

  const isBestSeller = Boolean(p.bestSeller);

  const isNewArrival = Boolean(p.newArrival);

  /*
   * Offer is considered active
   * when both the flag and
   * discounted price exist.
   */

  const isOffer = Boolean(p.offer) || hasOffer;

  return (
    <Link href={`/product/${p.slug}`} className="product-card">
      {/* =====================================================
          IMAGE
      ===================================================== */}

      <div className="product-card-image">
        {p.images?.[0] ? (
          <Image
            src={p.images[0]}
            alt={p.name}
            fill
            sizes="(max-width: 650px) 50vw, 25vw"
            className="product-card-img"
          />
        ) : (
          <div className="product-card-empty-image">
            <span>🧸</span>

            <small>No image</small>
          </div>
        )}

        {/* =================================================
            BADGES
        ================================================= */}

        <div className="product-card-badges">
          {hasOffer && (
            <span className="product-offer-badge">-{discount}%</span>
          )}

          {!hasOffer && isOffer && (
            <span className="product-offer-badge">OFFER</span>
          )}

          {isBestSeller && (
            <span className="product-best-seller-badge">🔥 Best Seller</span>
          )}

          {isNewArrival && (
            <span className="product-new-arrival-badge">✨ New</span>
          )}
        </div>

        {/* =================================================
            OUT OF STOCK
        ================================================= */}

        {!inStock && <div className="product-out-stock">Out of Stock</div>}

        {/* =================================================
            TOP ACTION
        ================================================= */}

        <div className="product-card-action">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="product-card-body">
        {/* CATEGORY */}

        <span className="product-card-category">{categoryLabel}</span>

        {/* PRODUCT NAME */}

        <h3 className="product-card-title">{p.name}</h3>

        {/* =================================================
            PRICE
        ================================================= */}

        <div className="product-card-price">
          <strong>৳{price}</strong>

          {hasOffer && <span>৳{regularPrice}</span>}
        </div>

        {/* =================================================
            BOTTOM
        ================================================= */}

        <div className="product-card-footer">
          <div className="product-stock">
            <span
              className={inStock ? "stock-dot-small" : "stock-dot-small out"}
            />

            <span>{inStock ? "In stock" : "Unavailable"}</span>
          </div>

          <div className="product-view">
            <ShoppingCart size={14} />

            <span>View</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
