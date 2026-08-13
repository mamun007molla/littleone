"use client";

import { useRef, useState } from "react";
import { Product, ProductVariant } from "@/models/types";
import ProductVariants from "./ProductVariants";

type ProductFormProps = {
  form: Product;

  setForm: React.Dispatch<React.SetStateAction<Product>>;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;

  editing: boolean;

  saving?: boolean;

  categories: string[];

  onCancel: () => void;
};

export default function ProductForm({
  form,
  setForm,
  onSubmit,
  editing,
  saving = false,
  categories,
  onCancel,
}: ProductFormProps) {
  const [uploadingImages, setUploadingImages] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);

  /* =========================================================
     BASIC FIELD UPDATE
  ========================================================= */

  const updateField = <K extends keyof Product>(
    field: K,
    value: Product[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =========================================================
     CATEGORIES
  ========================================================= */

  const selectedCategories = Array.isArray(form.categories)
    ? form.categories
    : [];

  const toggleCategory = (category: string) => {
    setForm((current) => {
      const currentCategories = Array.isArray(current.categories)
        ? current.categories
        : [];

      const exists = currentCategories.includes(category);

      return {
        ...current,

        categories: exists
          ? currentCategories.filter((item) => item !== category)
          : [...currentCategories, category],
      };
    });
  };

  /* =========================================================
     FEATURES
  ========================================================= */

  const featuresText = Array.isArray(form.features)
    ? form.features.join("\n")
    : "";

  const updateFeatures = (value: string) => {
    const features = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField("features", features);
  };

  /* =========================================================
     VARIANTS
  ========================================================= */

  const variants = Array.isArray(form.variants) ? form.variants : [];

  const updateVariants = (nextVariants: ProductVariant[]) => {
    setForm((current) => ({
      ...current,

      variants: nextVariants,

      stock:
        nextVariants.length > 0
          ? nextVariants.reduce(
              (total, variant) => total + Number(variant.stock || 0),
              0,
            )
          : current.stock,
    }));
  };

  /* =========================================================
     CLOUDINARY DIRECT UPLOAD
  ========================================================= */

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      /* =====================================================
         GET CLOUDINARY SIGNATURE
      ===================================================== */

      const signatureResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          resourceType: "image",
        }),
      });

      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok) {
        console.error("Cloudinary signature error:", signatureData);

        alert(signatureData?.error || "Could not prepare image upload.");

        return null;
      }

      /* =====================================================
         CLOUDINARY UPLOAD URL
      ===================================================== */

      const uploadUrl =
        `https://api.cloudinary.com/v1_1/` +
        `${signatureData.cloudName}/image/upload`;

      /* =====================================================
         FORM DATA
      ===================================================== */

      const uploadData = new FormData();

      uploadData.append("file", file);

      uploadData.append("api_key", signatureData.apiKey);

      uploadData.append("timestamp", String(signatureData.timestamp));

      uploadData.append("signature", signatureData.signature);

      uploadData.append("folder", signatureData.folder);

      /* =====================================================
         DIRECT CLOUDINARY UPLOAD
      ===================================================== */

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudinary image upload error:", data);

        alert(data?.error?.message || "Image upload failed.");

        return null;
      }

      if (!data?.secure_url) {
        alert("Upload completed but no image URL was returned.");

        return null;
      }

      return String(data.secure_url);
    } catch (error) {
      console.error("Image upload error:", error);

      alert("Image upload failed. Please try again.");

      return null;
    }
  };

  /* =========================================================
     MAIN IMAGE UPLOAD
  ========================================================= */

  const handleMainImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        /* IMAGE TYPE */

        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file.`);

          continue;
        }

        /* IMAGE SIZE */

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
          alert(`${file.name} is larger than 10MB.`);

          continue;
        }

        /* CLOUDINARY */

        const url = await uploadImage(file);

        if (url) {
          uploadedUrls.push(url);
        }
      }

      /* SAVE URLS */

      if (uploadedUrls.length > 0) {
        setForm((current) => ({
          ...current,

          images: [...(current.images || []), ...uploadedUrls],
        }));
      }
    } finally {
      setUploadingImages(false);

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  /* =========================================================
     REMOVE MAIN IMAGE
  ========================================================= */

  const removeMainImage = (imageIndex: number) => {
    setForm((current) => ({
      ...current,

      images: (current.images || []).filter((_, index) => index !== imageIndex),
    }));
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* =====================================================
       CATEGORY VALIDATION
    ===================================================== */

    if (selectedCategories.length === 0) {
      alert("Please select at least one category.");

      return;
    }

    /* =====================================================
       SUBMIT
    ===================================================== */

    onSubmit(e);
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <form onSubmit={handleSubmit} className="admin-product-form">
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 15,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {editing ? "Edit Product" : "Add New Product"}
          </h2>

          <p
            className="muted"
            style={{
              margin: "5px 0 0",
              fontSize: 13,
            }}
          >
            {editing
              ? "Update product information, categories, colors, images and video."
              : "Add a new product to your shop."}
          </p>
        </div>

        {editing && (
          <button
            type="button"
            className="btn secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* =================================================
          BASIC INFORMATION
      ================================================= */}

      <div className="admin-form-section">
        <div className="admin-form-section-title">
          <span>🧸</span>

          <div>
            <h3>Basic Information</h3>

            <p className="muted">Main information about this product.</p>
          </div>
        </div>

        {/* PRODUCT NAME */}

        <label>
          Product Name
          <input
            type="text"
            value={form.name || ""}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. Cute Panda Toy"
            required
          />
        </label>

        {/* SLUG */}

        <label>
          Slug
          <input
            type="text"
            value={form.slug || ""}
            onChange={(e) =>
              updateField(
                "slug",
                e.target.value.toLowerCase().trim().replace(/\s+/g, "-"),
              )
            }
            placeholder="cute-panda-toy"
            required
          />
          <small className="muted">Example: cute-panda-toy</small>
        </label>

        {/* =================================================
            MULTIPLE CATEGORIES
        ================================================= */}

        <div className="admin-category-field">
          <div className="admin-field-heading">
            <strong>Categories</strong>

            <span className="muted">Select one or more</span>
          </div>

          <div className="admin-category-grid">
            {categories.map((category) => {
              const selected = selectedCategories.includes(category);

              return (
                <label
                  key={category}
                  className={`admin-category-option ${
                    selected ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleCategory(category)}
                  />

                  <span className="admin-category-check">
                    {selected ? "✓" : ""}
                  </span>

                  <span className="admin-category-name">{category}</span>
                </label>
              );
            })}
          </div>

          {selectedCategories.length > 0 && (
            <div className="admin-selected-categories">
              <span>Selected:</span>

              {selectedCategories.map((category) => (
                <span key={category} className="admin-selected-category">
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AGE */}

        <label>
          Recommended Age
          <input
            type="text"
            value={form.ageRange || ""}
            onChange={(e) => updateField("ageRange", e.target.value)}
            placeholder="e.g. 3–6 Years"
          />
        </label>

        {/* DESCRIPTION */}

        <label>
          Description
          <textarea
            value={form.description || ""}
            onChange={(e) => updateField("description", e.target.value)}
            placeholder="Write a short description about this product..."
            rows={5}
            required
          />
        </label>

        {/* FEATURES */}

        <label>
          Product Features
          <textarea
            value={featuresText}
            onChange={(e) => updateFeatures(e.target.value)}
            placeholder={`Enter one feature per line

Easy to use
Baby friendly
Colorful design
Safe material`}
            rows={6}
          />
          <small className="muted">Write one feature per line.</small>
        </label>
      </div>

      {/* =================================================
          PRICING & STOCK
      ================================================= */}

      <div className="admin-form-section">
        <div className="admin-form-section-title">
          <span>💰</span>

          <div>
            <h3>Pricing & Stock</h3>

            <p className="muted">Set your product price and availability.</p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          {/* REGULAR PRICE */}

          <label>
            Regular Price
            <input
              type="number"
              min="0"
              value={form.regularPrice ?? ""}
              onChange={(e) =>
                updateField("regularPrice", Number(e.target.value || 0))
              }
              placeholder="749"
              required
            />
          </label>

          {/* OFFER PRICE */}

          <label>
            Offer Price
            <input
              type="number"
              min="0"
              value={form.offerPrice ?? ""}
              onChange={(e) =>
                updateField(
                  "offerPrice",
                  e.target.value === "" ? undefined : Number(e.target.value),
                )
              }
              placeholder="599"
            />
            <small className="muted">
              Leave empty if there is no discount.
            </small>
          </label>
        </div>

        {/* STOCK */}

        <label>
          Main Stock
          <input
            type="number"
            min="0"
            value={form.stock ?? 0}
            onChange={(e) =>
              updateField("stock", Math.max(0, Number(e.target.value || 0)))
            }
            disabled={variants.length > 0}
          />
          {variants.length > 0 && (
            <small className="muted">
              Main stock is automatically calculated from color variant stocks.
            </small>
          )}
        </label>
      </div>

      {/* =================================================
          PRODUCT STATUS
      ================================================= */}

      <div className="admin-form-section">
        <div className="admin-form-section-title">
          <span>🏷️</span>

          <div>
            <h3>Product Status</h3>

            <p className="muted">
              Choose where this product should appear on your website.
            </p>
          </div>
        </div>

        <div className="admin-product-status-grid">
          {/* OFFER */}

          <label
            className={`admin-status-option ${form.offer ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={Boolean(form.offer)}
              onChange={(e) => updateField("offer", e.target.checked)}
            />

            <span className="admin-status-icon">🏷️</span>

            <span>
              <strong>Offer</strong>

              <small>Show in Offers</small>
            </span>
          </label>

          {/* NEW ARRIVAL */}

          <label
            className={`admin-status-option ${
              form.newArrival ? "selected" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(form.newArrival)}
              onChange={(e) => updateField("newArrival", e.target.checked)}
            />

            <span className="admin-status-icon">✨</span>

            <span>
              <strong>New Arrival</strong>

              <small>Show in New Arrivals</small>
            </span>
          </label>

          {/* BEST SELLER */}

          <label
            className={`admin-status-option ${
              form.bestSeller ? "selected" : ""
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(form.bestSeller)}
              onChange={(e) => updateField("bestSeller", e.target.checked)}
            />

            <span className="admin-status-icon">🔥</span>

            <span>
              <strong>Best Seller</strong>

              <small>Show on homepage</small>
            </span>
          </label>

          {/* FEATURED */}

          <label
            className={`admin-status-option ${form.featured ? "selected" : ""}`}
          >
            <input
              type="checkbox"
              checked={Boolean(form.featured)}
              onChange={(e) => updateField("featured", e.target.checked)}
            />

            <span className="admin-status-icon">⭐</span>

            <span>
              <strong>Featured</strong>

              <small>Show in featured sections</small>
            </span>
          </label>
        </div>
      </div>

      {/* =================================================
          MAIN PRODUCT IMAGES
      ================================================= */}

      <div className="admin-form-section">
        <div className="admin-form-section-title">
          <span>🖼️</span>

          <div>
            <h3>Main Product Images</h3>

            <p className="muted">Upload the default product images.</p>
          </div>
        </div>

        {/* HIDDEN INPUT */}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleMainImageUpload(e.target.files)}
        />

        {/* UPLOAD */}

        <div className="admin-main-upload-area">
          <button
            type="button"
            className="btn secondary"
            disabled={uploadingImages}
            onClick={() => imageInputRef.current?.click()}
          >
            {uploadingImages ? "Uploading..." : "📷 Upload Images"}
          </button>

          <p className="muted">
            Select one or multiple images from your computer.
          </p>
        </div>

        {/* IMAGE PREVIEW */}

        {form.images && form.images.length > 0 ? (
          <div className="admin-main-image-grid">
            {form.images.map((image, index) => (
              <div key={`${image}-${index}`} className="admin-main-image-item">
                <img src={image} alt={`${form.name} ${index + 1}`} />

                <button
                  type="button"
                  className="admin-media-remove"
                  onClick={() => removeMainImage(index)}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-upload-empty">
            🖼️
            <span>No main images uploaded</span>
          </div>
        )}
      </div>

      {/* =================================================
          COLOR VARIANTS
      ================================================= */}

      <div className="admin-form-section">
        <ProductVariants variants={variants} onChange={updateVariants} />
      </div>

      {/* =================================================
          FORM ACTIONS
      ================================================= */}

      <div className="admin-product-form-actions">
        {editing && (
          <button
            type="button"
            className="btn secondary"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="btn"
          disabled={saving || uploadingImages}
        >
          {saving ? "Saving..." : editing ? "Update Product" : "Add Product"}
        </button>
      </div>
    </form>
  );
}
