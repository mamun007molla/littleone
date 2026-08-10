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
      product,
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
       BASIC FIELDS
    ===================================================== */

    const update: Record<string, unknown> = {};

    if (body.name !== undefined) {
      update.name = String(body.name || "").trim();
    }

    if (body.slug !== undefined) {
      update.slug = String(body.slug || "").trim();
    }

    if (body.category !== undefined) {
      update.category = String(body.category || "").trim();
    }

    if (body.description !== undefined) {
      update.description = String(body.description || "").trim();
    }

    if (body.features !== undefined) {
      update.features = Array.isArray(body.features)
        ? body.features
            .map((feature: unknown) => String(feature || "").trim())
            .filter(Boolean)
        : [];
    }

    if (body.regularPrice !== undefined) {
      update.regularPrice = Number(body.regularPrice || 0);
    }

    if (body.offerPrice !== undefined) {
      update.offerPrice =
        body.offerPrice === "" || body.offerPrice === null
          ? undefined
          : Number(body.offerPrice);
    }

    if (body.ageRange !== undefined) {
      update.ageRange = body.ageRange
        ? String(body.ageRange).trim()
        : undefined;
    }

    if (body.images !== undefined) {
      update.images = Array.isArray(body.images)
        ? body.images
            .map((image: unknown) => String(image || "").trim())
            .filter(Boolean)
        : [];
    }

    if (body.featured !== undefined) {
      update.featured = Boolean(body.featured);
    }

    /* =====================================================
       VARIANTS
    ===================================================== */

    if (body.variants !== undefined) {
      const variants = cleanVariants(body.variants);

      update.variants = variants.length > 0 ? variants : undefined;

      /*
       * Keep main stock synchronized
       * with total variant stock.
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
       * Only update main stock when
       * variants are not being changed.
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
       UPDATE
    ===================================================== */

    update.updatedAt = new Date();

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
      product,
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
