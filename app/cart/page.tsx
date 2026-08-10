"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CartItem } from "@/models/types";

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([]);

  /* =====================================================
     LOAD CART
  ===================================================== */

  useEffect(() => {
    try {
      const stored = localStorage.getItem("loo_cart");

      setItems(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error("Failed to load cart:", error);

      setItems([]);
    }
  }, []);

  /* =====================================================
     SAVE CART
  ===================================================== */

  const save = (next: CartItem[]) => {
    setItems(next);

    localStorage.setItem("loo_cart", JSON.stringify(next));

    window.dispatchEvent(new Event("loo-cart"));
  };

  /* =====================================================
     PRICE
  ===================================================== */

  const getPrice = (item: CartItem) => {
    const offerPrice = item.offerPrice != null ? Number(item.offerPrice) : null;

    const regularPrice = Number(item.regularPrice || 0);

    return offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice
      ? offerPrice
      : regularPrice;
  };

  /* =====================================================
     VARIANT STOCK
  ===================================================== */

  const getVariantStock = (item: CartItem) => {
    if (!item.variantId || !Array.isArray(item.variants)) {
      return Number(item.stock || 0);
    }

    const variant = item.variants.find(
      (current) => String(current.id) === String(item.variantId),
    );

    return Number(variant?.stock || 0);
  };

  /* =====================================================
     STOCK
  ===================================================== */

  const getStock = (item: CartItem) => {
    return item.variantId ? getVariantStock(item) : Number(item.stock || 0);
  };

  /* =====================================================
     UNIQUE CART ITEM CHECK
  ===================================================== */

  const isSameCartItem = (a: CartItem, b: CartItem) => {
    return (
      String(a._id) === String(b._id) &&
      String(a.variantId || "") === String(b.variantId || "")
    );
  };

  /* =====================================================
     TOTAL
  ===================================================== */

  const total = items.reduce(
    (sum, item) => sum + getPrice(item) * Number(item.quantity || 0),
    0,
  );

  /* =====================================================
     INCREASE
  ===================================================== */

  const increase = (item: CartItem) => {
    const stock = getStock(item);

    if (stock <= 0) {
      return;
    }

    const next = items.map((current) => {
      if (!isSameCartItem(current, item)) {
        return current;
      }

      return {
        ...current,
        quantity: Math.min(Number(current.quantity || 0) + 1, stock),
      };
    });

    save(next);
  };

  /* =====================================================
     DECREASE
  ===================================================== */

  const decrease = (item: CartItem) => {
    const next = items.map((current) => {
      if (!isSameCartItem(current, item)) {
        return current;
      }

      return {
        ...current,
        quantity: Math.max(1, Number(current.quantity || 0) - 1),
      };
    });

    save(next);
  };

  /* =====================================================
     REMOVE
  ===================================================== */

  const remove = (item: CartItem) => {
    const next = items.filter((current) => !isSameCartItem(current, item));

    save(next);
  };

  /* =====================================================
     TOTAL ITEM COUNT
  ===================================================== */

  const totalItems = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <main className="container section">
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          marginBottom: 25,
        }}
      >
        <h1>Your Cart</h1>

        {items.length > 0 && (
          <p className="muted">
            {totalItems} item
            {totalItems !== 1 ? "s" : ""} in your cart
          </p>
        )}
      </div>

      {/* =================================================
          EMPTY CART
      ================================================= */}

      {!items.length ? (
        <div
          className="empty"
          style={{
            padding: "60px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 55,
              marginBottom: 15,
            }}
          >
            🛒
          </div>

          <h2>Your cart is empty</h2>

          <p
            className="muted"
            style={{
              marginBottom: 20,
            }}
          >
            Looks like you haven't added anything yet.
          </p>

          <Link className="btn" href="/shop">
            Shop Now
          </Link>
        </div>
      ) : (
        /* =================================================
           CART CONTENT
        ================================================= */

        <div
          className="cart-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr",
            gap: 20,
            alignItems: "start",
          }}
        >
          {/* =================================================
              ITEMS
          ================================================= */}

          <div className="form">
            {items.map((item, index) => {
              const price = getPrice(item);

              const image = item.variantImage || item.images?.[0];

              const stock = getStock(item);

              const quantity = Number(item.quantity || 0);

              const itemTotal = price * quantity;

              return (
                <div
                  key={`${item._id}-${item.variantId || "default"}-${index}`}
                  className="cart-item"
                  style={{
                    display: "flex",
                    gap: 15,
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {/* =====================================
                        IMAGE
                    ===================================== */}

                  <div
                    style={{
                      flexShrink: 0,
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={
                          item.variantColor
                            ? `${item.name} - ${item.variantColor}`
                            : item.name
                        }
                        width={80}
                        height={80}
                        style={{
                          width: 80,
                          height: 80,
                          objectFit: "cover",
                          borderRadius: 12,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 80,
                          borderRadius: 12,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#f3f4f6",
                          fontSize: 30,
                        }}
                      >
                        🧸
                      </div>
                    )}
                  </div>

                  {/* =====================================
                        PRODUCT INFO
                    ===================================== */}

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        fontSize: 15,
                      }}
                    >
                      {item.name}
                    </strong>

                    {/* COLOR */}

                    {item.variantColor && (
                      <div
                        style={{
                          marginTop: 5,
                          fontSize: 13,
                        }}
                      >
                        🎨 Color: <strong>{item.variantColor}</strong>
                      </div>
                    )}

                    {/* PRICE */}

                    <div
                      style={{
                        marginTop: 6,
                        color: "var(--brand)",
                        fontWeight: 800,
                      }}
                    >
                      ৳{price}
                    </div>

                    {/* STOCK */}

                    <small
                      className="muted"
                      style={{
                        display: "block",
                        marginTop: 3,
                      }}
                    >
                      {stock > 0 ? `${stock} available` : "Out of stock"}
                    </small>
                  </div>

                  {/* =====================================
                        QUANTITY
                    ===================================== */}

                  <div
                    className="cart-quantity"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => decrease(item)}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>{quantity}</span>

                    <button
                      type="button"
                      onClick={() => increase(item)}
                      disabled={quantity >= stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* =====================================
                        ITEM TOTAL
                    ===================================== */}

                  <div
                    className="cart-item-total"
                    style={{
                      whiteSpace: "nowrap",
                      fontWeight: 800,
                    }}
                  >
                    ৳{itemTotal}
                  </div>

                  {/* =====================================
                        REMOVE
                    ===================================== */}

                  <button
                    type="button"
                    className="remove-item"
                    onClick={() => remove(item)}
                    aria-label={`Remove ${item.name}${
                      item.variantColor ? ` ${item.variantColor}` : ""
                    }`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {/* =================================================
              ORDER SUMMARY
          ================================================= */}

          <div
            className="form cart-summary"
            style={{
              position: "sticky",
              top: 95,
            }}
          >
            <h3>Order Summary</h3>

            <div className="summary-row">
              <span>Items</span>

              <strong>{totalItems}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>৳{total}</strong>
            </div>

            <div className="summary-row">
              <span>Delivery</span>

              <span className="summary-muted">Calculated at checkout</span>
            </div>

            <hr />

            <div className="summary-total">
              <strong>Total</strong>

              <strong>৳{total}</strong>
            </div>

            <Link
              className="btn checkout-btn"
              href="/checkout"
              style={{
                width: "100%",
              }}
            >
              Proceed to Checkout →
            </Link>

            <Link
              href="/shop"
              className="text-link"
              style={{
                display: "block",
                textAlign: "center",
                marginTop: 15,
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
