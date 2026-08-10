import Link from "next/link";
import Image from "next/image";
import { Product } from "@/models/types";
import { ShoppingCart, ArrowUpRight } from "lucide-react";

export default function ProductCard({ p }: { p: Product }) {
  const regularPrice = Number(p.regularPrice);
  const offerPrice = p.offerPrice != null ? Number(p.offerPrice) : null;

  const hasOffer = offerPrice !== null && offerPrice < regularPrice;

  const price = hasOffer ? offerPrice : regularPrice;

  const discount = hasOffer
    ? Math.round(((regularPrice - offerPrice) / regularPrice) * 100)
    : 0;

  const inStock = Number(p.stock) > 0;

  return (
    <Link href={`/product/${p.slug}`} className="product-card">
      {/* =========================
          IMAGE
      ========================= */}

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

        {/* OFFER */}

        {hasOffer && <span className="product-offer-badge">-{discount}%</span>}

        {/* STOCK */}

        {!inStock && <div className="product-out-stock">Out of Stock</div>}

        {/* TOP ACTION */}

        <div className="product-card-action">
          <ArrowUpRight size={16} />
        </div>
      </div>

      {/* =========================
          CONTENT
      ========================= */}

      <div className="product-card-body">
        <span className="product-card-category">{p.category}</span>

        <h3 className="product-card-title">{p.name}</h3>

        {/* PRICE */}

        <div className="product-card-price">
          <strong>৳{price}</strong>

          {hasOffer && <span>৳{regularPrice}</span>}
        </div>

        {/* BOTTOM */}

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
