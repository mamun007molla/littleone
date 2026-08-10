"use client";

import { useState } from "react";
import { Product, CartItem, ProductVariant } from "@/models/types";

type AddToCartProps = {
  product: Product;
  selectedVariant?: ProductVariant | null;
};

export default function AddToCart({
  product,
  selectedVariant = null,
}: AddToCartProps) {
  const [qty, setQty] = useState(1);

  const [added, setAdded] = useState(false);

  /* =========================================================
     STOCK
  ========================================================= */

  const hasVariants =
    Array.isArray(product.variants) && product.variants.length > 0;

  /*
   * If variants exist, stock comes from
   * the selected color.
   */

  const stock = hasVariants
    ? Number(selectedVariant?.stock || 0)
    : Number(product.stock || 0);

  /* =========================================================
     QUANTITY
  ========================================================= */

  const decreaseQty = () => {
    setQty((current) => Math.max(1, current - 1));
  };

  const increaseQty = () => {
    setQty((current) => Math.min(stock, current + 1));
  };

  /* =========================================================
     ADD TO CART
  ========================================================= */

  const addToCart = () => {
    if (stock <= 0) {
      return;
    }

    /*
     * If product has variants,
     * customer must select one.
     */

    if (hasVariants && !selectedVariant) {
      alert("Please select a color first.");

      return;
    }

    if (!product._id) {
      console.error("Product ID is missing.");

      return;
    }

    try {
      const storedCart = localStorage.getItem("loo_cart");

      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      const productId = String(product._id);

      const variantId = selectedVariant?.id;

      /*
       * IMPORTANT:
       *
       * Same product with different colors
       * must be treated as different cart items.
       */

      const existingIndex = cart.findIndex(
        (item) =>
          String(item._id) === productId &&
          String(item.variantId || "") === String(variantId || ""),
      );

      if (existingIndex !== -1) {
        const existingQuantity = Number(cart[existingIndex].quantity || 0);

        const newQuantity = existingQuantity + qty;

        cart[existingIndex].quantity = Math.min(newQuantity, stock);
      } else {
        const cartItem: CartItem = {
          ...product,

          _id: productId,

          quantity: qty,

          /*
           * Selected variant information
           */

          variantId: selectedVariant?.id,

          variantColor: selectedVariant?.color,

          variantImage: selectedVariant?.images?.[0],
        };

        cart.push(cartItem);
      }

      /* =====================================================
         SAVE CART
      ===================================================== */

      localStorage.setItem("loo_cart", JSON.stringify(cart));

      /*
       * Update navbar/cart count
       */

      window.dispatchEvent(new Event("loo-cart"));

      /* =====================================================
         SUCCESS
      ===================================================== */

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2200);
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    }
  };

  /* =========================================================
     SELECTED COLOR NAME
  ========================================================= */

  const selectedColor = selectedVariant?.color;

  /* =========================================================
     OUT OF STOCK
  ========================================================= */

  const outOfStock = stock <= 0;

  return (
    <div>
      {/* =====================================================
          SELECTED VARIANT INFO
      ===================================================== */}

      {hasVariants && (
        <div
          style={{
            marginBottom: 12,
            padding: 10,
            borderRadius: 10,
            background: selectedVariant ? "#f4f8ff" : "#fff8e6",
            border: "1px solid var(--line)",
            fontSize: 13,
          }}
        >
          {selectedVariant ? (
            <>
              <strong>Selected Color:</strong> {selectedColor}
              <span
                className="muted"
                style={{
                  marginLeft: 8,
                }}
              >
                • {stock} available
              </span>
            </>
          ) : (
            <strong>🎨 Please select a color before adding to cart.</strong>
          )}
        </div>
      )}

      {/* =====================================================
          QUANTITY
      ===================================================== */}

      <div className="quantity-selector">
        <button
          type="button"
          onClick={decreaseQty}
          disabled={qty <= 1 || outOfStock}
          aria-label="Decrease quantity"
        >
          −
        </button>

        <span>{qty}</span>

        <button
          type="button"
          onClick={increaseQty}
          disabled={qty >= stock || outOfStock}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* =====================================================
          ADD TO CART
      ===================================================== */}

      <button
        type="button"
        className={`add-cart-btn ${added ? "added" : ""}`}
        onClick={addToCart}
        disabled={outOfStock || (hasVariants && !selectedVariant)}
      >
        {added ? (
          <>
            <span>✓</span>
            Added to Cart
          </>
        ) : outOfStock ? (
          <>
            <span>×</span>
            Out of Stock
          </>
        ) : (
          <>
            <span>🛒</span>
            Add to Cart
          </>
        )}
      </button>

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {added && (
        <div className="cart-success-message">
          ✓{" "}
          {selectedColor
            ? `${selectedColor} color added to your cart`
            : "Product added to your cart"}
        </div>
      )}
    </div>
  );
}
