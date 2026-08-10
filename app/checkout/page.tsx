"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CartItem } from "@/models/types";

type DeliveryType = "inside" | "outside";

type PaymentMethod = "cod" | "bkash" | "nagad" | "bank";

const PAYMENT_DETAILS = {
  bkash: {
    title: "bKash",
    number: "01778930553",
  },

  nagad: {
    title: "Nagad",
    number: "01778930553",
  },

  bank: {
    title: "Bank Transfer",
    bankName: "BRAC Bank PLC",
    accountName: "MD MAMUN MOLLA",
    accountNumber: "1053335630001",
    branchName: "KONABARI SME/KRISHI BR",
    routingNumber: "060330952",
    swiftCode: "BRAKBDDH",
  },

  cod: {
    title: "Cash on Delivery",
  },
};

export default function CheckoutPage() {
  /* =====================================================
     CART
  ===================================================== */

  const [items, setItems] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [successOrderId, setSuccessOrderId] = useState("");

  /* =====================================================
     CUSTOMER INFORMATION
  ===================================================== */

  const [name, setName] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [area, setArea] = useState("");

  const [district, setDistrict] = useState("Dhaka");

  const [deliveryType, setDeliveryType] = useState<DeliveryType>("inside");

  /* =====================================================
     PAYMENT
  ===================================================== */

  const [payment, setPayment] = useState<PaymentMethod>("cod");

  const [senderNumber, setSenderNumber] = useState("");

  const [transactionId, setTransactionId] = useState("");

  const [note, setNote] = useState("");

  /* =====================================================
     LOAD CART
  ===================================================== */

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem("loo_cart");

      const cart: CartItem[] = storedCart ? JSON.parse(storedCart) : [];

      setItems(Array.isArray(cart) ? cart : []);
    } catch (error) {
      console.error("Failed to load cart:", error);

      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /* =====================================================
     PRICE
  ===================================================== */

  const getPrice = (item: CartItem) => {
    const regularPrice = Number(item.regularPrice || 0);

    const offerPrice = item.offerPrice != null ? Number(item.offerPrice) : null;

    if (offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice) {
      return offerPrice;
    }

    return regularPrice;
  };

  /* =====================================================
     SUBTOTAL
  ===================================================== */

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + getPrice(item) * Number(item.quantity || 0),
      0,
    );
  }, [items]);

  /* =====================================================
     DELIVERY
  ===================================================== */

  const delivery = deliveryType === "outside" ? 130 : 80;

  /* =====================================================
     TOTAL
  ===================================================== */

  const total = subtotal + delivery;

  /* =====================================================
     ITEM COUNT
  ===================================================== */

  const itemCount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  /* =====================================================
     PAYMENT CHANGE
  ===================================================== */

  const handlePaymentChange = (method: PaymentMethod) => {
    setPayment(method);

    /*
     * Clear payment information
     * when changing method.
     */

    setSenderNumber("");
    setTransactionId("");
  };

  /* =====================================================
     SUBMIT ORDER
  ===================================================== */

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    /* =================================================
       BASIC VALIDATION
    ================================================= */

    if (!items.length) {
      setError("Your cart is empty.");

      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");

      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number.");

      return;
    }

    if (!address.trim()) {
      setError("Please enter your delivery address.");

      return;
    }

    /* =================================================
       PAYMENT VALIDATION
    ================================================= */

    if (payment === "bkash" || payment === "nagad") {
      if (!senderNumber.trim()) {
        setError("Please enter the Sender Number.");

        return;
      }

      if (!transactionId.trim()) {
        setError("Please enter the Transaction ID.");

        return;
      }
    }

    if (payment === "bank") {
      if (!transactionId.trim()) {
        setError("Please enter the Bank Transaction ID.");

        return;
      }
    }

    /* =================================================
       SUBMITTING
    ================================================= */

    setSubmitting(true);

    try {
      /* =================================================
         ORDER ITEMS

         Only send product IDs and quantities.
         Backend should verify prices.
      ================================================= */

      const orderItems = items.map((item) => ({
        _id: String(item._id),

        name: item.name,

        quantity: Number(item.quantity || 0),

        variantId: item.variantId,

        variantColor: item.variantColor,

        variantImage: item.variantImage,
      }));

      /* =================================================
         CREATE ORDER
      ================================================= */

      const response = await fetch("/api/orders", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),

          phone: phone.trim(),

          address: address.trim(),

          area: area.trim(),

          district: district.trim(),

          deliveryType,

          payment,

          /*
           * Payment information
           */

          senderNumber: senderNumber.trim(),

          transactionId: transactionId.trim(),

          note: note.trim(),

          items: orderItems,
        }),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      /* =================================================
         API ERROR
      ================================================= */

      if (!response.ok) {
        throw new Error(data?.error || "Order could not be placed.");
      }

      /* =================================================
         ORDER ID
      ================================================= */

      const orderId = String(data?.orderId || "");

      if (!orderId) {
        throw new Error("Order was created but Order ID was not returned.");
      }

      /* =================================================
         CLEAR CART
      ================================================= */

      localStorage.removeItem("loo_cart");

      /* =================================================
         UPDATE CART
      ================================================= */

      window.dispatchEvent(new Event("loo-cart"));

      /* =================================================
         SUCCESS
      ================================================= */

      setSuccessOrderId(orderId);
    } catch (error) {
      console.error("Checkout error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while placing your order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="container section">
        <div className="empty">
          <div
            style={{
              fontSize: 45,
              marginBottom: 10,
            }}
          >
            🛒
          </div>

          <p>Loading checkout...</p>
        </div>
      </main>
    );
  }

  /* =====================================================
     SUCCESS
  ===================================================== */

  if (successOrderId) {
    return (
      <main className="container section">
        <div className="checkout-success">
          {/* SUCCESS ICON */}

          <div className="success-icon-wrap">✓</div>

          <span className="eyebrow">ORDER CONFIRMED</span>

          <h1>Order Placed Successfully! 🎉</h1>

          <p className="success-description">
            Thank you for shopping with <strong>Little One Outlet</strong> ❤️
          </p>

          {/* ORDER ID */}

          <div className="success-order-id">
            <span>Your Order ID</span>

            <strong>#{successOrderId}</strong>

            <small>Please save this Order ID to track your order.</small>
          </div>

          {/* =================================================
              PAYMENT SUCCESS
          ================================================= */}

          <div className="checkout-payment-success">
            <div className="checkout-payment-success-header">
              <span>💳</span>

              <div>
                <strong>Payment Method</strong>

                <small>{PAYMENT_DETAILS[payment].title}</small>
              </div>
            </div>

            {/* =========================
                COD
            ========================= */}

            {payment === "cod" && (
              <div className="checkout-payment-details">
                <div className="payment-method-icon">💵</div>

                <strong>Cash on Delivery</strong>

                <p>You can pay when your order is delivered.</p>
              </div>
            )}

            {/* =========================
                BKASH
            ========================= */}

            {payment === "bkash" && (
              <div className="checkout-payment-details">
                <span className="payment-detail-label">bKash Payment</span>

                <div className="payment-number-box">
                  <span>Send Money to</span>

                  <strong>01778930553</strong>
                </div>

                <div className="payment-warning">
                  ⚠️ This is a <strong>Personal bKash Account</strong>. Please
                  use <strong>Send Money</strong> only.
                </div>

                <p>
                  Sender Number: <strong>{senderNumber}</strong>
                </p>

                <p>
                  Transaction ID: <strong>{transactionId}</strong>
                </p>
              </div>
            )}

            {/* =========================
                NAGAD
            ========================= */}

            {payment === "nagad" && (
              <div className="checkout-payment-details">
                <span className="payment-detail-label">Nagad Payment</span>

                <div className="payment-number-box">
                  <span>Send Money to</span>

                  <strong>01778930553</strong>
                </div>

                <div className="payment-warning">
                  ⚠️ This is a <strong>Personal Nagad Account</strong>. Please
                  use <strong>Send Money</strong> only.
                </div>

                <p>
                  Sender Number: <strong>{senderNumber}</strong>
                </p>

                <p>
                  Transaction ID: <strong>{transactionId}</strong>
                </p>
              </div>
            )}

            {/* =========================
                BANK
            ========================= */}

            {payment === "bank" && (
              <div className="checkout-payment-details">
                <span className="payment-detail-label">Bank Transfer</span>

                <div className="bank-details">
                  <div>
                    <span>Bank Name</span>

                    <strong>BRAC Bank PLC</strong>
                  </div>

                  <div>
                    <span>Account Name</span>

                    <strong>MD MAMUN MOLLA</strong>
                  </div>

                  <div>
                    <span>Account Number</span>

                    <strong>1053335630001</strong>
                  </div>

                  <div>
                    <span>Branch Name</span>

                    <strong>KONABARI SME/KRISHI BR</strong>
                  </div>

                  <div>
                    <span>Routing Number</span>

                    <strong>060330952</strong>
                  </div>

                  <div>
                    <span>SWIFT Code</span>

                    <strong>BRAKBDDH</strong>
                  </div>
                </div>

                <p>
                  Transaction ID: <strong>{transactionId}</strong>
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              NEXT STEP
          ================================================= */}

          <div className="checkout-next-step">
            <span>📦</span>

            <div>
              <strong>What happens next?</strong>

              <p>
                We will contact you soon to confirm your order and delivery
                details.
              </p>
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="success-actions">
            <Link
              href={`/track-order?orderId=${encodeURIComponent(
                successOrderId,
              )}`}
              className="btn"
            >
              Track Order →
            </Link>

            <Link href="/shop" className="btn secondary">
              Continue Shopping
            </Link>
          </div>

          <Link href="/" className="success-home">
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (!items.length) {
    return (
      <main className="container section">
        <div className="empty checkout-empty">
          <div className="checkout-empty-icon">🛒</div>

          <h2>Your cart is empty</h2>

          <p className="muted">Add some products before checking out.</p>

          <Link href="/shop" className="btn">
            Shop Now
          </Link>
        </div>
      </main>
    );
  }

  /* =====================================================
     CHECKOUT
  ===================================================== */

  return (
    <main className="container section">
      {/* HEADER */}

      <div className="checkout-header">
        <Link href="/cart" className="text-link">
          ← Back to Cart
        </Link>

        <h1>Checkout</h1>

        <p className="muted">Complete your details to place your order.</p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="checkout-error" role="alert">
          {error}
        </div>
      )}

      {/* =================================================
          FORM
      ================================================= */}

      <form onSubmit={submit} className="checkout-layout">
        {/* =================================================
            CUSTOMER FORM
        ================================================= */}

        <div className="form">
          <h2>Delivery Details</h2>

          {/* NAME */}

          <label>
            Full Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoComplete="name"
              required
            />
          </label>

          {/* PHONE */}

          <label>
            Phone Number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01XXXXXXXXX"
              inputMode="tel"
              autoComplete="tel"
              required
            />
          </label>

          {/* ADDRESS */}

          <label>
            Full Address
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House, road, area..."
              rows={4}
              required
            />
          </label>

          {/* AREA */}

          <label>
            Area
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g. Mirpur, Uttara"
            />
          </label>

          {/* DISTRICT */}

          <label>
            District
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="Dhaka"
            />
          </label>

          {/* =================================================
              DELIVERY
          ================================================= */}

          <div className="checkout-section-block">
            <strong>Delivery Area</strong>

            <div className="checkout-delivery-options">
              {/* INSIDE */}

              <label
                className={`checkout-option ${
                  deliveryType === "inside" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="inside"
                  checked={deliveryType === "inside"}
                  onChange={() => setDeliveryType("inside")}
                />

                <span>
                  <strong>Inside Dhaka</strong>

                  <small>৳80 delivery</small>
                </span>
              </label>

              {/* OUTSIDE */}

              <label
                className={`checkout-option ${
                  deliveryType === "outside" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="outside"
                  checked={deliveryType === "outside"}
                  onChange={() => setDeliveryType("outside")}
                />

                <span>
                  <strong>Outside Dhaka</strong>

                  <small>৳130 delivery</small>
                </span>
              </label>
            </div>
          </div>

          {/* =================================================
              PAYMENT METHOD
          ================================================= */}

          <div className="checkout-payment-section">
            <strong>Payment Method</strong>

            <div className="checkout-payment-options">
              {/* COD */}

              <label
                className={`checkout-option ${
                  payment === "cod" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={payment === "cod"}
                  onChange={() => handlePaymentChange("cod")}
                />

                <span>
                  <strong>💵 Cash on Delivery</strong>

                  <small>Pay when your order arrives</small>
                </span>
              </label>

              {/* BKASH */}

              <label
                className={`checkout-option ${
                  payment === "bkash" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bkash"
                  checked={payment === "bkash"}
                  onChange={() => handlePaymentChange("bkash")}
                />

                <span>
                  <strong>📱 bKash</strong>

                  <small>Send Money</small>
                </span>
              </label>

              {/* NAGAD */}

              <label
                className={`checkout-option ${
                  payment === "nagad" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="nagad"
                  checked={payment === "nagad"}
                  onChange={() => handlePaymentChange("nagad")}
                />

                <span>
                  <strong>🟠 Nagad</strong>

                  <small>Send Money</small>
                </span>
              </label>

              {/* BANK */}

              <label
                className={`checkout-option ${
                  payment === "bank" ? "active" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="bank"
                  checked={payment === "bank"}
                  onChange={() => handlePaymentChange("bank")}
                />

                <span>
                  <strong>🏦 Bank Transfer</strong>

                  <small>Direct bank transfer</small>
                </span>
              </label>
            </div>

            {/* =================================================
                BKASH
            ================================================= */}

            {payment === "bkash" && (
              <div className="payment-details">
                <div className="payment-details-title">📱 bKash Payment</div>

                <div className="payment-number-box">
                  <span>Send Money to</span>

                  <strong>01778930553</strong>
                </div>

                <div className="payment-warning">
                  ⚠️ This is a <strong>Personal bKash Account</strong>. Please
                  use <strong>Send Money</strong> only.
                </div>

                <p className="payment-instruction">
                  After sending the payment, enter your Sender Number and
                  Transaction ID below.
                </p>

                <div className="payment-input-grid">
                  <label>
                    Sender Number
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      inputMode="tel"
                    />
                  </label>

                  <label>
                    Transaction ID
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Transaction ID"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* =================================================
                NAGAD
            ================================================= */}

            {payment === "nagad" && (
              <div className="payment-details">
                <div className="payment-details-title">🟠 Nagad Payment</div>

                <div className="payment-number-box">
                  <span>Send Money to</span>

                  <strong>01778930553</strong>
                </div>

                <div className="payment-warning">
                  ⚠️ This is a <strong>Personal Nagad Account</strong>. Please
                  use <strong>Send Money</strong> only.
                </div>

                <p className="payment-instruction">
                  After sending the payment, enter your Sender Number and
                  Transaction ID below.
                </p>

                <div className="payment-input-grid">
                  <label>
                    Sender Number
                    <input
                      type="tel"
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      inputMode="tel"
                    />
                  </label>

                  <label>
                    Transaction ID
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Transaction ID"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* =================================================
                BANK
            ================================================= */}

            {payment === "bank" && (
              <div className="payment-details">
                <div className="payment-details-title">🏦 Bank Transfer</div>

                <div className="bank-details">
                  <div>
                    <span>Bank Name</span>

                    <strong>BRAC Bank PLC</strong>
                  </div>

                  <div>
                    <span>Account Name</span>

                    <strong>MD MAMUN MOLLA</strong>
                  </div>

                  <div>
                    <span>Account Number</span>

                    <strong>1053335630001</strong>
                  </div>

                  <div>
                    <span>Branch Name</span>

                    <strong>KONABARI SME/KRISHI BR</strong>
                  </div>

                  <div>
                    <span>Routing Number</span>

                    <strong>060330952</strong>
                  </div>

                  <div>
                    <span>SWIFT Code</span>

                    <strong>BRAKBDDH</strong>
                  </div>
                </div>

                <p className="payment-instruction">
                  After completing the bank transfer, enter your Transaction ID
                  below.
                </p>

                <div className="payment-input-grid">
                  <label>
                    Transaction ID
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter Transaction ID"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* COD */}

            {payment === "cod" && (
              <div className="payment-cod-info">
                💵 You can pay when your order is delivered.
              </div>
            )}
          </div>

          {/* =================================================
              ORDER NOTE
          ================================================= */}

          <label>
            Order Note
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any special instruction? (Optional)"
              rows={3}
            />
          </label>

          {/* =================================================
              SUBMIT
          ================================================= */}

          <button
            type="submit"
            className="btn checkout-submit"
            disabled={submitting}
          >
            {submitting ? "Placing Order..." : `Place Order • ৳${total}`}
          </button>
        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

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
                <div key={item._id} className="checkout-item">
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

                    <div className="checkout-item-qty">
                      Qty: {item.quantity}
                    </div>
                  </div>

                  <strong>৳{price * Number(item.quantity || 0)}</strong>
                </div>
              );
            })}
          </div>

          {/* SUMMARY */}

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
      </form>
    </main>
  );
}
