"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { Product, ProductVariant } from "@/models/types";
import { CATEGORIES } from "@/lib/constants";

import ProductForm from "@/components/admin/ProductForm";
import ProductTable from "@/components/admin/ProductTable";
import OrderTable, { AdminOrder } from "@/components/admin/OrderTable";
import OrderDetails from "@/components/admin/OrderDetails";

/* =========================================================
   EMPTY PRODUCT
========================================================= */

const EMPTY_PRODUCT: Product = {
  name: "",
  slug: "",
  categories: [],
  description: "",
  features: [],
  regularPrice: 0,
  offerPrice: undefined,
  stock: 0,
  ageRange: "",
  images: [],
  variants: [],
  offer: false,
  newArrival: false,
  bestSeller: false,
  featured: false,
};

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(product: any): Product {
  let categories: string[] = [];

  /*
   * New format:
   * categories: ["Baby Toys", "Gift Items"]
   */

  if (Array.isArray(product?.categories)) {
    categories = product.categories.filter(
      (item: unknown): item is string =>
        typeof item === "string" && item.trim().length > 0,
    );
  } else if (typeof product?.category === "string" && product.category.trim()) {

  /*
   * Old format compatibility:
   * category: "Baby Toys"
   */
    categories = [product.category.trim()];
  }

  /* =====================================================
     VARIANTS
  ===================================================== */

  const variants: ProductVariant[] = Array.isArray(product?.variants)
    ? product.variants.map((variant: any) => ({
        id: String(variant?.id || ""),
        color: String(variant?.color || ""),
        images: Array.isArray(variant?.images)
          ? variant.images.map((image: any) => String(image))
          : [],
        video: variant?.video ? String(variant.video) : undefined,
        stock: Number(variant?.stock || 0),
      }))
    : [];

  /* =====================================================
     TOTAL VARIANT STOCK
  ===================================================== */

  const totalVariantStock = variants.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0,
  );

  /* =====================================================
     RETURN NORMALIZED PRODUCT
  ===================================================== */

  return {
    ...product,

    _id: product?._id ? String(product._id) : undefined,

    name: String(product?.name || ""),

    slug: String(product?.slug || ""),

    categories,

    description: String(product?.description || ""),

    features: Array.isArray(product?.features)
      ? product.features.map((feature: any) => String(feature))
      : [],

    regularPrice: Number(product?.regularPrice || 0),

    offerPrice:
      product?.offerPrice !== undefined &&
      product?.offerPrice !== null &&
      product?.offerPrice !== ""
        ? Number(product.offerPrice)
        : undefined,

    images: Array.isArray(product?.images)
      ? product.images.map((image: any) => String(image))
      : [],

    variants,

    stock:
      variants.length > 0 ? totalVariantStock : Number(product?.stock || 0),

    ageRange: product?.ageRange ? String(product.ageRange) : "",

    offer: Boolean(product?.offer),

    newArrival: Boolean(product?.newArrival),

    bestSeller: Boolean(product?.bestSeller),

    featured: Boolean(product?.featured),

    createdAt:
      product?.createdAt instanceof Date
        ? product.createdAt.toISOString()
        : product?.createdAt,

    updatedAt:
      product?.updatedAt instanceof Date
        ? product.updatedAt.toISOString()
        : product?.updatedAt,
  };
}

/* =========================================================
   ADMIN PAGE
========================================================= */

export default function AdminPage() {
  /* =======================================================
     AUTH
  ======================================================= */

  const [authed, setAuthed] = useState(false);

  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState("");

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState<Product>(EMPTY_PRODUCT);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [loadingProducts, setLoadingProducts] = useState(false);

  const [savingProduct, setSavingProduct] = useState(false);

  /* =======================================================
     ORDERS
  ======================================================= */

  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const [loadingOrders, setLoadingOrders] = useState(false);

  const [updatingOrderId, setUpdatingOrderId] = useState("");

  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  /* =======================================================
     DASHBOARD
  ======================================================= */

  const [activeSection, setActiveSection] = useState<
    "dashboard" | "products" | "orders"
  >("dashboard");

  /* =======================================================
     CHECK LOGIN
  ======================================================= */

  useEffect(() => {
    const saved = sessionStorage.getItem("loo_admin");

    if (saved === "true") {
      setAuthed(true);
    }
  }, []);

  /* =======================================================
     LOAD DATA AFTER LOGIN
  ======================================================= */

  useEffect(() => {
    if (!authed) {
      return;
    }

    loadProducts();
    loadOrders();
  }, [authed]);

  /* =======================================================
     LOAD PRODUCTS
  ======================================================= */

  const loadProducts = async () => {
    setLoadingProducts(true);

    try {
      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load products.");
      }

      const rawProducts = Array.isArray(data?.products) ? data.products : [];

      const normalizedProducts = rawProducts.map(normalizeProduct);

      setProducts(normalizedProducts);
    } catch (error) {
      console.error("Admin products error:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  /* =======================================================
     LOAD ORDERS
  ======================================================= */

  const loadOrders = async () => {
    setLoadingOrders(true);

    try {
      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load orders.");
      }

      setOrders(Array.isArray(data?.orders) ? data.orders : []);
    } catch (error) {
      console.error("Admin orders error:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  /* =======================================================
     LOGIN
  ======================================================= */

  const login = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setAuthError("");

    const ADMIN_PASSWORD = "admin123";

    if (password !== ADMIN_PASSWORD) {
      setAuthError("Incorrect admin password.");
      return;
    }

    sessionStorage.setItem("loo_admin", "true");

    setAuthed(true);
  };

  /* =======================================================
     LOGOUT
  ======================================================= */

  const logout = () => {
    sessionStorage.removeItem("loo_admin");

    setAuthed(false);

    setPassword("");

    setActiveSection("dashboard");
  };

  /* =======================================================
     RESET PRODUCT FORM
  ======================================================= */

  const resetForm = () => {
    setForm({
      ...EMPTY_PRODUCT,

      categories: [],

      features: [],

      images: [],

      variants: [],

      offer: false,

      newArrival: false,

      bestSeller: false,

      featured: false,
    });

    setEditingId(null);
  };

  /* =======================================================
     EDIT PRODUCT
  ======================================================= */

  const editProduct = (product: Product) => {
    const normalized = normalizeProduct(product);

    setForm({
      ...normalized,

      categories: normalized.categories || [],

      features: Array.isArray(normalized.features) ? normalized.features : [],

      images: Array.isArray(normalized.images) ? normalized.images : [],

      variants: Array.isArray(normalized.variants) ? normalized.variants : [],

      offer: Boolean(normalized.offer),

      newArrival: Boolean(normalized.newArrival),

      bestSeller: Boolean(normalized.bestSeller),

      featured: Boolean(normalized.featured),
    });

    setEditingId(String(product._id));

    setActiveSection("products");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  const saveProduct = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSavingProduct(true);

    try {
      const variants = Array.isArray(form.variants) ? form.variants : [];

      /* =================================================
         TOTAL VARIANT STOCK
      ================================================= */

      const totalVariantStock = variants.reduce(
        (total, variant) => total + Number(variant.stock || 0),
        0,
      );

      /* =================================================
         CATEGORIES
      ================================================= */

      const categories = Array.isArray(form.categories)
        ? form.categories
            .filter(
              (category): category is string =>
                typeof category === "string" && category.trim().length > 0,
            )
            .map((category) => category.trim())
        : [];

      if (categories.length === 0) {
        alert("Please select at least one category.");

        setSavingProduct(false);

        return;
      }

      /* =================================================
         PAYLOAD
      ================================================= */

      const payload = {
        name: form.name.trim(),

        slug: form.slug.trim(),

        categories,

        description: form.description.trim(),

        features: Array.isArray(form.features) ? form.features : [],

        regularPrice: Number(form.regularPrice || 0),

        offerPrice:
          form.offerPrice !== undefined && form.offerPrice !== null
            ? Number(form.offerPrice)
            : undefined,

        stock:
          variants.length > 0 ? totalVariantStock : Number(form.stock || 0),

        ageRange: form.ageRange || "",

        images: Array.isArray(form.images) ? form.images : [],

        variants,

        /* =============================================
           PRODUCT FLAGS
        ============================================= */

        offer: Boolean(form.offer),

        newArrival: Boolean(form.newArrival),

        bestSeller: Boolean(form.bestSeller),

        featured: Boolean(form.featured),
      };

      /* =================================================
         API
      ================================================= */

      const url = editingId ? `/api/products/${editingId}` : "/api/products";

      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to save product.");
      }

      /* =================================================
         REFRESH PRODUCTS
      ================================================= */

      await loadProducts();

      /* =================================================
         RESET FORM
      ================================================= */

      resetForm();

      setActiveSection("products");

      alert(
        editingId
          ? "Product updated successfully."
          : "Product added successfully.",
      );
    } catch (error) {
      console.error("Save product error:", error);

      alert(error instanceof Error ? error.message : "Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const deleteProduct = async (product: Product) => {
    const productId = String(product._id || "");

    if (!productId) {
      alert("Product ID is missing.");
      return;
    }

    const confirmed = window.confirm(
      `Delete "${product.name}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete product.");
      }

      setProducts((current) =>
        current.filter((item) => String(item._id) !== productId),
      );

      if (editingId === productId) {
        resetForm();
      }

      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Delete product error:", error);

      alert(
        error instanceof Error ? error.message : "Failed to delete product.",
      );
    }
  };

  /* =======================================================
     UPDATE ORDER STATUS
  ======================================================= */

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);

    try {
      const response = await fetch("/api/orders", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          orderId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to update order.");
      }

      /* ===============================================
         UPDATE LOCAL ORDER LIST
      =============================================== */

      setOrders((current) =>
        current.map((order) =>
          order.orderId === orderId
            ? {
                ...order,
                status,
                updatedAt: new Date().toISOString(),
              }
            : order,
        ),
      );

      /* ===============================================
         UPDATE OPEN ORDER
      =============================================== */

      setSelectedOrder((current) =>
        current && current.orderId === orderId
          ? {
              ...current,
              status,
              updatedAt: new Date().toISOString(),
            }
          : current,
      );
    } catch (error) {
      console.error("Update order status error:", error);

      alert(error instanceof Error ? error.message : "Failed to update order.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  /* =======================================================
     DASHBOARD STATS
  ======================================================= */

  const stats = useMemo(() => {
    const totalProducts = products.length;

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => String(order.status || "").toLowerCase() === "pending",
    ).length;

    const deliveredOrders = orders.filter(
      (order) => String(order.status || "").toLowerCase() === "delivered",
    ).length;

    const totalSales = orders
      .filter(
        (order) => String(order.status || "").toLowerCase() !== "cancelled",
      )
      .reduce((total, order) => total + Number(order.total || 0), 0);

    const lowStock = products.filter((product) => {
      const variants = Array.isArray(product.variants) ? product.variants : [];

      if (variants.length > 0) {
        const total = variants.reduce(
          (sum, variant) => sum + Number(variant.stock || 0),
          0,
        );

        return total > 0 && total <= 5;
      }

      return Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5;
    }).length;

    const bestSellerCount = products.filter((product) =>
      Boolean(product.bestSeller),
    ).length;

    const newArrivalCount = products.filter((product) =>
      Boolean(product.newArrival),
    ).length;

    const offerCount = products.filter((product) =>
      Boolean(product.offer),
    ).length;

    return {
      totalProducts,

      totalOrders,

      pendingOrders,

      deliveredOrders,

      totalSales,

      lowStock,

      bestSellerCount,

      newArrivalCount,

      offerCount,
    };
  }, [products, orders]);

  /* =======================================================
     LOGIN SCREEN
  ======================================================= */

  if (!authed) {
    return (
      <main className="container section">
        <div
          style={{
            minHeight: "70vh",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",
          }}
        >
          <form
            onSubmit={login}
            className="form"
            style={{
              width: "100%",

              maxWidth: 420,
            }}
          >
            <div
              style={{
                textAlign: "center",

                marginBottom: 25,
              }}
            >
              <div
                style={{
                  fontSize: 45,

                  marginBottom: 10,
                }}
              >
                🔐
              </div>

              <span className="eyebrow">LITTLE ONE OUTLET</span>

              <h1>Admin Login</h1>

              <p className="muted">Sign in to manage products and orders.</p>
            </div>

            <label>
              Admin Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
                required
              />
            </label>

            {authError && (
              <div
                style={{
                  marginTop: 12,

                  padding: 12,

                  borderRadius: 10,

                  background: "#fff1f1",

                  color: "#b42318",
                }}
              >
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="btn"
              style={{
                width: "100%",

                marginTop: 15,
              }}
            >
              Login →
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* =======================================================
     ADMIN APP
  ======================================================= */

  return (
    <main className="admin-page">
      {/* =================================================
          ADMIN HEADER
      ================================================= */}

      <header
        className="admin-header"
        style={{
          borderBottom: "1px solid var(--line)",

          background: "#fff",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              gap: 15,

              padding: "18px 0",
            }}
          >
            <div>
              <span className="eyebrow">LITTLE ONE OUTLET</span>

              <h1
                style={{
                  margin: "4px 0 0",
                }}
              >
                Admin Panel
              </h1>
            </div>

            <button type="button" className="btn secondary" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div
        style={{
          borderBottom: "1px solid var(--line)",

          background: "#fff",
        }}
      >
        <div className="container">
          <nav
            style={{
              display: "flex",

              gap: 8,

              overflowX: "auto",

              padding: "10px 0",
            }}
          >
            <button
              type="button"
              className={`btn ${
                activeSection === "dashboard" ? "" : "secondary"
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              📊 Dashboard
            </button>

            <button
              type="button"
              className={`btn ${
                activeSection === "products" ? "" : "secondary"
              }`}
              onClick={() => setActiveSection("products")}
            >
              🧸 Products
            </button>

            <button
              type="button"
              className={`btn ${activeSection === "orders" ? "" : "secondary"}`}
              onClick={() => setActiveSection("orders")}
            >
              📦 Orders
              {stats.pendingOrders > 0 && (
                <span
                  style={{
                    marginLeft: 6,

                    display: "inline-flex",

                    minWidth: 20,

                    height: 20,

                    alignItems: "center",

                    justifyContent: "center",

                    borderRadius: "50%",

                    background: "#fff",

                    color: "var(--brand)",

                    fontSize: 11,

                    fontWeight: 800,
                  }}
                >
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="container section">
        {/* =================================================
            DASHBOARD
        ================================================= */}

        {activeSection === "dashboard" && (
          <section>
            <div
              style={{
                marginBottom: 22,
              }}
            >
              <span className="eyebrow">OVERVIEW</span>

              <h2>Welcome back 👋</h2>

              <p className="muted">Here's what's happening with your store.</p>
            </div>

            {/* STATS */}

            <div
              style={{
                display: "grid",

                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",

                gap: 15,
              }}
            >
              <StatCard
                icon="🧸"
                label="Products"
                value={stats.totalProducts}
              />

              <StatCard
                icon="📦"
                label="Total Orders"
                value={stats.totalOrders}
              />

              <StatCard
                icon="🕐"
                label="Pending Orders"
                value={stats.pendingOrders}
              />

              <StatCard
                icon="🚚"
                label="Delivered"
                value={stats.deliveredOrders}
              />

              <StatCard
                icon="💰"
                label="Total Sales"
                value={`৳${stats.totalSales}`}
              />

              <StatCard icon="⚠️" label="Low Stock" value={stats.lowStock} />

              <StatCard
                icon="🔥"
                label="Best Sellers"
                value={stats.bestSellerCount}
              />

              <StatCard
                icon="✨"
                label="New Arrivals"
                value={stats.newArrivalCount}
              />

              <StatCard icon="🏷️" label="Offers" value={stats.offerCount} />
            </div>

            {/* QUICK ACTIONS */}

            <div
              className="form"
              style={{
                marginTop: 22,
              }}
            >
              <h3>Quick Actions</h3>

              <div
                style={{
                  display: "flex",

                  gap: 10,

                  flexWrap: "wrap",

                  marginTop: 12,
                }}
              >
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    resetForm();

                    setActiveSection("products");
                  }}
                >
                  + Add Product
                </button>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setActiveSection("products")}
                >
                  Manage Products
                </button>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setActiveSection("orders")}
                >
                  View Orders
                </button>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            PRODUCTS
        ================================================= */}

        {activeSection === "products" && (
          <section>
            {/* PRODUCT FORM */}

            <div
              className="form"
              style={{
                marginBottom: 25,
              }}
            >
              <ProductForm
                form={form}
                setForm={setForm}
                onSubmit={saveProduct}
                editing={Boolean(editingId)}
                saving={savingProduct}
                categories={[...CATEGORIES]}
                onCancel={resetForm}
              />
            </div>

            {/* PRODUCT LIST */}

            <div className="form">
              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  gap: 12,

                  marginBottom: 18,

                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span className="eyebrow">STORE</span>

                  <h2
                    style={{
                      margin: "4px 0",
                    }}
                  >
                    Products
                  </h2>

                  <p
                    className="muted"
                    style={{
                      margin: 0,
                    }}
                  >
                    {products.length} product
                    {products.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={loadProducts}
                  disabled={loadingProducts}
                >
                  {loadingProducts ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>

              <ProductTable
                products={products}
                onEdit={editProduct}
                onDelete={deleteProduct}
                loading={loadingProducts}
              />
            </div>
          </section>
        )}

        {/* =================================================
            ORDERS
        ================================================= */}

        {activeSection === "orders" && (
          <section>
            <div className="form">
              <div
                style={{
                  display: "flex",

                  justifyContent: "space-between",

                  alignItems: "center",

                  gap: 12,

                  marginBottom: 18,

                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span className="eyebrow">SALES</span>

                  <h2
                    style={{
                      margin: "4px 0",
                    }}
                  >
                    Orders
                  </h2>

                  <p
                    className="muted"
                    style={{
                      margin: 0,
                    }}
                  >
                    {orders.length} order
                    {orders.length !== 1 ? "s" : ""}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn secondary"
                  onClick={loadOrders}
                  disabled={loadingOrders}
                >
                  {loadingOrders ? "Refreshing..." : "↻ Refresh"}
                </button>
              </div>

              <OrderTable
                orders={orders}
                loading={loadingOrders}
                updatingOrderId={updatingOrderId}
                onStatusChange={updateOrderStatus}
                onView={setSelectedOrder}
              />
            </div>
          </section>
        )}
      </div>

      {/* =================================================
          ORDER DETAILS MODAL
      ================================================= */}

      <OrderDetails
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string | number;
}) {
  return (
    <div
      className="form"
      style={{
        minHeight: 120,

        display: "flex",

        flexDirection: "column",

        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          fontSize: 25,
        }}
      >
        {icon}
      </div>

      <div>
        <div
          className="muted"
          style={{
            fontSize: 12,
          }}
        >
          {label}
        </div>

        <strong
          style={{
            display: "block",

            marginTop: 4,

            fontSize: 25,
          }}
        >
          {value}
        </strong>
      </div>
    </div>
  );
}
