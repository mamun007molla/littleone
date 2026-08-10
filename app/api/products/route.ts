import { NextResponse } from "next/server";
import { db } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/* =========================================================
   HELPERS
========================================================= */

function cleanVariants(variants: any) {
  if (!Array.isArray(variants)) {
    return [];
  }

  return variants
    .map((variant: any) => {
      const color = String(variant?.color || "").trim();

      if (!color) {
        return null;
      }

      const id =
        String(variant?.id || "").trim() ||
        `${color.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(
          36,
        )}`;

      const images = Array.isArray(variant?.images)
        ? variant.images
            .map((image: any) => String(image || "").trim())
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
   GET PRODUCTS
========================================================= */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id")?.trim();

    const slug = searchParams.get("slug")?.trim();

    const d = await db();

    /* =====================================================
       SINGLE PRODUCT BY ID
    ===================================================== */

    if (id) {
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
    }

    /* =====================================================
       SINGLE PRODUCT BY SLUG
    ===================================================== */

    if (slug) {
      const product = await d.collection("products").findOne({
        slug,
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
    }

    /* =====================================================
       ALL PRODUCTS
    ===================================================== */

    const products = await d
      .collection("products")
      .find({})
      .sort({
        createdAt: -1,
      })
      .toArray();

    return NextResponse.json({
      products,
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        error: "Failed to load products.",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   POST PRODUCT
========================================================= */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      slug,
      category,
      description,
      features,
      regularPrice,
      offerPrice,
      stock,
      ageRange,
      images,
      variants,
      featured,
    } = body;

    /* =====================================================
       BASIC VALIDATION
    ===================================================== */

    if (!name || !String(name).trim()) {
      return NextResponse.json(
        {
          error: "Product name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!slug || !String(slug).trim()) {
      return NextResponse.json(
        {
          error: "Product slug is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!category || !String(category).trim()) {
      return NextResponse.json(
        {
          error: "Product category is required.",
        },
        {
          status: 400,
        },
      );
    }

    const d = await db();

    /* =====================================================
       CHECK DUPLICATE SLUG
    ===================================================== */

    const existing = await d.collection("products").findOne({
      slug: String(slug).trim(),
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "A product with this slug already exists.",
        },
        {
          status: 409,
        },
      );
    }

    /* =====================================================
       NORMALIZE IMAGES
    ===================================================== */

    const cleanImages = Array.isArray(images)
      ? images.map((image: any) => String(image || "").trim()).filter(Boolean)
      : [];

    /* =====================================================
       NORMALIZE FEATURES
    ===================================================== */

    const cleanFeatures = Array.isArray(features)
      ? features
          .map((feature: any) => String(feature || "").trim())
          .filter(Boolean)
      : [];

    /* =====================================================
       VARIANTS
    ===================================================== */

    const cleanProductVariants = cleanVariants(variants);

    /* =====================================================
       MAIN STOCK

       যদি variants থাকে, main stock-এর value
       total variant stock হিসেবে রাখা হবে।

       এতে পুরোনো code-ও compatibility পাবে।
    ===================================================== */

    const variantStockTotal = cleanProductVariants.reduce(
      (sum: number, variant: any) => sum + Number(variant.stock || 0),
      0,
    );

    const finalStock =
      cleanProductVariants.length > 0
        ? variantStockTotal
        : Math.max(0, Number(stock || 0));

    /* =====================================================
       PRODUCT DOCUMENT
    ===================================================== */

    const product = {
      name: String(name).trim(),

      slug: String(slug).trim(),

      category: String(category).trim(),

      description: String(description || "").trim(),

      features: cleanFeatures,

      regularPrice: Number(regularPrice || 0),

      offerPrice:
        offerPrice != null && offerPrice !== ""
          ? Number(offerPrice)
          : undefined,

      stock: finalStock,

      ageRange: ageRange ? String(ageRange).trim() : undefined,

      images: cleanImages,

      variants:
        cleanProductVariants.length > 0 ? cleanProductVariants : undefined,

      featured: Boolean(featured),

      createdAt: new Date(),
    };

    /* =====================================================
       INSERT
    ===================================================== */

    const result = await d.collection("products").insertOne(product);

    return NextResponse.json(
      {
        success: true,

        product: {
          ...product,

          _id: result.insertedId,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        error: "Failed to create product.",
      },
      {
        status: 500,
      },
    );
  }
}
