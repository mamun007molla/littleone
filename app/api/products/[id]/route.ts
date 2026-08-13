import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { db } from "@/lib/mongodb";

/* =========================================================
   TYPES
========================================================= */

type ProductVariantInput = {
  id?: string;
  color?: string;
  images?: string[];
  video?: string;
  stock?: number;
};

/* =========================================================
   HELPERS
========================================================= */

function makeVariantId(color: string) {
  return `${color
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")}-${Date.now().toString(36)}`;
}

/* =========================================================
   CLEAN VARIANTS
========================================================= */

function cleanVariants(variants: unknown) {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants
    .map((variant: ProductVariantInput) => {
      const color = String(variant?.color || "").trim();

      if (!color) {
        return null;
      }

      const id = String(variant?.id || "").trim() || makeVariantId(color);

      const images = Array.isArray(variant?.images)
        ? variant.images
            .map((image) => String(image || "").trim())
            .filter(Boolean)
        : [];

      const video = variant?.video ? String(variant.video).trim() : "";

      const stock = Math.max(0, Number(variant?.stock || 0));

      return {
        id,
        color,
        images,

        ...(video
          ? {
              video,
            }
          : {}),

        stock,
      };
    })
    .filter(Boolean);
}

/* =========================================================
   CLEAN CATEGORIES
========================================================= */

function cleanCategories(categories: unknown, oldCategory?: unknown) {
  let values: unknown[] = [];

  /*
   * New format:
   *
   * categories: [
   *   "Baby & Toddler Toys",
   *   "Educational & Learning"
   * ]
   */

  if (Array.isArray(categories)) {
    values = categories;
  }

  /*
   * Backward compatibility
   *
   * Old format:
   *
   * category: "Baby Toys"
   */

  if (
    values.length === 0 &&
    typeof oldCategory === "string" &&
    oldCategory.trim()
  ) {
    values = [oldCategory];
  }

  return [
    ...new Set(values.map((item) => String(item || "").trim()).filter(Boolean)),
  ];
}

/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(product: any) {
  const categories = cleanCategories(product?.categories, product?.category);

  const variants = Array.isArray(product?.variants) ? product.variants : [];

  const variantStock = variants.reduce(
    (total: number, variant: any) => total + Number(variant?.stock || 0),
    0,
  );

  return {
    ...product,

    categories,

    stock: variants.length > 0 ? variantStock : Number(product?.stock || 0),

    offer: Boolean(product?.offer),

    newArrival: Boolean(product?.newArrival),

    bestSeller: Boolean(product?.bestSeller),

    featured: Boolean(product?.featured),
  };
}

/* =========================================================
   GET SINGLE PRODUCT
========================================================= */

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    const d = await db();

    const product = await d.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      product: normalizeProduct(product),
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);

    return NextResponse.json(
      {
        error: "Failed to load product.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   PATCH PRODUCT
========================================================= */

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const d = await db();

    /* =====================================================
       EXISTING PRODUCT
    ===================================================== */

    const existing = await d.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    /* =====================================================
       UPDATE OBJECT
    ===================================================== */

    const update: Record<string, unknown> = {};

    /* =====================================================
       NAME
    ===================================================== */

    if (body.name !== undefined) {
      const name = String(body.name || "").trim();

      if (!name) {
        return NextResponse.json(
          {
            error: "Product name is required.",
          },
          {
            status: 400,
          },
        );
      }

      update.name = name;
    }

    /* =====================================================
       SLUG
    ===================================================== */

    if (body.slug !== undefined) {
      const slug = String(body.slug || "").trim();

      if (!slug) {
        return NextResponse.json(
          {
            error: "Product slug is required.",
          },
          {
            status: 400,
          },
        );
      }

      update.slug = slug;
    }

    /* =====================================================
       MULTIPLE CATEGORIES
    ===================================================== */

    if (body.categories !== undefined || body.category !== undefined) {
      const categories = cleanCategories(body.categories, body.category);

      if (categories.length === 0) {
        return NextResponse.json(
          {
            error: "At least one product category is required.",
          },
          {
            status: 400,
          },
        );
      }

      update.categories = categories;

      /*
       * Remove old single category
       * field when possible.
       */

      update.category = null;
    }

    /* =====================================================
       DESCRIPTION
    ===================================================== */

    if (body.description !== undefined) {
      update.description = String(body.description || "").trim();
    }

    /* =====================================================
       FEATURES
    ===================================================== */

    if (body.features !== undefined) {
      update.features = Array.isArray(body.features)
        ? body.features
            .map((feature: unknown) => String(feature || "").trim())
            .filter(Boolean)
        : [];
    }

    /* =====================================================
       REGULAR PRICE
    ===================================================== */

    if (body.regularPrice !== undefined) {
      update.regularPrice = Number(body.regularPrice || 0);
    }

    /* =====================================================
       OFFER PRICE
    ===================================================== */

    if (body.offerPrice !== undefined) {
      update.offerPrice =
        body.offerPrice === "" || body.offerPrice === null
          ? null
          : Number(body.offerPrice);
    }

    /* =====================================================
       AGE RANGE
    ===================================================== */

    if (body.ageRange !== undefined) {
      update.ageRange = body.ageRange ? String(body.ageRange).trim() : null;
    }

    /* =====================================================
       IMAGES
    ===================================================== */

    if (body.images !== undefined) {
      update.images = Array.isArray(body.images)
        ? body.images
            .map((image: unknown) => String(image || "").trim())
            .filter(Boolean)
        : [];
    }

    /* =====================================================
       PRODUCT FLAGS
    ===================================================== */

    if (body.offer !== undefined) {
      update.offer = Boolean(body.offer);
    }

    if (body.newArrival !== undefined) {
      update.newArrival = Boolean(body.newArrival);
    }

    if (body.bestSeller !== undefined) {
      update.bestSeller = Boolean(body.bestSeller);
    }

    if (body.featured !== undefined) {
      update.featured = Boolean(body.featured);
    }

    /* =====================================================
       VARIANTS
    ===================================================== */

    if (body.variants !== undefined) {
      const variants = cleanVariants(body.variants);

      update.variants = variants.length > 0 ? variants : null;

      /*
       * Automatically calculate
       * total stock.
       */

      const totalVariantStock = variants.reduce(
        (total: number, variant: any) => total + Number(variant.stock || 0),
        0,
      );

      update.stock =
        variants.length > 0
          ? totalVariantStock
          : Math.max(0, Number(body.stock || 0));
    } else if (body.stock !== undefined) {
      /*
       * Only change main stock
       * if there are no existing
       * variants.
       */

      const existingVariants = Array.isArray(existing.variants)
        ? existing.variants
        : [];

      if (existingVariants.length === 0) {
        update.stock = Math.max(0, Number(body.stock || 0));
      }
    }

    /* =====================================================
       SLUG DUPLICATE CHECK
    ===================================================== */

    if (update.slug && update.slug !== existing.slug) {
      const duplicate = await d.collection("products").findOne({
        slug: update.slug,

        _id: {
          $ne: new ObjectId(id),
        },
      });

      if (duplicate) {
        return NextResponse.json(
          {
            error: "A product with this slug already exists.",
          },
          {
            status: 409,
          },
        );
      }
    }

    /* =====================================================
       UPDATED TIME
    ===================================================== */

    update.updatedAt = new Date();

    /* =====================================================
       UPDATE DATABASE
    ===================================================== */

    await d.collection("products").updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: update,
      },
    );

    /* =====================================================
       RETURN UPDATED PRODUCT
    ===================================================== */

    const product = await d.collection("products").findOne({
      _id: new ObjectId(id),
    });

    return NextResponse.json({
      success: true,

      product: product ? normalizeProduct(product) : null,
    });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);

    return NextResponse.json(
      {
        error: "Failed to update product.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   DELETE PRODUCT
========================================================= */

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error: "Invalid product ID.",
        },
        {
          status: 400,
        },
      );
    }

    const d = await db();

    const result = await d.collection("products").deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        {
          error: "Product not found.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete product.",
      },
      {
        status: 500,
      },
    );
  }
}
