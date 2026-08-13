"use client";

import { useState } from "react";
import { Product, ProductVariant } from "@/models/types";

import ProductGallery from "@/components/ProductGallery";
import ProductColorSelector from "@/components/ProductColorSelector";
import AddToCart from "@/components/AddToCart";

type ProductDetailsProps = {
  product: Product;
  variants?: ProductVariant[];
};

export default function ProductDetails({
  product,
  variants = [],
}: ProductDetailsProps) {
  /* =========================================================
     SELECTED VARIANT
  ========================================================= */

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    variants.length > 0 ? variants[0] : null,
  );

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

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      className="product-details-layout"
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
        gap: 45,
        alignItems: "start",
      }}
    >
      {/* =====================================================
          LEFT - PRODUCT GALLERY
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
          RIGHT - PRODUCT INFORMATION
      ===================================================== */}

      <div className="product-details-info">
        {/* ===================================================
            CATEGORIES
        =================================================== */}

        {categories.length > 0 && (
          <div
            className="product-detail-categories"
            style={{
              display: "flex",
              gap: 7,
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {categories.map((category) => (
              <span
                key={category}
                className="eyebrow"
                style={{
                  display: "inline-block",
                }}
              >
                {category}
              </span>
            ))}
          </div>
        )}

        {/* ===================================================
            PRODUCT NAME
        =================================================== */}

        <h1
          style={{
            margin: "8px 0 12px",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.1,
          }}
        >
          {product.name}
        </h1>

        {/* ===================================================
            AGE RANGE
        =================================================== */}

        {product.ageRange && (
          <div
            className="muted"
            style={{
              marginBottom: 15,
              fontSize: 13,
            }}
          >
            👶 Recommended age: <strong>{product.ageRange}</strong>
          </div>
        )}

        {/* ===================================================
            PRICE
        =================================================== */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 15,
          }}
        >
          <strong
            style={{
              fontSize: 30,
            }}
          >
            ৳{finalPrice}
          </strong>

          {hasOffer && (
            <>
              <span
                className="muted"
                style={{
                  textDecoration: "line-through",
                  fontSize: 16,
                }}
              >
                ৳{regularPrice}
              </span>

              <span
                style={{
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: "#fff0f0",
                  color: "#c62828",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                -{discount}%
              </span>
            </>
          )}
        </div>

        {/* ===================================================
            STOCK
        =================================================== */}

        <div
          style={{
            marginBottom: 18,
          }}
        >
          {outOfStock ? (
            <span
              style={{
                color: "#c62828",
                fontWeight: 700,
              }}
            >
              × Out of stock
            </span>
          ) : (
            <span
              style={{
                color: stock <= 5 ? "#a66a00" : "#16753b",
                fontWeight: 700,
              }}
            >
              ✓ {stock} available
            </span>
          )}
        </div>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        {product.description && (
          <div
            style={{
              marginBottom: 20,
            }}
          >
            <p
              style={{
                lineHeight: 1.75,
                whiteSpace: "pre-line",
              }}
            >
              {product.description}
            </p>
          </div>
        )}

        {/* ===================================================
            COLOR / VARIANT SELECTOR
        =================================================== */}

        {hasVariants && (
          <ProductColorSelector
            variants={variants}
            selectedVariantId={selectedVariant?.id}
            onSelect={handleVariantSelect}
          />
        )}

        {/* ===================================================
            ADD TO CART
        =================================================== */}

        <div
          style={{
            marginTop: 22,
          }}
        >
          <AddToCart product={product} selectedVariant={selectedVariant} />
        </div>

        {/* ===================================================
            TRUST INFORMATION
        =================================================== */}

        <div
          className="product-trust-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
            marginTop: 22,
          }}
        >
          {/* DELIVERY */}

          <div
            style={{
              padding: 13,
              border: "1px solid var(--line)",
              borderRadius: 12,
            }}
          >
            <strong>🚚 Fast Delivery</strong>

            <small
              className="muted"
              style={{
                display: "block",
                marginTop: 4,
              }}
            >
              Across Bangladesh
            </small>
          </div>

          {/* QUALITY */}

          <div
            style={{
              padding: 13,
              border: "1px solid var(--line)",
              borderRadius: 12,
            }}
          >
            <strong>🛡️ Trusted Quality</strong>

            <small
              className="muted"
              style={{
                display: "block",
                marginTop: 4,
              }}
            >
              Carefully selected
            </small>
          </div>
        </div>

        {/* ===================================================
            FEATURES
        =================================================== */}

        {Array.isArray(product.features) && product.features.length > 0 && (
          <div
            style={{
              marginTop: 25,
            }}
          >
            <h3>Product Features</h3>

            <ul
              style={{
                paddingLeft: 20,
                lineHeight: 1.9,
              }}
            >
              {product.features.map((feature, index) => (
                <li key={`${feature}-${index}`}>{feature}</li>
              ))}
            </ul>
          </div>
        )}

        {/* ===================================================
            PRODUCT STATUS
        =================================================== */}

        {(product.newArrival || product.bestSeller || product.offer) && (
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            {product.newArrival && (
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#eef2ff",
                  color: "#3742fa",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                ✨ New Arrival
              </span>
            )}

            {product.bestSeller && (
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#fff7e6",
                  color: "#a66a00",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                🔥 Best Seller
              </span>
            )}

            {product.offer && (
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#fff0f0",
                  color: "#c62828",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                🏷️ Special Offer
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
