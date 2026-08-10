"use client";

import { useState } from "react";
import Link from "next/link";

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
    product.offerPrice != null ? Number(product.offerPrice) : null;

  const finalPrice =
    offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice
      ? offerPrice
      : regularPrice;

  const hasOffer =
    offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice;

  /* =========================================================
     STOCK
  ========================================================= */

  const hasVariants = variants.length > 0;

  const stock = hasVariants
    ? Number(selectedVariant?.stock || 0)
    : Number(product.stock || 0);

  const outOfStock = stock <= 0;

  /* =========================================================
     VARIANT SELECT
  ========================================================= */

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, .95fr)",
        gap: 45,
        alignItems: "start",
      }}
    >
      {/* ===================================================
          LEFT - GALLERY
      =================================================== */}

      <div>
        <ProductGallery
          images={product.images}
          variants={variants}
          selectedVariant={selectedVariant}
          productName={product.name}
        />
      </div>

      {/* ===================================================
          RIGHT - PRODUCT INFO
      =================================================== */}

      <div>
        {/* CATEGORY */}

        <span className="eyebrow">{product.category}</span>

        {/* NAME */}

        <h1
          style={{
            margin: "8px 0 12px",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.1,
          }}
        >
          {product.name}
        </h1>

        {/* AGE */}

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

        {/* =================================================
            PRICE
        ================================================= */}

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
                ৳{product.regularPrice}
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
                SALE
              </span>
            </>
          )}
        </div>

        {/* =================================================
            STOCK
        ================================================= */}

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

        {/* =================================================
            DESCRIPTION
        ================================================= */}

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

        {/* =================================================
            COLOR SELECTOR
        ================================================= */}

        {hasVariants && (
          <ProductColorSelector
            variants={variants}
            selectedVariantId={selectedVariant?.id}
            onSelect={handleVariantSelect}
          />
        )}

        {/* =================================================
            ADD TO CART
        ================================================= */}

        <div
          style={{
            marginTop: 22,
          }}
        >
          <AddToCart product={product} selectedVariant={selectedVariant} />
        </div>

        {/* =================================================
            TRUST INFO
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 10,
            marginTop: 22,
          }}
        >
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

        {/* =================================================
            FEATURES
        ================================================= */}

        {product.features?.length > 0 && (
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
      </div>
    </div>
  );
}
