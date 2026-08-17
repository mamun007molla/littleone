"use client";

import { useEffect, useState } from "react";

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

  const hasOffer =
    offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice;

  const finalPrice = hasOffer ? offerPrice : regularPrice;

  const discount =
    hasOffer && regularPrice > 0
      ? Math.round(((regularPrice - offerPrice!) / regularPrice) * 100)
      : 0;

  /* =========================================================
     META PIXEL - VIEW CONTENT
  ========================================================= */

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawId =
      (product as any)?._id ?? (product as any)?.id ?? product?.slug ?? "";

    const contentId = rawId ? String(rawId) : "";

    if (!contentId) {
      console.warn(
        "Meta Pixel ViewContent: Product ID and slug are missing.",
        product,
      );
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;

    let fired = false;

    const fireViewContent = () => {
      const fbq = (window as any).fbq;

      if (typeof fbq !== "function") {
        return false;
      }

      if (fired) {
        return true;
      }

      fired = true;

      const eventData = {
        content_ids: [contentId],
        content_name: product.name || "Product",
        content_type: "product",
        value: Number(finalPrice) || 0,
        currency: "BDT",
      };

      fbq("track", "ViewContent", eventData);

      console.log("Meta Pixel ViewContent fired:", eventData);

      return true;
    };

    const firstAttemptSuccessful = fireViewContent();

    if (!firstAttemptSuccessful) {
      interval = setInterval(() => {
        const success = fireViewContent();

        if (success) {
          if (interval) {
            clearInterval(interval);
            interval = null;
          }
        }
      }, 500);
    }

    timeout = setTimeout(() => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }

      if (!fired) {
        console.warn(
          "Meta Pixel ViewContent could not be fired within 20 seconds.",
        );
      }
    }, 20000);

    return () => {
      if (interval) {
        clearInterval(interval);
      }

      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [
    (product as any)?._id,
    (product as any)?.id,
    product?.slug,
    product?.name,
    finalPrice,
  ]);

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
    ? product.categories
    : [];

  /* =========================================================
     PRODUCT STATUS
  ========================================================= */

  const isBestSeller = Boolean(product.bestSeller);

  const isNewArrival = Boolean(product.newArrival);

  const isOffer = Boolean(product.offer) || hasOffer;

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
        {/* =================================================
            PRODUCT BADGES
        ================================================= */}

        {(isOffer || isBestSeller || isNewArrival) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 7,
              marginBottom: 10,
            }}
          >
            {isOffer && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: "#fff0f0",
                  color: "#c62828",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                🏷️ Offer
              </span>
            )}

            {isBestSeller && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: "#fff7e6",
                  color: "#a15c00",
                  border: "1px solid #ffe0a3",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                🔥 Best Seller
              </span>
            )}

            {isNewArrival && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "5px 9px",
                  borderRadius: 999,
                  background: "#eef6ff",
                  color: "#2864a8",
                  border: "1px solid #cfe5ff",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                ✨ New Arrival
              </span>
            )}
          </div>
        )}

        {/* =================================================
            CATEGORIES
        ================================================= */}

        {categories.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 8,
            }}
          >
            {categories.map((category, index) => (
              <span key={`${category}-${index}`} className="eyebrow">
                {category}
              </span>
            ))}
          </div>
        )}

        {/* =================================================
            NAME
        ================================================= */}

        <h1
          style={{
            margin: "8px 0 12px",
            fontSize: "clamp(28px, 4vw, 44px)",
            lineHeight: 1.1,
          }}
        >
          {product.name}
        </h1>

        {/* =================================================
            AGE
        ================================================= */}

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
                -{discount}%
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
