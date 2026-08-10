"use client";

import { useMemo, useState } from "react";
import { ProductVariant } from "@/models/types";

type ProductGalleryProps = {
  images?: string[];
  variants?: ProductVariant[];
  selectedVariant?: ProductVariant | null;
  productName: string;
};

export default function ProductGallery({
  images = [],
  variants = [],
  selectedVariant = null,
  productName,
}: ProductGalleryProps) {
  /* =========================================================
     GALLERY MEDIA
  ========================================================= */

  const galleryImages = useMemo(() => {
    /*
     * If a color variant is selected,
     * show that color's images first.
     */

    if (selectedVariant && selectedVariant.images?.length) {
      return selectedVariant.images.filter(Boolean);
    }

    /*
     * Otherwise show main product images.
     */

    if (images.length > 0) {
      return images.filter(Boolean);
    }

    /*
     * If main images don't exist,
     * use the first variant images.
     */

    if (variants.length > 0) {
      return variants[0].images.filter(Boolean);
    }

    return [];
  }, [images, variants, selectedVariant]);

  /* =========================================================
     STATE
  ========================================================= */

  const [activeIndex, setActiveIndex] = useState(0);

  /*
   * Reset naturally when selected variant
   * has fewer images than previous variant.
   */

 const safeIndex =
   activeIndex === -1
     ? -1
     : activeIndex >= galleryImages.length
       ? 0
       : activeIndex;

  const activeImage = galleryImages[safeIndex] || "";

  /* =========================================================
     VIDEO
  ========================================================= */

  const video = selectedVariant?.video || "";

  /* =========================================================
     EMPTY IMAGE
  ========================================================= */

  if (galleryImages.length === 0 && !video) {
    return (
      <div
        className="product-gallery"
        style={{
          width: "100%",
        }}
      >
        <div
          style={{
            aspectRatio: "1 / 1",
            borderRadius: 18,
            background: "#f5f6f8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 70,
          }}
        >
          🧸
        </div>
      </div>
    );
  }

  return (
    <div
      className="product-gallery"
      style={{
        width: "100%",
      }}
    >
      {/* =====================================================
          MAIN MEDIA
      ===================================================== */}

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 18,
          overflow: "hidden",
          background: "#f7f7f7",
          border: "1px solid var(--line)",
        }}
      >
        {activeImage ? (
          <img
            src={activeImage}
            alt={
              selectedVariant?.color
                ? `${productName} - ${selectedVariant.color}`
                : productName
            }
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
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
              padding: 15,
            }}
          >
            <video
              src={video}
              controls
              playsInline
              preload="metadata"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                background: "#000",
              }}
            />
          </div>
        )}

        {/* COLOR LABEL */}

        {selectedVariant?.color && (
          <div
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              padding: "7px 11px",
              borderRadius: 999,
              background: "rgba(255,255,255,.92)",
              backdropFilter: "blur(8px)",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 3px 12px rgba(0,0,0,.08)",
            }}
          >
            🎨 {selectedVariant.color}
          </div>
        )}

        {/* IMAGE COUNTER */}

        {galleryImages.length > 1 && (
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              padding: "6px 9px",
              borderRadius: 999,
              background: "rgba(0,0,0,.6)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
            }}
          >
            {safeIndex + 1} / {galleryImages.length}
          </div>
        )}
      </div>

      {/* =====================================================
          THUMBNAILS
      ===================================================== */}

      {(galleryImages.length > 0 || video) && (
        <div
          style={{
            display: "flex",
            gap: 9,
            marginTop: 12,
            overflowX: "auto",
            paddingBottom: 3,
          }}
        >
          {galleryImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View image ${index + 1}`}
              style={{
                width: 72,
                height: 72,
                minWidth: 72,
                padding: 0,
                border:
                  safeIndex === index
                    ? "2px solid var(--brand)"
                    : "1px solid var(--line)",
                borderRadius: 11,
                overflow: "hidden",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </button>
          ))}

          {/* VIDEO THUMBNAIL */}

          {video && (
            <button
              type="button"
              onClick={() => {
                /*
                 * -1 means video is active.
                 * We keep the image index untouched.
                 */
                setActiveIndex(-1);
              }}
              aria-label="Play product demo video"
              style={{
                width: 72,
                height: 72,
                minWidth: 72,
                padding: 0,
                border:
                  safeIndex === -1
                    ? "2px solid var(--brand)"
                    : "1px solid var(--line)",
                borderRadius: 11,
                overflow: "hidden",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                position: "relative",
              }}
            >
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
                ▶
              </div>

              <span
                style={{
                  position: "absolute",
                  bottom: 5,
                  left: 0,
                  right: 0,
                  fontSize: 9,
                  fontWeight: 700,
                }}
              >
                VIDEO
              </span>
            </button>
          )}
        </div>
      )}

      {/* =====================================================
          VIDEO PLAYER
      ===================================================== */}

      {video && safeIndex === -1 && (
        <div
          style={{
            marginTop: 12,
            borderRadius: 14,
            overflow: "hidden",
            background: "#000",
          }}
        >
          <video
            src={video}
            controls
            autoPlay
            playsInline
            preload="metadata"
            style={{
              width: "100%",
              display: "block",
              maxHeight: 430,
            }}
          />
        </div>
      )}
    </div>
  );
}
