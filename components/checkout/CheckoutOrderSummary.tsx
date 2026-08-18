"use client";

import { CartItem } from "@/models/types";

type CheckoutOrderSummaryProps = {
  items: CartItem[];
  subtotal: number;
  delivery: number;
  total: number;
  itemCount: number;
  getPrice: (item: CartItem) => number;
};

export default function CheckoutOrderSummary({
  items,
  subtotal,
  delivery,
  total,
  itemCount,
  getPrice,
}: CheckoutOrderSummaryProps) {
  return (
    <aside className="checkout-summary">
      <h2>Your Order</h2>

      <p className="muted">
        {itemCount} item
        {itemCount !== 1 ? "s" : ""}
      </p>

      <div className="checkout-items">
        {items.map((item) => {
          const price = getPrice(item);

          const image = item.variantImage || item.images?.[0];

          return (
            <div
              key={`${item._id}-${item.variantId || ""}`}
              className="checkout-item"
            >
              {image ? (
                <img src={image} alt={item.name} width={62} height={62} />
              ) : (
                <div className="checkout-item-placeholder">🧸</div>
              )}

              <div className="checkout-item-info">
                <strong>{item.name}</strong>

                {item.variantColor && (
                  <div className="checkout-item-color">
                    Color: <strong>{item.variantColor}</strong>
                  </div>
                )}

                <div className="checkout-item-qty">Qty: {item.quantity}</div>
              </div>

              <strong>৳{price * Number(item.quantity || 0)}</strong>
            </div>
          );
        })}
      </div>

      <div className="checkout-summary-details">
        <div className="summary-row">
          <span>Subtotal</span>

          <strong>৳{subtotal}</strong>
        </div>

        <div className="summary-row">
          <span>Delivery</span>

          <strong>৳{delivery}</strong>
        </div>

        <hr />

        <div className="summary-total">
          <strong>Total</strong>

          <strong>৳{total}</strong>
        </div>
      </div>
    </aside>
  );
}
