"use client";

import { FormEvent, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type OrderItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantColor?: string;
  variantImage?: string;
};

type Order = {
  orderId: string;
  name: string;
  phone: string;
  address: string;
  area?: string;
  district?: string;
  deliveryType?: string;
  delivery?: number;
  payment?: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
};

/* =========================================================
   STATUS
========================================================= */

const STATUS_STEPS = [
  {
    key: "pending",
    label: "Pending",
    icon: "🕐",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: "✓",
  },
  {
    key: "processing",
    label: "Processing",
    icon: "⚙️",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "🚚",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "🎉",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");

  const [order, setOrder] = useState<Order | null>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     TRACK ORDER
  ======================================================= */

  const trackOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const value = query.trim();

    setError("");
    setOrder(null);

    if (!value) {
      setError("Please enter your Order ID or phone number.");
      return;
    }

    /*
     * Order ID:
     *
     * LO-ABC123
     *
     * Phone:
     *
     * 017XXXXXXXX
     */

    const looksLikeOrderId = value.toUpperCase().startsWith("LO-");

    const looksLikePhone = /^[+0-9\s-]{8,}$/.test(value);

    let parameter = "";

    if (looksLikeOrderId) {
      parameter = `orderId=${encodeURIComponent(value.toUpperCase())}`;
    } else if (looksLikePhone) {
      const normalizedPhone = value.replace(/[\s-]/g, "");

      parameter = `phone=${encodeURIComponent(normalizedPhone)}`;
    } else {
      setError("Please enter a valid Order ID (LO-...) or phone number.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/orders?${parameter}`, {
        method: "GET",
        cache: "no-store",
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data?.error || "Order not found.");
      }

      if (!data?.order) {
        throw new Error("Order not found.");
      }

      setOrder(data.order);
    } catch (err) {
      console.error("Track order error:", err);

      setError(
        err instanceof Error ? err.message : "Unable to find your order.",
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (value?: string) => {
    if (!value) {
      return "";
    }

    try {
      return new Date(value).toLocaleString("en-BD", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return "";
    }
  };

  /* =======================================================
     STATUS HELPERS
  ======================================================= */

  const normalizedStatus = String(order?.status || "pending").toLowerCase();

  const currentStatusIndex = STATUS_STEPS.findIndex(
    (step) => step.key === normalizedStatus,
  );

  const isStatusReached = (stepIndex: number) => {
    if (normalizedStatus === "cancelled") {
      return false;
    }

    return currentStatusIndex >= stepIndex;
  };

  const getStatusClass = (status: string) => {
    return `track-status track-status-${String(
      status || "pending",
    ).toLowerCase()}`;
  };

  /* =======================================================
     PAYMENT
  ======================================================= */

  const formatPayment = (payment?: string) => {
    switch (String(payment || "").toLowerCase()) {
      case "cod":
        return "Cash on Delivery";

      case "bkash":
        return "bKash";

      case "nagad":
        return "Nagad";

      case "bank":
        return "Bank Payment";

      default:
        return payment || "Cash on Delivery";
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="container section">
      {/* ===================================================
          HEADER
      =================================================== */}

      <div
        style={{
          maxWidth: 700,
          margin: "0 auto 30px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 50,
            marginBottom: 10,
          }}
        >
          📦
        </div>

        <span className="eyebrow">ORDER TRACKING</span>

        <h1>Track Your Order</h1>

        <p className="muted">
          Enter your Order ID or phone number to check your order status.
        </p>
      </div>

      {/* ===================================================
          SEARCH
      =================================================== */}

      <section
        style={{
          maxWidth: 700,
          margin: "0 auto 30px",
        }}
      >
        <form onSubmit={trackOrder} className="form">
          <label>
            Order ID or Phone Number
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="LO-ABC123 or 017XXXXXXXX"
              autoComplete="off"
            />
          </label>

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 12,
                padding: 13,
                borderRadius: 10,
                background: "#fff1f1",
                color: "#b42318",
                border: "1px solid #ffd5d5",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: 15,
            }}
          >
            {loading ? "Searching..." : "Track Order →"}
          </button>
        </form>
      </section>

      {/* ===================================================
          ORDER RESULT
      =================================================== */}

      {order && (
        <section
          style={{
            maxWidth: 900,
            margin: "0 auto 60px",
          }}
        >
          {/* =================================================
              ORDER HEADER
          ================================================= */}

          <div className="form">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 15,
                flexWrap: "wrap",
              }}
            >
              <div>
                <span
                  className="muted"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  ORDER ID
                </span>

                <h2
                  style={{
                    margin: "4px 0",
                  }}
                >
                  {order.orderId}
                </h2>

                {order.createdAt && (
                  <small className="muted">
                    Placed {formatDate(order.createdAt)}
                  </small>
                )}
              </div>

              <span
                className={getStatusClass(order.status)}
                style={{
                  padding: "8px 14px",
                  borderRadius: 999,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {order.status || "Pending"}
              </span>
            </div>

            {/* =================================================
                ORDER PROGRESS
            ================================================= */}

            <div
              style={{
                marginTop: 30,
              }}
            >
              <h3>Order Status</h3>

              <div
                className="order-progress"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                {STATUS_STEPS.map((step, index) => {
                  const active = isStatusReached(index);

                  return (
                    <div
                      key={step.key}
                      className={`order-progress-step ${
                        active ? "active" : ""
                      }`}
                    >
                      <span>{step.icon}</span>

                      <small>{step.label}</small>
                    </div>
                  );
                })}
              </div>

              {/* CANCELLED */}

              {normalizedStatus === "cancelled" && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 14,
                    borderRadius: 12,
                    background: "#fff1f1",
                    color: "#b42318",
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  ❌ This order has been cancelled.
                </div>
              )}

              {/* DELIVERED */}

              {normalizedStatus === "delivered" && (
                <div
                  style={{
                    marginTop: 15,
                    padding: 14,
                    borderRadius: 12,
                    background: "#eefbf2",
                    color: "#16753b",
                    textAlign: "center",
                    fontWeight: 700,
                  }}
                >
                  🎉 Your order has been delivered!
                </div>
              )}
            </div>

            {/* =================================================
                CUSTOMER INFO
            ================================================= */}

            <div
              style={{
                marginTop: 30,
                padding: 18,
                borderRadius: 14,
                background: "#f8fafc",
              }}
            >
              <h3>Delivery Details</h3>

              <p>
                <strong>{order.name}</strong>
              </p>

              <p>📞 {order.phone}</p>

              <p>
                📍 {order.address}
                {order.area ? `, ${order.area}` : ""}
                {order.district ? `, ${order.district}` : ""}
              </p>

              <p>
                🚚{" "}
                {order.deliveryType === "outside"
                  ? "Outside Dhaka"
                  : "Inside Dhaka"}
              </p>

              <p>💳 {formatPayment(order.payment)}</p>

              {order.note && <p>📝 {order.note}</p>}
            </div>

            {/* =================================================
                PRODUCTS
            ================================================= */}

            <div
              style={{
                marginTop: 30,
              }}
            >
              <h3>Ordered Products</h3>

              <div
                style={{
                  marginTop: 12,
                }}
              >
                {order.items?.map((item, index) => {
                  const itemTotal =
                    Number(item.price || 0) * Number(item.quantity || 0);

                  return (
                    <div
                      key={`${item._id}-${item.variantId || "default"}-${index}`}
                      style={{
                        display: "flex",
                        gap: 14,
                        alignItems: "center",
                        padding: "15px 0",
                        borderBottom: "1px solid var(--line)",
                      }}
                    >
                      {/* IMAGE */}

                      {item.variantImage ? (
                        <img
                          src={item.variantImage}
                          alt={
                            item.variantColor
                              ? `${item.name} - ${item.variantColor}`
                              : item.name
                          }
                          width={70}
                          height={70}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: "cover",
                            borderRadius: 12,
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 70,
                            height: 70,
                            borderRadius: 12,
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 28,
                            flexShrink: 0,
                          }}
                        >
                          🧸
                        </div>
                      )}

                      {/* INFO */}

                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                        }}
                      >
                        <strong>{item.name}</strong>

                        {item.variantColor && (
                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 13,
                              color: "#555",
                            }}
                          >
                            🎨 Color: <strong>{item.variantColor}</strong>
                          </div>
                        )}

                        <div
                          className="muted"
                          style={{
                            marginTop: 4,
                            fontSize: 13,
                          }}
                        >
                          Qty: {item.quantity}
                        </div>

                        <div
                          className="muted"
                          style={{
                            marginTop: 3,
                            fontSize: 12,
                          }}
                        >
                          ৳{item.price} × {item.quantity}
                        </div>
                      </div>

                      {/* PRICE */}

                      <strong
                        style={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        ৳{itemTotal}
                      </strong>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =================================================
                TOTAL
            ================================================= */}

            <div
              style={{
                maxWidth: 350,
                margin: "25px 0 0 auto",
              }}
            >
              <div className="summary-row">
                <span>Subtotal</span>

                <strong>৳{Number(order.subtotal || 0)}</strong>
              </div>

              <div className="summary-row">
                <span>Delivery</span>

                <strong>৳{Number(order.delivery || 0)}</strong>
              </div>

              <hr />

              <div className="summary-total">
                <strong>Total</strong>

                <strong>৳{Number(order.total || 0)}</strong>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
