"use client";

type OrderItem = {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantColor?: string;
  variantImage?: string;
};

export type AdminOrder = {
  _id?: string;
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

type OrderTableProps = {
  orders: AdminOrder[];
  loading?: boolean;
  updatingOrderId?: string;
  onStatusChange: (orderId: string, status: string) => void;
  onView: (order: AdminOrder) => void;
};

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(value).toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

function getStatusLabel(status: string) {
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

function getStatusStyle(status: string) {
  switch (String(status || "").toLowerCase()) {
    case "confirmed":
      return {
        background: "#eef6ff",
        color: "#1769aa",
      };

    case "processing":
      return {
        background: "#f4efff",
        color: "#6842b8",
      };

    case "shipped":
      return {
        background: "#eefbf8",
        color: "#087f68",
      };

    case "delivered":
      return {
        background: "#eefbf2",
        color: "#16753b",
      };

    case "cancelled":
      return {
        background: "#fff1f1",
        color: "#c62828",
      };

    default:
      return {
        background: "#fff8e6",
        color: "#a66a00",
      };
  }
}

export default function OrderTable({
  orders,
  loading = false,
  updatingOrderId = "",
  onStatusChange,
  onView,
}: OrderTableProps) {
  /* =====================================================
     EMPTY
  ===================================================== */

  if (!loading && orders.length === 0) {
    return (
      <div
        style={{
          padding: 45,
          textAlign: "center",
          border: "1px dashed var(--line)",
          borderRadius: 16,
          background: "#fafafa",
        }}
      >
        <div
          style={{
            fontSize: 42,
            marginBottom: 10,
          }}
        >
          📦
        </div>

        <h3>No Orders Yet</h3>

        <p
          className="muted"
          style={{
            margin: 0,
          }}
        >
          Customer orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="admin-orders-table-wrapper">
      <table className="admin-orders-table">
        <thead>
          <tr>
            <th>Order</th>

            <th>Customer</th>

            <th>Products</th>

            <th>Total</th>

            <th>Status</th>

            <th>Date</th>

            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => {
            const status = String(order.status || "pending").toLowerCase();

            const statusStyle = getStatusStyle(status);

            const itemCount =
              order.items?.reduce(
                (total, item) => total + Number(item.quantity || 0),
                0,
              ) || 0;

            const isUpdating = updatingOrderId === order.orderId;

            return (
              <tr key={order._id || order.orderId}>
                {/* =====================================
                      ORDER ID
                  ===================================== */}

                <td>
                  <strong
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {order.orderId}
                  </strong>

                  <small
                    className="muted"
                    style={{
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    {itemCount} item
                    {itemCount !== 1 ? "s" : ""}
                  </small>
                </td>

                {/* =====================================
                      CUSTOMER
                  ===================================== */}

                <td>
                  <strong>{order.name}</strong>

                  <a
                    href={`tel:${order.phone}`}
                    style={{
                      display: "block",
                      marginTop: 4,
                      fontSize: 13,
                    }}
                  >
                    📞 {order.phone}
                  </a>

                  <small
                    className="muted"
                    style={{
                      display: "block",
                      marginTop: 4,
                      maxWidth: 180,
                    }}
                  >
                    {order.address}
                  </small>
                </td>

                {/* =====================================
                      PRODUCTS
                  ===================================== */}

                <td>
                  <div
                    style={{
                      display: "grid",
                      gap: 7,
                    }}
                  >
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div
                        key={`${item._id}-${item.variantId || "default"}-${index}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                        }}
                      >
                        {item.variantImage ? (
                          <img
                            src={item.variantImage}
                            alt={item.name}
                            width={35}
                            height={35}
                            style={{
                              width: 35,
                              height: 35,
                              objectFit: "cover",
                              borderRadius: 7,
                              flexShrink: 0,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 35,
                              height: 35,
                              borderRadius: 7,
                              background: "#f3f4f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            🧸
                          </div>
                        )}

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 12,
                              fontWeight: 700,
                              maxWidth: 190,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </div>

                          <small className="muted">
                            {item.variantColor ? `${item.variantColor} • ` : ""}
                            Qty: {item.quantity}
                          </small>
                        </div>
                      </div>
                    ))}

                    {order.items?.length > 3 && (
                      <small className="muted">
                        +{order.items.length - 3} more
                      </small>
                    )}
                  </div>
                </td>

                {/* =====================================
                      TOTAL
                  ===================================== */}

                <td>
                  <strong
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    ৳{Number(order.total || 0)}
                  </strong>

                  <small
                    className="muted"
                    style={{
                      display: "block",
                      marginTop: 4,
                    }}
                  >
                    {order.deliveryType === "outside"
                      ? "Outside Dhaka"
                      : "Inside Dhaka"}
                  </small>
                </td>

                {/* =====================================
                      STATUS
                  ===================================== */}

                <td>
                  <div
                    style={{
                      display: "grid",
                      gap: 7,
                      minWidth: 145,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        width: "fit-content",
                        padding: "5px 9px",
                        borderRadius: 999,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "capitalize",
                        background: statusStyle.background,
                        color: statusStyle.color,
                      }}
                    >
                      {getStatusLabel(status)}
                    </span>

                    <select
                      value={status}
                      disabled={isUpdating}
                      onChange={(e) =>
                        onStatusChange(order.orderId, e.target.value)
                      }
                      style={{
                        fontSize: 12,
                      }}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {getStatusLabel(option)}
                        </option>
                      ))}
                    </select>

                    {isUpdating && <small className="muted">Updating...</small>}
                  </div>
                </td>

                {/* =====================================
                      DATE
                  ===================================== */}

                <td>
                  <small className="muted">{formatDate(order.createdAt)}</small>
                </td>

                {/* =====================================
                      ACTION
                  ===================================== */}

                <td>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => onView(order)}
                    style={{
                      padding: "8px 12px",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
