"use client";

import { Product } from "@/models/types";

type ProductTableProps = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  loading?: boolean;
};

export default function ProductTable({
  products,
  onEdit,
  onDelete,
  loading = false,
}: ProductTableProps) {
  /* =====================================================
     PRICE
  ===================================================== */

  const getPrice = (product: Product) => {
    const regularPrice = Number(product.regularPrice || 0);

    const offerPrice =
      product.offerPrice != null ? Number(product.offerPrice) : null;

    if (offerPrice !== null && offerPrice > 0 && offerPrice < regularPrice) {
      return offerPrice;
    }

    return regularPrice;
  };

  /* =====================================================
     STOCK
  ===================================================== */

  const getTotalStock = (product: Product) => {
    if (Array.isArray(product.variants) && product.variants.length > 0) {
      return product.variants.reduce(
        (total, variant) => total + Number(variant.stock || 0),
        0,
      );
    }

    return Number(product.stock || 0);
  };

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!loading && !products.length) {
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
          🧸
        </div>

        <h3>No Products Yet</h3>

        <p
          className="muted"
          style={{
            margin: 0,
          }}
        >
          Add your first product using the product form.
        </p>
      </div>
    );
  }

  return (
    <div
      className="admin-product-table-wrapper"
      style={{
        width: "100%",
        overflowX: "auto",
      }}
    >
      <table
        className="admin-product-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          minWidth: 850,
        }}
      >
        <thead>
          <tr>
            <th>Product</th>

            <th>Category</th>

            <th>Price</th>

            <th>Stock</th>

            <th>Colors</th>

            <th>Featured</th>

            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const image = product.images?.[0];

            const variants = Array.isArray(product.variants)
              ? product.variants
              : [];

            const stock = getTotalStock(product);

            const price = getPrice(product);

            const hasOffer =
              product.offerPrice != null &&
              Number(product.offerPrice) < Number(product.regularPrice);

            return (
              <tr key={String(product._id)}>
                {/* =====================================
                      PRODUCT
                  ===================================== */}

                <td>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        width={58}
                        height={58}
                        style={{
                          width: 58,
                          height: 58,
                          objectFit: "cover",
                          borderRadius: 10,
                          border: "1px solid var(--line)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 58,
                          height: 58,
                          borderRadius: 10,
                          background: "#f3f4f6",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 25,
                          flexShrink: 0,
                        }}
                      >
                        🧸
                      </div>
                    )}

                    <div
                      style={{
                        minWidth: 180,
                      }}
                    >
                      <strong>{product.name}</strong>

                      <small
                        className="muted"
                        style={{
                          display: "block",
                          marginTop: 3,
                        }}
                      >
                        /{product.slug}
                      </small>
                    </div>
                  </div>
                </td>

                {/* =====================================
                      CATEGORY
                  ===================================== */}

                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "5px 9px",
                      borderRadius: 999,
                      background: "#f3f4f6",
                      fontSize: 12,
                    }}
                  >
                    {product.category}
                  </span>
                </td>

                {/* =====================================
                      PRICE
                  ===================================== */}

                <td>
                  <strong>৳{price}</strong>

                  {hasOffer && (
                    <small
                      className="muted"
                      style={{
                        display: "block",
                        textDecoration: "line-through",
                        marginTop: 2,
                      }}
                    >
                      ৳{product.regularPrice}
                    </small>
                  )}
                </td>

                {/* =====================================
                      STOCK
                  ===================================== */}

                <td>
                  <span
                    style={{
                      fontWeight: 700,
                      color:
                        stock <= 0
                          ? "#c62828"
                          : stock <= 5
                            ? "#b26a00"
                            : "#16753b",
                    }}
                  >
                    {stock}
                  </span>

                  <small
                    className="muted"
                    style={{
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {stock <= 0
                      ? "Out of stock"
                      : stock <= 5
                        ? "Low stock"
                        : "In stock"}
                  </small>
                </td>

                {/* =====================================
                      COLORS
                  ===================================== */}

                <td>
                  {variants.length > 0 ? (
                    <div>
                      <strong>{variants.length}</strong>

                      <div
                        style={{
                          display: "flex",
                          gap: 4,
                          flexWrap: "wrap",
                          marginTop: 5,
                        }}
                      >
                        {variants.slice(0, 4).map((variant) => (
                          <span
                            key={variant.id}
                            title={variant.color}
                            style={{
                              padding: "3px 7px",
                              borderRadius: 999,
                              background: "#f5f5f5",
                              fontSize: 10,
                            }}
                          >
                            {variant.color}
                          </span>
                        ))}

                        {variants.length > 4 && (
                          <span
                            className="muted"
                            style={{
                              fontSize: 10,
                            }}
                          >
                            +{variants.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="muted">No variants</span>
                  )}
                </td>

                {/* =====================================
                      FEATURED
                  ===================================== */}

                <td>
                  {product.featured ? (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: "#fff7df",
                        color: "#9a6800",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ⭐ Featured
                    </span>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>

                {/* =====================================
                      ACTIONS
                  ===================================== */}

                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: 7,
                      alignItems: "center",
                    }}
                  >
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => onEdit(product)}
                      style={{
                        padding: "7px 11px",
                        fontSize: 12,
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      style={{
                        border: 0,
                        background: "#fff1f1",
                        color: "#c62828",
                        borderRadius: 8,
                        padding: "8px 11px",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
