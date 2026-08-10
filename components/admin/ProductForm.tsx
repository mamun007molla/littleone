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

  /* =====================================================
     BASIC FIELD UPDATE
  ===================================================== */

  const updateField = <K extends keyof Product>(
    field: K,
    value: Product[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /* =====================================================
     FEATURES
  ===================================================== */

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

  /* =====================================================
     VARIANTS
  ===================================================== */

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

  /* =====================================================
     CLOUDINARY UPLOAD
  ===================================================== */

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data?.error || "Image upload failed.");

        return null;
      }

      if (!data?.url) {
        alert("Upload completed but no URL was returned.");

        return null;
      }

      return String(data.url);
    } catch (error) {
      console.error("Image upload error:", error);

      alert("Image upload failed. Please try again.");

      return null;
    }
  };

  /* =====================================================
     MAIN IMAGE UPLOAD
  ===================================================== */

  const handleMainImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    setUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          alert(`${file.name} is not an image file.`);

          continue;
        }

        const maxSize = 10 * 1024 * 1024;

        if (file.size > maxSize) {
          alert(`${file.name} is larger than 10MB.`);

          continue;
        }

        const url = await uploadImage(file);

        if (url) {
          uploadedUrls.push(url);
        }
      }

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

  /* =====================================================
     REMOVE MAIN IMAGE
  ===================================================== */

  const removeMainImage = (imageIndex: number) => {
    setForm((current) => ({
      ...current,
      images: (current.images || []).filter((_, index) => index !== imageIndex),
    }));
  };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    onSubmit(e);
  };

  /* =====================================================
     UI
  ===================================================== */

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
              ? "Update product information, colors, images and video."
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

        <label>
          Category
          <select
            value={form.category || ""}
            onChange={(e) => updateField("category", e.target.value)}
            required
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label>
          Recommended Age
          <input
            type="text"
            value={form.ageRange || ""}
            onChange={(e) => updateField("ageRange", e.target.value)}
            placeholder="e.g. 3–6 Years"
          />
        </label>

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
          PRICING
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
          </label>
        </div>

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

        {/* HIDDEN FILE INPUT */}

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => handleMainImageUpload(e.target.files)}
        />

        {/* UPLOAD BUTTON */}

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
          FEATURED
      ================================================= */}

      <div className="admin-form-section">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={Boolean(form.featured)}
            onChange={(e) => updateField("featured", e.target.checked)}
            style={{
              width: 18,
              height: 18,
            }}
          />

          <span>
            <strong>Featured Product</strong>

            <small
              className="muted"
              style={{
                display: "block",
                marginTop: 2,
              }}
            >
              Show this product in featured sections.
            </small>
          </span>
        </label>
      </div>

      {/* =================================================
          FORM ACTIONS
      ================================================= */}

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "flex-end",
          flexWrap: "wrap",
          marginTop: 20,
        }}
      >
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
