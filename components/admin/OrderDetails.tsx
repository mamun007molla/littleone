"use client";

import type { AdminOrder } from "./OrderTable";

type OrderDetailsProps = {
  order: AdminOrder | null;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function paymentLabel(payment?: string) {
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
}

function statusLabel(status?: string) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "processing":
      return "Processing";
    case "shipped":
      return "Shipped";
    case "delivered":
      return "Delivered";
    case "cancelled":
      return "Cancelled";
    default:
      return status || "Pending";
  }
}

export default function OrderDetails({ order, onClose }: OrderDetailsProps) {
  if (!order) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Order ${order.orderId}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,.45)",
        padding: 20,
        overflowY: "auto",
      }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 850,
          margin: "30px auto",
          background: "#fff",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 20px 60px rgba(0,0,0,.18)",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 15,
            marginBottom: 24,
          }}
        >
          <div>
            <span
              className="muted"
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              ORDER DETAILS
            </span>

            <h2
              style={{
                margin: "5px 0",
              }}
            >
              {order.orderId}
            </h2>

            <small className="muted">{formatDate(order.createdAt)}</small>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close order details"
            style={{
              width: 38,
              height: 38,
              border: 0,
              borderRadius: "50%",
              background: "#f3f4f6",
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <div
          style={{
            padding: 15,
            borderRadius: 13,
            background: "#f8fafc",
            marginBottom: 20,
          }}
        >
          <div
            className="muted"
            style={{
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 5,
            }}
          >
            CURRENT STATUS
          </div>

          <strong
            style={{
              textTransform: "capitalize",
              fontSize: 18,
            }}
          >
            {statusLabel(order.status)}
          </strong>
        </div>

        {/* =================================================
            CUSTOMER + DELIVERY
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 15,
          }}
        >
          {/* CUSTOMER */}

          <div
            style={{
              padding: 18,
              border: "1px solid var(--line)",
              borderRadius: 14,
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              Customer
            </h3>

            <p>
              <strong>{order.name}</strong>
            </p>

            <p>
              📞 <a href={`tel:${order.phone}`}>{order.phone}</a>
            </p>

            <p
              className="muted"
              style={{
                marginBottom: 0,
              }}
            >
              Customer contact number
            </p>
          </div>

          {/* DELIVERY */}

          <div
            style={{
              padding: 18,
              border: "1px solid var(--line)",
              borderRadius: 14,
            }}
          >
            <h3
              style={{
                marginTop: 0,
              }}
            >
              Delivery
            </h3>

            <p>📍 {order.address}</p>

            {order.area && <p>Area: {order.area}</p>}

            {order.district && <p>District: {order.district}</p>}

            <p
              style={{
                marginBottom: 0,
              }}
            >
              🚚{" "}
              {order.deliveryType === "outside"
                ? "Outside Dhaka"
                : "Inside Dhaka"}
            </p>
          </div>
        </div>

        {/* =================================================
            PAYMENT
        ================================================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 15,
            marginTop: 15,
          }}
        >
          <div
            style={{
              padding: 16,
              borderRadius: 13,
              background: "#fafafa",
            }}
          >
            <small className="muted">PAYMENT</small>

            <strong
              style={{
                display: "block",
                marginTop: 5,
              }}
            >
              {paymentLabel(order.payment)}
            </strong>
          </div>

          <div
            style={{
              padding: 16,
              borderRadius: 13,
              background: "#fafafa",
            }}
          >
            <small className="muted">DELIVERY CHARGE</small>

            <strong
              style={{
                display: "block",
                marginTop: 5,
              }}
            >
              ৳{Number(order.delivery || 0)}
            </strong>
          </div>
        </div>

        {/* =================================================
            PRODUCTS
        ================================================= */}

        <div
          style={{
            marginTop: 28,
          }}
        >
          <h3>Ordered Products</h3>

          <div
            style={{
              borderTop: "1px solid var(--line)",
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
                    gap: 15,
                    alignItems: "center",
                    padding: "16px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  {/* IMAGE */}

                  {item.variantImage ? (
                    <img
                      src={item.variantImage}
                      alt={item.name}
                      width={78}
                      height={78}
                      style={{
                        width: 78,
                        height: 78,
                        objectFit: "cover",
                        borderRadius: 12,
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: 12,
                        background: "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 30,
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
                          marginTop: 5,
                          fontSize: 13,
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
                      Unit Price: ৳{Number(item.price || 0)}
                    </div>

                    <div
                      className="muted"
                      style={{
                        marginTop: 3,
                        fontSize: 13,
                      }}
                    >
                      Quantity: {item.quantity}
                    </div>
                  </div>

                  {/* TOTAL */}

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
            ORDER NOTE
        ================================================= */}

        {order.note && (
          <div
            style={{
              marginTop: 22,
              padding: 16,
              borderRadius: 13,
              background: "#fffaf0",
              border: "1px solid #f5dfaa",
            }}
          >
            <strong>📝 Customer Note</strong>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              {order.note}
            </p>
          </div>
        )}

        {/* =================================================
            TOTAL
        ================================================= */}

        <div
          style={{
            maxWidth: 360,
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

        {/* =================================================
            CLOSE
        ================================================= */}

        <div
          style={{
            marginTop: 25,
            textAlign: "right",
          }}
        >
          <button type="button" className="btn secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
