import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/mongodb";
import { Product } from "@/models/types";
import ProductDetailsClient from "./ProductDetailsClient";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

/* =========================================================
   GET PRODUCT
========================================================= */

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const d = await db();

    const product = await d.collection("products").findOne({
      slug,
    });

    if (!product) {
      return null;
    }

    /* =====================================================
       CATEGORIES

       New:
       categories: []

       Old:
       category: ""
    ===================================================== */

    const categories = Array.isArray(product.categories)
      ? product.categories
          .map((category: any) => String(category || "").trim())
          .filter(Boolean)
      : typeof product.category === "string" && product.category.trim()
        ? [product.category.trim()]
        : [];

    /* =====================================================
       VARIANTS
    ===================================================== */

    const variants = Array.isArray(product.variants)
      ? product.variants.map((variant: any) => ({
          id: String(variant?.id || ""),

          color: String(variant?.color || ""),

          images: Array.isArray(variant?.images)
            ? variant.images
                .map((image: any) => String(image || "").trim())
                .filter(Boolean)
            : [],

          video: variant?.video ? String(variant.video) : undefined,

          stock: Math.max(0, Number(variant?.stock || 0)),
        }))
      : [];

    /* =====================================================
       STOCK
    ===================================================== */

    const variantStock = variants.reduce(
      (total: number, variant: any) => total + Number(variant?.stock || 0),
      0,
    );

    const stock =
      variants.length > 0
        ? variantStock
        : Math.max(0, Number(product.stock || 0));

    /* =====================================================
       NORMALIZED PRODUCT
    ===================================================== */

    return {
      ...product,

      _id: String(product._id),

      categories,

      stock,

      variants,

      images: Array.isArray(product.images)
        ? product.images
            .map((image: any) => String(image || "").trim())
            .filter(Boolean)
        : [],

      features: Array.isArray(product.features)
        ? product.features
            .map((feature: any) => String(feature || "").trim())
            .filter(Boolean)
        : [],

      regularPrice: Number(product.regularPrice || 0),

      offerPrice:
        product.offerPrice != null && product.offerPrice !== ""
          ? Number(product.offerPrice)
          : undefined,

      offer: Boolean(product.offer),

      newArrival: Boolean(product.newArrival),

      bestSeller: Boolean(product.bestSeller),

      featured: Boolean(product.featured),

      createdAt:
        product.createdAt instanceof Date
          ? product.createdAt.toISOString()
          : product.createdAt,

      updatedAt:
        product.updatedAt instanceof Date
          ? product.updatedAt.toISOString()
          : product.updatedAt,
    } as Product;
  } catch (error) {
    console.error("Product details error:", error);

    return null;
  }
}

/* =========================================================
   PAGE
========================================================= */

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const variants = Array.isArray(product.variants) ? product.variants : [];

  return (
    <main>
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <section
        className="section"
        style={{
          paddingBottom: 0,
        }}
      >
        <div className="container">
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              flexWrap: "wrap",
              fontSize: 13,
            }}
          >
            <Link href="/" className="muted">
              Home
            </Link>

            <span className="muted">/</span>

            <Link href="/shop" className="muted">
              Shop
            </Link>

            {/* =================================================
                CATEGORY BREADCRUMB
            ================================================= */}

            {product.categories?.length > 0 && (
              <>
                <span className="muted">/</span>

                <Link
                  href={`/shop?category=${encodeURIComponent(
                    product.categories[0],
                  )}`}
                  className="muted"
                >
                  {product.categories[0]}
                </Link>
              </>
            )}

            <span className="muted">/</span>

            <span>{product.name}</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          PRODUCT
      ===================================================== */}

      <section className="section">
        <div className="container">
          <ProductDetailsClient product={product} variants={variants} />
        </div>
      </section>
    </main>
  );
}
