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
   CLEAN CATEGORIES
========================================================= */

function cleanCategories(categories: any, oldCategory?: any) {
  let values: any[] = [];

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
   * Backward compatibility:
   *
   * Old product:
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
   GET PRODUCTS
========================================================= */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id")?.trim();

    const slug = searchParams.get("slug")?.trim();

    const category = searchParams.get("category")?.trim();

    const offer = searchParams.get("offer")?.trim();

    const newArrival = searchParams.get("newArrival")?.trim();

    const bestSeller = searchParams.get("bestSeller")?.trim();

    const featured = searchParams.get("featured")?.trim();

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

      /*
       * Normalize old product
       * before returning.
       */

      const normalizedProduct = {
        ...product,

        categories: cleanCategories(product.categories, product.category),

        offer: Boolean(product.offer),

        newArrival: Boolean(product.newArrival),

        bestSeller: Boolean(product.bestSeller),

        featured: Boolean(product.featured),
      };

      return NextResponse.json({
        product: normalizedProduct,
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

      const normalizedProduct = {
        ...product,

        categories: cleanCategories(product.categories, product.category),

        offer: Boolean(product.offer),

        newArrival: Boolean(product.newArrival),

        bestSeller: Boolean(product.bestSeller),

        featured: Boolean(product.featured),
      };

      return NextResponse.json({
        product: normalizedProduct,
      });
    }

    /* =====================================================
       FILTER
    ===================================================== */

    const filter: Record<string, any> = {};

    /*
     * Multiple category support.
     *
     * A product is returned if the
     * selected category exists inside
     * its categories array.
     */

    if (category) {
      filter.$or = [
        {
          categories: category,
        },

        /*
         * Old products compatibility.
         */

        {
          category: category,
        },
      ];
    }

    /* =====================================================
       OFFER FILTER
    ===================================================== */

    if (offer === "true") {
      filter.offer = true;
    }

    /* =====================================================
       NEW ARRIVAL FILTER
    ===================================================== */

    if (newArrival === "true") {
      filter.newArrival = true;
    }

    /* =====================================================
       BEST SELLER FILTER
    ===================================================== */

    if (bestSeller === "true") {
      filter.bestSeller = true;
    }

    /* =====================================================
       FEATURED FILTER
    ===================================================== */

    if (featured === "true") {
      filter.featured = true;
    }

    /* =====================================================
       ALL PRODUCTS
    ===================================================== */

    const products = await d
      .collection("products")
      .find(filter)
      .sort({
        createdAt: -1,
      })
      .toArray();

    /*
     * Normalize old products so
     * frontend always receives:
     *
     * categories: []
     *
     * offer
     * newArrival
     * bestSeller
     * featured
     */

    const normalizedProducts = products.map((product: any) => ({
      ...product,

      categories: cleanCategories(product.categories, product.category),

      offer: Boolean(product.offer),

      newArrival: Boolean(product.newArrival),

      bestSeller: Boolean(product.bestSeller),

      featured: Boolean(product.featured),
    }));

    return NextResponse.json({
      products: normalizedProducts,
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
      categories,
      category,
      description,
      features,
      regularPrice,
      offerPrice,
      stock,
      ageRange,
      images,
      variants,

      offer,
      newArrival,
      bestSeller,
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

    /* =====================================================
       CATEGORIES
    ===================================================== */

    const cleanProductCategories = cleanCategories(categories, category);

    if (cleanProductCategories.length === 0) {
      return NextResponse.json(
        {
          error: "At least one product category is required.",
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

      /*
       * NEW:
       * Multiple categories.
       */

      categories: cleanProductCategories,

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

      /* =================================================
         PRODUCT FLAGS
      ================================================= */

      offer: Boolean(offer),

      newArrival: Boolean(newArrival),

      bestSeller: Boolean(bestSeller),

      featured: Boolean(featured),

      createdAt: new Date(),

      updatedAt: new Date(),
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
