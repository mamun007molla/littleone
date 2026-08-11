"use client";

import { useRef, useState } from "react";
import { ProductVariant } from "@/models/types";

type ProductVariantsProps = {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
};

function createVariant(): ProductVariant {
  return {
    id: `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    color: "",
    images: [],
    video: "",
    stock: 0,
  };
}

export default function ProductVariants({
  variants,
  onChange,
}: ProductVariantsProps) {
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);

  const [uploadingVideo, setUploadingVideo] = useState<string | null>(null);

  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const videoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  /* =========================================================
     VARIANT
  ========================================================= */

  const addVariant = () => {
    onChange([...variants, createVariant()]);
  };

  const updateVariant = (index: number, changes: Partial<ProductVariant>) => {
    const next = [...variants];

    next[index] = {
      ...next[index],
      ...changes,
    };

    onChange(next);
  };

  const removeVariant = (index: number) => {
    onChange(variants.filter((_, i) => i !== index));
  };

  /* =========================================================
     DIRECT CLOUDINARY UPLOAD
  ========================================================= */

  const uploadFile = async (
    file: File,
    resourceType: "image" | "video",
  ): Promise<string | null> => {
    try {
      /* =====================================================
         STEP 1
         GET SIGNATURE FROM OUR SERVER
      ===================================================== */

      const signatureResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          resourceType,
        }),
      });

      const signatureData = await signatureResponse.json();

      if (!signatureResponse.ok) {
        console.error("Signature error:", signatureData);

        alert(signatureData?.error || "Could not prepare upload.");

        return null;
      }

      /* =====================================================
         STEP 2
         CLOUDINARY UPLOAD URL
      ===================================================== */

      const uploadUrl =
        `https://api.cloudinary.com/v1_1/` +
        `${signatureData.cloudName}/` +
        `${resourceType}/upload`;

      /* =====================================================
         STEP 3
         CREATE CLOUDINARY FORM DATA
      ===================================================== */

      const formData = new FormData();

      formData.append("file", file);

      formData.append("api_key", signatureData.apiKey);

      formData.append("timestamp", String(signatureData.timestamp));

      formData.append("signature", signatureData.signature);

      formData.append("folder", signatureData.folder);

      /* =====================================================
         STEP 4
         DIRECT CLOUDINARY UPLOAD

         Browser → Cloudinary
         NOT Browser → Vercel → Cloudinary
      ===================================================== */

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Cloudinary upload error:", data);

        alert(data?.error?.message || "Upload failed. Please try again.");

        return null;
      }

      /* =====================================================
         STEP 5
         GET SECURE URL
      ===================================================== */

      if (!data?.secure_url) {
        console.error("No secure_url:", data);

        alert("Upload completed but no URL was returned.");

        return null;
      }

      return String(data.secure_url);
    } catch (error) {
      console.error("Cloudinary direct upload error:", error);

      alert("Upload failed. Please try again.");

      return null;
    }
  };

  /* =========================================================
     IMAGE UPLOAD
  ========================================================= */

  const handleImageUpload = async (
    variantIndex: number,
    files: FileList | null,
  ) => {
    if (!files || files.length === 0) {
      return;
    }

    const variantId = variants[variantIndex]?.id;

    if (!variantId) {
      return;
    }

    setUploadingImage(variantId);

    try {
      const uploadedUrls: string[] = [];

      /* ===================================================
         UPLOAD ALL SELECTED IMAGES
      =================================================== */

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

        /* DIRECT CLOUDINARY */

        const url = await uploadFile(file, "image");

        if (url) {
          uploadedUrls.push(url);
        }
      }

      /* ===================================================
         SAVE IMAGE URLS TO VARIANT
      =================================================== */

      if (uploadedUrls.length > 0) {
        const current = variants[variantIndex];

        updateVariant(variantIndex, {
          images: [...(current.images || []), ...uploadedUrls],
        });
      }
    } finally {
      setUploadingImage(null);

      const input = imageInputRefs.current[variantId];

      if (input) {
        input.value = "";
      }
    }
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const variant = variants[variantIndex];

    updateVariant(variantIndex, {
      images: variant.images.filter((_, index) => index !== imageIndex),
    });
  };

  /* =========================================================
     VIDEO UPLOAD
  ========================================================= */

  const handleVideoUpload = async (variantIndex: number, file: File | null) => {
    if (!file) {
      return;
    }

    const variantId = variants[variantIndex]?.id;

    if (!variantId) {
      return;
    }

    /* VIDEO TYPE */

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file.");

      return;
    }

    /* ===================================================
         VIDEO SIZE
         100MB
      =================================================== */

    const maxSize = 100 * 1024 * 1024;

    if (file.size > maxSize) {
      alert("Video must be smaller than 100MB.");

      return;
    }

    setUploadingVideo(variantId);

    try {
      /* =================================================
           DIRECT CLOUDINARY VIDEO UPLOAD
        ================================================= */

      const url = await uploadFile(file, "video");

      if (url) {
        updateVariant(variantIndex, {
          video: url,
        });
      }
    } finally {
      setUploadingVideo(null);

      const input = videoInputRefs.current[variantId];

      if (input) {
        input.value = "";
      }
    }
  };

  /* =========================================================
     REMOVE VIDEO
  ========================================================= */

  const removeVideo = (variantIndex: number) => {
    updateVariant(variantIndex, {
      video: "",
    });
  };

  /* =========================================================
     TOTAL STOCK
  ========================================================= */

  const totalVariantStock = variants.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0,
  );

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="admin-variants">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="admin-variants-header">
        <div>
          <h3>Product Colors</h3>

          <p className="muted">
            Add different colors, images, videos and stock for this product.
          </p>
        </div>

        <button type="button" className="btn" onClick={addVariant}>
          + Add Color
        </button>
      </div>

      {/* =================================================
          EMPTY
      ================================================= */}

      {variants.length === 0 && (
        <div className="admin-variants-empty">
          <div className="admin-variants-empty-icon">🎨</div>

          <strong>No color variants</strong>

          <p className="muted">
            If this product has different colors, add them here.
          </p>

          <button type="button" className="btn secondary" onClick={addVariant}>
            + Add First Color
          </button>
        </div>
      )}

      {/* =================================================
          VARIANTS
      ================================================= */}

      <div className="admin-variant-list">
        {variants.map((variant, variantIndex) => {
          const isImageUploading = uploadingImage === variant.id;

          const isVideoUploading = uploadingVideo === variant.id;

          return (
            <div key={variant.id} className="admin-variant-card">
              {/* =================================================
                    HEADER
                ================================================= */}

              <div className="admin-variant-header">
                <strong>Color #{variantIndex + 1}</strong>

                <button
                  type="button"
                  className="admin-variant-remove"
                  onClick={() => removeVariant(variantIndex)}
                >
                  Remove
                </button>
              </div>

              {/* =================================================
                    COLOR + STOCK
                ================================================= */}

              <div className="admin-variant-basic-grid">
                <label>
                  Color Name
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) =>
                      updateVariant(variantIndex, {
                        color: e.target.value,
                      })
                    }
                    placeholder="e.g. Blue"
                  />
                </label>

                <label>
                  Stock
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(variantIndex, {
                        stock: Math.max(0, Number(e.target.value || 0)),
                      })
                    }
                    placeholder="0"
                  />
                </label>
              </div>

              {/* =================================================
                    PRODUCT IMAGES
                ================================================= */}

              <div className="admin-variant-media-section">
                <div className="admin-variant-media-header">
                  <div>
                    <strong>Product Images</strong>

                    <p className="muted">Upload images for this color.</p>
                  </div>

                  <button
                    type="button"
                    className="btn secondary"
                    disabled={isImageUploading}
                    onClick={() => imageInputRefs.current[variant.id]?.click()}
                  >
                    {isImageUploading ? "Uploading..." : "📷 Upload Images"}
                  </button>

                  <input
                    ref={(element) => {
                      imageInputRefs.current[variant.id] = element;
                    }}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) =>
                      handleImageUpload(variantIndex, e.target.files)
                    }
                  />
                </div>

                {/* IMAGE PREVIEW */}

                {variant.images.length === 0 ? (
                  <div className="admin-upload-empty">
                    🖼️
                    <span>No images uploaded</span>
                  </div>
                ) : (
                  <div className="admin-variant-image-grid">
                    {variant.images.map((image, imageIndex) => (
                      <div
                        key={`${variant.id}-${imageIndex}`}
                        className="admin-variant-image-item"
                      >
                        <img
                          src={image}
                          alt={`${variant.color || "Product"} ${
                            imageIndex + 1
                          }`}
                        />

                        <button
                          type="button"
                          className="admin-media-remove"
                          onClick={() => removeImage(variantIndex, imageIndex)}
                          aria-label="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* =================================================
                    PRODUCT VIDEO
                ================================================= */}

              <div className="admin-variant-media-section">
                <div className="admin-variant-media-header">
                  <div>
                    <strong>🎥 Product Demo Video</strong>

                    <p className="muted">
                      Upload a short video showing how the product works.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn secondary"
                    disabled={isVideoUploading}
                    onClick={() => videoInputRefs.current[variant.id]?.click()}
                  >
                    {isVideoUploading
                      ? "Uploading..."
                      : variant.video
                        ? "🔄 Replace Video"
                        : "🎥 Upload Video"}
                  </button>

                  <input
                    ref={(element) => {
                      videoInputRefs.current[variant.id] = element;
                    }}
                    type="file"
                    accept="video/*"
                    hidden
                    onChange={(e) =>
                      handleVideoUpload(
                        variantIndex,
                        e.target.files?.[0] || null,
                      )
                    }
                  />
                </div>

                {/* VIDEO PREVIEW */}

                {variant.video ? (
                  <div className="admin-variant-video-preview">
                    <video
                      src={variant.video}
                      controls
                      preload="metadata"
                      playsInline
                    />

                    <button
                      type="button"
                      className="admin-video-remove"
                      onClick={() => removeVideo(variantIndex)}
                    >
                      🗑 Remove Video
                    </button>
                  </div>
                ) : (
                  <div className="admin-upload-empty">
                    🎥
                    <span>No demo video uploaded</span>
                  </div>
                )}
              </div>

              {/* =================================================
                    SUMMARY
                ================================================= */}

              <div className="admin-variant-summary">
                <strong>{variant.color || "Unnamed Color"}</strong>

                <span className="muted">
                  • {variant.images.length} image
                  {variant.images.length !== 1 ? "s" : ""}
                  {" • "}
                  {variant.stock} in stock
                  {variant.video ? " • 🎥 Video added" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* =================================================
          TOTAL STOCK
      ================================================= */}

      {variants.length > 0 && (
        <div className="admin-variant-total-stock">
          <strong>Total Variant Stock: {totalVariantStock}</strong>

          <span className="muted">
            This will be used as the product's total stock.
          </span>
        </div>
      )}
    </div>
  );
}
