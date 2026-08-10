"use client";

import { useMemo, useState } from "react";
import { Product, ProductVariant } from "@/models/types";
import AddToCart from "@/components/AddToCart";

type ProductDetailsProps = {
  product: Product;
};

export default function ProductDetails({ product }: ProductDetailsProps) {
  const variants = product.variants || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null,
  );

  const selectedVariant: ProductVariant | null = useMemo(() => {
    if (!selectedVariantId) {
      return null;
    }

    return variants.find((variant) => variant.id === selectedVariantId) || null;
  }, [variants, selectedVariantId]);

  const images = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images || [];

  const [selectedImage, setSelectedImage] = useState(0);

  const regularPrice = Number(product.regularPrice || 0);

  const offerPrice =
    product.offerPrice != null ? Number(product.offerPrice) : null;

  const hasOffer = offerPrice !== null && offerPrice < regularPrice;

  const price = hasOffer ? offerPrice : regularPrice;

  const saving = hasOffer ? regularPrice - offerPrice : 0;

  const stock = selectedVariant
    ? Number(selectedVariant.stock || 0)
    : Number(product.stock || 0);

  const inStock = stock > 0;

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId);

    setSelectedImage(0);
  };

  return (
    <div className="product-details-content">
      {/* =================================================
          PRODUCT GALLERY
      ================================================= */}

      <div className="product-gallery">
        {/* MAIN IMAGE */}

        <div className="product-main-image">
          {images.length > 0 ? (
            <img
              src={images[selectedImage] || images[0]}
              alt={
                selectedVariant
                  ? `${product.name} ${selectedVariant.color}`
                  : product.name
              }
            />
          ) : (
            <div className="product-image-empty">
              <span>🧸</span>

              <p>No image available</p>
            </div>
          )}

          {hasOffer && (
            <span className="product-page-discount">
              -{Math.round(((regularPrice - price) / regularPrice) * 100)}%
            </span>
          )}
        </div>

        {/* THUMBNAILS */}

        {images.length > 1 && (
          <div className="product-thumbnails">
            {images.map((image, index) => (
              <button
                type="button"
                key={`${image}-${index}`}
                className={`product-thumbnail ${
                  selectedImage === index ? "active" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} />
              </button>
            ))}
          </div>
        )}

        {/* =================================================
            VIDEO
        ================================================= */}

        {selectedVariant?.video && (
          <div className="product-video-section">
            <h3>▶ See How It Works</h3>

            <div className="product-video-wrapper">
              <video
                controls
                preload="metadata"
                playsInline
                src={selectedVariant.video}
              >
                Your browser does not support video playback.
              </video>
            </div>
          </div>
        )}
      </div>

      {/* =================================================
          PRODUCT INFORMATION
      ================================================= */}

      <div className="product-info">
        <div className="product-page-category">{product.category}</div>

        <h1>{product.name}</h1>

        {/* PRICE */}

        <div className="product-page-price">
          <span className="current-price">৳{price}</span>

          {hasOffer && (
            <>
              <span className="regular-price">৳{regularPrice}</span>

              <span className="save-badge">Save ৳{saving}</span>
            </>
          )}
        </div>

        {/* =================================================
            COLOR VARIANTS
        ================================================= */}

        {variants.length > 0 && (
          <div className="product-variants">
            <div className="variant-title">
              <strong>Choose Color</strong>

              {selectedVariant && <span>{selectedVariant.color}</span>}
            </div>

            <div className="variant-list">
              {variants.map((variant) => {
                const variantStock = Number(variant.stock || 0);

                const available = variantStock > 0;

                const active = selectedVariantId === variant.id;

                return (
                  <button
                    type="button"
                    key={variant.id}
                    disabled={!available}
                    onClick={() => handleVariantChange(variant.id)}
                    className={`product-variant ${active ? "active" : ""} ${
                      !available ? "out-of-stock" : ""
                    }`}
                  >
                    {/* COLOR IMAGE */}

                    <span className="variant-image">
                      {variant.images?.[0] ? (
                        <img src={variant.images[0]} alt={variant.color} />
                      ) : (
                        <span>🎨</span>
                      )}
                    </span>

                    <span className="variant-info">
                      <strong>{variant.color}</strong>

                      <small>
                        {available
                          ? `${variantStock} available`
                          : "Out of stock"}
                      </small>
                    </span>

                    {active && <span className="variant-check">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* =================================================
            STOCK
        ================================================= */}

        <div className="product-stock-status">
          {inStock ? (
            <>
              <span className="stock-dot" />

              <span>In stock</span>

              <span className="stock-count">({stock} available)</span>
            </>
          ) : (
            <>
              <span className="stock-dot out" />

              <span>Currently out of stock</span>
            </>
          )}
        </div>

        {/* =================================================
            DESCRIPTION
        ================================================= */}

        {product.description && (
          <div className="product-description">
            <h3>About this product</h3>

            <p>{product.description}</p>
          </div>
        )}

        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div className="product-info-list">
          {product.ageRange && (
            <div className="info-row">
              <span className="info-label">Recommended Age</span>

              <strong>{product.ageRange}</strong>
            </div>
          )}

          <div className="info-row">
            <span className="info-label">Availability</span>

            <strong className={inStock ? "available-text" : "unavailable-text"}>
              {inStock ? "Available" : "Out of Stock"}
            </strong>
          </div>

          {selectedVariant && (
            <div className="info-row">
              <span className="info-label">Selected Color</span>

              <strong>{selectedVariant.color}</strong>
            </div>
          )}
        </div>

        {/* =================================================
            FEATURES
        ================================================= */}

        {product.features && product.features.length > 0 && (
          <div className="product-features">
            <h3>Product Features</h3>

            <ul>
              {product.features.map((feature) => (
                <li key={feature}>
                  <span>✓</span>

                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* =================================================
            ADD TO CART
        ================================================= */}

        {inStock ? (
          <div className="product-buy-area">
            <AddToCart
              product={product}
              selectedVariant={selectedVariant || null}
            />
          </div>
        ) : (
          <button className="btn disabled-btn" disabled>
            Currently Unavailable
          </button>
        )}

        {/* =================================================
            TRUST
        ================================================= */}

        <div className="product-trust">
          <div>
            <span>🚚</span>

            <div>
              <strong>Fast Delivery</strong>

              <small>3–5 working days</small>
            </div>
          </div>

          <div>
            <span>💳</span>

            <div>
              <strong>Easy Payment</strong>

              <small>COD, bKash, Nagad & Bank</small>
            </div>
          </div>

          <div>
            <span>🛡️</span>

            <div>
              <strong>Trusted Quality</strong>

              <small>Carefully selected products</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
