"use client";

import { ProductVariant } from "@/models/types";

type ProductColorSelectorProps = {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onSelect: (variant: ProductVariant) => void;
};

export default function ProductColorSelector({
  variants,
  selectedVariantId,
  onSelect,
}: ProductColorSelectorProps) {
  if (!variants?.length) {
    return null;
  }

  return (
    <div
      className="product-color-selector"
      style={{
        marginTop: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          marginBottom: 10,
        }}
      >
        <div>
          <strong>Choose Color</strong>

          <p
            className="muted"
            style={{
              margin: "3px 0 0",
              fontSize: 12,
            }}
          >
            Select your preferred color
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {variants.map((variant) => {
          const selected = selectedVariantId === variant.id;

          const firstImage = variant.images?.[0];

          const outOfStock = Number(variant.stock || 0) <= 0;

          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => {
                if (!outOfStock) {
                  onSelect(variant);
                }
              }}
              disabled={outOfStock}
              aria-label={`Select ${variant.color}`}
              style={{
                width: 82,
                padding: 5,
                border: selected
                  ? "2px solid var(--brand)"
                  : "1px solid var(--line)",
                borderRadius: 12,
                background: "#fff",
                cursor: outOfStock ? "not-allowed" : "pointer",
                opacity: outOfStock ? 0.5 : 1,
                position: "relative",
              }}
            >
              {/* IMAGE */}

              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#f4f5f7",
                  marginBottom: 5,
                }}
              >
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={variant.color}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 25,
                    }}
                  >
                    🎨
                  </div>
                )}
              </div>

              {/* COLOR NAME */}

              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {variant.color}
              </div>

              {/* STOCK */}

              <div
                className="muted"
                style={{
                  fontSize: 9,
                  marginTop: 2,
                }}
              >
                {outOfStock ? "Out of stock" : `${variant.stock} available`}
              </div>

              {/* SELECTED */}

              {selected && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--brand)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 800,
                    boxShadow: "0 2px 8px rgba(0,0,0,.15)",
                  }}
                >
                  ✓
                </span>
              )}

              {/* VIDEO INDICATOR */}

              {variant.video && (
                <span
                  title="Product demo video available"
                  style={{
                    position: "absolute",
                    bottom: 28,
                    right: 7,
                    width: 19,
                    height: 19,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,.7)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                  }}
                >
                  ▶
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
