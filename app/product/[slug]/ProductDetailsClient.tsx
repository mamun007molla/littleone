"use client";

import { useState } from "react";

import { Product, ProductVariant } from "@/models/types";

import ProductGallery from "@/components/ProductGallery";
import ProductColorSelector from "@/components/ProductColorSelector";
import AddToCart from "@/components/AddToCart";

type ProductDetailsClientProps = {
  product: Product;
  variants: ProductVariant[];
};

export default function ProductDetailsClient({
  product,
  variants,
}: ProductDetailsClientProps) {
  /* =========================================================
     STATE
  ========================================================= */

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null,
  );

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  /* =========================================================
     PRICE
  ========================================================= */

  const regularPrice = Number(product.regularPrice || 0);

  const offerPrice =
    product.offerPrice !== undefined && product.offerPrice !== null
      ? Number(product.offerPrice)
      : null;

  const hasOffer =
    offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice;

  const finalPrice = hasOffer ? offerPrice : regularPrice;

  const discount = hasOffer
    ? Math.round(((regularPrice - Number(offerPrice)) / regularPrice) * 100)
    : 0;

  /* =========================================================
     STOCK
  ========================================================= */

  const hasVariants = variants.length > 0;

  const stock = hasVariants
    ? Number(selectedVariant?.stock || 0)
    : Number(product.stock || 0);

  const outOfStock = stock <= 0;

  /* =========================================================
     DESCRIPTION
  ========================================================= */

  const description = product.description || "";

  const shouldCollapseDescription =
    description.length > 180 || description.split("\n").length > 3;

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const categories = Array.isArray(product.categories)
    ? product.categories.filter(Boolean)
    : [];

  /* =========================================================
     VARIANT SELECT
  ========================================================= */

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="product-details-layout">
      {/* =====================================================
          LEFT - GALLERY
      ===================================================== */}

      <div className="product-details-gallery">
        <ProductGallery
          images={product.images}
          variants={variants}
          selectedVariant={selectedVariant}
          productName={product.name}
        />
      </div>

      {/* =====================================================
          RIGHT - INFORMATION
      ===================================================== */}

      <div className="product-details-info">
        {/* ===================================================
            BADGES
        =================================================== */}

        {(product.offer || product.bestSeller || product.newArrival) && (
          <div className="product-detail-badges">
            {product.offer && (
              <span className="detail-badge offer">🏷️ Offer</span>
            )}

            {product.bestSeller && (
              <span className="detail-badge bestseller">🔥 Best Seller</span>
            )}

            {product.newArrival && (
              <span className="detail-badge new">✨ New Arrival</span>
            )}
          </div>
        )}

        {/* ===================================================
            CATEGORY
        =================================================== */}

        {categories.length > 0 && (
          <div className="product-detail-categories">
            {categories.map((category) => (
              <span key={category}>{category}</span>
            ))}
          </div>
        )}

        {/* ===================================================
            NAME
        =================================================== */}

        <h1 className="product-detail-title">{product.name}</h1>

        {/* ===================================================
            AGE
        =================================================== */}

        {product.ageRange && (
          <div className="product-detail-age">
            👶 Recommended age:
            <strong>{product.ageRange}</strong>
          </div>
        )}

        {/* ===================================================
            PRICE
        =================================================== */}

        <div className="product-detail-price-row">
          <strong className="product-detail-price">৳{finalPrice}</strong>

          {hasOffer && (
            <>
              <span className="product-detail-old-price">৳{regularPrice}</span>

              <span className="product-detail-discount">-{discount}%</span>
            </>
          )}
        </div>

        {/* ===================================================
            STOCK
        =================================================== */}

        <div
          className={
            outOfStock ? "product-detail-stock out" : "product-detail-stock"
          }
        >
          {outOfStock ? "× Out of stock" : `✓ ${stock} available`}
        </div>

        {/* ===================================================
            COLOR / VARIANT
        =================================================== */}

        {hasVariants && (
          <div className="product-detail-variant-box">
            <ProductColorSelector
              variants={variants}
              selectedVariantId={selectedVariant?.id}
              onSelect={handleVariantSelect}
            />
          </div>
        )}

        {/* ===================================================
            ADD TO CART
        =================================================== */}

        <div className="product-detail-cart">
          <AddToCart product={product} selectedVariant={selectedVariant} />
        </div>

        {/* ===================================================
            TRUST INFO
        =================================================== */}

        <div className="product-trust-grid">
          <div className="product-trust-card">
            <span>🚚</span>

            <div>
              <strong>Fast Delivery</strong>

              <small>Across Bangladesh</small>
            </div>
          </div>

          <div className="product-trust-card">
            <span>🛡️</span>

            <div>
              <strong>Trusted Quality</strong>

              <small>Carefully selected</small>
            </div>
          </div>
        </div>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        {description && (
          <div className="product-description-section">
            <h3>Product Description</h3>

            <div
              className={
                !descriptionExpanded && shouldCollapseDescription
                  ? "product-description collapsed"
                  : "product-description"
              }
            >
              {description}
            </div>

            {shouldCollapseDescription && (
              <button
                type="button"
                className="description-toggle"
                onClick={() => setDescriptionExpanded((value) => !value)}
              >
                {descriptionExpanded ? "See Less ↑" : "See More ↓"}
              </button>
            )}
          </div>
        )}

        {/* ===================================================
            FEATURES
        =================================================== */}

        {Array.isArray(product.features) && product.features.length > 0 && (
          <div className="product-features-section">
            <h3>Product Features</h3>

            <ul>
              {product.features.map((feature, index) => (
                <li key={`${feature}-${index}`}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
