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
     CATEGORIES
  ===================================================== */

  const getCategories = (product: Product) => {
    if (Array.isArray(product.categories)) {
      return product.categories.filter(Boolean);
    }

    // Old product compatibility
    const oldCategory = (product as Product & { category?: string }).category;

    return oldCategory ? [oldCategory] : [];
  };

  /* =====================================================
     EMPTY
  ===================================================== */

  if (!loading && !products.length) {
    return (
      <div className="admin-product-empty">
        <div className="admin-product-empty-icon">🧸</div>

        <h3>No Products Yet</h3>

        <p className="muted">Add your first product using the product form.</p>
      </div>
    );
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="admin-product-loading">
        <div className="admin-product-loading-icon">⏳</div>

        <strong>Loading products...</strong>
      </div>
    );
  }

  /* =====================================================
     TABLE
  ===================================================== */

  return (
    <div className="admin-product-table-wrapper">
      <table className="admin-product-table">
        <colgroup>
          <col className="product-col" />
          <col className="category-col" />
          <col className="price-col" />
          <col className="stock-col" />
          <col className="colors-col" />
          <col className="featured-col" />
          <col className="actions-col" />
        </colgroup>

        <thead>
          <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Colors</th>
            <th>Tags</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {products.map((product) => {
            const image = product.images?.[0];

            const variants = Array.isArray(product.variants)
              ? product.variants
              : [];

            const categories = getCategories(product);

            const stock = getTotalStock(product);

            const price = getPrice(product);

            const regularPrice = Number(product.regularPrice || 0);

            const hasOffer =
              product.offerPrice != null &&
              Number(product.offerPrice) > 0 &&
              Number(product.offerPrice) < regularPrice;

            return (
              <tr key={String(product._id || product.slug)}>
                {/* =================================================
                    PRODUCT
                ================================================= */}

                <td className="product-cell">
                  <div className="product-info">
                    <div className="product-thumb-wrap">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="product-thumb"
                        />
                      ) : (
                        <div className="product-thumb-placeholder">🧸</div>
                      )}
                    </div>

                    <div className="product-name-wrap">
                      <strong className="product-name">{product.name}</strong>

                      <small className="muted product-slug">
                        /{product.slug}
                      </small>
                    </div>
                  </div>
                </td>

                {/* =================================================
                    CATEGORY
                ================================================= */}

                <td className="category-cell">
                  {categories.length > 0 ? (
                    <div className="admin-category-list">
                      {categories.map((category) => (
                        <span key={category} className="admin-category-pill">
                          {category}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">No category</span>
                  )}
                </td>

                {/* =================================================
                    PRICE
                ================================================= */}

                <td className="price-cell">
                  <div className="product-price">
                    <strong>৳{price}</strong>

                    {hasOffer && (
                      <small className="product-old-price">
                        ৳{regularPrice}
                      </small>
                    )}
                  </div>
                </td>

                {/* =================================================
                    STOCK
                ================================================= */}

                <td className="stock-cell">
                  <div className="product-stock">
                    <strong
                      className={
                        stock <= 0
                          ? "stock-out"
                          : stock <= 5
                            ? "stock-low"
                            : "stock-good"
                      }
                    >
                      {stock}
                    </strong>

                    <small className="muted">
                      {stock <= 0
                        ? "Out of stock"
                        : stock <= 5
                          ? "Low stock"
                          : "In stock"}
                    </small>
                  </div>
                </td>

                {/* =================================================
                    COLORS
                ================================================= */}

                <td className="colors-cell">
                  {variants.length > 0 ? (
                    <div className="product-colors">
                      <strong className="color-count">{variants.length}</strong>

                      <div className="color-list">
                        {variants.slice(0, 3).map((variant) => (
                          <span
                            key={variant.id}
                            title={variant.color}
                            className="color-pill"
                          >
                            {variant.color}
                          </span>
                        ))}

                        {variants.length > 3 && (
                          <span className="color-more">
                            +{variants.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="muted">No colors</span>
                  )}
                </td>

                {/* =================================================
                    TAGS
                ================================================= */}

                <td className="tags-cell">
                  <div className="product-tags">
                    {product.bestSeller && (
                      <span className="admin-tag best">🔥 Best Seller</span>
                    )}

                    {product.newArrival && (
                      <span className="admin-tag new">✨ New Arrival</span>
                    )}

                    {product.offer && (
                      <span className="admin-tag offer">🏷️ Offer</span>
                    )}

                    {product.featured && (
                      <span className="admin-tag featured">⭐ Featured</span>
                    )}

                    {!product.bestSeller &&
                      !product.newArrival &&
                      !product.offer &&
                      !product.featured && <span className="muted">—</span>}
                  </div>
                </td>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <td className="actions-cell">
                  <div className="product-actions">
                    <button
                      type="button"
                      className="btn secondary product-edit-btn"
                      onClick={() => onEdit(product)}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="product-delete-btn"
                      onClick={() => onDelete(product)}
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
